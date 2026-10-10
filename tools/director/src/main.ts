import { WAVES } from "@neon-spore/content";
import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { bindBacklog } from "./backlog-page.js";
import { type BossPanel, bindBossPanel } from "./boss.js";
import { bindBrushHints } from "./brush-hints.js";
import { jumpWaveIndex } from "./brush-wave.js";
import { bindCellPanel, type CellPanel } from "./cell-panel.js";
import { initColumnResize } from "./column-resize.js";
import { initColumns } from "./columns.js";
import { bindDocumentationRooms } from "./documentation-rooms.js";
import { bindGrid, type GridPanel } from "./grid.js";
import { makeHeld } from "./held.js";
import { bindRefresh } from "./main-refresh.js";
import { bindTempoControls } from "./main-tempo.js";
import { initMobileMenu } from "./mobile-menu.js";
import { bindNotes } from "./notes-page.js";
import { bindPairPanel } from "./pair-panel.js";
import { bindPalette } from "./palette.js";
import { onPhone } from "./phone-view.js";
import { openPullLabAsked } from "./pull-lab.js";
import { bindRail } from "./rail.js";
import { rememberedWave } from "./rail-arrive.js";
import { followHash } from "./section-follow.js";
import { makeSelection } from "./selection.js";
import { bindPlace, type PlaceSession } from "./session.js";
import { bindSheetDoors } from "./sheet-doors.js";
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
import { bindStates } from "./states-page.js";
import { initSubcols } from "./subcols.js";
import { bindContents, bindExpanders, bindTabs } from "./tabs.js";
import { bindWaveIo } from "./waves-io.js";

// The director: one screen where a wave is placed, played and judged — not
// the game, and the stage runs the shipping renderer through `computeStage`.
// **The hull breaks here.** It held while a wave was judged, and the owner asked
// for that off: a wave of sound going through the ship with the bar unmoved is a
// defence that cannot be judged, which is what this screen is for. `briefings`
// stays at `DEFAULT_CONFIG`'s own default (off, for determinism and shape sheets
// — `config-pair.ts`); `#briefToggle` turns it on to judge an opening card.
// **On a phone it starts on**: the owner, 24 September 2026, *by default for
// mobile show briefing* — a phone is where a wave is played as the pair would
// meet it, card first.
const cfg: SimConfig = { ...DEFAULT_CONFIG, briefings: onPhone() };

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

// A bare address opens on the wave last opened here (`rail-arrive.ts`).
const place: PlaceSession = bindPlace(store.waves.length, rememberedWave());
store.index = place.initialWave;

const saveButton = document.getElementById("save");
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
// And which brush the author is carrying, if any — the palette lights it and
// the map spends it (`held.ts`).
const held = makeHeld();
// What every panel does when the wave under it moves — see `main-refresh.ts`.
const { onShape, refreshAll, jumpToBrushWave } = bindRefresh({
  store,
  cfg,
  place,
  selection,
  stage,
  panels: () => ({ rail, grid, boss, palette, cells }),
  paintStatus,
});
const palette = bindPalette({
  selection,
  held,
  hidden: hiddenBrushes,
  onPaint: paintSelected,
  canJump: (brush) => jumpWaveIndex(store.waves, brush) !== undefined,
  onJump: jumpToBrushWave,
});
grid = bindGrid(
  store,
  () => cfg,
  onShape,
  (beat) => stage.seek(beat),
  selection,
  held,
);
// Arming a brush changes what a click on the map *does*, so the map is rebuilt
// with it: a cell that can be picked up while nothing is held is a cell that
// paints while something is (`grid-gestures.ts`).
held.watch(() => {
  palette.render();
  grid?.render();
});
// The panel under the map: what the selected cell holds — see `cell-panel.ts`.
const cells: CellPanel = bindCellPanel({ store, selection, cfg: () => cfg, onEdit: onShape });
// The boss panel edits a wave through `onShape` like every other panel, and
// picks a *round* through `stage.openRound`, which the stage then holds and
// re-applies to every world it builds — so nothing here depends on an order.
const boss: BossPanel = bindBossPanel(
  store,
  onShape,
  (round) => stage.openRound(round),
  () => stage.round(),
);
// The pair's own switches plus the cannon's wind-up — see `pair-panel.ts`. Its
// `render` was for DEMOS, which flipped `cfg` from outside this file; nothing
// does that now that the room is gone, so the panel paints itself and nobody
// has to ask it to.
bindPairPanel(cfg, () => {
  renderShip(cfg, currentWave(store));
  renderShipSheet(cfg);
  stage.rebuild();
});
const rail = bindRail(store, refreshAll, onProse);
// The slider and the picker, bound in terms of each other (`main-tempo.ts`).
bindTempoControls(cfg, () => {
  grid.render();
  renderShip(cfg, currentWave(store));
  renderShipSheet(cfg);
  stage.rebuild();
});
renderShip(cfg, currentWave(store));
renderShipSheet(cfg);
// DOCUMENTATION's lazy rooms, all bound before `bindStates` below — see
// `documentation-rooms.ts` for why the order matters.
bindDocumentationRooms();

// The palette's descriptions, on or off, remembered — see `brush-hints.ts`.
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
// Only the prose changed — replaying the wave for a typed letter would be rude.
function onProse(): void {
  paintStatus();
}

// The save button is the indicator: blue while there is something to write,
// green once the store matches disk. Only a message the button cannot carry —
// a refusal, a failed save, no server — still needs words beside it.
function paintStatus(): void {
  const bad = refuse(store.waves);
  setStatus(bad ?? "", bad ? "bad" : "");
  saveButton?.classList.toggle("saved", !bad && !store.dirty);
}

// Reading and writing the act files, and the base revision that keeps a save
// from overwriting an edit this page never saw — see `waves-io.ts`.
const io = bindWaveIo({ store, setStatus, repaint: paintStatus, refresh: refreshAll });
saveButton?.addEventListener("click", () => void io.save());

// `#tabs` holds no tab any more, only the arrows and the wave's own number
// (`index.html`, `rail-steps.ts`) — so there is no `?tab=` button left to click
// at startup, and `#tab-wave` keeps the `on` the markup gives it.
bindTabs("#tabs");
bindBacklog();
bindNotes();
bindStates();
bindSoundPage();
// After every page is bound: the doors light off the pages, whichever opened
// them — see `sheet-doors.ts`.
bindSheetDoors();
bindExpanders();
bindContents();
// After every sheet has restored itself from the query string.
followHash();
openPullLabAsked(window.location.search);

void io.load();
