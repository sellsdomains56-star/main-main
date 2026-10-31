"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// Re-fetches the server data of the current page on a timer, so a dashboard stays live without a manual reload.
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) router.refresh(); }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
