import { createCipheriv, createDecipheriv, randomBytes, scrypt as scryptCb, type ScryptOptions } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

/**
 * Encryption at rest. Everything personal (chats, titles, memories, reminders,
 * agents, settings, uploaded files) is stored encrypted with AES-256-GCM under a
 * random data key. The data key is itself encrypted with a key derived from your
 * password (scrypt), so it only exists in memory while the app is unlocked. A
 * copy of the data folder is unreadable without your password.
 */

export class VaultLockedError extends Error {
  constructor() {
    super("Dizz Lab is locked. Sign in to unlock it.");
  }
}

interface VaultFile {
  version: 1;
  kdf: { name: "scrypt"; N: number; r: number; p: number; salt: string };
  /** base64(iv | ciphertext | tag) of the data key */
  wrappedKey: string;
  createdAt: number;
}

const VAULT_PATH = path.join(config.dataDir, "vault.json");
const testing = process.env.NODE_ENV === "test";
// ~128 MB of memory per guess makes brute-forcing a stolen vault expensive.
const KDF = testing ? { N: 2 ** 14, r: 8, p: 1 } : { N: 2 ** 17, r: 8, p: 1 };
const TEXT_PREFIX = "e1:";
const FILE_MAGIC = Buffer.from("DZE1");

let dataKey: Buffer | null = null;
let memoryVault: VaultFile | null = null; // tests keep the vault in memory

function readVault(): VaultFile | null {
  if (testing) return memoryVault;
  try {
    return JSON.parse(fs.readFileSync(VAULT_PATH, "utf8")) as VaultFile;
  } catch {
    return null;
  }
}

function writeVault(vault: VaultFile): void {
  if (testing) {
    memoryVault = vault;
    return;
  }
  const tmp = `${VAULT_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(vault, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, VAULT_PATH);
}

function deriveKey(password: string, kdf: VaultFile["kdf"]): Promise<Buffer> {
  const options: ScryptOptions = { N: kdf.N, r: kdf.r, p: kdf.p, maxmem: 256 * 1024 * 1024 };
  return new Promise((resolve, reject) =>
    scryptCb(password.normalize("NFKC"), Buffer.from(kdf.salt, "base64"), 32, options, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

function seal(key: Buffer, plain: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, body, cipher.getAuthTag()]);
}

function open(key: Buffer, sealed: Buffer): Buffer {
  const iv = sealed.subarray(0, 12);
  const tag = sealed.subarray(sealed.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(sealed.subarray(12, sealed.length - 16)), decipher.final()]);
}

export function vaultExists(): boolean {
  return readVault() !== null;
}

export function isUnlocked(): boolean {
  return dataKey !== null;
}

/** First run: makes the vault with your password and unlocks it. */
export async function createVault(password: string): Promise<void> {
  if (vaultExists()) throw new Error("Dizz Lab is already set up");
  const kdf = { name: "scrypt" as const, ...KDF, salt: randomBytes(16).toString("base64") };
  const key = randomBytes(32);
  const wrapped = seal(await deriveKey(password, kdf), key);
  writeVault({ version: 1, kdf, wrappedKey: wrapped.toString("base64"), createdAt: Date.now() });
  dataKey = key;
}

/** Checks the password; if it's right, unlocks the data (when locked). */
export async function unlock(password: string): Promise<boolean> {
  const vault = readVault();
  if (!vault) return false;
  try {
    const key = open(await deriveKey(password, vault.kdf), Buffer.from(vault.wrappedKey, "base64"));
    dataKey ??= key;
    return true;
  } catch {
    return false; // GCM authentication failed: wrong password
  }
}

const lockListeners: (() => void)[] = [];

/** Runs when the vault locks, so decrypted caches can be dropped. */
export function onLock(fn: () => void): void {
  lockListeners.push(fn);
}

/** Forgets the key: nothing can be read until you sign in again. */
export function lock(): void {
  dataKey?.fill(0);
  dataKey = null;
  for (const fn of lockListeners) fn();
}

/** Re-encrypts the data key under a new password. Your data itself doesn't need re-encrypting. */
export async function changePassword(current: string, next: string): Promise<boolean> {
  const vault = readVault();
  if (!vault || !(await unlock(current)) || !dataKey) return false;
  const kdf = { name: "scrypt" as const, ...KDF, salt: randomBytes(16).toString("base64") };
  writeVault({ ...vault, kdf, wrappedKey: seal(await deriveKey(next, kdf), dataKey).toString("base64") });
  return true;
}

function key(): Buffer {
  if (!dataKey) throw new VaultLockedError();
  return dataKey;
}

export function encryptText(plain: string): string {
  return TEXT_PREFIX + seal(key(), Buffer.from(plain, "utf8")).toString("base64");
}

export function decryptText(stored: string): string {
  if (!stored.startsWith(TEXT_PREFIX)) return stored;
  return open(key(), Buffer.from(stored.slice(TEXT_PREFIX.length), "base64")).toString("utf8");
}

export function encryptBytes(plain: Buffer): Buffer {
  return Buffer.concat([FILE_MAGIC, seal(key(), plain)]);
}

export function decryptBytes(stored: Buffer): Buffer {
  if (!stored.subarray(0, 4).equals(FILE_MAGIC)) return stored;
  return open(key(), stored.subarray(4));
}
