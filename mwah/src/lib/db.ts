import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Row, Table } from "./types";
import { seed } from "./seed";

/**
 * One tiny storage interface, two backends:
 *  - Supabase (production): every table is `id text primary key, data jsonb`. See supabase/schema.sql.
 *  - Local JSON file (.data/db.json): used automatically when Supabase keys are not set, so the shop runs out of the box.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const usingSupabase = Boolean(url && key);

const sb = usingSupabase ? createClient(url!, key!, { auth: { persistSession: false } }) : null;

const FILE = path.join(process.cwd(), ".data", "db.json");
type Dump = Record<Table, Row[]>;
function readFile(): Dump {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(seed(), null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
function writeFile(d: Dump) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

export async function list<T extends Row>(table: Table): Promise<T[]> {
  if (sb) {
    const { data, error } = await sb.from(table).select("id,data").limit(10000);
    if (error) throw new Error(`${table}: ${error.message}`);
    return (data ?? []).map((r) => ({ ...(r.data as object), id: r.id }) as T);
  }
  return readFile()[table] as T[];
}
export async function get<T extends Row>(table: Table, id: string): Promise<T | null> {
  if (sb) {
    const { data, error } = await sb.from(table).select("id,data").eq("id", id).maybeSingle();
    if (error) throw new Error(`${table}: ${error.message}`);
    return data ? ({ ...(data.data as object), id: data.id } as T) : null;
  }
  return (readFile()[table] as T[]).find((r) => r.id === id) ?? null;
}
export async function put<T extends Row>(table: Table, row: T): Promise<T> {
  if (sb) {
    const { id, ...rest } = row;
    const { error } = await sb.from(table).upsert({ id, data: rest });
    if (error) throw new Error(`${table}: ${error.message}`);
    return row;
  }
  const d = readFile();
  const rows = d[table] as Row[];
  const i = rows.findIndex((r) => r.id === row.id);
  if (i >= 0) rows[i] = row; else rows.push(row);
  writeFile(d);
  return row;
}
export async function remove(table: Table, id: string) {
  if (sb) { await sb.from(table).delete().eq("id", id); return; }
  const d = readFile();
  d[table] = (d[table] as Row[]).filter((r) => r.id !== id);
  writeFile(d);
}
export const uid = () => crypto.randomUUID();
