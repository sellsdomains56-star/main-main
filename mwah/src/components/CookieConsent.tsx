"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Creator = { code: string; name: string; discountPct: number };
const getCookie = (k: string) => document.cookie.split("; ").find((c) => c.startsWith(k + "="))?.split("=")[1];
const setConsent = (v: "all" | "essential") => { document.cookie = `mwah_consent=${v}; max-age=31536000; path=/; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`; };

/**
 * Essential cookies only unless the visitor says yes. A creator link (?ref=CODE) is held in memory until they agree;
 * if they decline, we show the code to type at checkout instead and save nothing.
 */
export function CookieConsent() {
  const router = useRouter();
  const [choice, setChoice] = useState<string | undefined>("pending");
  const [creator, setCreator] = useState<Creator | null>(null);
  const [saved, setSaved] = useState(false);

  async function saveRef(code: string) {
    const r = await fetch("/api/ref", { method: "POST", body: JSON.stringify({ code }) });
    const d = await r.json();
    if (d.code) { setCreator(d); setSaved(true); router.refresh(); }
  }

  useEffect(() => {
    const c = getCookie("mwah_consent");
    setChoice(c);
    const ref = new URLSearchParams(location.search).get("ref");
    if (ref) {
      try { sessionStorage.setItem("mwah_ref_pending", ref); } catch {}
      history.replaceState(null, "", location.pathname); // keep the address bar clean
    }
    let pending: string | null = null;
    try { pending = sessionStorage.getItem("mwah_ref_pending"); } catch {}
    if (pending) {
      fetch(`/api/ref?code=${encodeURIComponent(pending)}`).then((r) => r.json()).then((d) => {
        if (!d.code) return;
        setCreator(d);
        if (c === "all") saveRef(d.code);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function decide(v: "all" | "essential") {
    setConsent(v); setChoice(v);
    if (v === "all" && creator) saveRef(creator.code);
  }

  if (choice === "pending") return null;
  return (
    <>
      {choice === undefined && (
        <div role="dialog" aria-label="Cookies" className="fixed inset-x-0 bottom-0 z-40 p-3">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-3xl border-2 border-ink bg-white p-4 shadow-xl">
            <p className="min-w-60 flex-1 text-sm">
              We use essential cookies to run the shop.{creator ? ` Your creator link from ${creator.name} also needs a cookie so your ${creator.discountPct}% discount follows you to checkout.` : " Creator links use an optional cookie to remember who sent you."} <Link href="/cookies" className="font-bold underline">Cookie policy</Link>
            </p>
            <div className="flex gap-2">
              <button onClick={() => decide("essential")} className="btn btn-ghost px-4 py-2 text-sm">Essential only</button>
              <button onClick={() => decide("all")} className="btn btn-pink px-4 py-2 text-sm">Accept all</button>
            </div>
          </div>
        </div>
      )}
      {choice === "essential" && creator && !saved && (
        <div role="status" className="fixed inset-x-0 bottom-0 z-40 p-3">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-3xl bg-butter p-4 text-sm font-bold shadow-xl">
            <span>Use code <code className="rounded bg-white px-1.5 py-0.5">{creator.code}</code> at checkout for {creator.discountPct}% off.</span>
            <button onClick={() => setCreator(null)} className="text-lg" aria-label="Dismiss">✕</button>
          </div>
        </div>
      )}
    </>
  );
}
