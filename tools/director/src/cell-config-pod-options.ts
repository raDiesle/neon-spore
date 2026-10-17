import type { Color, PodEntry } from "@neon-spore/sim";

type Chip = (text: string, on: boolean, press: () => void) => HTMLElement;

/**
 * The rows that make a pod harder to take (`sim/pod-options.ts`): which shot
 * frees it, how many presses take it, whether it swings, whose screen its
 * clock is on, whether it lets go by itself, and — on a husk — which seat it
 * fools. Each is absent in the wave
 * file until an author sets it, so a wave nobody touched is the wave it was.
 *
 * Next door to `cell-config-pod.ts` rather than in it because that file was at
 * its limit, and these are one family — the SUCK page's options of 16
 * October 2026 — where the rows there are where a pod is and when.
 */
export function podOptionRows(
  pod: PodEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
  chip: Chip,
): HTMLElement[] {
  return [
    shotRow(pod, onEdit, labelled, chip),
    weightRow(pod, onEdit, labelled, chip),
    hangRow(pod, onEdit, labelled, chip),
    clockRow(pod, onEdit, labelled, chip),
    dropRow(pod, onEdit, labelled, chip),
    // Only a hollow pod fools anyone, so only a hollow pod asks whom.
    ...(pod.kind === "husk" ? [fooledRow(pod, onEdit, labelled, chip)] : []),
  ];
}

/** Any shot frees it, or only one colour does (`PodEntry.tint`). */
function shotRow(
  pod: PodEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
  chip: Chip,
): HTMLElement {
  const row = labelled("FREED BY");
  const tints: (Color | undefined)[] = [undefined, "red", "cyan"];
  for (const tint of tints) {
    row.appendChild(
      chip(tint === undefined ? "ANY" : tint.toUpperCase(), pod.tint === tint, () => {
        if (tint === undefined) delete pod.tint;
        else pod.tint = tint;
        onEdit();
      }),
    );
  }
  return row;
}

/** One press, or two (`PodEntry.heavy`). */
function weightRow(
  pod: PodEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
  chip: Chip,
): HTMLElement {
  const row = labelled("PRESSES");
  for (const heavy of [false, true]) {
    row.appendChild(
      chip(heavy ? "TWO" : "ONE", (pod.heavy ?? false) === heavy, () => {
        if (heavy) pod.heavy = true;
        else delete pod.heavy;
        onEdit();
      }),
    );
  }
  return row;
}

/** Hangs still, or swings a column either side (`PodEntry.swing`). */
function hangRow(
  pod: PodEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
  chip: Chip,
): HTMLElement {
  const row = labelled("HANGS");
  for (const swing of [false, true]) {
    row.appendChild(
      chip(swing ? "SWINGS" : "STILL", (pod.swing ?? false) === swing, () => {
        if (swing) pod.swing = true;
        else delete pod.swing;
        onEdit();
      }),
    );
  }
  return row;
}

/** Its clock on both screens, or on player 1's alone (`PodEntry.clockP1`). */
function clockRow(
  pod: PodEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
  chip: Chip,
): HTMLElement {
  const row = labelled("CLOCK ON");
  for (const p1 of [false, true]) {
    row.appendChild(
      chip(p1 ? "P1 ONLY" : "BOTH", (pod.clockP1 ?? false) === p1, () => {
        if (p1) pod.clockP1 = true;
        else delete pod.clockP1;
        onEdit();
      }),
    );
  }
  return row;
}

/** Beats after it appears that it lets go by itself, or never (`PodEntry.drop`). */
function dropRow(
  pod: PodEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
  chip: Chip,
): HTMLElement {
  const row = labelled("DROPS");
  const beats: (number | undefined)[] = [undefined, 4, 6, 8, 12];
  for (const drop of beats) {
    row.appendChild(
      chip(drop === undefined ? "NEVER" : `AFTER ${drop}`, pod.drop === drop, () => {
        if (drop === undefined) delete pod.drop;
        else pod.drop = drop;
        onEdit();
      }),
    );
  }
  return row;
}

/**
 * Which seat a husk fools (`PodEntry.truthP1`): player 1 by default, as THE
 * HUSK was made, with the red twin and the frame on player 2's screen; or
 * player 2, with the truth on player 1's.
 */
function fooledRow(
  pod: PodEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
  chip: Chip,
): HTMLElement {
  const row = labelled("FOOLS");
  for (const p1Sees of [false, true]) {
    row.appendChild(
      chip(p1Sees ? "P2" : "P1", (pod.truthP1 ?? false) === p1Sees, () => {
        if (p1Sees) pod.truthP1 = true;
        else delete pod.truthP1;
        onEdit();
      }),
    );
  }
  return row;
}
