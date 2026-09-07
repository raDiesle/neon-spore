import type { PodEntry, SimConfig } from "@neon-spore/sim";
import { crossLabel } from "./cell-config-rows.js";

/**
 * The rows under the selected cell that configure the **pod** in it: the row it
 * hangs at, which way it crosses the field, and how fast it goes when it does.
 *
 * **These used to be a list under the map.** Every pod on the wave had a line
 * of its own below the grid, with its coordinates written out in words and
 * three fields on the end of them — so a pod was the one thing in this editor
 * you configured by finding it in a list rather than by pointing at it, and the
 * fields for it were the one set that lived on the opposite side of the map
 * from every other field. The owner asked for all of it in one place, above the
 * map, and this is that: click the cell, and what is in it says what it is.
 *
 * The three questions are the pod's own and they are asked in the vocabulary a
 * rock's route already uses — `crossLabel` is called rather than restated, so
 * "◀ CROSSES" means the same thing in both rows and an author who has learnt
 * one has learnt the other (`cell-config-rows.ts`).
 *
 * Its own file rather than more of `cell-config.ts` next door because the two
 * answer questions about different things: that one is what an *arrival* is,
 * and a pod is not an arrival — it is never cleared, it never blocks the end of
 * a wave, and it is carried in a list of its own on the wave.
 */
export interface PodConfigOptions {
  pod: PodEntry;
  cfg: SimConfig;
  /** The pod changed: mark the wave dirty and redraw everything. */
  onEdit(): void;
  /** `labelled` from `cell-config-rows.ts`, handed in rather than imported
   * twice, so every row under the map is built by one function. */
  labelled(label: string): HTMLElement;
}

export function podConfig({ pod, cfg, onEdit, labelled }: PodConfigOptions): HTMLElement {
  const box = document.createElement("div");
  box.className = "cell-config";
  box.append(rowRow(pod, cfg, onEdit, labelled), crossRow(pod, onEdit, labelled));
  // How fast it crosses says nothing at all about a pod that hangs, so it is
  // not drawn on one — `cell-config.ts`'s rule for a row whose question the
  // thing does not answer, and the reason a greyed-out speed would be worse
  // than no speed: it would read as a speed the pod happens to be at.
  if (pod.cross !== undefined) box.append(speedRow(pod, cfg, onEdit, labelled));
  return box;
}

/**
 * The row it hangs at — the one pod coordinate the map cannot show, because
 * the map's vertical axis is time and this is a place in the field.
 *
 * Chips rather than the number box it used to be, for the reason the whole
 * panel is chips: a row is one of a dozen values and the author is choosing
 * between them, not typing one in — and a number box refuses what it does not
 * like silently, while a chip that is not there was never offered.
 */
function rowRow(
  pod: PodEntry,
  cfg: SimConfig,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
): HTMLElement {
  const row = labelled("ROW");
  // Never the hull row and never the top one: a pod hangs *in* the field.
  for (let r = 1; r <= cfg.rows - 2; r++) {
    row.appendChild(
      chip(String(r), pod.row === r, () => {
        pod.row = r;
        onEdit();
      }),
    );
  }
  return row;
}

/**
 * Which way it crosses the field, or nothing at all.
 *
 * Three states rather than a switch and a direction, because the middle one is
 * not "crossing, neither way" — it is a pod that **hangs**, which is what every
 * pod in the game was before THE CLAW and is still the default. Absent rather
 * than `0` in the wave file, so a wave nobody has touched is byte-for-byte the
 * wave it was (`PodEntry.cross`).
 */
function crossRow(
  pod: PodEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
): HTMLElement {
  const row = labelled("ROUTE");
  for (const cross of [null, -1, 1] as const) {
    // A pod that hangs is the one label these two rows do not share: a rock
    // that is not crossing falls, and a pod that is not crossing stays where it
    // was left.
    const label = cross === null ? "HANGS" : crossLabel(cross);
    row.appendChild(
      chip(label, (pod.cross ?? null) === cross, () => {
        if (cross === null) pod.cross = undefined;
        else pod.cross = cross;
        onEdit();
      }),
    );
  }
  return row;
}

/** How fast it crosses, in tiles per beat. The shipped default is offered as a
 * chip of its own rather than as an empty box, so the number the field will
 * actually use is on screen whether or not anybody chose it. */
function speedRow(
  pod: PodEntry,
  cfg: SimConfig,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
): HTMLElement {
  const row = labelled("SPEED");
  const shipped = cfg.podCrossTilesPerBeat;
  // The shipped number is folded into the list rather than sitting beside it,
  // so a tuning that moves it does not leave two chips meaning one speed. The
  // star is which one the wave file will say nothing about.
  const speeds = [...new Set([shipped, 1, 2, 3, 4, 6])].sort((a, b) => a - b);
  for (const speed of speeds) {
    row.appendChild(
      chip(speed === shipped ? `×${speed}*` : `×${speed}`, (pod.speed ?? shipped) === speed, () => {
        // The shipped speed is written as *no* field, so a pod nobody hurried
        // serialises exactly as it always did.
        pod.speed = speed === shipped ? undefined : speed;
        onEdit();
      }),
    );
  }
  return row;
}

function chip(text: string, on: boolean, press: () => void): HTMLElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = on ? "chip on" : "chip";
  button.textContent = text;
  button.addEventListener("click", press);
  return button;
}
