import { NextRequest, NextResponse } from "next/server";
import { influencerByCode } from "@/lib/store";

// Creator link: /r/ZARA. Stores nothing by itself: it hands the code to the page, which saves it (30 days)
// only after the visitor agrees to cookies. The code can always be typed at checkout instead.
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const inf = await influencerByCode(code);
  return NextResponse.redirect(new URL(inf ? `/?ref=${encodeURIComponent(inf.code)}` : "/", req.url));
}
