# Dizz Lab

**A private AI agent that works only for you.** It's a chat app you run yourself, at the polish level of Grok or ChatGPT, with Claude and Grok one click apart, live web and X search, connectors for Gmail, Calendar, Drive and other apps, long-term memory, reminders and scheduled tasks, files, code, image generation, and as many custom agents as you want, which can work in parallel swarms. Everything you store is encrypted with a key only your password unlocks.

## What it does

| | |
| --- | --- |
| **Claude + Grok** | Switch per message between Claude Fable 5.1 (the most capable, and the default), Opus 5.5, Sonnet 5.5, Haiku 5.5 and Grok 4.7. Or choose **Smart pick** and it picks for each message: Haiku for small talk, Sonnet for everyday questions, Opus for analysis, plans, code and files, Fable on Max, and Grok for questions about X. Pick **Fast**, **Auto**, **Deep** or **Max** thinking. Earlier turns are replayed exactly, so a conversation keeps its reasoning. Fable 5.1 costs about twice as much as Opus 5.5 per message; pick Opus under **Settings** if you'd rather. |
| **Live web** | Claude uses Anthropic's web search and page reading; Grok uses xAI's web search and **X search**. Sources show under every answer. |
| **Memory** | It remembers facts about you across chats (and you can see, add and delete them under **Memory**). It can also search your past conversations. With thousands of facts, each message gets the ones that matter (your standing instructions always), and it searches the rest, by meaning when you add a [Voyage AI](https://voyageai.com) key. Very long chats are condensed automatically on Claude so they never run out of room. |
| **Reminders & scheduled tasks** | "Remind me at 6 to call mum", "every weekday at 8, brief me on the news and the weather". Tasks run on their own and post the result, with a browser notification and, optionally, a phone push. |
| **Files** | Drop in images, PDFs, spreadsheets, code or any document; it reads them. Anything it makes (reports, CSVs, charts) appears as a download. |
| **Code** | Runs Python, JavaScript or shell on your machine for maths, data analysis, charts and file conversions. Your API keys are never visible to that code. |
| **Images** | "Generate an image of…" with Grok Imagine (needs an xAI key). |
| **Connectors** | Connect **Gmail**, **Google Calendar** and **Google Drive**, or one-click apps like **Notion, Linear, Jira & Confluence, Zapier, Canva, Stripe, PayPal, Vercel, Sentry and GitHub**, or **any app by pasting its link**. The agent can then read and draft email, check and add events, find documents and work in those apps. Emails it writes wait for your **Send** click unless you allow automatic sending. |
| **Agents** | Create unlimited named agents, each with its own instructions, model and abilities. Chat with one directly, or tell the main agent "create 20 agents for…". Import and export them as JSON. |
| **Swarms** | "Use my research agents to compare these 200 companies." The work is split across many agents running in parallel (8 at a time by default), with live progress, and you get one combined answer plus a full report file. |
| **Arabic & English** | The whole app is in English or Arabic (with a full right-to-left layout); switch under **Settings** or on the sign-in screen. The agent replies in Arabic when the app is in Arabic, and always in the language you write in. |
| **Spending** | **Usage & spending** shows what you've spent today, this week, this month and in total, a 30-day chart, and costs by model and agent (estimated from published prices, prompt caching and searches included). Set a monthly budget to get a notification at 80% and 100%. |
| **Voice** | Dictate with the mic button; turn on read-aloud in Settings. |
| **Anywhere** | Works on desktop and phone; install it to your home screen like an app. Dark and light themes. |

## Try it without installing

`npm run build:demo` builds two single-page versions into `dist/`:

- **`dizz-lab-demo.html`** is the whole app in one file that runs in any browser (desktop or phone) with **scripted replies**, so you can click through everything, including chats, agents, swarms, memory, reminders, connectors, the email approval card and Arabic, before setting anything up. Nothing leaves the page, and everything is forgotten when you close it.
- **`dizz-lab-cloud.html`** is page content for a claude.ai page with the `sample`, `db` and `user` capabilities. There, **real Claude answers through your own claude.ai account** (no server, no API key), with memory, reminders (while the page is open), custom agents and small parallel swarms (up to 8 tasks, 2 at a time). Chats, memories, agents and settings are encrypted in the browser with your password (AES-256-GCM, PBKDF2) before they're saved to your private claude.ai storage. It can't search the web, run code, generate images or use connectors; those need the app on your computer.

## Quick start

You need [Node.js 22.13 or newer](https://nodejs.org) (and Python 3 if you want Python code execution).

```bash
cd agent
npm install
cp .env.example .env      # then add at least one API key (see below)
npm start
```

Open **http://localhost:8787**. On first run, Dizz Lab asks you to **choose your password**. That password also encrypts your data, and it can't be recovered, so keep it in a password manager.

**API keys** (set one or both in `.env`):

- **Claude:** create a key at [platform.claude.com](https://platform.claude.com) → `ANTHROPIC_API_KEY`
- **Grok:** create a key at [console.x.ai](https://console.x.ai) → `XAI_API_KEY` (also turns on image generation)

With no key set, the app runs in **demo mode** with scripted replies, so you can try the whole interface for free (`npm run demo`, password `demo`).

## Privacy & encryption — what's protected, honestly

- **Stored data is encrypted.** Chats, titles, memories, reminders, agents, settings and uploaded files are stored with AES-256-GCM. The data key is wrapped with a key derived from your password (scrypt, 128 MB), and **your password is never saved, not even as a hash**. The data folder is useless to anyone without your password.
- **Locks on restart.** After a restart the server can't read anything until you sign in. Reminders that come due while it's locked fire once you unlock. **Settings → Lock now** locks it on demand.
- **Connection.** Use HTTPS whenever you're not on the same computer (see below). Settings tells you whether your current connection is encrypted.
- **AI providers.** To answer, each message is sent over TLS to the provider you chose (Anthropic or xAI) under their API data policies. **No AI can reply to a message it can't read**, so this hop can't be end-to-end encrypted, and that's true of every cloud AI, including Grok itself.
- **The workspace folder** (`data/workspace`) is not encrypted, because programs the agent runs need to open files there. Delete what you don't want kept from **Files**.
- **Notifications** through Web Push are encrypted end to end to your device. ntfy pushes (if you use ntfy) only say "You have a reminder" unless you set `NTFY_SHOW_CONTENT=1`, because ntfy can read them.
- Setting `AGENT_PASSWORD` in `.env` makes the app unlock itself on start. That's convenient, but anyone with the `.env` file can then read your data. Leave it empty for full protection.

## Run it on a server (works from your phone, 24/7)

A small cloud server runs everything around the clock, so your phone gets the full app (web search, Grok, connectors, scheduled tasks, swarms) without a computer left on. Expect about $5–10 a month for the server, plus what you use on Claude and Grok.

The `Dockerfile` builds a ready image: Node 22, Python with pandas and matplotlib, and [Litestream](https://litestream.io) for backups. Data lives in `/data`; mount a disk there.

**Fly.io**

```bash
cd agent
fly launch --copy-config --no-deploy      # uses fly.toml; pick an app name and region
fly volumes create dizz_data --size 3
fly secrets set ANTHROPIC_API_KEY=... XAI_API_KEY=... TIMEZONE=Asia/Dubai PUBLIC_URL=https://<app>.fly.dev
fly deploy
```

**Render:** New → Blueprint → choose this repository (it reads `render.yaml`), then fill in the keys. Use a paid instance: free ones go to sleep, which stops reminders.

**Any VPS with Docker:**

```bash
docker build -t dizz-lab agent
docker run -d --restart unless-stopped -p 8787:8787 -v dizz-data:/data --env-file agent/.env dizz-lab
```

Put HTTPS in front of it (Caddy, Cloudflare Tunnel or Tailscale), and set `PUBLIC_URL` to that address.

**On a server, code runs in a sandbox.** The image sets `CODE_EXECUTION=sandbox`: Claude runs code in Anthropic's isolated container (files you attach are uploaded to it, and files it makes appear in the chat), so code the model writes never runs on your server. `local` runs code on the machine itself, which is fine on your own computer.

**Backups.** Set `LITESTREAM_REPLICA_URL` (for example `s3://my-bucket/dizzlab`), `LITESTREAM_ACCESS_KEY_ID` and `LITESTREAM_SECRET_ACCESS_KEY`, plus `LITESTREAM_ENDPOINT` and `LITESTREAM_REGION=auto` for Cloudflare R2. The database (chats, memory, agents, settings, connectors and the encryption key's wrapper) is then copied to your bucket every 10 seconds, and a new server with an empty disk restores it automatically on start. It stays encrypted with your password. Uploaded files live on the server's disk; most hosts snapshot disks daily.

## Use it from your phone

The app is a website, so any device that can reach your computer (or your server) can use it. For a computer at home, make it reachable safely over the internet:

1. **Tailscale (easiest, private):** install [Tailscale](https://tailscale.com) on your computer and phone, run `tailscale serve --bg 8787`, and open the `https://…ts.net` address it prints. Only your devices can reach it.
2. **Cloudflare Tunnel:** `cloudflared tunnel --url http://localhost:8787` gives you an HTTPS address.

Set `TRUST_PROXY=1` and `PUBLIC_URL` to that address in `.env`. Then, in your phone's browser, use **Share → Add to Home Screen**.

**Notifications on your phone:** open **Settings → Notifications on this device → Turn on** on each phone or computer. Reminders, finished scheduled tasks and budget alerts then arrive as normal notifications, even when the app is closed. They use the browser's own push system and are encrypted end to end between your server and your device, so Apple and Google can't read them. On iPhone and iPad (iOS 16.4 or later), add the app to your Home Screen first and turn notifications on from there. The app has to be reached over HTTPS.

Prefer [ntfy](https://ntfy.sh)? Subscribe to a long random topic name in its app and put `NTFY_URL=https://ntfy.sh/<your-topic>` in `.env`.

## Connectors

Open **Connectors** in the sidebar.

**Apps (Notion, Linear, Jira & Confluence, Zapier, Canva, Stripe, PayPal, Vercel, Sentry):** press **Connect** and sign in on the app's own page; you come straight back to Dizz Lab. **GitHub** asks for a [personal access token](https://github.com/settings/personal-access-tokens/new) instead.

**Any other app, by link:** many apps publish a connector link, also called an "MCP server URL" (MCP is the open standard Claude and others use for connectors). Paste it under **Add any app by link**. If the app gave you an API key, paste that too; otherwise you'll be asked to sign in. Zapier's link alone gives the agent access to thousands of apps through the actions you enable in Zapier.

**Gmail, Calendar and Drive** need a one-time Google setup, because Google requires every app (even a private one) to have its own OAuth client:

1. Open [Google Cloud → Credentials](https://console.cloud.google.com/apis/credentials) and create a project.
2. Enable the [Gmail](https://console.cloud.google.com/apis/library/gmail.googleapis.com), [Calendar](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) and [Drive](https://console.cloud.google.com/apis/library/drive.googleapis.com) APIs.
3. **OAuth consent screen:** choose *External*, fill in the app name, add your email as a test user, then **Publish app**. (In "testing" mode Google signs you out every 7 days. Google will say the app is unverified, which is normal for a private app: choose *Continue*.)
4. **Create credentials → OAuth client ID → Web application** and add the redirect URI shown in Dizz Lab's Connectors window (for example `http://localhost:8787/api/connectors/oauth/callback`, or your HTTPS address if you use one).
5. Paste the client ID and secret into the Connectors window (or set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`), then press **Connect** on Gmail, Calendar or Drive.

What each one can do: **Gmail**: search, read, save attachments to the workspace, and draft or send emails and replies. **Calendar**: list events, add events (guests aren't emailed unless you ask) and delete them when you ask. **Drive**: search, and read Docs, Sheets and Slides (other files are saved to the workspace for analysis). Connectors work in scheduled tasks too ("every morning at 7, summarise my unread email and today's meetings").

**Safety:** connector sign-ins are stored encrypted with everything else. You can switch each connector off or disconnect it at any time; disconnecting Google also revokes the access at Google. The agent treats what it reads in emails and apps as information, not instructions. Custom agents only get connectors if you tick **Connected apps** in their abilities.

## Agents & swarms

- **Create:** click **Agents → New agent**, or ask: *"Create agents for a newsroom: an editor, a fact-checker, a headline writer and a social media manager."*
- **Abilities:** each agent can be limited to web search, memory, reminders, files, code, images and/or running other agents.
- **Swarms:** ask for parallel work: *"Have 50 agents each research one of these startups and give me founders, funding and traction"*. Agents in a swarm can't start swarms of their own.
- **Limits:** `SWARM_CONCURRENCY` (default 8) is how many work at once, and `SWARM_MAX_TASKS` (default 1000) is the most tasks per swarm. **Every agent in a swarm is a full model run that you pay for**, so a 500-task swarm costs about what 500 separate questions would. Start small.

## Settings (`.env`)

| Variable | What it does |
| --- | --- |
| `ANTHROPIC_API_KEY`, `XAI_API_KEY` | Your AI providers (one or both). |
| `AGENT_PASSWORD` | Leave empty (recommended). If set, the app unlocks itself on start. |
| `AGENT_NAME` | What the agent calls itself (default "Dizz Lab"). |
| `TIMEZONE` | Your time zone for reminders, e.g. `Asia/Dubai`. |
| `PORT`, `DATA_DIR`, `PUBLIC_URL`, `TRUST_PROXY` | Server address, data folder, public link, and HTTPS proxy support. |
| `NTFY_URL`, `NTFY_SHOW_CONTENT` | Phone push notifications. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Your Google OAuth client for Gmail, Calendar and Drive (or paste it in the app). |
| `CODE_EXECUTION` | `0` turns off running code. |
| `SWARM_CONCURRENCY`, `SWARM_MAX_TASKS` | Swarm limits. |
| `ANTHROPIC_MODELS`, `XAI_MODELS`, `XAI_IMAGE_MODEL` | Override the model lists. |
| `VOYAGE_API_KEY`, `VOYAGE_MODEL` | Memory search by meaning (default model `voyage-4-lite`). The vectors are stored encrypted. |
| `SENTRY_DSN` | Error tracking (errors only, never your messages). |
| `LITESTREAM_*` | Continuous database backups on a server (see **Run it on a server**). |

Personal preferences (your name, personality — Default, Fun, Concise or Professional — default model, custom instructions, theme, read-aloud) are in the app under **Settings**.

## Back up

Copy the whole `data` folder while the app is stopped. It's encrypted, so the backup is safe to keep in the cloud, but it's only usable with your password. On a server, Litestream does this continuously (see **Run it on a server**).

## For developers

```bash
npm run dev        # restart on changes
npm run typecheck  # server and browser code
npm test           # adapters against local fake Claude/xAI/Google servers, an MCP app, swarms, reminders, encryption, auth, Arabic coverage
npm run build:demo # the single-file browser demo in dist/
```

GitHub Actions (`.github/workflows/dizz-lab.yml`) runs the type check, the tests and the demo build on every push that touches `agent/`, then builds the Docker image and checks that it starts.

**Error tracking:** set `SENTRY_DSN` and crashes, server errors and failed agent turns are reported to [Sentry](https://sentry.io). Only errors are sent: no request bodies, headers, cookies, AI prompts or replies.

| Path | What's there |
| --- | --- |
| `src/agent/providers/` | Claude (Anthropic SDK, Messages API) and Grok (xAI Responses API) adapters: streaming, tool loops, history replay. |
| `src/agent/tools.ts`, `swarm.ts`, `toolkit.ts` | The agent's tools, custom agents and swarms, and which agent gets which tools. |
| `src/agent/run.ts`, `chat.ts`, `prompt.ts` | One agent turn, sending and regenerating, and the system prompt. |
| `src/connectors/` | Gmail, Calendar and Drive (Google OAuth + REST), apps by link (MCP client with OAuth and automatic registration), and the app gallery. |
| `src/vault.ts`, `db.ts`, `files.ts` | Encryption, the encrypted SQLite store, and files/workspace. |
| `src/server.ts`, `auth.ts`, `scheduler.ts` | HTTP API, sign-in and the reminder scheduler. |
| `web/` | The browser app (TypeScript, bundled on the fly with esbuild). `web/i18n-ar.ts` holds the Arabic text. `web/inpage.ts` lets the app run on an in-page backend: `web/demo/` (scripted replies) and `web/cloud/` (Claude through the viewer's claude.ai account, with encrypted storage). |
