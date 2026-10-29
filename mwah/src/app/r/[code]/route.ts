import { NextRequest, NextResponse } from "next/server";
import { influencerByCode, recordClick } from "@/lib/store";

// Creator link: mwah.ae/r/ZARA  ->  remembers the creator for 30 days, then sends the visitor to the shop.
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const res = NextResponse.redirect(new URL("/?welcome=1", req.url));
  const inf = await influencerByCode(code);
  if (inf) {
    res.cookies.set("mwah_ref", inf.code, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
    if (!req.cookies.get("mwah_clicked")) { // one click per browser per day
      await recordClick(inf.id);
      res.cookies.set("mwah_clicked", "1", { maxAge: 60 * 60 * 24, path: "/" });
    }
  }
  return res;
}
