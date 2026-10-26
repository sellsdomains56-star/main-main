import { AUTO_MODEL, availableModels, type ModelInfo } from "../config.js";
import type { Effort, FileRecord } from "../types.js";

export { AUTO_MODEL };

const HARD =
  /\b(analy[sz]e|analysis|plan|strategy|research|report|compare|comparison|prove|proof|debug|refactor|architecture|design|optimi[sz]e|calculate|forecast|budget|contract|legal|essay|business plan|step[- ]by[- ]step|explain why|pros and cons)\b|حلل|تحليل|خطة|استراتيجية|بحث|تقرير|قارن|مقارنة|برهن|ميزانية|توقع|عقد|قانوني|اشرح لماذا/i;
const SMALL_TALK = /^(hi|hey|hello|yo|thanks|thank you|thx|ok|okay|cool|nice|great|good (morning|night|evening)|gm|gn|bye|lol|haha|👍|🙏|مرحبا|اهلا|أهلا|السلام عليكم|هلا|شكرا|شكرًا|تمام|حلو|ممتاز|صباح الخير|مساء الخير|تصبح على خير|مع السلامة)[\s!.؟?]*$/i;
const ABOUT_X = /\b(tweets?|twitter|on x|x\.com|trending on x|x posts?)\b|تويتر|تغريد|ترند/i;

/**
 * Chooses a model for one message. Rules of thumb, no extra request:
 * Max thinking → the most capable model; Deep, files, code or hard questions → Opus;
 * small talk → Haiku; questions about X → Grok when it's set up; everything else → Sonnet.
 */
export function routeModel(input: { text: string; attachments?: FileRecord[]; effort: Effort; scheduled?: boolean }): ModelInfo {
  const models = availableModels();
  const has = (id: string) => models.find((m) => m.id === id);
  const firstOf = (...ids: string[]) => ids.map(has).find(Boolean);
  const text = input.text.trim();
  const fallback = models.find((m) => m.id !== AUTO_MODEL.id) ?? models[0];

  if (ABOUT_X.test(text)) {
    const grok = models.find((m) => m.provider === "xai");
    if (grok) return grok;
  }
  if (input.effort === "max") return firstOf("claude-fable-5-1", "claude-opus-5-5") ?? fallback;
  const hard = input.effort === "deep" || (input.attachments?.length ?? 0) > 0 || text.length > 1200 || text.includes("```") || HARD.test(text);
  if (hard) return firstOf("claude-opus-5-5", "claude-fable-5-1", "claude-sonnet-5-5") ?? fallback;
  if (!input.scheduled && input.effort !== "deep" && (SMALL_TALK.test(text) || (text.length < 25 && !/[?؟]/.test(text)))) {
    return firstOf("claude-haiku-5-5", "claude-sonnet-5-5") ?? fallback;
  }
  return firstOf("claude-sonnet-5-5", "claude-opus-5-5") ?? fallback;
}
