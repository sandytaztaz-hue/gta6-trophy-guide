// Leonida Trophy Codex — filters.js: the checklist filters and the spoiler guard.
// A hidden trophy stays masked while the guard is on and it is not earned yet:
// the name and description hide, but the grade and kind stay visible so the
// list still reads as a complete 55.
import { isEarned } from './store.js';

export function spoilerMask(trophy, state) {
  return state.spoiler && trophy.hidden && !isEarned(state.save, trophy.id);
}

export function maskedName() {
  return 'Hidden trophy — earn it to reveal';
}

export function maskedDescription() {
  return 'Hidden until earned. Switch the spoiler guard off to read this trophy\u2019s name and description.';
}

export function applyFilters(trophies, state) {
  const q = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind !== 'all') {
      if (state.kind === 'missable') {
        if (!t.missable && !t.watch) return false;
      } else if (t.kind !== state.kind) {
        return false;
      }
    }
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earned === 'earned' && !isEarned(state.save, t.id)) return false;
    if (state.earned === 'unearned' && isEarned(state.save, t.id)) return false;
    if (state.hiddenOnly && !t.hidden) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
