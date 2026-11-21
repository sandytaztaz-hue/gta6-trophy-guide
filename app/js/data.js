// Leonida Trophy Codex — data.js: loads trophies.json once and answers lookups.
// Every other module reads the trophy list through here, never by fetching twice.
let doc = null;

export async function loadTrophies() {
  if (doc) return doc;
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('trophies.json failed to load');
  doc = await res.json();
  return doc;
}

function list() {
  if (!doc) throw new Error('loadTrophies() first');
  return doc.trophies;
}

export function trophyList() {
  return list();
}

export function trophyById(id) {
  return list().find((t) => t.id === id) || null;
}

export function hiddenTrophies() {
  return list().filter((t) => t.hidden);
}

export function missableTrophies() {
  return list().filter((t) => t.missable);
}

export function watchTrophies() {
  return list().filter((t) => t.watch);
}

export function countedTrophies() {
  return list().filter((t) => t.count != null);
}

export function trophiesByKind(kind) {
  if (kind === 'missable') return list().filter((t) => t.missable || t.watch);
  return list().filter((t) => t.kind === kind);
}

// The source list lives in trophies.json, so no URL literal sits in the code.
export function sourceList() {
  if (!doc) throw new Error('loadTrophies() first');
  return doc.sources || [];
}

export function sourceUrl(name) {
  const found = sourceList().find((s) => s.name === name);
  return found ? found.url : null;
}
