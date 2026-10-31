"use client";
import { useEffect, useRef, useState } from "react";

// Shows how many orders Mwah has had. Starts from the server's number, re-checks every 30s while the tab is open,
// and counts up smoothly when a new order has come in.
export function OrderCounter({ initial }: { initial: number }) {
  const [target, setTarget] = useState(initial);
  const [shown, setShown] = useState(initial);
  const shownRef = useRef(initial);

  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try { const r = await fetch("/api/stats", { cache: "no-store" }); const d = await r.json(); if (typeof d.orders === "number") setTarget(d.orders); } catch {}
    };
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const from = shownRef.current;
    if (from === target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { shownRef.current = target; setShown(target); return; }
    const start = performance.now(), dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const v = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
      shownRef.current = v; setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  if (target === 0) return <p className="mt-6 text-sm font-bold">💋 Be our very first order</p>;
  return (
    <p className="mt-6 text-sm font-bold" aria-live="polite">
      💋 <span className="font-display text-2xl font-extrabold text-pink tabular-nums">{shown.toLocaleString("en")}</span>{" "}
      {target === 1 ? "order placed" : "orders placed"} and counting
    </p>
  );
}
