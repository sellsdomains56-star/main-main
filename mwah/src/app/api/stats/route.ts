import { NextResponse } from "next/server";
import { orderCount } from "@/lib/store";

// Public, read-only: just the number of orders, nothing about who ordered.
export async function GET() {
  return NextResponse.json({ orders: await orderCount() }, { headers: { "Cache-Control": "no-store" } });
}
