const API = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

export interface TgMessage {
  message_id: number;
  from?: { id: number; first_name?: string; is_bot?: boolean };
  chat: { id: number; type: string };
  text?: string;
  voice?: unknown;
  photo?: unknown;
  document?: unknown;
}
export interface TgUpdate {
  update_id: number;
  message?: TgMessage;
}

async function call<T>(token: string, method: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const res = await fetch(API(token, method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const json = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description ?? res.status}`);
  return json.result as T;
}

export const getUpdates = (token: string, offset: number) =>
  call<TgUpdate[]>(token, "getUpdates", { offset, timeout: 30, allowed_updates: ["message"] }, AbortSignal.timeout(45_000));

export const sendText = (token: string, chatId: number, text: string) => call(token, "sendMessage", { chat_id: chatId, text });

/** Shows "typing…" for about 5 seconds; call again to keep it going. */
export const sendTyping = (token: string, chatId: number) => call(token, "sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
