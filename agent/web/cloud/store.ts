import type { Db } from "./claude.js";

/**
 * Encrypted records for the cloud page. Every record (settings, memories,
 * agents, each conversation) is JSON sealed with AES-256-GCM in this browser
 * before it is written, so the stored copy is unreadable without your
 * password. A random data key does the encrypting; your password (PBKDF2,
 * 600,000 rounds) only wraps it, so changing the password rewraps one key.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ITERATIONS = 600_000;
/** Base64 characters per stored document (documents cap at 256 KiB). */
const CHUNK = 180_000;
const DELETE = Symbol("delete");

function b64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export class WrongPassword extends Error {}

/** Where sealed documents live: the viewer's private db subtree, or this page's memory. */
interface Backing {
  get(name: string): Promise<Record<string, unknown> | undefined>;
  set(name: string, data: Record<string, unknown>): Promise<void>;
  delete(name: string): Promise<void>;
}

function dbBacking(db: Db, userId: string): Backing {
  const ref = (name: string) => db.doc(`data/users/${userId}/${name}`);
  return {
    async get(name) {
      const snap = await ref(name).get();
      return snap.exists ? snap.data() : undefined;
    },
    set: (name, data) => ref(name).set(data),
    delete: (name) => ref(name).delete(),
  };
}

function memoryBacking(): Backing {
  const docs = new Map<string, Record<string, unknown>>();
  return {
    get: async (name) => docs.get(name),
    set: async (name, data) => void docs.set(name, data),
    delete: async (name) => void docs.delete(name),
  };
}

async function passwordKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: ITERATIONS }, base, { name: "AES-GCM", length: 256 }, false, [
    "wrapKey",
    "unwrapKey",
  ]);
}

export class Store {
  private key: CryptoKey | null = null;
  private chunks = new Map<string, number>();
  private pending = new Map<string, unknown>();
  private writing = new Map<string, Promise<void>>();

  private constructor(
    private backing: Backing,
    /** False when the page couldn't get a private store: everything lasts until the page closes. */
    readonly persistent: boolean,
    private onError: (err: unknown) => void,
  ) {}

  static async open(db: Db | null, userId: string | null, onError: (err: unknown) => void): Promise<Store> {
    if (db && userId) return new Store(dbBacking(db, userId), true, onError);
    const store = new Store(memoryBacking(), false, onError);
    store.key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    return store;
  }

  get unlocked() {
    return !!this.key;
  }

  async hasVault(): Promise<boolean> {
    return !this.persistent || !!(await this.backing.get("vault"));
  }

  private async writeVault(password: string, dataKey: CryptoKey) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.wrapKey("raw", dataKey, await passwordKey(password, salt), { name: "AES-GCM", iv });
    await this.backing.set("vault", { v: 1, kdf: "PBKDF2-SHA256", iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), key: b64(new Uint8Array(wrapped)) });
  }

  async create(password: string) {
    const dataKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    await this.writeVault(password, dataKey);
    this.key = dataKey;
  }

  async unlock(password: string) {
    const vault = await this.backing.get("vault");
    if (!vault) throw new WrongPassword();
    try {
      const kek = await passwordKey(password, unb64(String(vault.salt)));
      this.key = await crypto.subtle.unwrapKey("raw", unb64(String(vault.key)) as BufferSource, kek, { name: "AES-GCM", iv: unb64(String(vault.iv)) as BufferSource }, { name: "AES-GCM", length: 256 }, true, [
        "encrypt",
        "decrypt",
      ]);
    } catch {
      throw new WrongPassword();
    }
  }

  async changePassword(current: string, next: string) {
    const key = this.key;
    await this.unlock(current); // throws WrongPassword
    await this.writeVault(next, key ?? this.key!);
  }

  lock() {
    this.key = null;
    this.chunks.clear();
  }

  async load<T>(name: string): Promise<T | null> {
    if (!this.key) throw new Error("Locked");
    const first = await this.backing.get(name);
    if (!first) return null;
    const n = Number(first.n ?? 1);
    const rest = await Promise.all(Array.from({ length: n - 1 }, (_, i) => this.backing.get(`${name}~${i + 1}`)));
    this.chunks.set(name, n);
    const sealed = unb64([first, ...rest].map((d) => String(d?.d ?? "")).join(""));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(String(first.iv)) as BufferSource, additionalData: encoder.encode(name) }, this.key, sealed as BufferSource);
    return JSON.parse(decoder.decode(plain)) as T;
  }

  /** Saves in the background; rapid saves of one record collapse into the latest. */
  save(name: string, value: unknown): Promise<void> {
    this.pending.set(name, value);
    let running = this.writing.get(name);
    if (!running) {
      running = (async () => {
        while (this.pending.has(name)) {
          const next = this.pending.get(name);
          this.pending.delete(name);
          try {
            await (next === DELETE ? this.erase(name) : this.write(name, next));
          } catch (err) {
            this.onError(err);
          }
        }
      })().finally(() => this.writing.delete(name));
      this.writing.set(name, running);
    }
    return running;
  }

  remove(name: string): Promise<void> {
    return this.save(name, DELETE);
  }

  private async write(name: string, value: unknown) {
    if (!this.key) return;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const sealed = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: encoder.encode(name) }, this.key, encoder.encode(JSON.stringify(value)));
    const text = b64(new Uint8Array(sealed));
    const parts: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK) parts.push(text.slice(i, i + CHUNK));
    if (!parts.length) parts.push("");
    // Write the tail chunks first, so the head never points at chunks that aren't there yet.
    for (let i = parts.length - 1; i >= 1; i--) await this.backing.set(`${name}~${i}`, { d: parts[i] });
    await this.backing.set(name, { v: 1, iv: b64(iv), n: parts.length, d: parts[0] });
    const before = this.chunks.get(name) ?? 1;
    for (let i = parts.length; i < before; i++) await this.backing.delete(`${name}~${i}`);
    this.chunks.set(name, parts.length);
  }

  private async erase(name: string) {
    const first = await this.backing.get(name);
    const n = Number(first?.n ?? this.chunks.get(name) ?? 1);
    await this.backing.delete(name);
    for (let i = 1; i < n; i++) await this.backing.delete(`${name}~${i}`);
    this.chunks.delete(name);
  }
}
