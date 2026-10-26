import { availableModels, type ModelInfo } from "../config.js";
import { getConversation, updateConversation } from "../db.js";
import { providerFor } from "./providers/index.js";

function fallbackTitle(text: string): string {
  const words = text.replace(/\s+/g, " ").trim().split(" ").slice(0, 7).join(" ");
  return words.length > 60 ? `${words.slice(0, 57)}…` : words || "New chat";
}

/** The cheapest model from the same provider, for naming chats. */
function titleModel(model: ModelInfo): ModelInfo {
  if (model.provider === "anthropic") return availableModels().find((m) => m.id.includes("haiku")) ?? model;
  return model;
}

/** Names a chat from its first exchange. Returns the new title, or null if it already had one. */
export async function autoTitle(conversationId: string, userText: string, reply: string, model: ModelInfo): Promise<string | null> {
  const conversation = getConversation(conversationId);
  if (!conversation || conversation.title) return null;
  let title = fallbackTitle(userText);
  try {
    const m = titleModel(model);
    const suggested = await providerFor(m.provider).quick(
      m.id,
      "Write a short title (2 to 6 words) for this chat. Reply with the title only: no quotes, no full stop.\n\n" +
        `User: ${userText.slice(0, 1500)}\nAssistant: ${reply.slice(0, 1500)}`,
      AbortSignal.timeout(20_000),
    );
    const clean = suggested.split("\n")[0].replace(/^["'“”#*\s]+|["'“”.*\s]+$/g, "").slice(0, 80);
    if (clean) title = clean;
  } catch {
    // Keep the fallback.
  }
  if (getConversation(conversationId)?.title) return null;
  updateConversation(conversationId, { title });
  return title;
}
