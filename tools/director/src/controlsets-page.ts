import {
  CONTROL_SETS,
  type ControlDef,
  type ControlSet,
  controlSet,
  heldBack,
  setControls,
  WAVES,
  wavesUsingSet,
} from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  startWave,
  type World,
} from "@neon-spore/sim";
import { renderFieldControls } from "./field-controls-page.js";
import { frameWorld } from "./pose-art.js";
import { bindTabs } from "./tabs.js";
import { renderTriedControls } from "./tried-controls-page.js";

/**
 * CONTROLS: every registered panel, drawn, plus the things the pair touches
 * on the field itself. A tab of GAME MECHANICS (`states-page.ts` owns the
 * sheet itself) rather than a sheet of its own, to save a topbar button.
 *
 * Renamed from CONTROL SETS, which only ever covered the strip below the
 * field. The owner named the gap: `packages/render/src/touch.ts` answers a
 * finger on THE MAZE's string, THE WARDEN's tether or a falling creature the
 * same way it answers a press on a lobe, and none of those three has a name,
 * a page or a test — each was built by whichever lane needed it. Three inner
 * tabs, one for each half of that sentence and one for what was played this
 * way before: PANELS (this file's original card-per-set body), ON THE FIELD
 * and TRIED AND SET ASIDE — built by `field-controls-page.ts` and
 * `tried-controls-page.ts`, split
 * out on line count. `docs/spec/controls.md` is the same list in prose, for
 * a reader who is not looking at this page.
 *
 * The wave editor's own picker (`rail.ts`) says a set by name, and a name in
 * a dropdown does not say what the pair will have in their hands — PANELS is
 * what makes the picker mean anything. One card per entry in `CONTROL_SETS`:
 * what it is for, the panel itself as `band.ts` would draw it, each control
 * in it in one line, and which waves are played on it.
 *
 * Built like `states-page.ts`: a real frame of the shipping renderer against
 * a real `World`, not a description of one. The world is posed on whichever
 * wave `wavesUsingSet` names for the set — `control-sets.ts`'s own invariant
 * (`test/control-sets.test.ts`) guarantees there is always at least one, the
 * same way a set no wave reaches would be a panel nobody could ever see.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
/** Wide enough to read both seats' labels side by side, no wider than a card. */
const PANEL_WIDTH = 340;

/**
 * A world posed on a wave that plays `set` — `drawBand` (`band.ts`) reads
 * `controlSetForWave(world.wave)`, which reads the wave *index*, so a pose
 * for this page has to be a real wave rather than the set handed straight to
 * the renderer. This is the catalogue's own reference wave, not the wave the
 * director happens to be editing — see the caution on this lane: the editor's
 * unsaved draft is not what this page is for.
 */
export function setWorld(set: ControlSet): World {
  const index = WAVES.findIndex((w) => controlSet(w.controls).id === set.id);
  const world = createWorld({ ...CFG }, 11);
  startWave(world, Math.max(0, index), [], [], null);
  return world;
}

function controlRow(c: ControlDef): HTMLElement {
  const li = document.createElement("li");
  const label = document.createElement("b");
  label.textContent = c.label;
  li.append(label, document.createTextNode(` — ${c.does}`));
  return li;
}

function seatColumn(set: ControlSet, player: 1 | 2): HTMLElement {
  const col = document.createElement("div");
  col.className = "control-set-col";
  const h = document.createElement("h3");
  h.textContent = player === 1 ? "PLAYER 1" : "PLAYER 2";
  col.appendChild(h);
  const ul = document.createElement("ul");
  for (const c of setControls(set, player)) ul.appendChild(controlRow(c));
  col.appendChild(ul);
  return col;
}

/**
 * What a rung of the standard ladder is *less than*, and by exactly which
 * buttons. Nothing at all for a panel that reduces nothing, which is most of
 * them: a line saying "reduces nothing" is furniture.
 *
 * It sits above the two seat columns rather than under them because it is the
 * first thing to know about such a card — the columns below list what the pair
 * has, and this says what the same panel would have had.
 */
function reductionNote(set: ControlSet): HTMLElement | null {
  const off = heldBack(set);
  if (off.length === 0) return null;
  const p = document.createElement("p");
  p.className = "reduces";
  const base = document.createElement("b");
  base.textContent = controlSet(set.reduces).name;
  p.append(base, document.createTextNode(` with ${off.map((c) => c.label).join(", ")} held back`));
  return p;
}

function waveList(set: ControlSet): HTMLElement {
  const p = document.createElement("p");
  p.className = "note";
  const names = wavesUsingSet(set.id);
  p.textContent = `WAVES ON THIS PANEL — ${names.length > 0 ? names.join(", ") : "none yet"}`;
  return p;
}

function setCard(set: ControlSet): HTMLElement {
  const card = document.createElement("section");
  card.className = "control-set-card";

  const h2 = document.createElement("h2");
  h2.textContent = set.name;
  card.appendChild(h2);

  const why = document.createElement("p");
  why.className = "note";
  why.textContent = set.why;
  card.appendChild(why);

  const shot = document.createElement("div");
  shot.className = "control-set-shot";
  shot.appendChild(frameWorld(setWorld(set), "test", "band", PANEL_WIDTH).canvas);
  card.appendChild(shot);

  const reduces = reductionNote(set);
  if (reduces) card.appendChild(reduces);

  const cols = document.createElement("div");
  cols.className = "control-set-cols";
  cols.append(seatColumn(set, 1), seatColumn(set, 2));
  card.appendChild(cols);

  card.appendChild(waveList(set));
  return card;
}

let drawn = false;

/** Every registered set, once. Built on first sight of the tab and kept. */
export function renderControlSets(): void {
  if (drawn) return;
  const body = document.getElementById("controlSetsBody");
  if (!body) return;
  drawn = true;
  body.replaceChildren();
  for (const set of CONTROL_SETS) body.appendChild(setCard(set));
  renderFieldControls();
  renderTriedControls();
}

/**
 * Lazy like `backlog-page.ts`'s SHAPES tab: a card per set poses a world and
 * draws a canvas, so a session that never opens this tab should not pay for
 * it. `renderControlSets`'s own `drawn` flag makes a second click free, and a
 * restore straight to this tab (`?sheet=states&inner=controlsets`) fires the
 * same click `mountSheet` already drives for every inner tab.
 *
 * The three inner tabs (PANELS/ON THE FIELD/TRIED AND SET ASIDE) are wired
 * here too, with the same `bindTabs` every other nested bar in this director
 * uses (`sound-page.ts`, `states-page.ts`, `backlog-page.ts`) — a different
 * selector from theirs, so a click here cannot touch their own restored tab.
 */
export function bindControlSetsTab(): void {
  document
    .querySelector<HTMLButtonElement>('#statesTabs button[data-tab="controlsets"]')
    ?.addEventListener("click", renderControlSets);
  bindTabs("#controlsInnerTabs", "ctlpage", "ctl-");
}
