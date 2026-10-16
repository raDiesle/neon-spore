import { unlink } from "node:fs/promises";
import type { Wave } from "@neon-spore/content";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";
import { type ActFile, beside, nameOf } from "./waves-act-files.js";
import { type ActName, type ArcEnd, idsInAct } from "./waves-act-list.js";
import { recutActs } from "./waves-recut.js";

/**
 * The files side of a re-cut (`waves-recut.ts`): which acts the tutorial arc
 * keeps, and every act after them written again and the emptied ones deleted.
 */

/** How many of `acts` the arc keeps: up to and with the one holding its last wave. */
export function arcActs(sources: readonly string[], acts: readonly ActFile[]): number {
  const at = acts.findIndex((a, i) =>
    idsInAct(sources[i] ?? "", a.exportName).includes(TUTORIAL_LAST_ID),
  );
  return at === -1 ? acts.length : at + 1;
}

/** The number the first act after `last` takes: `act-2` → 3. */
export function numberAfter(last: ActFile): number {
  return Number(/^act-(\d+)/.exec(nameOf(last))?.[1] ?? 0) + 1;
}

/** How many of `waves` are the arc's: up to and with its last. */
export function arcLength(waves: readonly Wave[]): number {
  return waves.findIndex((w) => w.id === TUTORIAL_LAST_ID) + 1;
}

/** Where the arc ends in `waves` and in `acts` (`ArcEnd`), or `undefined`
 * when either has no arc's last wave, or no act comes after the arc's. */
export function arcEndOf(
  waves: readonly Wave[],
  sources: readonly string[],
  acts: readonly ActFile[],
): ArcEnd | undefined {
  const inActs = arcActs(sources, acts);
  const inWaves = arcLength(waves);
  return inWaves > 0 && inActs < acts.length ? { waves: inWaves, acts: inActs } : undefined;
}

/**
 * The waves from `arc` on written as acts numbered after the last of `all`
 * the arc keeps, onto `into`; every act after the kept ones that no piece
 * took is deleted, and its path returned.
 */
export async function recutAfter(
  waves: readonly Wave[],
  arc: number,
  all: readonly ActFile[],
  keep: number,
  known: ReadonlyMap<string, string>,
  into: { written: ActFile[]; order: ActName[] },
): Promise<string[]> {
  const last = all[keep - 1];
  if (keep === all.length || !last) return [];
  for (const piece of recutActs(waves, arc, numberAfter(last), known)) {
    const file = beside(last, piece.act);
    await Bun.write(file.file, piece.text);
    into.written.push(file);
    into.order.push(piece.act);
  }
  const removed: string[] = [];
  for (const act of all.slice(keep)) {
    if (into.written.some((w) => w.rel === act.rel)) continue;
    await unlink(act.file);
    removed.push(act.rel);
  }
  return removed;
}
