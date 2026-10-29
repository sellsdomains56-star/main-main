import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth";
import { uid } from "@/lib/db";

// Admin-only product image upload. Supabase Storage bucket "products" in production, public/uploads locally.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const file = (await req.formData()).get("file") as File | null;
  const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[file?.type ?? ""];
  if (!file || !ext || file.size > 5_000_000) return NextResponse.json({ error: "Use a JPG, PNG or WebP under 5 MB." }, { status: 400 });
  const name = `${uid()}.${ext}`, bytes = Buffer.from(await file.arrayBuffer());
  const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  if (url && key) {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await sb.storage.from("products").upload(name, bytes, { contentType: file.type });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ url: sb.storage.from("products").getPublicUrl(name).data.publicUrl });
  }
  fs.mkdirSync(path.join(process.cwd(), "public", "uploads"), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), "public", "uploads", name), bytes);
  return NextResponse.json({ url: `/uploads/${name}` });
}
