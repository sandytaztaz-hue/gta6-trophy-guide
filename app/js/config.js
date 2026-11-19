// Leonida Trophy Codex — config.js names the parts: labels, roadmap stages, demo save.
export const APP_NAME = 'Leonida Trophy Codex';
export const TOTAL_TROPHIES = 55;
export const SAVE_KEY = 'leonida-trophy-atlas-v1';
export const SPOILER_DEFAULT = true;

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
export const GRADE_LETTERS = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
export const GRADE_TOTALS = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

export const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  combat: 'Combat',
  exploration: 'Exploration',
};

// Roadmap stages, in the order a player should work them. Each stage lists trophy ids.
export const ROADMAP_STAGES = [
  { title: 'Stage 1 — Opening, Chapter 1', note: 'Play the opening and finish Chapter 1. Meditate with Lucia now — it may not come back.', ids: [2, 3, 28] },
  { title: 'Stage 2 — Story, Chapters 2–4', note: 'Named story missions and chapter completions. Do the optional Chapter 4 mission before the chapter ends.', ids: [4, 5, 6, 8, 9, 10, 11, 12, 13] },
  { title: 'Stage 3 — Finale', note: 'Finish the final mission after Chapter 4.', ids: [7] },
  { title: 'Stage 4 — Strangers & partners', note: 'Start each stranger chain as soon as its marker appears; the partner finals carry a watch note.', ids: [22, 23, 24, 26, 27, 25, 29] },
  { title: 'Stage 5 — Activities & challenges', note: 'Shooting Range golds, stunts, races, arcade, fishing, challenges, bowling.', ids: [15, 16, 17, 18, 19, 20, 21, 32, 46, 51] },
  { title: 'Stage 6 — Collectibles & economy', note: 'Cards, WAiNK spots, vehicles, exploring Leonida, laundering, shops, garages.', ids: [30, 31, 35, 42, 52, 53, 54, 55] },
  { title: 'Stage 7 — Combat & wanted', note: 'Wanted-level escapes, robberies, Combat Focus, tanks, jets, gang operations.', ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 48] },
  { title: 'Stage 8 — Secrets & the long tail', note: 'The five trophies with no confirmed trigger at launch — description-derived guides only.', ids: [44, 45, 47, 49, 50] },
  { title: 'Stage 9 — Platinum', note: '100% completion, then the Platinum itself.', ids: [14, 1] },
];

// Demo save used by the ?shot= screenshots: 13 of 55 earned, counters part-way.
export const DEMO_SAVE = {
  earned: [2, 3, 5, 8, 13, 16, 19, 20, 21, 28, 35, 42, 55],
  counters: { 15: 120, 17: 18, 25: 3, 31: 47, 32: 21, 52: 87500, 53: 41200, 54: 3, 30: 1, 18: 6 },
  notes: {
    17: 'Gold on the first 18; the moving-target rounds need a steadier aim.',
    28: 'Did Lucia\u2019s balcony meditation in Chapter 1.',
  },
};

// How the checklist sorts: story order first, then grade, then name.
export const SORT_STORY_FIRST = true;
