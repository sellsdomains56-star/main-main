import { NextRequest, NextResponse } from "next/server";
import { influencerByCode, recordClick } from "@/lib/store";

// Public info about a creator code (so the page can say "10% off with Zara's code").
export async function GET(req: NextRequest) {
  const inf = await influencerByCode(req.nextUrl.searchParams.get("code"));
  return NextResponse.json(inf ? { code: inf.code, name: inf.name, discountPct: inf.customerDiscountPct } : { code: null });
}

// Called only after the visitor has accepted cookies: remembers the creator for 30 days and counts one click per day.
export async function POST(req: NextRequest) {
  if (req.cookies.get("mwah_consent")?.value !== "all") return NextResponse.json({ error: "Consent required" }, { status: 403 });
  const { code } = await req.json();
  const inf = await influencerByCode(code);
  if (!inf) return NextResponse.json({ code: null });
  const res = NextResponse.json({ code: inf.code, name: inf.name, discountPct: inf.customerDiscountPct });
  res.cookies.set("mwah_ref", inf.code, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  if (!req.cookies.get("mwah_clicked")) {
    await recordClick(inf.id);
    res.cookies.set("mwah_clicked", "1", { maxAge: 60 * 60 * 24, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  }
  return res;
}
