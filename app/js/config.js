// Leonida Trophy Codex — config.js: the constants every other module reads.
// Labels, grades, PSN points, the nine roadmap stages, and the demo save that
// the ?shot= screenshots render (12 of 55 earned, counters part-way).
export const APP_NAME = 'Leonida Trophy Codex';
export const TOTAL_TROPHIES = 55;
export const SAVE_KEY = 'leonida-trophy-atlas-v1';
export const SPOILER_DEFAULT = true;

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};
export const GRADE_LETTERS = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
export const GRADE_TOTALS = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

// PSN points per grade: 300 + 2x90 + 6x30 + 46x15 = 1,350 for the full set.
export const PSN_POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
export const PSN_TOTAL = 1350;

export const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  combat: 'Combat',
  exploration: 'Exploration',
};

// The road to platinum, in the order a player should work it. Every trophy
// belongs to exactly one stage, so the stage chips on the checklist always land.
export const ROADMAP_STAGES = [
  { num: 1, title: 'Stage 1 — Opening, Chapter 1', short: 'Opening', note: 'Play the opening and finish Chapter 1. Meditate with Lucia now — it may not come back.', ids: [2, 3, 28] },
  { num: 2, title: 'Stage 2 — Story, Chapters 2–4', short: 'Story', note: 'Named story missions and chapter completions. Do the optional Chapter 4 mission before the chapter ends.', ids: [4, 5, 6, 8, 9, 10, 11, 12, 13] },
  { num: 3, title: 'Stage 3 — Finale', short: 'Finale', note: 'Finish the final mission after Chapter 4.', ids: [7] },
  { num: 4, title: 'Stage 4 — Strangers & partners', short: 'Strangers', note: 'Start each stranger chain as soon as its marker appears; the partner finals carry a watch note.', ids: [22, 23, 24, 26, 27, 25, 29] },
  { num: 5, title: 'Stage 5 — Activities & challenges', short: 'Activities', note: 'Shooting Range golds, stunts, races, arcade, fishing, challenges, bowling.', ids: [15, 16, 17, 18, 19, 20, 21, 32, 46, 51] },
  { num: 6, title: 'Stage 6 — Collectibles & economy', short: 'Collectibles', note: 'Cards, WAiNK spots, vehicles, exploring Leonida, laundering, shops, garages.', ids: [30, 31, 35, 42, 52, 53, 54, 55] },
  { num: 7, title: 'Stage 7 — Combat & wanted', short: 'Combat', note: 'Wanted-level escapes, robberies, Combat Focus, tanks, jets, gang operations.', ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 48] },
  { num: 8, title: 'Stage 8 — Secrets & the long tail', short: 'Secrets', note: 'The five trophies with no confirmed trigger at launch — description-derived guides only.', ids: [44, 45, 47, 49, 50] },
  { num: 9, title: 'Stage 9 — Platinum', short: 'Platinum', note: '100% completion, then the Platinum itself.', ids: [14, 1] },
];

// Which stage a trophy sits in, for the "S1 · Opening" chip on each row.
export function stageForTrophy(id) {
  const stage = ROADMAP_STAGES.find((s) => s.ids.includes(id));
  if (!stage) return null;
  return { num: stage.num, title: stage.title, short: stage.short };
}

// The demo save behind ?demo=1: 12 of 55 earned, counters part-way, and the
// hero trophy — Positive Mental Attitude — at 6 of 18 meditations, not earned,
// so the cover shot shows the count climbing rather than a finished trophy.
export const DEMO_SAVE = {
  earned: [2, 3, 5, 8, 13, 16, 19, 20, 21, 35, 42, 55],
  counters: { 15: 120, 17: 18, 25: 3, 28: 6, 31: 47, 32: 21, 52: 87500, 53: 41200, 54: 3, 30: 1, 18: 6 },
  notes: {
    17: 'Gold on the first 18; the moving-target rounds need a steadier aim.',
    28: 'Balcony meditation done in Chapter 1 — 6 of 18 so far.',
  },
};

// Checklist order: story order first, then grade, then name.
export const SORT_STORY_FIRST = true;
