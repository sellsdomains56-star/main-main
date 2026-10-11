# AI / SI + Microsoft-Abu Dhabi reel: asset report (collected 2026-10-11)

All files are in this folder; `assets.json` has one object per file (id, file, kind, shows, source_url, outlet, date, text, supports, notes, license, attribution, key_text_bbox [x,y,w,h in file pixels], size). Nothing was mocked up, retyped or edited. The only changes to captured pages: cropping, and removal of cookie/sign-up pop-ups, ads, sidebars and a broken video placeholder (listed in each entry's `notes`). Captures are 2x (dpr 2). `extra_bboxes` in `assets.json` holds secondary highlight boxes (headline, date, etc.).

## What is here
| Item | Files |
|---|---|
| 1 Trump portrait | `trump_portrait.jpg` (1638x2048, public domain, Daniel Torok / White House, via Commons) |
| 2 Truth Social posts (real posts, via the trumpstruth.org archive mirror) | `truth_post_si_enemy.png` (8 Oct 2026 "THE ENEMY!"), `truth_post_si_name_poll.png` (21 Sep), `truth_post_super_intelligence_force.png` (4 Oct), `truth_post_eo_images.png` (29 Sep, the EO posted as images) + full-size `eo_page1/2/3_*.jpg` (page 3 has the signature and "September 29, 2026") |
| 3 EO coverage | `whitehouse_eo_14434_header.png` + `whitehouse_eo_14434_sec2.png` (official page, EO 14434, 2026-09-29), `news_foxbusiness_si_order.png` (Fox Business, 29 Sep), `news_newsweek_si_order.png` (Newsweek, 30 Sep) |
| 4 Microsoft US$15.2bn | `ms_uae_15bn_blog.png` (Microsoft On the Issues, Brad Smith, 3 Nov 2025), `news_thenational_ms_uae_15bn.png` (The National, 3 Nov 2025) |
| 5 Abu Dhabi engineering center | `ms_engineering_center_abu_dhabi_source.png` (Microsoft Source press release, 24 Sep 2024), `ms_uae_engineering_center_blog.png` (section of the 2025 post) |
| 6 Logos (transparent PNG, ~1200 px) | `logo_microsoft.png`, `logo_truth_social.png`, `logo_g42.png`, `logo_forbes.png`, `logo_axios.png` (+ `.svg` for Microsoft/Forbes/Axios) |
| 7 Photos (CC BY-SA 4.0, credit required) | `photo_reem_island_sunset.jpg` (3840x2560), `photo_reem_skyline_central_park.jpg`, `photo_reem_towers_vertical.jpg`, `photo_al_maryah_island.jpg` |

`_tools/` holds the capture scripts used (`shot2.mjs`, `svg2png.mjs`).

## Verified figures (read from the captured pages)
- **Microsoft UAE: US$15.2 billion, currency USD, period 2023 to end of 2029 (cumulative, not new money from Nov 2025).** Microsoft's own post: "Microsoft will invest $15.2 billion USD in the UAE between the start of this initiative in 2023 and the end of this decade, in 2029." Split: just over $7.3bn spent 2023 to end-2025 (incl. the $1.5bn G42 equity stake, >$4.6bn data-centre capex, >$1.2bn opex/COGS) + >$7.9bn 2026 to 2029 (>$5.5bn capex, ~$2.4bn opex/COGS). G42 = "the UAE's sovereign AI company". Careful: The National's headline says "$15 billion" but its lede says "nearly $8 billion ... between 2026 and 2029" (the forward part only).
- **Engineering center:** announced 24 Sep 2024 ("will be established in Abu Dhabi, one of Microsoft's first engineering centers to be launched in the Arab world", to attract "top tech talent from around the world"); Microsoft's Nov 2025 post says "This year, we established the Global Engineering Development Center in Abu Dhabi to attract world-class tech talent to the UAE."
- **EO 14434, "Inaugurating the Era of Super Intelligence", signed 29 Sep 2026:** executive departments/agencies "shall use 'Super Intelligence' and 'SI' in place of 'Artificial Intelligence' and 'AI'" in official correspondence, public communications, websites, reports, policy documents and other non-statutory documents, "to the maximum extent permitted by law". Executive branch only; historical documents/contracts exempt; 60 days for a proposed legal definition. It does not bind the private sector.
- **Truth Social times (EDT):** 21 Sep 11:44 AM (poll question), 29 Sep 8:11 PM (EO images), 4 Oct 8:23 AM (SIF), 8 Oct 12:14 PM ("THE ENEMY!"). Status IDs are in `assets.json`. Poll result (50,000+ votes, 65% "super intelligence") is from Newsweek, not visible in the post capture.
- Do not mix up: Microsoft's separate 24 Sep 2026 Middle East framework (>$10bn across Kuwait, Qatar, Saudi Arabia, UAE to 2030) is a different announcement.

## Not obtained / blocked (no workaround attempted)
- **truthsocial.com (live posts):** Cloudflare bot challenge, HTTP 403. The captures are of the trumpstruth.org archive page for each post (real text, name, handle, date; it links the original). Truth Social's avatar CDN also 403'd, so the avatar slot is hidden (name/handle/date/text untouched). If you want an avatar, use `trump_portrait.jpg`; it is not in the post capture.
- **Axios (both 2026-10-01 and 2026-10-08 URLs):** Cloudflare 403. **Forbes** (30 Sep EO article, 8 Oct "Enemy" article): "Access is temporarily restricted". Real headlines, from search results only: Forbes "Trump Signs Executive Order Renaming AI To 'Super Intelligence'-Here's What It Changes" (30 Sep, Siladitya Ray); Forbes "Trump Calls Anyone Who Says 'AI' Instead Of 'Super Intelligence' An 'Enemy'" (8 Oct, Conor Murray); Axios "Trump: Anyone saying 'AI' is 'THE ENEMY!' The White House uses it" (8 Oct). Not captured; Fox Business, Newsweek and the White House page replace them.
- **NBC:** only video pages found for this story; not captured. **Reuters/CNBC/Bloomberg** on the Microsoft deal: not attempted (Microsoft's primary post + The National cover it).
- **Lead photos:** Newsweek's lead is a video (shows "Media Error" in headless Chromium) and Fox Business's lead video thumbnail did not load, so those two captures have no lead image. The White House and The National captures include their lead visuals.
- **Wikimedia rate limits (HTTP 429, 10-min penalties on the shared proxy IP):** not downloaded: the larger 2550x3300 Commons portrait ("January 2025 Official Presidential Portrait", LoC ppbd.11614); full-size originals of the Reem photos (thumbnails used; 3840 px for the sunset one); the original Truth Social SVG (a 1280 px Commons-rendered PNG is used). loc.gov is also behind Cloudflare (403).
- **G42 logo:** none on Commons; used the official 492x290 PNG from g42.ai, upscaled to 1200 px (slightly soft). **Unsplash** connector unusable (account email unconfirmed).
- **Al Maryah Island:** no good CC-licensed skyline found; the one photo is a modest daytime view of the Cleveland Clinic Abu Dhabi waterfront.

## Usage notes
- Posts/articles are screenshots of third-party pages (fair use / commentary), not open licences. Microsoft/White House/outlet logos are trademarks (identification only).
- Photos are CC BY-SA 4.0: show the credit from `attribution` on screen or in the caption. Two Reem photos are heavily colour-graded (noted in `assets.json`).
- The Microsoft and G42 logos have dark/grey marks and need a light background; the Truth Social logo is navy.
