import { Api, TelegramClient } from "telegram";
import { NewMessage, type NewMessageEvent } from "telegram/events/index.js";
import { StringSession } from "telegram/sessions/index.js";
import { getUpdates, sendText, sendTyping } from "./telegram.js";
import { sleep } from "./humanize.js";

export interface Incoming {
  /** Telegram user id of the sender. */
  senderId: number;
  isPrivate: boolean;
  text?: string;
}

/** How Tim reaches Telegram: as a bot, or as a real account. The brain doesn't care which. */
export interface Transport {
  start(onMessage: (m: Incoming) => void): Promise<void>;
  typing(userId: number): Promise<void>;
  send(userId: number, text: string): Promise<void>;
}

export function botTransport(token: string): Transport {
  return {
    async start(onMessage) {
      let offset = 0;
      for (;;) {
        try {
          for (const u of await getUpdates(token, offset)) {
            offset = u.update_id + 1;
            const m = u.message;
            if (m?.from && !m.from.is_bot) onMessage({ senderId: m.from.id, isPrivate: m.chat.type === "private", text: m.text });
          }
        } catch (err) {
          console.error("polling error:", (err as Error).message);
          await sleep(3000);
        }
      }
    },
    typing: async (id) => void (await sendTyping(token, id)),
    send: async (id, text) => void (await sendText(token, id, text)),
  };
}

/** Tim as a real Telegram user account (MTProto). `session` comes from `npm run login`. */
export function accountTransport(apiId: number, apiHash: string, session: string): Transport {
  const client = new TelegramClient(new StringSession(session), apiId, apiHash, { connectionRetries: 10 });
  const peers = new Map<number, Api.TypeInputPeer>();
  const peerOf = async (userId: number): Promise<Api.TypeInputPeer> => peers.get(userId) ?? ((await client.getInputEntity(userId)) as Api.TypeInputPeer);

  return {
    async start(onMessage) {
      await client.connect();
      if (!(await client.checkAuthorization())) throw new Error("TELEGRAM_SESSION is not logged in. Run `npm run login` again.");
      const me = await client.getMe();
      console.log(`Tim is logged in as ${"firstName" in me ? me.firstName : "?"} (id ${me.id}).`);
      client.addEventHandler(async (ev: NewMessageEvent) => {
        const msg = ev.message;
        if (msg.out || !msg.senderId) return;
        const senderId = Number(msg.senderId.toString());
        const peer = await msg.getInputChat().catch(() => undefined);
        if (peer) peers.set(senderId, peer as Api.TypeInputPeer);
        // Mark it read, like a person opening the chat.
        client.markAsRead(peer ?? senderId).catch(() => {});
        onMessage({ senderId, isPrivate: ev.isPrivate === true, text: msg.message || undefined });
      }, new NewMessage({ incoming: true }));
      await new Promise<never>(() => {}); // run until the process is stopped
    },
    async typing(userId) {
      await client.invoke(new Api.messages.SetTyping({ peer: await peerOf(userId), action: new Api.SendMessageTypingAction() })).catch(() => {});
    },
    async send(userId, text) {
      await client.sendMessage(await peerOf(userId), { message: text });
    },
  };
}
