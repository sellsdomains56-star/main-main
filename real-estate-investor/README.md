# Abdullah Ahli Off-Plan Investor

Analyze an off-plan property brochure (PDF) for investment: pros, cons, real market data comparison and a what-if simulator.

- `index.html`: web calculator (open in a browser or host on GitHub Pages).
- `skill/offplan-investor/`: the downloadable Claude skill.

## Install the skill
Copy the `skill/offplan-investor` folder to `~/.claude/skills/` (Claude Code), or zip the folder and upload it in Claude settings under Skills. Then upload a brochure PDF and ask: "Is this a good investment?"

## Real market data
The skill never invents transactions. Provide data one of two ways:
- Set `DXP_API_URL` and `DXP_API_KEY` (DXP Interact; `scripts/market_data.py` `fetch_api()` needs adjusting to the real API format).
- Pass an ADREC/DLD transactions CSV: `python scripts/market_data.py --area Hudayriyat --csv export.csv`.

## Disclaimer
Analysis only, not financial advice. No tool can guarantee 100% accuracy; verify against the SPA and official registries.

(c) Abdullah Ahli
