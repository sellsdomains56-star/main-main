import { h } from "./dom.js";
import { icon, logo } from "./icons.js";
import { lang, t } from "./i18n.js";
import { state } from "./state.js";
import { toast } from "./util.js";
import { sendSpoken } from "./chat.js";

/**
 * Voice calls: talk to your agent hands-free and hear it answer, like a phone call.
 * It listens, sends what you said to the current chat, speaks the reply (with
 * ElevenLabs when the server has a key, otherwise the device's own voice), and
 * listens again. Tap to interrupt while it's talking.
 */

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

/** A tenth of a second of silence (as a blob: the page's security policy allows blob audio, not data: URLs). */
function silence(): string {
  const samples = 800;
  const buf = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buf);
  const text = (at: number, s: string) => [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)));
  text(0, "RIFF");
  v.setUint32(4, 36 + samples * 2, true);
  text(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true);
  v.setUint32(28, 16000, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  text(36, "data");
  v.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

type Phase = "listening" | "thinking" | "speaking" | "paused";

let active: { end(): void } | null = null;

const speechLang = () => (lang() === "ar" ? (navigator.language?.startsWith("ar") ? navigator.language : "ar-SA") : navigator.language || "en-US");

function plain(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/[*_~#|>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function startCall(): void {
  if (active) return;
  const Ctor =
    (window as unknown as Record<string, new () => Recognition>).SpeechRecognition ??
    (window as unknown as Record<string, new () => Recognition>).webkitSpeechRecognition;
  if (!Ctor) return void toast(t("Voice input isn't supported in this browser"), "error");

  const agent = state.current?.agent ?? state.draftAgent;
  const natural = !!state.boot.features.voice?.naturalVoice;
  let phase: Phase = "listening";
  let ended = false;
  let recognition: Recognition | null = null;
  let quietTurns = 0;

  // Phones only play audio started by a tap: unlock both voices now, while we have one.
  const audio = new Audio();
  audio.src = silence();
  void audio.play().catch(() => {});
  if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(""));

  const statusEl = h("p", { class: "call-status", role: "status" });
  const heard = h("p", { class: "call-heard", dir: "auto" });
  const said = h("p", { class: "call-said", dir: "auto" });
  const avatar = h("div", { class: "call-avatar" }, agent ? h("span", { class: "call-emoji" }, agent.emoji) : h("span", { html: logo(64) }));
  const muteBtn = h("button", { class: "call-ctl", type: "button", "aria-label": t("Pause listening"), html: icon("mic", 22) });
  const endBtn = h("button", { class: "call-ctl end", type: "button", "aria-label": t("End call"), html: icon("phone", 22) });
  const overlay = h(
    "div",
    { class: "call-overlay", role: "dialog", "aria-modal": "true", "aria-label": t("Voice call") },
    h("div", { class: "call-body" }, avatar, h("h2", null, agent ? agent.name : state.boot.agentName), statusEl, heard, said),
    h("p", { class: "call-hint" }, t("Tap anywhere to interrupt")),
    h("div", { class: "call-controls" }, muteBtn, endBtn),
  );

  const setPhase = (next: Phase) => {
    phase = next;
    overlay.dataset.phase = next;
    statusEl.textContent = {
      listening: t("Listening…"),
      thinking: t("Thinking…"),
      speaking: t("Speaking…"),
      paused: t("Paused. Tap the microphone to talk."),
    }[next];
    muteBtn.classList.toggle("off", next === "paused");
  };

  const stopSpeaking = () => {
    audio.pause();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  };

  async function speak(text: string): Promise<void> {
    const words = plain(text);
    if (!words) return;
    setPhase("speaking");
    said.textContent = words;
    if (natural) {
      try {
        const res = await fetch("/api/voice/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Requested-With": "agent" },
          body: JSON.stringify({ text: words }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const url = URL.createObjectURL(await res.blob());
        if (ended || phase !== "speaking") return URL.revokeObjectURL(url);
        audio.src = url;
        await new Promise<void>((resolve) => {
          audio.onended = audio.onpause = audio.onerror = () => resolve();
          void audio.play().catch(() => resolve());
        });
        URL.revokeObjectURL(url);
        return;
      } catch {
        // Fall back to the device's voice.
      }
    }
    if (!("speechSynthesis" in window) || ended) return;
    const u = new SpeechSynthesisUtterance(words);
    u.lang = /[؀-ۿ]/.test(words) ? (speechLang().startsWith("ar") ? speechLang() : "ar-SA") : speechLang().startsWith("ar") ? "en-US" : speechLang();
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(u.lang.slice(0, 2).toLowerCase()));
    if (voice) u.voice = voice;
    await new Promise<void>((resolve) => {
      u.onend = u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }

  function listen() {
    if (ended || phase === "paused") return;
    setPhase("listening");
    heard.textContent = "";
    let finalText = "";
    recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLang();
    recognition.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      heard.textContent = text;
      if (e.results[e.results.length - 1]?.isFinal) finalText = text;
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast(t("Allow the microphone to talk to {name}.", { name: state.boot.agentName }), "error");
        end();
      }
    };
    recognition.onend = () => {
      recognition = null;
      if (ended || phase !== "listening") return;
      const text = (finalText || heard.textContent || "").trim();
      if (!text) {
        // Nothing heard: keep listening, but don't burn the battery forever.
        if (++quietTurns >= 4) setPhase("paused");
        else listen();
        return;
      }
      quietTurns = 0;
      void turn(text);
    };
    recognition.start();
  }

  async function turn(text: string) {
    setPhase("thinking");
    said.textContent = "";
    const reply = await sendSpoken(text).catch(() => null);
    if (ended) return;
    if (reply) await speak(reply);
    if (!ended && phase !== "paused") listen();
  }

  function end() {
    if (ended) return;
    ended = true;
    recognition?.abort();
    stopSpeaking();
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    active = null;
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") end();
  };

  // Tap anywhere (but the buttons) while it talks: it stops and listens to you.
  overlay.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".call-ctl")) return;
    if (phase === "speaking") {
      stopSpeaking();
      setPhase("listening");
      listen();
    }
  });
  muteBtn.addEventListener("click", () => {
    if (phase === "paused") {
      quietTurns = 0;
      setPhase("listening");
      listen();
    } else {
      recognition?.abort();
      stopSpeaking();
      setPhase("paused");
    }
  });
  endBtn.addEventListener("click", end);
  document.addEventListener("keydown", onKey);

  document.body.append(overlay);
  active = { end };
  setPhase("listening");
  listen();
}
