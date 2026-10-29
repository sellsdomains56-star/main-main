"use server";
import { uid } from "@/lib/db";
import { influencerByEmail, saveInfluencer } from "@/lib/store";
import { getSettings } from "@/lib/store";

export type State = { ok?: boolean; error?: string };

export async function applyAsCreator(_: State, fd: FormData): Promise<State> {
  const s = (k: string, max = 120) => String(fd.get(k) ?? "").trim().slice(0, max);
  const email = s("email").toLowerCase(), name = s("name"), handle = s("handle").replace(/^@/, "");
  if (!name || !handle || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Please add your name, handle and a valid email." };
  const existing = await influencerByEmail(email);
  if (existing) return { error: "We already have an application or account with that email." };
  const settings = await getSettings();
  await saveInfluencer({
    id: uid(), name, handle, platform: s("platform", 30), followers: s("followers", 30), email, code: "",
    commissionPct: settings.defaultCommissionPct, customerDiscountPct: settings.defaultCustomerDiscountPct,
    status: "applied", createdAt: new Date().toISOString(),
  });
  return { ok: true };
}
