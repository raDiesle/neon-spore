import {
  CONTROL_SETS,
  type ControlDef,
  type ControlSet,
  controlSet,
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
import { frameWorld } from "./pose-art.js";
import { mountSheet } from "./session.js";

/**
 * THE CONTROL SETS: every registered panel, drawn.
 *
 * The wave editor's own picker (`rail.ts`) says a set by name, and a name in
 * a dropdown does not say what the pair will have in their hands — this page
 * is what makes the picker mean anything. One card per entry in
 * `CONTROL_SETS`: what it is for, the panel itself as `band.ts` would draw
 * it, each control in it in one line, and which waves are played on it.
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

  const cols = document.createElement("div");
  cols.className = "control-set-cols";
  cols.append(seatColumn(set, 1), seatColumn(set, 2));
  card.appendChild(cols);

  card.appendChild(waveList(set));
  return card;
}

let drawn = false;

/** Every registered set, once. Built on first open and kept, like the STATES sheet. */
export function renderControlSets(): void {
  if (drawn) return;
  const body = document.getElementById("controlSetsBody");
  if (!body) return;
  drawn = true;
  body.replaceChildren();
  for (const set of CONTROL_SETS) body.appendChild(setCard(set));
}

export function bindControlSetsPage(): void {
  const sheet = document.getElementById("controlSets");
  const open = document.getElementById("controlSetsOpen");
  const close = document.getElementById("controlSetsClose");
  if (!sheet || !open || !close) return;

  mountSheet({ name: "controlSets", sheet, open, close, onOpen: renderControlSets });
}
