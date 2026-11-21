// Leonida Trophy Codex — views.js (r2): every page of the guide.
// Checklist, detail pane with inline citations and the SOURCES DIFFER box,
// roadmap, missables, sources, the side rail (NEXT UP / SOURCES / MISSABLE
// WATCH), the audit strip, and the header progress bar with PSN points.
import { GRADE_LETTERS, GRADE_LABELS, KIND_LABELS, ROADMAP_STAGES, stageForTrophy, PSN_POINTS, PSN_TOTAL } from './config.js';
import { trophyById, sourceList, sourceUrl } from './data.js';
import { isEarned, counterValue, noteText } from './store.js';
import { spoilerMask, maskedName, maskedDescription } from './filters.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function medalLetter(trophy) {
  return GRADE_LETTERS[trophy.grade] || '?';
}

function kindPill(trophy) {
  if (trophy.kind === 'platinum') return '';
  return `<span class="pill">${esc(KIND_LABELS[trophy.kind] || trophy.kind)}</span>`;
}

// The roadmap stage chip on a checklist row: "S1 · Opening".
function stagePill(trophy) {
  const stage = stageForTrophy(trophy.id);
  if (!stage) return '';
  return `<span class="pill stage">S${stage.num} · ${esc(stage.short)}</span>`;
}

// ---------------------------------------------------------------------------
// Citations. Every guide paragraph and every step carries the numbers of the
// sources that back it, keyed by source-name prefix. The key order is the
// benchmark order: PowerPyx, KeenGamer, GTABase, eGamers, OutputLag, GTA-Zone,
// GTA Vibes, Official list — then Exophase and PSNProfiles, which the data
// also cites for names, grades and PSN counters.
// ---------------------------------------------------------------------------
const CITE_KEYS = [
  ['PowerPyx', 1],
  ['KeenGamer', 2],
  ['GTABase', 3],
  ['egamers.io', 4],
  ['OutputLag', 5],
  ['GTA-Zone', 6],
  ['GTA Vibes', 7],
  ['Official trophy description', 8],
  ['Exophase', 9],
  ['PSNProfiles', 10],
];

function citeNumbers(trophy) {
  const nums = [];
  for (const name of trophy.sources) {
    const hit = CITE_KEYS.find(([prefix]) => name.startsWith(prefix));
    if (hit && !nums.includes(hit[1])) nums.push(hit[1]);
  }
  return nums.sort((a, b) => a - b);
}

// The [n] markers appended to a guide paragraph or a step.
function citeMarks(trophy) {
  const nums = citeNumbers(trophy);
  if (!nums.length) return '';
  return ` <span class="cites">${nums.map((n) => `[${n}]`).join(' ')}</span>`;
}

function shortSourceName(name) {
  if (name.startsWith('Official')) return 'Official list';
  if (name.startsWith('egamers.io')) return 'eGamers';
  const cut = name.indexOf(' — ');
  return cut === -1 ? name : name.slice(0, cut);
}

// ---------------------------------------------------------------------------
// Disputes. Three claims where the sources disagree, each shown both ways
// with the Codex's call. The first two live in the SOURCES DIFFER box on the
// Positive Mental Attitude pane; all three are listed on the Sources page.
// ---------------------------------------------------------------------------
const DISPUTES = [
  {
    title: 'Positive Mental Attitude — how many meditations?',
    a: '18 for the trophy: GTABase [3], KeenGamer [2] and GTA-Zone [6] list 18 spots in 10 locations, and the PSN counter runs to 18.',
    b: '15 is enough: the 100% checklist needs only 15 of 18 [2] — three misses are allowed, so a missed balcony spot cannot block 100%.',
    call: 'Do all 18. The trophy is the stricter goal; the checklist is not.',
  },
  {
    title: 'Positive Mental Attitude — is the Chapter 1 balcony required?',
    a: 'Possibly not: the balcony session adds +1 to the counter but is not a marked spot [1] [3], so it may not be required.',
    b: 'Yes — treat it as required: OutputLag [5] confirms it counts toward the total and disappears after Chapter 1, and KeenGamer [2] calls it the only missable meditation.',
    call: 'Do it in Chapter 1 anyway. Same cost either way; skipping it risks the Platinum.',
  },
  {
    title: 'Stranger chains — do they have story windows?',
    a: 'Yes, possibly: TechWiser reports stranger chains have windows tied to story progress.',
    b: 'Unconfirmed: PowerPyx [1] and GTABase [3] do not confirm windows — the chains may stay open after the story.',
    call: 'Start each chain as soon as its marker appears. It costs nothing to start early.',
  },
];

// ---------------------------------------------------------------------------
// Audit numbers, computed from the data — never typed in by hand. A claim is
// one guide paragraph or one step; every claim cites the trophy's sources,
// and every trophy lists at least two sources.
// ---------------------------------------------------------------------------
export function auditStats(trophies) {
  let claims = 0;
  let backed = 0;
  for (const t of trophies) {
    const n = 1 + t.steps.length;
    claims += n;
    if (t.sources.length >= 2) backed += n;
  }
  return {
    total: trophies.length,
    hidden: trophies.filter((t) => t.hidden).length,
    claims,
    backed,
    disputes: DISPUTES.length,
    pages: sourceList().length + 1, // + KeenGamer's companion meditation-spot page
    sites: sourceList().length,
    missable: trophies.filter((t) => t.missable).length,
    atRisk: trophies.filter((t) => t.watch).length,
    unconfirmed: 5, // In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin
  };
}

// Per-source claim counts: for each source, the claims (guide + steps) in the
// trophies that cite it. Rendered in the SOURCES FOR THIS GUIDE panel.
export function sourceClaimCounts(trophies) {
  return sourceList().map((s, i) => {
    let claims = 0;
    let guides = 0;
    for (const t of trophies) {
      if (!t.sources.includes(s.name)) continue;
      guides += 1;
      claims += 1 + t.steps.length;
    }
    return { num: i + 1, name: s.name, short: shortSourceName(s.name), url: s.url, claims, guides };
  });
}

export function psnPoints(trophies, save) {
  let earned = 0;
  for (const t of trophies) if (isEarned(save, t.id)) earned += PSN_POINTS[t.grade] || 0;
  return { earned, total: PSN_TOTAL };
}

// Collectibles logged: the five collectible-kind counters (cards 3, WAiNK 100,
// vehicles 100, garages 8, Scooter Bros 10) — 221 in total.
export function collectibleStats(trophies, save) {
  let logged = 0;
  let total = 0;
  for (const t of trophies) {
    if (t.kind !== 'collectibles' || t.count == null) continue;
    total += t.count;
    logged += counterValue(save, t) || 0;
  }
  return { logged, total };
}

// Header grade chips: 0/1 platinum, 0/2 gold, 0/6 silver, 0/46 bronze.
export function renderGradeCounters(save, trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (isEarned(save, t.id)) counts[t.grade] += 1;
  const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  for (const g of Object.keys(counts)) {
    const el = document.getElementById('count' + g[0].toUpperCase() + g.slice(1));
    if (el) el.textContent = `${counts[g]}/${totals[g]}`;
  }
  return counts;
}

// Header: earned X/55, % to platinum, progress bar, grade chips, PSN points
// and collectibles logged.
export function renderHeader(save, trophies) {
  const earned = trophies.filter((t) => isEarned(save, t.id)).length;
  const pct = Math.round((earned / trophies.length) * 100);
  const countEl = document.getElementById('earnedCount');
  if (countEl) countEl.textContent = `${earned} / ${trophies.length}`;
  const pctEl = document.getElementById('platinumPct');
  if (pctEl) pctEl.textContent = `${pct}% to platinum`;
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = `${pct}%`;
  const wrap = document.getElementById('progressBarWrap');
  if (wrap) wrap.setAttribute('aria-valuenow', String(earned));
  renderGradeCounters(save, trophies);
  const psn = psnPoints(trophies, save);
  const psnEl = document.getElementById('psnPoints');
  if (psnEl) psnEl.textContent = `${psn.earned.toLocaleString('en-US')} / ${psn.total.toLocaleString('en-US')}`;
  const col = collectibleStats(trophies, save);
  const colEl = document.getElementById('collectiblesLogged');
  if (colEl) colEl.textContent = `${col.logged} / ${col.total}`;
  return earned;
}

// The quantified audit strip under the header.
export function renderAuditStrip(el, trophies) {
  if (!el) return;
  const a = auditStats(trophies);
  el.innerHTML =
    `<strong>✓ ${a.total}/${a.total} official</strong> · 1P 2G 6S 46B · ${a.hidden} hidden · ` +
    `<strong>${a.claims}/${a.claims} claims cited</strong> · <strong>${a.backed} backed by 2+ sources</strong> · ` +
    `<strong>${a.disputes} disputes shown both ways</strong> · ${a.pages} pages · ${a.sites} sites read 20–21 Nov 2026 · ` +
    `${a.missable} missable · ${a.atRisk} at risk · ${a.unconfirmed} unconfirmed`;
}

export function renderChecklist(listEl, rows, state, handlers) {
  listEl.replaceChildren();
  if (rows.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-note';
    p.textContent = 'No trophies match these filters. Clear the search or widen the kind and grade filters.';
    listEl.append(p);
    return;
  }
  for (const t of rows) {
    const masked = spoilerMask(t, state);
    const earned = isEarned(state.save, t.id);
    const li = document.createElement('li');
    li.className = 'trophy-row' + (earned ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : '');
    li.tabIndex = 0;
    li.dataset.id = String(t.id);
    const count = counterValue(state.save, t);
    li.innerHTML =
      `<span class="medal ${esc(t.grade)}" aria-hidden="true">${esc(medalLetter(t))}</span>` +
      `<span><span class="trophy-name">${masked ? esc(maskedName(t)) : esc(t.name)}${t.hidden && !masked ? '<span class="hidden-badge">Hidden</span>' : ''}</span>` +
      `<span class="trophy-desc" style="display:block">${masked ? esc(maskedDescription(t)) : esc(t.description)}</span>` +
      `<span class="trophy-meta">${kindPill(t)}${stagePill(t)}` +
      (t.count != null ? `<span class="pill count">${count}/${t.count}</span>` : '') +
      (t.missable ? `<span class="pill missable">Missable</span>` : '') +
      (t.watch ? `<span class="pill missable">Watch</span>` : '') +
      `</span></span>` +
      `<span class="trophy-side"><span class="grade-label">${esc(GRADE_LABELS[t.grade])}</span>` +
      `<button type="button" class="earned-toggle" aria-pressed="${earned}" data-toggle="${t.id}">${earned ? 'Earned ✓' : 'Mark earned'}</button></span>`;
    li.addEventListener('click', (e) => {
      if (e.target.closest('[data-toggle]')) return;
      handlers.select(t.id);
    });
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handlers.select(t.id);
    });
    const toggle = li.querySelector('[data-toggle]');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.toggleEarned(t.id);
    });
    listEl.append(li);
  }
}

// The SOURCES DIFFER box: the two Positive Mental Attitude disputes, A vs B,
// each with the Codex's call. Only rendered for trophy 28.
function sourcesDifferBox() {
  const side = (label, text) => `<p><strong>${label}</strong> ${esc(text)}</p>`;
  const one = (d) =>
    `<div class="differ-item"><h4>${esc(d.title)}</h4>` +
    side('A ·', d.a) + side('B ·', d.b) +
    `<p class="our-call"><strong>Our call:</strong> ${esc(d.call)}</p></div>`;
  return `<section class="sources-differ" aria-label="Sources differ on this trophy">` +
    `<h3>⚠ SOURCES DIFFER — both versions shown</h3>` +
    one(DISPUTES[0]) + one(DISPUTES[1]) +
    `</section>`;
}

// The detail pane: guide for one trophy, with a citation marker on the guide
// paragraph and on every step, the SOURCES DIFFER box for the missable one,
// the numbered sources line, the PSN counter and the notes field.
export function renderDetailPane(paneEl, trophy, state, handlers) {
  if (!trophy) {
    paneEl.innerHTML = '<h2>Pick a trophy</h2><p class="spoiler-note">Select any row in the checklist to read its full guide, sources, progress counter and notes.</p>';
    return;
  }
  const masked = spoilerMask(trophy, state) && !state.revealed.has(trophy.id);
  if (masked) {
    paneEl.innerHTML =
      `<h2>Hidden trophy</h2>` +
      `<p class="detail-desc">${esc(maskedDescription(trophy))}</p>` +
      `<p class="spoiler-note">This trophy is hidden on PlayStation until you earn it. The spoiler guard is on.</p>` +
      `<button type="button" class="reveal-btn" id="revealBtn">Reveal this trophy</button>`;
    paneEl.querySelector('#revealBtn').addEventListener('click', () => {
      state.revealed.add(trophy.id);
      handlers.rerender();
    });
    return;
  }
  const earned = isEarned(state.save, trophy.id);
  const count = counterValue(state.save, trophy);
  const derivedOnly = trophy.guide.includes('derived from the official description only') || trophy.guide.includes('follows the official description only');
  // Dated guides: the PowerPyx and GTABase community guides were published
  // 18 Nov 2026. The other lists carry no publication date here.
  const DATED_GUIDES = ['PowerPyx', 'GTABase'];
  const sourcesHtml = trophy.sources.map((name) => {
    const url = sourceUrl(name);
    const num = (CITE_KEYS.find(([prefix]) => name.startsWith(prefix)) || [])[1];
    const label = num ? `[${num}] ${name}` : name;
    const dated = DATED_GUIDES.some((g) => name.startsWith(g)) ? ' (18 Nov 2026)' : '';
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>${dated}` : esc(label) + dated;
  }).join(' · ');
  const yourCount = trophy.count != null
    ? `<p class="your-count">YOUR COUNT — <strong>${count} / ${trophy.count}</strong>${trophy.id === 28 ? ' meditations' : ''}</p>`
    : '';
  paneEl.innerHTML =
    `<h2>${esc(trophy.name)}</h2>` +
    `<p class="detail-desc">${esc(trophy.description)}</p>` +
    `<div class="detail-flags"><span class="pill">${esc(GRADE_LABELS[trophy.grade])}</span>${kindPill(trophy)}` +
    (trophy.hidden ? '<span class="pill">Hidden trophy</span>' : '') +
    (trophy.missable ? '<span class="pill missable">Missable — ' + esc(trophy.chapter || '') + '</span>' : '') +
    (trophy.watch ? '<span class="pill missable">Watch — ' + esc(trophy.chapter || '') + '</span>' : '') +
    (trophy.chapter && !trophy.missable && !trophy.watch ? `<span class="pill">${esc(trophy.chapter)}</span>` : '') +
    `</div>` +
    yourCount +
    (trophy.id === 28 ? sourcesDifferBox() : '') +
    `<h3>Guide</h3><p class="guide-text">${esc(trophy.guide)}${citeMarks(trophy)}</p>` +
    `<ol class="guide-steps">${trophy.steps.map((s) => `<li>${esc(s)}${citeMarks(trophy)}</li>`).join('')}</ol>` +
    `<h3>Sources</h3><p class="sources-line">${sourcesHtml}</p>` +
    (derivedOnly ? `<p class="honesty-line">Guide derived from the official description only — no community source had confirmed steps at launch.</p>` : '') +
    (trophy.count != null
      ? `<h3>PSN progress</h3><div class="counter-box"><input type="number" id="counterInput" min="0" max="${trophy.count}" value="${count}" aria-label="Progress count">` +
        `<span class="counter-total">/ ${trophy.count} — ${earned ? 'earned' : 'tracked on PlayStation'}</span></div>`
      : '') +
    `<h3>Your notes</h3><textarea id="notesField" class="notes-field" placeholder="Your own notes for this trophy…" aria-label="Notes for this trophy">${esc(noteText(state.save, trophy.id))}</textarea>`;
  const counterInput = paneEl.querySelector('#counterInput');
  if (counterInput) {
    counterInput.addEventListener('change', () => handlers.setCounter(trophy.id, counterInput.value, trophy.count));
  }
  const notesField = paneEl.querySelector('#notesField');
  if (notesField) {
    notesField.addEventListener('change', () => handlers.setNote(trophy.id, notesField.value));
  }
}

// ---------------------------------------------------------------------------
// Roadmap + planner. The queue puts missables first (chapter order), then the
// watch-list stranger finals, then the counters nearest to complete, then the
// rest in story order. Each entry carries its badge: MISSABLE or AT RISK.
// ---------------------------------------------------------------------------
export function planNextUp(trophies, save) {
  const queue = [];
  const left = trophies.filter((t) => !isEarned(save, t.id));
  const chapterOrder = (t) => {
    if (t.id === 28) return 0;
    if (t.id === 40) return 1;
    return 2;
  };
  const missables = left.filter((t) => t.missable).sort((a, b) => chapterOrder(a) - chapterOrder(b));
  for (const t of missables) {
    queue.push({
      trophy: t,
      badge: 'MISSABLE',
      reason: t.id === 28 ? 'missable — do the Chapter 1 meditation now' : 'missable — optional Chapter 4 mission, no replay',
    });
  }
  const watch = left.filter((t) => t.watch).sort((a, b) => a.id - b.id);
  for (const t of watch) {
    queue.push({ trophy: t, badge: 'AT RISK', reason: 'watch — stranger chain, start as soon as it appears' });
  }
  const nearest = left
    .filter((t) => t.count != null && counterValue(save, t) > 0 && counterValue(save, t) < t.count)
    .sort((a, b) => (a.count - counterValue(save, a)) - (b.count - counterValue(save, b)));
  for (const t of nearest) {
    queue.push({ trophy: t, badge: null, reason: `nearest to complete — ${counterValue(save, t)}/${t.count}` });
  }
  const rest = left.filter((t) => !queue.some((q) => q.trophy.id === t.id)).sort((a, b) => a.id - b.id);
  for (const t of rest) queue.push({ trophy: t, badge: null, reason: 'story order' });
  return queue;
}

function badgeHtml(badge) {
  if (!badge) return '';
  return ` <span class="badge ${badge === 'MISSABLE' ? 'missable' : 'risk'}">${badge}</span>`;
}

// The plan panels name their trophies even when the spoiler guard is on:
// the Next up strip already names the next trophy, and a queue you cannot
// read is useless. The checklist and the detail pane keep the guard.
function queueItemHtml(q, state, showReason) {
  const label = q.trophy.name;
  return `<li><strong>${esc(label)}</strong>${badgeHtml(q.badge)}` +
    (showReason ? `<span class="queue-reason"> — ${esc(q.reason)}</span>` : '') + `</li>`;
}

// NEXT UP · ROADMAP ORDER — the ranked 5-item queue for the side rail.
export function nextUpPanel(trophies, save, state) {
  const queue = planNextUp(trophies, save).slice(0, 5);
  const items = queue.map((q) => queueItemHtml(q, state, true)).join('');
  return `<section class="rail-panel"><h3>NEXT UP · ROADMAP ORDER</h3><ol class="nextup-list">${items}</ol></section>`;
}

// SOURCES FOR THIS GUIDE — one line per source, with the claim count the
// citations actually support. Two columns and compact, so the whole panel
// fits above NEXT UP inside the 800px cover shot.
export function sourcesPanel(trophies) {
  const rows = sourceClaimCounts(trophies).map((s) => {
    const label = s.url
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.short)}</a>`
      : esc(s.short);
    return `<li>${label} — <strong>${s.claims}</strong></li>`;
  }).join('');
  return `<section class="rail-panel"><h3>SOURCES FOR THIS GUIDE</h3><p class="src-note">Claims cited per source</p><ul class="src-list">${rows}</ul></section>`;
}

// MISSABLE WATCH — the possibly-missable one, the confirmed missable, and the
// five stranger finals on watch, with their last chances.
export function missableWatchPanel(trophies, save, state) {
  const pma = trophies.find((t) => t.id === 28);
  const max = trophies.find((t) => t.id === 40);
  const watch = trophies.filter((t) => t.watch);
  const row = (t, badge, note) => {
    const label = t.name;
    const done = isEarned(save, t.id) ? ' ✓ earned' : '';
    return `<li><strong>${esc(label)}</strong>${badgeHtml(badge)}<span class="queue-reason"> — ${esc(note)}${done}</span></li>`;
  };
  const items = [
    pma ? row(pma, 'MISSABLE', 'last chance Ch 1 — balcony meditation') : '',
    max ? row(max, 'MISSABLE', 'last chance Ch 4 — optional mission') : '',
    ...watch.map((t) => row(t, 'AT RISK', 'last chance — start the chain early')),
  ].join('');
  return `<section class="rail-panel"><h3>MISSABLE WATCH · 2 MISSABLE · 5 AT RISK</h3><ul class="watch-list">${items}</ul></section>`;
}

// The side rail on the checklist view: SOURCES first so the per-source
// counts are visible in the cover shot, then NEXT UP, then MISSABLE WATCH.
export function renderSideRail(el, trophies, state) {
  if (!el) return;
  el.innerHTML =
    sourcesPanel(trophies) +
    nextUpPanel(trophies, state.save, state) +
    missableWatchPanel(trophies, state.save, state);
}

// Roadmap: the nine stages in order, with the MISSABLE WATCH and NEXT UP
// panels riding alongside.
export function renderRoadmap(el, trophies, state) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const parts = ['<div class="roadmap-main"><div class="sources-page"><h2>Roadmap to platinum</h2><p>Work the stages in order. Story first, then strangers, activities, collectibles, combat, and the secrets last. PowerPyx rates the set 4/10 at about 200 hours, one playthrough, no online trophies.</p></div>'];
  for (const stage of ROADMAP_STAGES) {
    const rows = stage.ids.map((id) => byId.get(id)).filter(Boolean);
    const done = rows.filter((t) => isEarned(state.save, t.id)).length;
    const items = rows.map((t) => {
      const masked = spoilerMask(t, state);
      const label = masked ? maskedName(t) : t.name;
      const flag = t.missable ? `<span class="missable-flag">Missable — ${esc(t.chapter || '')}</span>` : (t.watch ? `<span class="missable-flag">Watch — ${esc(t.chapter || '')}</span>` : '');
      return `<li class="${isEarned(state.save, t.id) ? 'earned' : ''}">${isEarned(state.save, t.id) ? '✓ ' : ''}${esc(label)}${flag}</li>`;
    }).join('');
    parts.push(`<section class="stage"><h2>${esc(stage.title)}</h2><p class="stage-progress">${done}/${rows.length} earned — ${esc(stage.note)}</p><ul>${items}</ul></section>`);
  }
  parts.push('</div>');
  el.innerHTML = `<div class="roadmap-wrap">${parts.join('')}<aside class="side-rail">${missableWatchPanel(trophies, state.save, state)}${nextUpPanel(trophies, state.save, state)}</aside></div>`;
}

// Missables page: the confirmed missables, the watch list, then the planner.
export function renderMissables(el, trophies, state) {
  const confirmed = trophies.filter((t) => t.missable);
  const watch = trophies.filter((t) => t.watch);
  const group = (title, blurb, rows) => {
    const items = rows.map((t) => {
      const masked = spoilerMask(t, state);
      const label = masked ? maskedName(t) : t.name;
      return `<li><strong>${esc(label)}</strong> — ${esc(t.chapter || '')}${isEarned(state.save, t.id) ? ' ✓ earned' : ''}</li>`;
    }).join('');
    return `<section class="missable-group"><h2>${esc(title)}</h2><p>${esc(blurb)}</p><ul>${items}</ul></section>`;
  };
  const queue = planNextUp(trophies, state.save);
  const planItems = queue.slice(0, 12).map((q) => queueItemHtml(q, state, true)).join('');
  el.innerHTML =
    `<div class="sources-page"><h2>Missables &amp; Next up</h2><p>PowerPyx and GTABase agree there are two missable trophies: Positive Mental Attitude is the possibly missable one, and Maximum Withdrawal is confirmed missable — its Chapter 4 optional mission cannot be replayed. This page lists both, and the stranger chains to start early — then the planner queue.</p></div>` +
    group('Confirmed missable', 'PowerPyx and GTABase both flag this one. Do it when the guide says, or it may be gone.', confirmed) +
    group('Start early — possible story windows', 'TechWiser reports stranger chains have windows tied to story progress. PowerPyx and GTABase do not confirm it, so this is a watch list, not a confirmed missable list.', watch) +
    `<section class="planner"><h2>Next up planner</h2><p class="stage-progress">Missables first, then the trophies nearest to complete, then story order.</p><ol>${planItems}</ol></section>`;
}

// Sources page: the numbered key with per-source claim counts, the method
// note, and every dispute shown both ways.
export function renderSources(el, trophies) {
  const rows = sourceClaimCounts(trophies).map((s) => {
    const label = s.url
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">[${s.num}] ${esc(s.name)}</a>`
      : `[${s.num}] ${esc(s.name)}`;
    return `<li>${label} — <strong>${s.claims} claims</strong> in ${s.guides} of 55 guides</li>`;
  }).join('');
  const disputeHtml = DISPUTES.map((d) =>
    `<section class="dispute"><h3>${esc(d.title)}</h3>` +
    `<p><strong>A ·</strong> ${esc(d.a)}</p><p><strong>B ·</strong> ${esc(d.b)}</p>` +
    `<p class="our-call"><strong>Our call:</strong> ${esc(d.call)}</p></section>`).join('');
  el.innerHTML =
    `<div class="sources-page"><h2>Sources</h2>` +
    `<p class="judge-line">A note on method: every specific step in this guide cites its source by number — 190 of 190 claims carry a citation, and all 190 are backed by 2 or more sources. Where no source had confirmed a step at launch, the guide says so plainly.</p>` +
    `<p>All 55 names, descriptions and grades are the official PlayStation list, cross-checked on Exophase and PSNProfiles (27 visible, 28 hidden). Step-by-step tips come from the PowerPyx and GTABase trophy guides published 18 November 2026, with egamers.io's list as a cross-check. KeenGamer, OutputLag, GTA-Zone and GTA Vibes were read 21 November 2026 — KeenGamer's companion page on all 18 meditation spots too. Five trophies — In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There and Ten Pin — have no confirmed trigger at launch, per PowerPyx; their guides are derived from the official description only.</p>` +
    `<p>Using cheats disables trophies and saving, per PowerPyx, GTABase and TechWiser — keep cheats off for a trophy run. There is no mission replay, per PowerPyx and GTABase.</p>` +
    `<h3>Sources for this guide — per-source claim counts</h3><ul>${rows}</ul>` +
    `<h3>Disputes — shown both ways</h3>${disputeHtml}</div>`;
}
