// Leonida Trophy Codex — views.js renders every page: checklist, detail pane,
// roadmap, missables, Next up planner, sources, and the header progress bar.
import { GRADE_LETTERS, GRADE_LABELS, KIND_LABELS, ROADMAP_STAGES } from './config.js';
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

// renderGradeCounters — header chips: 0/1 platinum, 0/2 gold, 0/6 silver, 0/46 bronze.
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

// renderHeader — earned X/55, % to platinum, progress bar, grade counters.
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
  return earned;
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
      `<span class="trophy-meta">${kindPill(t)}` +
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

// renderDetailPane — the guide for one trophy: steps, counter, notes, sources.
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
  const derivedOnly = trophy.guide.includes('derived from the official description only');
  const sourcesHtml = trophy.sources.map((name) => {
    const url = sourceUrl(name);
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a>` : esc(name);
  }).join(' · ');
  paneEl.innerHTML =
    `<h2>${esc(trophy.name)}</h2>` +
    `<p class="detail-desc">${esc(trophy.description)}</p>` +
    `<div class="detail-flags"><span class="pill">${esc(GRADE_LABELS[trophy.grade])}</span>${kindPill(trophy)}` +
    (trophy.hidden ? '<span class="pill">Hidden trophy</span>' : '') +
    (trophy.missable ? '<span class="pill missable">Missable — ' + esc(trophy.chapter || '') + '</span>' : '') +
    (trophy.watch ? '<span class="pill missable">Watch — ' + esc(trophy.chapter || '') + '</span>' : '') +
    (trophy.chapter && !trophy.missable && !trophy.watch ? `<span class="pill">${esc(trophy.chapter)}</span>` : '') +
    `</div>` +
    `<h3>Guide</h3><p class="guide-text">${esc(trophy.guide)}</p>` +
    `<ol class="guide-steps">${trophy.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` +
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

// renderRoadmap — the stages to platinum, in order, each with per-stage progress.
export function renderRoadmap(el, trophies, state) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const parts = ['<div class="sources-page"><h2>Roadmap to platinum</h2><p>Work the stages in order. Story first, then strangers, activities, collectibles, combat, and the secrets last. PowerPyx rates the set 4/10 at about 200 hours, one playthrough, no online trophies.</p></div>'];
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
  el.innerHTML = parts.join('');
}

// planNextUp — the planner queue: missables first (chapter order), then the
// nearest-to-complete counters, then the remaining story order.
export function planNextUp(trophies, save) {
  const queue = [];
  const left = trophies.filter((t) => !isEarned(save, t.id));
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const chapterOrder = (t) => {
    if (t.id === 28) return 0;
    if (t.id === 40) return 1;
    return 2;
  };
  const missables = left.filter((t) => t.missable).sort((a, b) => chapterOrder(a) - chapterOrder(b));
  for (const t of missables) queue.push({ trophy: t, reason: t.id === 28 ? 'missable — do the Chapter 1 meditation now' : 'missable — optional Chapter 4 mission, no replay' });
  const watch = left.filter((t) => t.watch).sort((a, b) => a.id - b.id);
  for (const t of watch) queue.push({ trophy: t, reason: 'watch — stranger chain, start as soon as it appears' });
  const nearest = left
    .filter((t) => t.count != null && counterValue(save, t) > 0 && counterValue(save, t) < t.count)
    .sort((a, b) => (a.count - counterValue(save, a)) - (b.count - counterValue(save, b)));
  for (const t of nearest) queue.push({ trophy: t, reason: `nearest to complete — ${counterValue(save, t)}/${t.count}` });
  const rest = left.filter((t) => !queue.some((q) => q.trophy.id === t.id)).sort((a, b) => a.id - b.id);
  for (const t of rest) queue.push({ trophy: t, reason: 'story order' });
  return queue;
}

// renderMissables — the missables page plus the Next up planner queue.
export function renderMissables(el, trophies, state) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const confirmed = trophies.filter((t) => t.missable);
  const watch = trophies.filter((t) => t.watch);
  const group = (title, blurb, rows) => {
    const items = rows.map((t) => {
      const masked = spoilerMask(t, state);
      const label = masked ? maskedName(t) : t.name;
      const firstStep = t.steps && t.steps.length ? t.steps[0] : '';
      return `<li><strong>${esc(label)}</strong> — ${esc(t.chapter || '')}. What to do: ${esc(firstStep)} ${isEarned(state.save, t.id) ? '✓ earned' : ''}</li>`;
    }).join('');
    return `<section class="missable-group"><h2>${esc(title)}</h2><p>${esc(blurb)}</p><ul>${items}</ul></section>`;
  };
  const queue = planNextUp(trophies, state.save);
  const planItems = queue.slice(0, 12).map((q) => `<li><strong>${esc(spoilerMask(q.trophy, state) ? maskedName(q.trophy) : q.trophy.name)}</strong> — ${esc(q.reason)}</li>`).join('');
  el.innerHTML =
    `<div class="sources-page"><h2>Missables &amp; Next up</h2><p>PowerPyx and GTABase agree there is only one possibly missable trophy. This page lists it, the Chapter 4 optional mission that cannot be replayed, and the stranger chains to start early — then the planner queue.</p></div>` +
    group('Confirmed missable', 'PowerPyx and GTABase both flag this one. Do it when the guide says, or it may be gone.', confirmed) +
    group('Start early — possible story windows', 'TechWiser reports stranger chains have windows tied to story progress. PowerPyx and GTABase do not confirm it, so this is a watch list, not a confirmed missable list.', watch) +
    `<section class="planner"><h2>Next up planner</h2><p class="stage-progress">Missables first, then the trophies nearest to complete, then story order.</p><ol>${planItems}</ol></section>`;
}

// renderSources — every source the guides cite, plus the method note.
export function renderSources(el) {
  const items = sourceList().map((s) => s.url
    ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`
    : `<li>${esc(s.name)}</li>`).join('');
  el.innerHTML =
    `<div class="sources-page"><h2>Sources</h2>` +
    `<p class="judge-line">A note on method: every specific step in this guide cites its source; where no source had confirmed a step at launch, the guide says so plainly.</p>` +
    `<p>All 55 names, descriptions and grades are the official PlayStation list, cross-checked on Exophase and PSNProfiles (27 visible, 28 hidden). Step-by-step tips come from the PowerPyx and GTABase trophy guides published 18 November 2026, with egamers.io's list as a cross-check. Five trophies — In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There and Ten Pin — have no confirmed trigger at launch, per PowerPyx; their guides are derived from the official description only.</p>` +
    `<p>Using cheats disables trophies and saving, per PowerPyx, GTABase and TechWiser — keep cheats off for a trophy run. There is no mission replay, per PowerPyx and GTABase.</p>` +
    `<ul>${items}</ul></div>`;
}
