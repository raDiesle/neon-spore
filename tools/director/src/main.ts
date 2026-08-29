import { WAVES, type Wave } from "@neon-spore/content";
import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { bindBacklog } from "./backlog-page.js";
import { type BossPanel, bindBossPanel } from "./boss.js";
import { bindChecks } from "./checks-page.js";
import { bindControlSetsTab } from "./controlsets-page.js";
import { bindDemoPanel } from "./demo-panel.js";
import { bindGrid, type GridPanel } from "./grid.js";
import { bindCardsPage } from "./guide-sheet.js";
import { bindPairPanel } from "./pair-panel.js";
import { bindPalette } from "./palette.js";
import { initPanels } from "./panels.js";
import { bindRail } from "./rail.js";
import { bindPlace, type PlaceSession } from "./session.js";
import { renderShip, renderShipSheet } from "./ship.js";
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
import { bindStates, closeMechanicsSheet } from "./states-page.js";
import { bindExpanders, bindTabs } from "./tabs.js";
import { bindTuning } from "./tuning.js";
import { renderWaveOpening } from "./wave-opening.js";

// The director: one screen where a wave is placed, played and judged — not
// the game, and the stage runs the shipping renderer through `computeStage`.
// The hull holds while a wave is judged; `briefings: true` corrects
// `DEFAULT_CONFIG`'s own default (off, for determinism and shape sheets —
// see `config-pair.ts`), and `#briefToggle` (`pair-panel.ts`) turns it off
// again per session.
const cfg: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true, briefings: true };

// Every panel gets a collapse handle via `[data-panel]` — see `panels.ts`.
initPanels();
// Phone: the four columns become three views, toggled by #viewToggle —
// `?view=` overrides once (like panels.ts's `?closed=`); a click persists to
// localStorage. docs/queue.md, burn-director-ship.
const VIEWS = ["wave", "game", "map"] as const;
type MobileView = (typeof VIEWS)[number];
const isMobileView = (v: string | null): v is MobileView =>
  v !== null && (VIEWS as readonly string[]).includes(v);
(() => {
  const main = document.querySelector("main");
  const buttons = document.querySelectorAll<HTMLButtonElement>("#viewToggle button[data-view]");
  if (!main || buttons.length === 0) return;
  const forced = new URLSearchParams(location.search).get("view");
  const stored = localStorage.getItem("neon-spore-director-view");
  const apply = (v: MobileView): void => {
    main.setAttribute("data-view", v);
    for (const b of buttons) b.classList.toggle("on", b.dataset.view === v);
  };
  apply(isMobileView(forced) ? forced : isMobileView(stored) ? stored : "wave");
  for (const b of buttons)
    b.addEventListener("click", () => {
      apply(b.dataset.view as MobileView);
      localStorage.setItem("neon-spore-director-view", b.dataset.view as MobileView);
    });
})();

// A shipped build has no write route — hide what would fail rather than
// offer it; a route that cannot be reached at all reads the same way.
void fetch("/__director")
  .then((r) => r.json())
  .then((b: { shipped?: boolean }) => b.shipped !== false)
  .catch(() => true)
  .then((shipped) => {
    if (!shipped) return;
    for (const id of ["save", "checksOpen", "mainMenuLink"])
      document.getElementById(id)?.setAttribute("hidden", "");
    document.getElementById("shippedNote")?.removeAttribute("hidden");
  });

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

// `.hint` text defaults to hidden — the name is usually enough, and the full
// blurb is one click away in CREATURES. Persisted like the tuning presets.
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
  rail.render();
  grid?.render();
  boss.render();
  palette.render();
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
bindChecks();
bindStates();
bindSoundPage();
bindControlSetsTab();
bindCardsPage();
bindExpanders();

window.addEventListener("beforeunload", (e) => {
  if (!store.dirty) return;
  e.preventDefault();
});

void load();
