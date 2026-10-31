import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { activeProducts, discountByCode, getSettings, influencerByCode } from "@/lib/store";
import { quote } from "@/lib/pricing";
import { estimateWindow } from "@/lib/delivery";

// Live totals for the cart and checkout. Everything is recomputed from the database, never trusted from the browser.
export async function POST(req: NextRequest) {
  const { lines = [], country = "AE", code = "", email = "" } = await req.json();
  const [products, settings] = await Promise.all([activeProducts(), getSettings()]);
  const typed = String(code).trim();
  const discount = await discountByCode(typed);
  const refCode = typed && !discount ? typed : (await cookies()).get("mwah_ref")?.value;
  let influencer = await influencerByCode(refCode);
  if (influencer && email && influencer.email === String(email).toLowerCase()) influencer = null;
  const q = quote({ products, lines, country, settings, discount, influencer });
  const codeOk = Boolean(typed) && (Boolean(discount) || (influencer?.code === typed.toUpperCase()));
  const win = estimateWindow(settings, q.zone);
  return NextResponse.json({
    ...q, codeOk, creator: influencer ? influencer.name : null,
    delivery: { from: win.from.toISOString(), to: win.to.toISOString(), processing: [settings.processingMinDays, settings.processingMaxDays], transit: [q.zone.minDays, q.zone.maxDays] },
  });
}
