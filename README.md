# Leonida Trophy Codex — GTA 6 trophy guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sandytaztaz-hue/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sandytaztaz-hue/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies of GTA VI** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze — built for the [gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01) bounty on make.fun.

## What it does

- **Checklist** — every trophy by its exact official name and description, with grade, kind, hidden badge, earned toggle, and a PSN progress counter where one exists (20 trophies carry a counter, from 250 stunts to $250,000 laundered).
- **Every claim cited** — the guide paragraph and each step of every trophy carries inline source numbers [1]–[10]. 190 of 190 claims are cited, and all 190 are backed by 2 or more sources. The audit strip under the header shows the counts: 190/190 cited, 190 backed by 2+ sources, 3 disputes shown both ways, 11 pages across 10 sites read 20–21 Nov 2026.
- **The missable trophy leads** — Positive Mental Attitude (meditate at every spot across Leonida) is the default selected trophy, with a **SOURCES DIFFER** box showing both versions of each dispute (18 vs 15 meditations; whether the Chapter 1 balcony is required) and the Codex's call. A **NEXT UP · ROADMAP ORDER** queue (5 items, MISSABLE / AT RISK badges), a **SOURCES FOR THIS GUIDE** panel with per-source claim counts, and a **MISSABLE WATCH** panel (1 possibly missable, 1 confirmed missable, 5 at risk) ride in the side rail.
- **Full guide per trophy** — steps, where and how, when it can be missed, in the Codex's own words, with a **Sources line naming and linking each source** (PowerPyx, KeenGamer, GTABase, egamers.io, OutputLag, GTA-Zone, GTA Vibes, the official list, Exophase, PSNProfiles). Where no community source had confirmed steps at launch, the guide says so plainly instead of inventing them.
- **Spoiler guard (on by default)** — the 28 hidden trophies stay masked until earned; reveal one at a time from its detail pane.
- **Roadmap to platinum** — nine stages in play order, each with per-stage progress, built from the official descriptions, with the MISSABLE WATCH and NEXT UP panels alongside.
- **Missables page** — the one possibly-missable trophy (Positive Mental Attitude, Chapter 1), the confirmed-missable optional Chapter 4 mission behind Maximum Withdrawal, and the five stranger chains to start early — plus the **Next up planner** (missables first, then nearest-to-complete, then story order).
- **Progress that saves** — earned ticks, editable counters and per-trophy notes in localStorage, with export/import JSON and copy-to-clipboard. The header shows PSN points out of 1,350 (300 + 2×90 + 6×30 + 46×15) and collectibles logged out of 221.
- **Two themes** — Vice Dusk (dark, default) and Paper (light). Keyboard: `j`/`k` move, `e` toggle earned, `/` search, `s` spoiler guard.

## Run it

Open `app/index.html` in a desktop browser, or serve it locally:

```sh
node serve.ts
# then open http://localhost:8080
```

Everything runs offline from its own files — no network requests, no webfonts, system fonts only. Photos are not involved; this is a text guide, so there is no artwork to borrow and no Rockstar logo anywhere.

## How the guide was written

Names, descriptions, grades, hidden flags (28 hidden, 27 visible) and PSN counters were verified against the Exophase and PSNProfiles trophy lists. Step tips cite the PowerPyx and GTABase trophy guides published 18 November 2026, cross-checked on egamers.io, and the KeenGamer, OutputLag, GTA-Zone and GTA Vibes lists read 21 November 2026. Five trophies (In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin) have no confirmed trigger at launch, per PowerPyx — their guides are derived from the official description only and say so.

## License

MIT — see [LICENSE](LICENSE).

## Screenshots

Four renders of the app itself (see `shots.json` for the views): the checklist with Positive Mental Attitude open beside it, the roadmap, the missables page with the Next up planner, and a full trophy detail with its PSN progress counter. Take them with `node scripts/shots.mjs`.
