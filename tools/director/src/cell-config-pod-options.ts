import type { Color, PodEntry } from "@neon-spore/sim";

type Chip = (text: string, on: boolean, press: () => void) => HTMLElement;

/**
 * The three rows that make a pod harder to take (`sim/pod-options.ts`): which
 * shot frees it, how many presses take it, and whether it swings. Each is
 * absent in the wave file until an author sets it, so a wave nobody touched
 * is the wave it was.
 *
 * Next door to `cell-config-pod.ts` rather than in it because that file was at
 * its limit, and these three are one family — the SUCK page's options of 16
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
