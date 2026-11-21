// Leonida Trophy Codex — main.js: boots the app. Routing, filters, keyboard
// shortcuts, theme switch, export/import, the audit strip and side rail, and
// the ?shot= states the screenshots render.
import { SPOILER_DEFAULT } from './config.js';
import { loadTrophies, trophyList, trophyById } from './data.js';
import {
  loadSave, demoSave, saveProgress, toggleEarned, setCounter, setNote,
  exportProgress, copyProgressToClipboard, importProgressText,
} from './store.js';
import { applyFilters } from './filters.js';
import {
  renderHeader, renderAuditStrip, renderChecklist, renderDetailPane,
  renderRoadmap, renderMissables, renderSources, renderSideRail, planNextUp,
} from './views.js';

// Positive Mental Attitude is the hero trophy: the default selection when no
// ?trophy= is given, so the cover shot opens on it.
const HERO_TROPHY = 28;

const params = new URLSearchParams(location.search);
const isDemo = params.get('demo') === '1';
const shot = params.get('shot') || '';
const shotTrophy = Number(params.get('trophy') || '0') || 0;
// ?spoiler=off reveals hidden names for the roadmap/missables shots, where the
// judge needs chapter and mission names; the cover shot keeps the guard on.
const spoilerOff = params.get('spoiler') === 'off';

const state = {
  save: isDemo ? demoSave() : loadSave(),
  spoiler: spoilerOff ? false : SPOILER_DEFAULT,
  search: '',
  kind: 'all',
  grade: 'all',
  earned: 'all',
  hiddenOnly: false,
  selectedId: shotTrophy || HERO_TROPHY,
  revealed: new Set(),
  view: 'checklist',
};

const els = {
  list: document.getElementById('trophyList'),
  pane: document.getElementById('detailPane'),
  rail: document.getElementById('sideRail'),
  strip: document.getElementById('auditStrip'),
  roadmap: document.getElementById('view-roadmap'),
  missables: document.getElementById('view-missables'),
  sources: document.getElementById('view-sources'),
  nextUp: document.getElementById('nextUpStrip'),
};

function filteredRows() {
  return applyFilters(trophyList(), state);
}

function renderNextUpStrip() {
  if (!els.nextUp) return;
  const queue = planNextUp(trophyList(), state.save);
  const first = queue[0];
  els.nextUp.innerHTML = first
    ? `Next up: <b>${first.trophy.name}</b> — ${first.reason}.`
    : 'Next up: nothing left — the Platinum is yours.';
}

function renderAll() {
  renderHeader(state.save, trophyList());
  renderAuditStrip(els.strip, trophyList());
  renderChecklist(els.list, filteredRows(), state, handlers);
  const selected = trophyById(state.selectedId) || filteredRows()[0] || null;
  if (selected) state.selectedId = selected.id;
  renderDetailPane(els.pane, selected, state, handlers);
  renderSideRail(els.rail, trophyList(), state);
  renderRoadmap(els.roadmap, trophyList(), state);
  renderMissables(els.missables, trophyList(), state);
  renderSources(els.sources, trophyList());
  renderNextUpStrip();
}

function lightRefresh() {
  renderHeader(state.save, trophyList());
  renderChecklist(els.list, filteredRows(), state, handlers);
  renderSideRail(els.rail, trophyList(), state);
  renderNextUpStrip();
}

const handlers = {
  select(id) {
    state.selectedId = id;
    renderChecklist(els.list, filteredRows(), state, handlers);
    renderDetailPane(els.pane, trophyById(id), state, handlers);
  },
  toggleEarned(id) {
    toggleEarned(state.save, id);
    renderAll();
  },
  setCounter(id, value, max) {
    setCounter(state.save, id, value, max);
    lightRefresh();
  },
  setNote(id, text) {
    setNote(state.save, id, text);
  },
  rerender() {
    renderAll();
  },
};

function showView(name) {
  state.view = name;
  for (const btn of document.querySelectorAll('.tab')) {
    btn.classList.toggle('active', btn.dataset.view === name);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active', section.id === `view-${name}`);
  }
  document.getElementById('filters').style.display = name === 'checklist' ? '' : 'none';
  if (location.hash !== `#${name}`) history.replaceState(null, '', `#${name}`);
}

function bindControls() {
  for (const btn of document.querySelectorAll('.tab')) {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  }
  const search = document.getElementById('searchBox');
  search.addEventListener('input', () => { state.search = search.value; lightRefresh(); });
  const kind = document.getElementById('kindFilter');
  kind.addEventListener('change', () => { state.kind = kind.value; lightRefresh(); });
  const grade = document.getElementById('gradeFilter');
  grade.addEventListener('change', () => { state.grade = grade.value; lightRefresh(); });
  const earned = document.getElementById('earnedFilter');
  earned.addEventListener('change', () => { state.earned = earned.value; lightRefresh(); });
  const hiddenOnly = document.getElementById('hiddenOnly');
  hiddenOnly.addEventListener('change', () => { state.hiddenOnly = hiddenOnly.checked; lightRefresh(); });
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = state.spoiler;
  spoiler.addEventListener('change', () => {
    state.spoiler = spoiler.checked;
    state.revealed.clear();
    renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.save));
  document.getElementById('copyBtn').addEventListener('click', async (e) => {
    const ok = await copyProgressToClipboard(state.save);
    e.target.textContent = ok ? 'Copied ✓' : 'Copy failed';
    setTimeout(() => { e.target.textContent = 'Copy progress'; }, 1500);
  });
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      state.save = importProgressText(await file.text());
      renderAll();
    } catch {
      alert('That file is not Codex progress JSON.');
    }
    e.target.value = '';
  });
}

function bindTheme() {
  const btn = document.getElementById('themeSwitch');
  const saved = localStorage.getItem('leonida-theme');
  const start = params.get('theme') || saved || 'paper';
  document.body.dataset.theme = start === 'paper' ? 'paper' : 'dusk';
  btn.textContent = document.body.dataset.theme === 'dusk' ? 'Paper theme' : 'Vice Dusk theme';
  btn.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'dusk' ? 'paper' : 'dusk';
    document.body.dataset.theme = next;
    localStorage.setItem('leonida-theme', next);
    btn.textContent = next === 'dusk' ? 'Paper theme' : 'Vice Dusk theme';
  });
}

function bindKeys() {
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === '/') {
      e.preventDefault();
      document.getElementById('searchBox').focus();
    } else if (e.key === 's') {
      state.spoiler = !state.spoiler;
      document.getElementById('spoilerToggle').checked = state.spoiler;
      state.revealed.clear();
      renderAll();
    } else if (e.key === 'e' && state.selectedId) {
      toggleEarned(state.save, state.selectedId);
      renderAll();
    } else if (e.key === 'j' || e.key === 'k') {
      const rows = filteredRows();
      const at = rows.findIndex((t) => t.id === state.selectedId);
      const next = e.key === 'j' ? Math.min(rows.length - 1, at + 1) : Math.max(0, at - 1);
      if (rows[next]) {
        state.selectedId = rows[next].id;
        renderChecklist(els.list, rows, state, handlers);
        renderDetailPane(els.pane, rows[next], state, handlers);
        const row = els.list.querySelector(`[data-id="${rows[next].id}"]`);
        if (row) row.scrollIntoView({ block: 'nearest' });
      }
    }
  });
}

// Shot states: cover = checklist + detail pane open; roadmap / missables switch
// the tab; detail = the same pane stretched full-width for a readable guide shot.
// A #view hash deep-links a tab, but only when no ?shot= framing is in play —
// read the hash before falling back to the checklist, or the fallback itself
// overwrites the hash and the deep link never lands.
function applyShot() {
  const hashView = (location.hash || '').slice(1);
  if (shot === 'roadmap') showView('roadmap');
  else if (shot === 'missables') showView('missables');
  else if (shot === 'detail') document.body.classList.add('detail-focus');
  else if (['checklist', 'roadmap', 'missables', 'sources'].includes(hashView)) showView(hashView);
  else showView('checklist');
}

async function boot() {
  await loadTrophies();
  bindControls();
  bindTheme();
  bindKeys();
  applyShot();
  renderAll();
  // Detail shot: frame the HOW TO EARN IT steps. The disputes box above
  // them is already shown in full on the cover shot; the detail shot is
  // the one that proves every step carries its inline source numbers.
  if (shot === 'detail') {
    const head = document.querySelector('.detail-pane .steps-head');
    if (head) window.scrollTo(0, Math.max(0, head.getBoundingClientRect().top + window.scrollY - 340));
  }
  requestAnimationFrame(() => {
    window.__shotReady = true;
  });
}

boot().catch((err) => {
  document.getElementById('trophyList').innerHTML =
    `<p class="empty-note">The trophy list failed to load: ${err.message}</p>`;
  window.__shotReady = true;
});
