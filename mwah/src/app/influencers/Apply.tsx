"use client";
import { useActionState } from "react";
import Link from "next/link";
import { applyAsCreator, type State } from "./actions";

export function Apply() {
  const [st, action, pending] = useActionState<State, FormData>(applyAsCreator, {});
  if (st.ok) return <div className="card p-8 text-center"><p className="text-5xl">🎉</p><h2 className="mt-2 text-3xl font-extrabold">Application sent!</h2><p className="mt-2">We&apos;ll email you once we&apos;ve had a look.</p></div>;
  return (
    <form action={action} className="card space-y-4 p-6">
      <h2 className="text-2xl font-extrabold">Apply</h2>
      <div><label className="label" htmlFor="name">Your name</label><input id="name" name="name" required defaultValue={st.values?.name} className="input" /></div>
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required defaultValue={st.values?.email} className="input" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="handle">Handle</label><input id="handle" name="handle" required placeholder="@yourname" defaultValue={st.values?.handle} className="input" /></div>
        <div><label className="label" htmlFor="platform">Platform</label><select id="platform" name="platform" defaultValue={st.values?.platform} className="input"><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Snapchat</option><option>Other</option></select></div>
      </div>
      <div><label className="label" htmlFor="followers">Followers (approx.)</label><input id="followers" name="followers" placeholder="e.g. 25k" defaultValue={st.values?.followers} className="input" /></div>
      <label className="flex gap-2 text-sm"><input type="checkbox" name="agree" required className="mt-1 h-5 w-5 shrink-0 accent-pink-500" /><span>I agree to the <Link href="/creator-terms" target="_blank" className="font-bold underline">Creator Terms</Link> (including disclosing paid partnerships) and the <Link href="/privacy" target="_blank" className="font-bold underline">Privacy Policy</Link>.</span></label>
      {st.error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm font-bold text-red-800">{st.error}</p>}
      <button disabled={pending} className="btn btn-pink w-full">{pending ? "Sending…" : "Send application"}</button>
    </form>
  );
}
