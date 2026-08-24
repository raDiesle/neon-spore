import { WAVES, type Wave } from "@neon-spore/content";
import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { renderBestiary } from "./bestiary.js";
import { bindGrid } from "./grid.js";
import { bindRail } from "./rail.js";
import { bindStage } from "./stage.js";
import { refuse, type Store } from "./state.js";
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

const stage = bindStage(store, cfg);
const grid = bindGrid(store, () => cfg, onShape);
const rail = bindRail(store, refreshAll, onProse);
bindTuning(cfg, () => {
  grid.render();
  renderBestiary(cfg);
});
renderBestiary(cfg);

/** A wave changed shape: redraw the grid and replay it from the top. */
function onShape(): void {
  grid.render();
  stage.rebuild();
  paintStatus();
}

/** Only the prose changed. Replaying the wave for a typed letter would be rude. */
function onProse(): void {
  paintStatus();
}

function refreshAll(): void {
  rail.render();
  grid.render();
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

for (const tab of document.querySelectorAll<HTMLElement>("#tabs button")) {
  tab.addEventListener("click", () => {
    for (const other of document.querySelectorAll("#tabs button")) {
      other.classList.toggle("on", other === tab);
    }
    for (const page of document.querySelectorAll(".tabpage")) {
      page.classList.toggle("on", page.id === `tab-${tab.dataset.tab}`);
    }
  });
}

window.addEventListener("beforeunload", (e) => {
  if (!store.dirty) return;
  e.preventDefault();
});

void load();
