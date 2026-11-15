# Tim

A Telegram account (or bot) that talks like a person: short messages, a "typing…" pause, moods, and no repeating himself. He keeps a job book, chases unpaid jobs, and only treats a job as paid when the boss says so in chat.

**This is a throwaway spike.** Tim only talks to the owner in a private chat. Client chats come later.

## Put him online (Railway, works from a phone browser)

Tim needs an always-on server. A real Telegram account can't be logged in from a Claude cloud session (its network blocks that connection).

1. railway.app: sign in with GitHub, **New Project → Deploy from GitHub repo**, pick this repo.
2. Service **Settings**: Root Directory `tim`, and the branch that has this folder.
3. **Variables**: `TELEGRAM_API_ID`, `TELEGRAM_API_HASH` (from my.telegram.org, logged in with Tim's number), `ANTHROPIC_API_KEY`, `LOGIN_PAGE_PASSWORD` (any password), `TIM_DATA_DIR=/data/`, optional `OWNER_NAME`.
4. Add a **Volume** mounted at `/data` (keeps the login and the job book across restarts).
5. **Settings → Networking → Generate Domain**, open the link, enter the page password and Tim's number, then the code Telegram sends.
6. Message Tim's account from your own Telegram. The deploy log prints your user id: add it as `OWNER_TELEGRAM_ID` and redeploy. Until then he ignores everyone.
7. Fill in `data/ratecard.md` and `data/portfolio.md`. Tim never quotes a price or claims a project that isn't there.

On a computer instead: `cp .env.example .env`, fill it in, `npm install`, `npm run login`, `npm start`.
Bot mode (no real account): set only `TELEGRAM_BOT_TOKEN` from @BotFather.

## How he behaves

- **Speed:** tell him "reply faster" / "slow down", or he keeps `normal`. Values: `instant`, `fast`, `normal`, `slow`.
- **Payments:** he asks for the money, and a job stays unpaid until you say "paid". Then he thanks you and states the deadline, counted from that moment.
- **Nudges:** once a day he brings up unpaid jobs, and he brings up reminders when they're due.
- **Not today bro:** he can push a call to later, and he sets a reminder once you give him a day.
- **Honesty:** if you sincerely ask whether he's a bot, he says yes.

Data lives in `data/*.json` (git-ignored). Tests: `npm test`.
