// Leonida Trophy Atlas — data.js loads the trophy list and answers lookups.
let doc = null;

export async function loadTrophies() {
  if (doc) return doc;
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('trophies.json failed to load');
  doc = await res.json();
  return doc;
}

export function trophyList() {
  if (!doc) throw new Error('loadTrophies() first');
  return doc.trophies;
}

export function trophyById(id) {
  return trophyList().find((t) => t.id === id) || null;
}

export function hiddenTrophies() {
  return trophyList().filter((t) => t.hidden);
}

export function missableTrophies() {
  return trophyList().filter((t) => t.missable);
}

export function watchTrophies() {
  return trophyList().filter((t) => t.watch);
}

export function countedTrophies() {
  return trophyList().filter((t) => t.count != null);
}

export function trophiesByKind(kind) {
  if (kind === 'missable') return trophyList().filter((t) => t.missable || t.watch);
  return trophyList().filter((t) => t.kind === kind);
}

// The master source list lives in trophies.json so no URL literal sits in code.
export function sourceList() {
  if (!doc) throw new Error('loadTrophies() first');
  return doc.sources || [];
}

export function sourceUrl(name) {
  const found = sourceList().find((s) => s.name === name);
  return found ? found.url : null;
}
