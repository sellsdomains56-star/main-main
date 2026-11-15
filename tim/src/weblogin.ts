// A tiny, password-protected login page so Tim's account can be logged in from a phone browser.
// It only runs until Tim is logged in; after that the page just says he's online.
import { timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function page(body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tim login</title>
<style>body{font:17px system-ui,sans-serif;max-width:420px;margin:40px auto;padding:0 16px;background:#fafafa;color:#111}
input,button{font:inherit;width:100%;box-sizing:border-box;padding:12px;margin:6px 0 14px;border:1px solid #bbb;border-radius:10px}
button{background:#111;color:#fff;border:0}.err{color:#b00020}.muted{color:#666;font-size:15px}</style></head><body><h2>Tim</h2>${body}</body></html>`;
}

async function readForm(req: IncomingMessage): Promise<URLSearchParams> {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 10_000) break;
  }
  return new URLSearchParams(raw);
}

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Serve the login page on `port` until the account is logged in, then resolve with the session string.
 * Afterwards the same server keeps answering "Tim is online" (useful as a health check).
 */
export function loginViaWeb(opts: { port: number; apiId: number; apiHash: string; pagePassword: string }): Promise<string> {
  const creds = { apiId: opts.apiId, apiHash: opts.apiHash };
  const client = new TelegramClient(new StringSession(""), opts.apiId, opts.apiHash, { connectionRetries: 5 });
  let step: "phone" | "code" | "2fa" | "done" = "phone";
  let phone = "";
  let phoneCodeHash = "";
  let wrongPasswords = 0;

  return new Promise((resolve) => {
    const form = (inner: string, err = "") =>
      page(`${err ? `<p class="err">${esc(err)}</p>` : ""}<form method="post">
<label>Page password<input name="pw" type="password" autocomplete="current-password" required></label>${inner}<button>Continue</button></form>`);
    const forms = {
      phone: (e = "") => form(`<label>Tim's phone number (with +country code)<input name="phone" type="tel" placeholder="+971…" required></label>`, e),
      code: (e = "") => form(`<p class="muted">Telegram sent a code to ${esc(phone)} (check the Telegram app on that number, or SMS).</p><label>Code<input name="code" inputmode="numeric" autocomplete="one-time-code" required></label>`, e),
      "2fa": (e = "") => form(`<label>Two-step verification password<input name="twofa" type="password" required></label>`, e),
    };

    const send = (res: ServerResponse, html: string, status = 200) => {
      res.writeHead(status, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY" });
      res.end(html);
    };

    const finish = () => {
      step = "done";
      const session = client.session.save() as unknown as string;
      client.disconnect().catch(() => {});
      resolve(session);
    };

    createServer(async (req, res) => {
      if (step === "done") return send(res, page("<p>Tim is logged in and online. You can close this page.</p>"));
      if (wrongPasswords >= 5) return send(res, page(`<p class="err">Locked after too many wrong page passwords. Restart Tim to try again.</p>`), 429);
      if (req.method !== "POST") return send(res, forms[step]());

      const f = await readForm(req);
      if (!same(f.get("pw") ?? "", opts.pagePassword)) {
        wrongPasswords++;
        return send(res, forms[step]("Wrong page password."), 401);
      }
      try {
        if (!client.connected) await client.connect();
        if (step === "phone") {
          phone = (f.get("phone") ?? "").replace(/[^\d+]/g, "");
          phoneCodeHash = (await client.sendCode(creds, phone)).phoneCodeHash;
          step = "code";
          return send(res, forms.code());
        }
        if (step === "code") {
          try {
            await client.invoke(new Api.auth.SignIn({ phoneNumber: phone, phoneCodeHash, phoneCode: (f.get("code") ?? "").replace(/\D/g, "") }));
          } catch (err) {
            if ((err as { errorMessage?: string }).errorMessage === "SESSION_PASSWORD_NEEDED") {
              step = "2fa";
              return send(res, forms["2fa"]());
            }
            throw err;
          }
          finish();
          return send(res, page("<p>Done. Tim is logged in. Message him from your own Telegram.</p>"));
        }
        if (step === "2fa") {
          let failed: Error | null = null;
          await client
            .signInWithPassword(creds, { password: async () => f.get("twofa") ?? "", onError: async (e) => ((failed = e), true) })
            .catch((e: Error) => (failed ??= e));
          if (failed) return send(res, forms["2fa"]("That password didn't work. Try again."));
          finish();
          return send(res, page("<p>Done. Tim is logged in. Message him from your own Telegram.</p>"));
        }
      } catch (err) {
        const msg = (err as { errorMessage?: string }).errorMessage ?? (err as Error).message;
        console.error("login step failed:", msg);
        if (/PHONE_CODE_(INVALID|EMPTY)/.test(msg)) return send(res, forms.code("Wrong code. Try again."));
        if (/PHONE_CODE_EXPIRED/.test(msg)) step = "phone";
        if (/PHONE_NUMBER_(INVALID|BANNED)/.test(msg)) step = "phone";
        return send(res, forms[step as "phone" | "code" | "2fa"](`Telegram said: ${msg}`));
      }
      send(res, forms[step as "phone" | "code" | "2fa"]());
    }).listen(opts.port, () => console.log(`Login page is up on port ${opts.port}. Open Tim's public URL on your phone.`));
  });
}
