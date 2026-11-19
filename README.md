# Leonida Trophy Atlas — GTA 6 trophy guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sandytaztaz-hue/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sandytaztaz-hue/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies of GTA VI** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze — built for the [gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01) bounty on make.fun.

## What it does

- **Checklist** — every trophy by its exact official name and description, with grade, kind, hidden badge, earned toggle, and a PSN progress counter where one exists (20 trophies carry a counter, from 250 stunts to $250,000 laundered).
- **Full guide per trophy** — steps, where and how, when it can be missed, in the Atlas's own words, with a **Sources line naming and linking each source** (PowerPyx, GTABase, Exophase, PSNProfiles, egamers.io). Where no community source had confirmed steps at launch, the guide says so plainly instead of inventing them.
- **Spoiler guard (on by default)** — the 28 hidden trophies stay masked until earned; reveal one at a time from its detail pane.
- **Roadmap to platinum** — nine stages in play order, each with per-stage progress, built from the official descriptions.
- **Missables page** — the one confirmed possibly-missable trophy (Positive Mental Attitude, Chapter 1), the optional Chapter 4 mission behind Maximum Withdrawal, and the five stranger chains to start early — plus the **Next up planner** (missables first, then nearest-to-complete, then story order).
- **Progress that saves** — earned ticks, editable counters and per-trophy notes in localStorage, with export/import JSON and copy-to-clipboard.
- **Two themes** — Vice Dusk (dark, default) and Paper (light). Keyboard: `j`/`k` move, `e` toggle earned, `/` search, `s` spoiler guard.

## Run it

Open `app/index.html` in a desktop browser, or serve it locally:

```sh
node serve.ts
# then open http://localhost:8080
```

Everything runs offline from its own files — no network requests, no webfonts, system fonts only. Photos are not involved; this is a text guide, so there is no artwork to borrow and no Rockstar logo anywhere.

## How the guide was written

Names, descriptions, grades, hidden flags (28 hidden, 27 visible) and PSN counters were verified against the Exophase and PSNProfiles trophy lists. Step tips cite the PowerPyx and GTABase trophy guides published 18 November 2026, cross-checked on egamers.io. Five trophies (In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin) have no confirmed trigger at launch, per PowerPyx — their guides are derived from the official description only and say so.

## License

MIT — see [LICENSE](LICENSE).

## Screenshots

Four renders of the app itself (see `shots.json` for the views): the checklist with a guide open beside it, the roadmap, the missables page with the Next up planner, and a full trophy detail with its PSN progress counter. Take them with `node scripts/shots.mjs`.
