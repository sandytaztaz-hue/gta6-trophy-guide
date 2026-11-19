// Leonida Trophy Atlas — store.js keeps progress in the browser: earned ticks,
// PSN progress counters, per-trophy notes, export/import, copy-to-clipboard.
import { SAVE_KEY, DEMO_SAVE } from './config.js';

function blankSave() {
  return { earned: [], counters: {}, notes: {} };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return blankSave();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    };
  } catch {
    return blankSave();
  }
}

export function saveProgress(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

// The demo save (?demo=1) lives in memory only — it never overwrites the player's own save.
export function demoSave() {
  return {
    earned: [...DEMO_SAVE.earned],
    counters: { ...DEMO_SAVE.counters },
    notes: { ...DEMO_SAVE.notes },
  };
}

export function isEarned(save, id) {
  return save.earned.includes(id);
}

export function toggleEarned(save, id) {
  const at = save.earned.indexOf(id);
  if (at === -1) save.earned.push(id);
  else save.earned.splice(at, 1);
  saveProgress(save);
  return save;
}

export function counterValue(save, trophy) {
  if (trophy.count == null) return null;
  if (isEarned(save, trophy.id)) return trophy.count;
  const raw = save.counters[trophy.id];
  if (raw == null || Number.isNaN(Number(raw))) return 0;
  return Math.max(0, Math.min(trophy.count, Math.floor(Number(raw))));
}

export function setCounter(save, id, value, max) {
  const n = Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));
  save.counters[id] = n;
  saveProgress(save);
  return n;
}

export function noteText(save, id) {
  return save.notes[id] || '';
}

export function setNote(save, id, text) {
  if (text.trim() === '') delete save.notes[id];
  else save.notes[id] = text;
  saveProgress(save);
}

export function exportProgress(save) {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function copyProgressToClipboard(save) {
  const lines = [`Leonida Trophy Atlas — ${save.earned.length}/55 earned`];
  for (const id of [...save.earned].sort((a, b) => a - b)) lines.push(`earned #${id}`);
  const text = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.append(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return true;
}

export function importProgressText(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('not a progress file');
  const save = {
    earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
    counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
    notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
  };
  saveProgress(save);
  return save;
}

export function resetProgress() {
  const save = blankSave();
  saveProgress(save);
  return save;
}

// Earned count and grade breakdown, for the header progress bar.
export function progressSummary(save, trophies) {
  const earned = new Set(save.earned);
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.id)) byGrade[t.grade] += 1;
  return { earned: earned.size, total: trophies.length, byGrade };
}
