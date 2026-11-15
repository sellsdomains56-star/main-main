import type { Speed } from "./humanize.js";
import { readJson, writeJson } from "./store.js";

export interface Turn {
  role: "user" | "assistant";
  text: string;
}
interface State {
  speed: Speed;
  history: Turn[];
}

const MAX_TURNS = 60;
const load = () => readJson<State>("state.json", { speed: "normal", history: [] });

export const getSpeed = (): Speed => load().speed;
export function setSpeed(speed: Speed): void {
  const s = load();
  s.speed = speed;
  writeJson("state.json", s);
}
export const getHistory = (): Turn[] => load().history;
export function pushTurns(...turns: Turn[]): void {
  const s = load();
  s.history = [...s.history, ...turns].slice(-MAX_TURNS);
  // The window must start on a user turn or the API rejects it.
  while (s.history[0]?.role === "assistant") s.history.shift();
  writeJson("state.json", s);
}
