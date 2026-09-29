import type { ScoutArena, ScoutEntry, ScoutHazard } from "@neon-spore/sim";
import { button, el } from "./dom.js";
import { scoutArenaFault, scoutGrid } from "./scout-editor-grid.js";

/**
 * THE SCOUT's levels, painted on the arena they are flown in — the owner's
 * *I would like to create my own in director*, 29 September 2026.
 *
 * The third boss the director edits rather than documents, for PINBALL's
 * reason: where a mote hangs and which row a hazard sweeps **is** the level,
 * and none of that reads as rows of `{ colMilli, rowMilli }`.
 *
 * **One gesture, as on PINBALL's board.** A press walks a cell through
 * nothing, mote, hazard going right, hazard going left, nothing again. A
 * hazard's speed is the one number a press cannot say, so each has a line
 * under the grid with − and +.
 *
 * The arena itself — the cells, what a press does to one, and what makes a
 * level unwinnable — is `scout-editor-grid.ts`.
 */

/** Which level is being painted, kept across the re-render every press causes. */
const SHOWN: WeakMap<ScoutEntry, number> = new WeakMap();

export function renderScoutEditor(panel: HTMLElement, boss: ScoutEntry, onEdit: () => void): void {
  const at = Math.min(SHOWN.get(boss) ?? 0, boss.arenas.length - 1);
  const arena = boss.arenas[at];
  if (arena === undefined) return;
  const redraw = (): void => {
    SHOWN.set(boss, at);
    onEdit();
  };
  panel.appendChild(
    el(
      "p",
      "note",
      "The little ship fetches every mote, one at a time, and brings each home " +
        "to be sucked in. Press a cell to walk it through empty, mote, hazard " +
        "going right, hazard going left. Hazards turn round at the walls.",
    ),
  );
  // The bar is handed `onEdit` rather than `redraw`: a redraw writes the
  // level it was drawn on back into `SHOWN`, over the one a tab just chose.
  panel.appendChild(tabs(boss, at, onEdit));
  panel.appendChild(scoutGrid(arena, redraw));
  arena.hazards.forEach((h, i) => {
    panel.appendChild(speed(arena, h, i, redraw));
  });
  panel.appendChild(clock(arena, redraw));
  const fault = scoutArenaFault(arena);
  if (fault !== null) panel.appendChild(el("p", "note fleet-fault", `not a level yet: ${fault}`));
}

/** One button per level, and the two that add and remove one. */
function tabs(boss: ScoutEntry, at: number, onEdit: () => void): HTMLElement {
  const row = el("div", "pin-tabs");
  boss.arenas.forEach((_, i) => {
    const tab = button(`LEVEL ${i + 1}`, i === at ? "pin-tab on" : "pin-tab");
    tab.addEventListener("click", () => {
      SHOWN.set(boss, i);
      onEdit();
    });
    row.appendChild(tab);
  });
  const add = button("+", "pin-tab");
  add.addEventListener("click", () => {
    // A copy of the one before, as PINBALL's `+` does: a level is edited out
    // of a level, and an empty one is a fault before it is anything else.
    const last = boss.arenas[boss.arenas.length - 1];
    boss.arenas.push({
      beats: last?.beats ?? 24,
      motes: (last?.motes ?? []).map((m) => ({ ...m })),
      hazards: (last?.hazards ?? []).map((h) => ({ ...h })),
    });
    SHOWN.set(boss, boss.arenas.length - 1);
    onEdit();
  });
  row.appendChild(add);
  const drop = button("REMOVE", "pin-tab");
  drop.disabled = boss.arenas.length <= 1;
  drop.addEventListener("click", () => {
    boss.arenas.splice(at, 1);
    SHOWN.set(boss, Math.max(0, Math.min(at, boss.arenas.length - 1)));
    onEdit();
  });
  row.appendChild(drop);
  return row;
}

/** A hazard's speed, in tenths of a tile a beat with − and +. */
function speed(arena: ScoutArena, h: ScoutHazard, i: number, redraw: () => void): HTMLElement {
  const row = el("div", "pin-clock");
  const size = Math.hypot(h.vColMilli, h.vRowMilli);
  row.appendChild(el("span", "note", `hazard ${i + 1}: ${(size / 1000).toFixed(1)} tiles a beat`));
  for (const [label, by] of [
    ["−", -200],
    ["+", 200],
  ] as const) {
    const step = button(label, "fleet-len");
    step.addEventListener("click", () => {
      const next = Math.max(200, Math.min(8_000, size + by));
      const k = size === 0 ? 0 : next / size;
      const [vCol, vRow] = size === 0 ? [next, 0] : [h.vColMilli * k, h.vRowMilli * k];
      arena.hazards = arena.hazards.map((o) =>
        o === h ? { ...o, vColMilli: Math.round(vCol), vRowMilli: Math.round(vRow) } : o,
      );
      redraw();
    });
    row.appendChild(step);
  }
  return row;
}

/** How long this level lasts, in beats. */
function clock(arena: ScoutArena, redraw: () => void): HTMLElement {
  const row = el("div", "pin-clock");
  row.appendChild(el("span", "note", `${arena.beats} beats`));
  for (const [label, by] of [
    ["−4", -4],
    ["+4", 4],
  ] as const) {
    const step = button(label, "fleet-len");
    step.addEventListener("click", () => {
      arena.beats = Math.max(8, Math.min(400, arena.beats + by));
      redraw();
    });
    row.appendChild(step);
  }
  return row;
}
