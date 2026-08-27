import { WAVES, type Wave } from "@neon-spore/content";
import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { bindBacklog } from "./backlog-page.js";
import { type BalancePanel, bindBalance } from "./balance.js";
import { type BossPanel, bindBossPanel } from "./boss.js";
import { bindChecks } from "./checks-page.js";
import { bindGrid, type GridPanel } from "./grid.js";
import { bindPalette } from "./palette.js";
import { bindRail } from "./rail.js";
import { renderShip } from "./ship.js";
import { bindSoundPage } from "./sound-page.js";
import { bindStage } from "./stage.js";
import {
  type Brush,
  CREATURE_BRUSHES,
  currentWave,
  isCreaturePlacementBlocked,
  refuse,
  type Store,
} from "./state.js";
import { bindStates } from "./states-page.js";
import { bindExpanders, bindTabs } from "./tabs.js";
import { bindTuning } from "./tuning.js";

/**
 * The director: one screen where a wave is placed, played and judged.
 *
 * Desktop only, and it is not the game — it has controls no player's phone
 * carries. What it must not do is show a different field from the one the
 * phone shows, which is why the stage runs the shipping renderer through
 * `computeStage` rather than drawing the grid a second time.
 */

// The hull holds while a wave is being looked at, the same choice `apps/game`
// makes in its test build and for the same reason: a wave that is being judged
// should be allowed to reach its end. The damage is still drawn.
const cfg: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };

// The bundled waves are the fallback, not the source. The server reads the
// file from disk, so an editor opened after a hand edit shows the hand edit.
const store: Store = { waves: structuredClone(WAVES), index: 0, dirty: false };

const status = document.getElementById("status");
const setStatus = (text: string, cls = ""): void => {
  if (!status) return;
  status.textContent = text;
  status.className = cls;
};

let grid: GridPanel | null = null;
// Bound after the stage, because it reads the stage's world — see below.
let balance: BalancePanel | null = null;
const stage = bindStage(
  store,
  cfg,
  (beat) => grid?.mark(beat),
  () => balance?.render(),
);
balance = bindBalance(() => stage.world());
const palette = bindPalette(() => {}, hiddenBrushes);
grid = bindGrid(
  store,
  () => cfg,
  palette,
  onShape,
  (beat) => stage.seek(beat),
);
const boss: BossPanel = bindBossPanel(store, onShape);
const rail = bindRail(store, refreshAll, onProse);
bindTuning(cfg, () => {
  grid.render();
  renderShip(cfg);
  stage.rebuild();
});
renderShip(cfg);

/**
 * The brush description text (`.hint`, e.g. a blurb like "Dead rock. Cannot
 * be shot…") defaults to hidden — the palette is grouped by category now, so
 * the name alone is usually enough, and the full bestiary blurb is one click
 * away in the CREATURES tab. Persisted the same way the tuning presets are:
 * plain `localStorage`, read once at startup.
 */
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

/** Brushes the current wave has no use for, so the palette knows what to hide. */
function hiddenBrushes(): ReadonlySet<Brush> {
  const wave = currentWave(store);
  if (!wave || !isCreaturePlacementBlocked(wave)) return new Set();
  return new Set(CREATURE_BRUSHES);
}

/** A wave changed shape: redraw the grid, the boss panel, and replay from the top. */
function onShape(): void {
  grid?.render();
  boss.render();
  palette.render();
  stage.rebuild();
  paintStatus();
}

/** Only the prose changed. Replaying the wave for a typed letter would be rude. */
function onProse(): void {
  paintStatus();
}

function refreshAll(): void {
  rail.render();
  grid?.render();
  boss.render();
  palette.render();
  stage.rebuild();
  paintStatus();
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
    // Opened without the server — the bundled copy is still worth editing,
    // it just cannot be saved.
    setStatus("no server — read only", "bad");
  }
  store.index = Math.min(store.index, store.waves.length - 1);
  refreshAll();
}

bindTabs("#tabs");
bindBacklog();
bindChecks();
bindStates();
bindSoundPage();
bindExpanders();

window.addEventListener("beforeunload", (e) => {
  if (!store.dirty) return;
  e.preventDefault();
});

void load();
