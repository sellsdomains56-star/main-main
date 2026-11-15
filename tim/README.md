# Tim

A Telegram bot that talks like a person: short messages, a "typing…" pause, moods, and no repeating himself. He keeps a job book, chases unpaid jobs, and only treats a job as paid when the boss says so in chat.

**This is a throwaway spike.** Tim only talks to the owner in a private chat. Client chats come later.

## Run it

1. In Telegram, message **@BotFather**, send `/newbot`, name it Tim, copy the token.
2. `cp .env.example .env` and fill in `TELEGRAM_BOT_TOKEN` and `ANTHROPIC_API_KEY`.
3. `npm install && npm start`, then message Tim. His log prints your Telegram id: put it in `.env` as `OWNER_TELEGRAM_ID` and restart. Until then he ignores everyone.
4. Fill in `data/ratecard.md` and `data/portfolio.md`. Tim never quotes a price or claims a project that isn't there.

## How he behaves

- **Speed:** tell him "reply faster" / "slow down", or he keeps `normal`. Values: `instant`, `fast`, `normal`, `slow`.
- **Payments:** he asks for the money, and a job stays unpaid until you say "paid". Then he thanks you and states the deadline, counted from that moment.
- **Nudges:** once a day he brings up unpaid jobs, and he brings up reminders when they're due.
- **Not today bro:** he can push a call to later, and he sets a reminder once you give him a day.
- **Honesty:** if you sincerely ask whether he's a bot, he says yes.

Data lives in `data/*.json` (git-ignored). Tests: `npm test`.
