# HeyGen (AI avatar) - what to use and what never to use

Account: the user's own HeyGen account (API key is NOT stored here or anywhere in the repo; it was given in chat for one session - read it from `HEYGEN_API_KEY` or ask).

## Use
- Abdullah Ahli's digital twin: look id `fc56bfbe458b48b48d68065717e6774b` ("abdullah -- 3", completed, podcast studio).
- His cloned voice: voice id `e36e274a9ff347fca80d3bd267ca69d7` ("abdullah -- 3"). (A second clone "abdullah -- 4", id `9755b38f2fa84604b181a948a3aadf45`, exists; use only if the user says so.)
- Only for scripts the user (and Abdullah) approved. Label the result as AI-generated on Instagram.

## Never use
- Any "mohammed salam" twin or voice (the user said: none of them).
- Voices cloned from other people's audio ("Video by kudrat.ibr.mp3", "faisal", "Nikki Beach Resort & Spa 2.m4a", "Pearl Jumeirah 2_1"). No cloning of third parties.

## API notes (checked 15 Oct 2026)
- Base `https://api.heygen.com`, header `X-Api-Key`. Use v3 (`GET /v3/users/me`, `GET /v3/avatars/looks?ownership=private`, `GET /v3/voices?type=private`, `POST /v3/videos` with type `avatar`, then `GET /v3/videos/{id}`); the v2 endpoints are legacy and removed on 2026-10-31. Docs index: https://developers.heygen.com/llms.txt
- Billing: v3 uses a prepaid wallet (showed USD 0.00 on 15 Oct 2026); the legacy quota call showed 1,393 plan credits. Check before generating; every video costs money/credits, so never generate without the user's approval of idea and script.
- Generated avatar video -> edit in the map style with the small face circle (`FACE = 'video'`) exactly like `reels/four-islands-map` / `reels/dubai-ideal-time`.
