export type Speed = "instant" | "fast" | "normal" | "slow";
export const SPEEDS: Speed[] = ["instant", "fast", "normal", "slow"];

const FACTOR: Record<Speed, number> = { instant: 0, fast: 0.35, normal: 1, slow: 2 };

/** Split Tim's reply into chat bubbles: one per non-empty line, long lines broken at sentence ends. */
export function toBubbles(reply: string): string[] {
  const out: string[] = [];
  for (const line of reply.split("\n").map((l) => l.trim()).filter(Boolean)) {
    if (line.length <= 220) {
      out.push(line);
      continue;
    }
    let cur = "";
    for (const part of line.split(/(?<=[.!?])\s+/)) {
      if (cur && (cur + " " + part).length > 220) {
        out.push(cur);
        cur = part;
      } else cur = cur ? cur + " " + part : part;
    }
    if (cur) out.push(cur);
  }
  return out.slice(0, 8);
}

/** Time to "read" the incoming message before starting to type. */
export function readDelayMs(incoming: string, speed: Speed, rng: () => number = Math.random): number {
  if (speed === "instant") return 0;
  const base = 500 + Math.min(incoming.length, 200) * 6 + rng() * 900;
  return Math.round(Math.min(base * FACTOR[speed], 6000));
}

/** Time to "type" one bubble: roughly 7 characters a second for a phone typist, with jitter. */
export function typingDelayMs(bubble: string, speed: Speed, rng: () => number = Math.random): number {
  if (speed === "instant") return 0;
  const base = 350 + bubble.length * 130 * (0.8 + rng() * 0.5);
  return Math.round(Math.min(base * FACTOR[speed], 9000));
}

/** Short pause between two bubbles, like someone hitting send and starting the next thought. */
export function betweenMs(speed: Speed, rng: () => number = Math.random): number {
  if (speed === "instant") return 0;
  return Math.round((250 + rng() * 500) * FACTOR[speed]);
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
