import { WAVES, type Wave } from "@neon-spore/content";
import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { bindBacklog } from "./backlog-page.js";
import { type BossPanel, bindBossPanel } from "./boss.js";
import { bindCellPanel, type CellPanel } from "./cell-panel.js";
import { initColumnResize } from "./column-resize.js";
import { initColumns } from "./columns.js";
import { bindControlSetsTab } from "./controlsets-page.js";
import { bindDemoPanel } from "./demo-panel.js";
import { bindGrid, type GridPanel } from "./grid.js";
import { bindGuidesTab } from "./guide-sheet.js";
import { initMobileMenu } from "./mobile-menu.js";
import { bindNotes } from "./notes-page.js";
import { bindPairPanel } from "./pair-panel.js";
import { bindPalette } from "./palette.js";
import { bindRail } from "./rail.js";
import { makeSelection } from "./selection.js";
import { bindPlace, type PlaceSession } from "./session.js";
import { renderShip, renderShipSheet } from "./ship.js";
import { bindShipped } from "./shipped.js";
import { bindSoundPage } from "./sound-page.js";
import { bindStage } from "./stage.js";
import {
  type Brush,
  CREATURE_BRUSHES,
  currentWave,
  isCreaturePlacementBlocked,
  paint,
  refuse,
  type Store,
} from "./state.js";
import { bindStates, closeMechanicsSheet } from "./states-page.js";
import { initSubcols } from "./subcols.js";
import { bindExpanders, bindTabs } from "./tabs.js";
import { bindTuning } from "./tuning.js";
import { renderWaveOpening } from "./wave-opening.js";

// The director: one screen where a wave is placed, played and judged — not
// the game, and the stage runs the shipping renderer through `computeStage`.
// The hull holds while a wave is judged; `briefings` stays at `DEFAULT_CONFIG`'s
// own default (off, for determinism and shape sheets — see `config-pair.ts`),
// so the stage opens straight on the wave. `#briefToggle` (`pair-panel.ts`)
// turns it on per session for whoever is judging a wave's opening card.
const cfg: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };

// Every column of `<main>` gets a collapse handle (`columns.ts`) and a drag
// grip on its right edge (`column-resize.ts`, after initColumns, which decides
// how wide a section measures); BRUSH and MAP inside the map column get their
// own finer collapse (`subcols.ts`); a phone gets `mobile-menu.ts` instead.
initColumns();
initColumnResize();
initSubcols();
initMobileMenu();

bindShipped();

// The bundled waves are the fallback — the server reads the file from disk.
const store: Store = { waves: structuredClone(WAVES), index: 0, dirty: false };

const place: PlaceSession = bindPlace("#tabs", store.waves.length);
store.index = place.initialWave;

const status = document.getElementById("status");
const setStatus = (text: string, cls = ""): void => {
  if (!status) return;
  status.textContent = text;
  status.className = cls;
};

let grid: GridPanel | null = null;
const stage = bindStage(store, cfg, (beat) => grid?.mark(beat));
// Which cell of the map is under the author's attention — see `selection.ts`.
const selection = makeSelection();
const palette = bindPalette({ selection, hidden: hiddenBrushes, onPaint: paintSelected });
grid = bindGrid(
  store,
  () => cfg,
  onShape,
  (beat) => stage.seek(beat),
  selection,
);
// The panel under the map: what the selected cell holds — see `cell-panel.ts`.
const cells: CellPanel = bindCellPanel({ store, selection, onEdit: onShape });
const boss: BossPanel = bindBossPanel(store, onShape);
const rail = bindRail(store, refreshAll, onProse);
bindTuning(cfg, () => {
  grid.render();
  renderShip(cfg, currentWave(store));
  renderShipSheet(cfg);
  stage.rebuild();
});
// The pair's own switches plus the cannon's wind-up — see `pair-panel.ts`.
const pair = bindPairPanel(cfg, () => {
  renderShip(cfg, currentWave(store));
  renderShipSheet(cfg);
  stage.rebuild();
});
renderShip(cfg, currentWave(store));
renderShipSheet(cfg);
// One wave and one set of switches per mechanic — see `demo-panel.ts`.
// `refreshAll` is what every other jump to a wave runs through; `pair.render`
// and `renderShip` follow because a demo flips `cfg` from outside their files.
bindDemoPanel(
  store,
  cfg,
  () => {
    refreshAll();
    pair.render();
    renderShip(cfg, currentWave(store));
    renderShipSheet(cfg);
  },
  closeMechanicsSheet,
);
// GUIDES joined GAME MECHANICS as a tab — see `guide-sheet.ts`. Bound before
// `bindStates` below, the same ordering `bindDemoPanel` uses, so a restore
// straight to this tab finds the listener already wired.
bindGuidesTab();

// `.hint` text defaults to hidden — the name is usually enough, and the full blurb is one click away in CREATURES. Persisted like the tuning presets.
const BRUSH_HINTS_KEY = "neon-spore-director-brush-hints";

function bindBrushHints(): void {
  const brushes = document.getElementById("brushes");
  const toggle = document.getElementById("brushHintToggle");
  let show = window.localStorage.getItem(BRUSH_HINTS_KEY) === "1";
  const apply = (): void => {
    brushes?.classList.toggle("hide-hints", !show);
    if (toggle) toggle.textContent = show ? "HIDE DESCRIPTIONS" : "SHOW DESCRIPTIONS";
  };
  apply();
  toggle?.addEventListener("click", () => {
    show = !show;
    window.localStorage.setItem(BRUSH_HINTS_KEY, show ? "1" : "0");
    apply();
  });
}
bindBrushHints();

// Paint the selected cell with a brush — a no-op with nothing selected.
function paintSelected(brush: Brush): void {
  const wave = currentWave(store);
  const at = selection.at();
  if (!wave || !at) return;
  paint(wave, at.beat, at.col, brush);
  store.dirty = true;
  onShape();
}
// Brushes the current wave has no use for, so the palette knows what to hide.
function hiddenBrushes(): ReadonlySet<Brush> {
  const wave = currentWave(store);
  if (!wave || !isCreaturePlacementBlocked(wave)) return new Set();
  return new Set(CREATURE_BRUSHES);
}
// A wave changed shape: redraw the grid, the boss panel, and replay from the top.
function onShape(): void {
  grid?.render();
  boss.render();
  palette.render();
  // The selection did not move, but what is under it may have just been
  // erased or painted over — the panel names the contents, not the coordinates.
  cells?.render();
  stage.rebuild();
  paintStatus();
  paintBriefing();
  renderShip(cfg, currentWave(store));
}
// Which cards the wave on the stage raises for a fresh pair — see `wave-opening.ts`.
function paintBriefing(): void {
  renderWaveOpening(currentWave(store));
}
// Only the prose changed — replaying the wave for a typed letter would be rude.
function onProse(): void {
  paintStatus();
}

function refreshAll(): void {
  place.persist(store.index);
  // A different wave: beat 4 column 2 is a different cell now, and pointing the
  // panel at whatever happens to be there would be a selection nobody made.
  selection.set(null);
  rail.render();
  grid?.render();
  boss.render();
  palette.render();
  cells?.render();
  stage.rebuild();
  paintStatus();
  paintBriefing();
  renderShip(cfg, currentWave(store));
}

function paintStatus(): void {
  const bad = refuse(store.waves);
  if (bad) setStatus(bad, "bad");
  else if (store.dirty) setStatus("unsaved", "dirty");
  else setStatus("saved");
}

document.getElementById("save")?.addEventListener("click", save);

async function save(): Promise<void> {
  const bad = refuse(store.waves);
  if (bad) {
    setStatus(bad, "bad");
    return;
  }
  setStatus("saving…");
  try {
    const res = await fetch("/api/waves", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(store.waves),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? res.statusText);
    store.dirty = false;
    paintStatus();
  } catch (err) {
    setStatus(`save failed: ${String(err)}`, "bad");
  }
}

async function load(): Promise<void> {
  try {
    const res = await fetch("/api/waves");
    if (!res.ok) throw new Error(res.statusText);
    store.waves = (await res.json()) as Wave[];
  } catch {
    // No server — the bundled copy is still worth editing, just not saving.
    setStatus("no server — read only", "bad");
  }
  store.index = Math.min(store.index, store.waves.length - 1);
  refreshAll();
}

bindTabs("#tabs");
document.querySelector<HTMLButtonElement>(`#tabs button[data-tab="${place.initialTab}"]`)?.click();
bindBacklog();
bindNotes();
bindStates();
bindSoundPage();
bindControlSetsTab();
bindExpanders();

window.addEventListener("beforeunload", (e) => {
  if (!store.dirty) return;
  e.preventDefault();
});

void load();
