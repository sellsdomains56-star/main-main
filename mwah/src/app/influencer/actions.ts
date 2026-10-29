"use server";
import { redirect } from "next/navigation";
import { checkPassword, loginInfluencer, logout } from "@/lib/auth";
import { influencerByEmail } from "@/lib/store";

export async function creatorLogin(_: { error?: string; email?: string }, fd: FormData) {
  const email = String(fd.get("email") ?? "");
  const i = await influencerByEmail(email);
  if (!i || i.status !== "active" || !checkPassword(String(fd.get("password") ?? ""), i.passwordHash))
    return { error: "Wrong email or password, or your account isn't active yet.", email };
  await loginInfluencer(i.id);
  redirect("/influencer");
}
export async function creatorLogout() { await logout("influencer"); redirect("/influencer"); }
