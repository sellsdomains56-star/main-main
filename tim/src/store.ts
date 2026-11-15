import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const DATA_DIR = process.env.TIM_DATA_DIR ?? new URL("../data/", import.meta.url).pathname;

export function readJson<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(DATA_DIR + name, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Write atomically so a crash mid-write never leaves a half-written job book. */
export function writeJson(name: string, value: unknown): void {
  const path = DATA_DIR + name;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path + ".tmp", JSON.stringify(value, null, 2));
  renameSync(path + ".tmp", path);
}

export function readText(name: string): string {
  try {
    return readFileSync(DATA_DIR + name, "utf8");
  } catch {
    return "";
  }
}

export function writeText(name: string, value: string): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_DIR + name, value, { mode: 0o600 });
}
