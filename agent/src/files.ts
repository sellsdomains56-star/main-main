import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { addFile, findFileByPath, getFile, newId, updateFileSize } from "./db.js";
import type { FileRecord } from "./types.js";
import { decryptBytes, encryptBytes } from "./vault.js";

/** Uploads are kept here, encrypted and unchanged, so old messages can always be replayed to the model exactly. */
export const BLOB_DIR = path.join(config.dataDir, "blobs");
/**
 * The agent's working folder: uploads are copied in, code runs here, generated files land here.
 * It is not encrypted, because programs the agent runs need to open these files.
 */
export const WORKSPACE_DIR = path.join(config.dataDir, "workspace");
fs.mkdirSync(BLOB_DIR, { recursive: true });
fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
  pdf: "application/pdf", txt: "text/plain", md: "text/markdown", csv: "text/csv", tsv: "text/tab-separated-values",
  json: "application/json", html: "text/html", htm: "text/html", xml: "application/xml", yaml: "text/yaml", yml: "text/yaml",
  js: "text/javascript", mjs: "text/javascript", ts: "text/x-typescript", tsx: "text/x-typescript", jsx: "text/javascript",
  py: "text/x-python", rb: "text/x-ruby", go: "text/x-go", rs: "text/x-rust", java: "text/x-java", c: "text/x-c", h: "text/x-c",
  cpp: "text/x-c++", cs: "text/x-csharp", php: "text/x-php", sh: "text/x-shellscript", sql: "text/x-sql", css: "text/css",
  log: "text/plain", ini: "text/plain", toml: "text/plain", env: "text/plain",
  mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", ogg: "audio/ogg", webm: "audio/webm", mp4: "video/mp4", mov: "video/quicktime",
  zip: "application/zip", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export function mimeFor(name: string, fallback = "application/octet-stream"): string {
  const ext = path.extname(name).slice(1).toLowerCase();
  return MIME[ext] ?? fallback;
}

export function isTextMime(mime: string): boolean {
  return (
    mime.startsWith("text/") ||
    ["application/json", "application/xml", "application/javascript", "image/svg+xml"].includes(mime)
  );
}

/** Images both providers accept as vision input. */
export function isVisionImage(mime: string): boolean {
  return ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(mime);
}

export function safeName(name: string): string {
  const base = path.basename(name).replace(/[\u0000-\u001f<>:"/\\|?*]+/g, "_").replace(/^\.+/, "").trim();
  return base.slice(0, 120) || "file";
}

/**
 * Resolves a path the model gave us inside the workspace, or throws if it tries to leave it.
 * The check is on the real path too, so a symlink in the workspace can't point outside.
 */
export function workspacePath(relative: string): string {
  const target = path.resolve(WORKSPACE_DIR, relative);
  const rel = path.relative(WORKSPACE_DIR, target);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) throw new Error(`"${relative}" is outside the workspace`);
  let real = target;
  try {
    real = fs.realpathSync(target);
  } catch {
    // Doesn't exist yet (a new file); check its parent instead.
    try {
      real = path.join(fs.realpathSync(path.dirname(target)), path.basename(target));
    } catch {
      return target;
    }
  }
  const realRel = path.relative(fs.realpathSync(WORKSPACE_DIR), real);
  if (realRel.startsWith("..") || path.isAbsolute(realRel)) throw new Error(`"${relative}" is outside the workspace`);
  return target;
}

function uniqueWorkspaceName(name: string): string {
  const ext = path.extname(name);
  const stem = name.slice(0, name.length - ext.length);
  let candidate = name;
  for (let i = 2; fs.existsSync(path.join(WORKSPACE_DIR, candidate)); i++) candidate = `${stem} (${i})${ext}`;
  return candidate;
}

export function saveUpload(originalName: string, mime: string, data: Buffer, conversationId: string | null): FileRecord {
  const blobName = newId("blob");
  const blobPath = path.join(BLOB_DIR, blobName);
  fs.writeFileSync(blobPath, encryptBytes(data));
  const name = uniqueWorkspaceName(safeName(originalName));
  fs.writeFileSync(path.join(WORKSPACE_DIR, name), data);
  return addFile({ name, mime: mime || mimeFor(name), size: data.length, origin: "upload", conversationId }, blobPath);
}

/** Registers (or refreshes) a file the agent created in the workspace. */
export function registerGenerated(relative: string, conversationId: string | null): FileRecord {
  const full = workspacePath(relative);
  const stat = fs.statSync(full);
  const mime = mimeFor(relative);
  const existing = findFileByPath(full);
  if (existing) {
    updateFileSize(existing.id, stat.size, mime);
    return { ...existing, size: stat.size, mime };
  }
  return addFile({ name: relative, mime, size: stat.size, origin: "generated", conversationId }, full);
}

export function readFileBytes(id: string, opts: { includeDeleted?: boolean } = {}): { record: FileRecord; data: Buffer } | null {
  const record = getFile(id, opts.includeDeleted);
  if (!record || !fs.existsSync(record.path)) return null;
  const raw = fs.readFileSync(record.path);
  return { record, data: record.path.startsWith(BLOB_DIR + path.sep) ? decryptBytes(raw) : raw };
}

const SKIP_DIRS = new Set(["node_modules", ".git", "__pycache__", ".venv", "venv", ".cache"]);

/** Every file in the workspace with its size and mtime, for spotting what a run of code created. */
export function snapshotWorkspace(): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (dir: string, prefix: string, depth: number) => {
    if (depth > 4 || out.size > 2000) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, rel, depth + 1);
      else if (entry.isFile()) {
        const s = fs.statSync(full);
        out.set(rel, `${s.size}:${s.mtimeMs}`);
      }
    }
  };
  walk(WORKSPACE_DIR, "", 0);
  return out;
}

export function changedFiles(before: Map<string, string>): string[] {
  const after = snapshotWorkspace();
  return [...after.entries()].filter(([rel, sig]) => before.get(rel) !== sig).map(([rel]) => rel);
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
