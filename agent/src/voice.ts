import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { availableModels, config } from "./config.js";
import { createConversation, getSettings } from "./db.js";
import { sendMessage } from "./agent/chat.js";
import { isUnlocked } from "./vault.js";

/**
 * Talking to your agent out loud: a natural voice for calls in the app (ElevenLabs,
 * optional) and a real phone number it answers (Twilio, optional).
 */

const ARABIC = /[؀-ۿ]/;

/** Markdown turned into something that sounds right read aloud. */
export function speakable(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/\|/g, ", ")
    .replace(/[*_~#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── A natural voice (ElevenLabs) ─────────────────────────────────────────────

/** Speaks text with ElevenLabs; the caller streams the MP3 on to the browser. */
export async function synthesize(text: string, signal?: AbortSignal): Promise<globalThis.Response> {
  const spoken = speakable(text).slice(0, 4000);
  const model = config.elevenlabsModel;
  const res = await fetch(`${config.elevenlabsBaseUrl}/text-to-speech/${encodeURIComponent(config.elevenlabsVoiceId)}/stream?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": config.elevenlabsKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: spoken,
      model_id: model,
      // Flash and Turbo models take a language hint, which helps Arabic.
      ...(/flash|turbo/.test(model) ? { language_code: ARABIC.test(spoken) ? "ar" : "en" } : {}),
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
    }),
    signal: signal ?? AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

// ── A phone number (Twilio) ──────────────────────────────────────────────────

const xml = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
const twiml = (body: string) => `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;

/** The address Twilio called, exactly as it signed it. */
function calledUrl(req: Request): string {
  const base = config.publicUrl || `${req.protocol}://${req.get("host")}`;
  return `${base}${req.originalUrl}`;
}

/** Twilio signs each request: HMAC-SHA1 of the URL plus the sorted POST fields, with your auth token. */
export function validTwilioSignature(req: Request): boolean {
  if (!config.twilioAuthToken) return false;
  const params = (req.body ?? {}) as Record<string, string>;
  const data = calledUrl(req) + Object.keys(params).sort().map((k) => k + params[k]).join("");
  const expected = Buffer.from(createHmac("sha1", config.twilioAuthToken).update(data, "utf8").digest("base64"));
  const given = Buffer.from(req.get("x-twilio-signature") ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const normalize = (n: string) => n.replace(/[^\d+]/g, "");
export const callerAllowed = (from: string) => config.twilioAllowedCallers.includes(normalize(from));

function phoneLanguage(): { language: string; voice: string; ar: boolean } {
  const ar = config.twilioLanguage ? config.twilioLanguage.startsWith("ar") : getSettings().language === "ar";
  return {
    ar,
    language: config.twilioLanguage || (ar ? "ar-AE" : "en-US"),
    voice: config.twilioVoice || (ar ? "Google.ar-XA-Chirp3-HD-Kore" : "Google.en-US-Chirp3-HD-Aoede"),
  };
}

const say = (text: string) => {
  const { language, voice } = phoneLanguage();
  return `<Say voice="${xml(voice)}" language="${xml(language)}">${xml(text)}</Say>`;
};

/** Listens for the caller's next sentence and sends it to /turn. */
function listen(prompt?: string): string {
  const { language, ar } = phoneLanguage();
  return (
    `<Gather input="speech" action="/api/voice/twilio/turn" method="POST" speechTimeout="auto" language="${xml(language)}">` +
    (prompt ? say(prompt) : "") +
    `</Gather>` +
    say(ar ? "لم أسمع شيئًا. مع السلامة." : "I didn't hear anything. Goodbye.") +
    "<Hangup/>"
  );
}

interface Call {
  conversationId: string | null;
  reply: Promise<string> | null;
  waits: number;
  pinTries: number;
}
const calls = new Map<string, Call>();
const GOODBYE = /^(bye|goodbye|bye bye|that's all|thanks,? bye|hang up|مع السلامة|باي|خلاص شكرا|في امان الله|في أمان الله)[\s.!؟?]*$/i;

/** First contact: check who's calling, then greet them. */
export function incomingCall(body: Record<string, string>): string {
  const { ar } = phoneLanguage();
  if (!callerAllowed(body.From ?? "")) return twiml('<Reject reason="rejected"/>');
  if (!isUnlocked()) {
    return twiml(say(ar ? "Dizz Lab مقفل. افتح التطبيق وسجّل الدخول أولًا." : "Dizz Lab is locked. Open the app and sign in first.") + "<Hangup/>");
  }
  calls.set(body.CallSid, { conversationId: null, reply: null, waits: 0, pinTries: 0 });
  if (config.twilioPin) return twiml(askPin(ar ? "أدخل رمزك السري ثم اضغط المربع." : "Please enter your PIN, then press pound."));
  return twiml(greet(body.CallSid));
}

function askPin(prompt: string): string {
  return `<Gather input="dtmf" action="/api/voice/twilio/pin" method="POST" finishOnKey="#" timeout="10">${say(prompt)}</Gather>${say("Goodbye.")}<Hangup/>`;
}

/** Checks the keypad PIN; three wrong tries end the call. */
export function callPin(body: Record<string, string>): string {
  const call = calls.get(body.CallSid);
  const { ar } = phoneLanguage();
  if (!call) return twiml("<Hangup/>");
  const given = Buffer.from((body.Digits ?? "").replace(/\D/g, ""));
  const pin = Buffer.from(config.twilioPin);
  if (given.length === pin.length && timingSafeEqual(given, pin)) return twiml(greet(body.CallSid));
  if (++call.pinTries >= 3) {
    calls.delete(body.CallSid);
    return twiml(say(ar ? "رمز غير صحيح. مع السلامة." : "That PIN isn't right. Goodbye.") + "<Hangup/>");
  }
  return twiml(askPin(ar ? "رمز غير صحيح. حاول مرة أخرى." : "That PIN isn't right. Try again."));
}

/** Opens the call's chat and says hello. */
function greet(callSid: string): string {
  const { ar } = phoneLanguage();
  const call = calls.get(callSid)!;
  const when = new Intl.DateTimeFormat(ar ? "ar-u-nu-latn" : "en-GB", { timeZone: config.timezone, dateStyle: "medium", timeStyle: "short" }).format(Date.now());
  call.conversationId = createConversation(`📞 ${ar ? "مكالمة" : "Call"} · ${when}`).id;
  const name = getSettings().userName.trim();
  const greeting = ar ? `أهلًا${name ? ` ${name}` : ""}، معك Dizz Lab. كيف أقدر أساعدك؟` : `Hi${name ? ` ${name}` : ""}, it's Dizz Lab. How can I help?`;
  return listen(greeting);
}

/** Twilio gives a webhook 15 seconds; a reply that takes longer is picked up by /wait. */
const WAIT_MS = 9_000;

async function within(reply: Promise<string>, ms: number): Promise<string | null> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<null>((resolve) => (timer = setTimeout(() => resolve(null), ms)));
  try {
    return await Promise.race([reply, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function answer(call: Call, text: string): string {
  call.reply = null;
  call.waits = 0;
  const spoken = speakable(text).slice(0, 1500) || "Done.";
  return twiml(listen(spoken));
}

/** The caller said something: run the agent on it and speak the reply. */
export async function callTurn(body: Record<string, string>): Promise<string> {
  const call = calls.get(body.CallSid);
  const { ar } = phoneLanguage();
  if (!call?.conversationId || !isUnlocked()) return twiml(say(ar ? "انتهت المكالمة. اتصل مرة أخرى." : "This call has ended. Please call again.") + "<Hangup/>");
  const text = (body.SpeechResult ?? "").trim();
  if (!text) return twiml(listen(ar ? "عذرًا، لم أسمعك." : "Sorry, I didn't catch that."));
  if (GOODBYE.test(text)) {
    calls.delete(body.CallSid);
    return twiml(say(ar ? "مع السلامة!" : "Bye for now!") + "<Hangup/>");
  }
  // Quick replies on the phone: Smart pick (when there is one) at the fast setting.
  const auto = availableModels().some((m) => m.id === "auto");
  const run = sendMessage({ conversationId: call.conversationId, text, voice: true, effort: "fast", model: auto ? "auto" : undefined });
  call.reply = new Promise<string>((resolve) => {
    let reply = "";
    run.subscribe(
      (e) => {
        if (e.type === "done") reply = e.message.text || e.message.error || "";
      },
      () => resolve(reply),
    );
  });
  const reply = await within(call.reply, WAIT_MS);
  if (reply !== null) return answer(call, reply);
  return twiml(say(ar ? "لحظة من فضلك." : "One moment.") + '<Redirect method="POST">/api/voice/twilio/wait</Redirect>');
}

/** Still thinking: wait some more (Twilio follows the redirect), up to about two minutes. */
export async function callWait(body: Record<string, string>): Promise<string> {
  const call = calls.get(body.CallSid);
  const { ar } = phoneLanguage();
  if (!call?.reply) return twiml(listen());
  const reply = await within(call.reply, WAIT_MS);
  if (reply !== null) return answer(call, reply);
  if (++call.waits > 12) {
    call.reply = null;
    return twiml(listen(ar ? "ما زلت أعمل على ذلك؛ ستجد الرد في التطبيق. هل من شيء آخر؟" : "I'm still working on that; you'll find the answer in the app. Anything else?"));
  }
  return twiml('<Pause length="1"/><Redirect method="POST">/api/voice/twilio/wait</Redirect>');
}

export function callEnded(body: Record<string, string>): void {
  calls.delete(body.CallSid);
}
