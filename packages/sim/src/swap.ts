import { faultStep } from "./fault-clock.js";
import { faultCovers, type PlacedFault, TO_THE_END } from "./fault-placed.js";
import type { World } from "./world.js";

/**
 * **THE SWAP: THE HANDOVER, over and over.**
 *
 * The owner, 19 October 2026: a new brush that is the handover, *much more
 * frequent*, with a warning about three seconds before every change. THE
 * HANDOVER trades the two panels once per placement and gives them back; one
 * placement of THE SWAP trades them on its first beat and then again every
 * `swapEveryBeats`, back and forth, until it ends — and if they are away when
 * it ends, they come home on that beat, which is a change like any other and
 * is warned like one.
 *
 * **It is THE HANDOVER's arrangement exactly, and nothing else.** No state,
 * nothing hashed beyond the placement the world already holds, no command
 * swallowed: whose screen a panel is on is a fact render/ and a host read off
 * the beat (`handover.ts`'s header says why), and `handedOver` asks this file
 * as well as its own fault. So everything that follows a trade — the band's
 * colours, the hit test, the trade and return sounds — follows this one too.
 *
 * What this file adds is the two questions a *frequent* trade needs answered
 * that a single window never did: **how far is the next change**, wherever it
 * comes from, and **how long ago was the last one**, so a picture can let one
 * form turn into the other across the beat after it.
 */

/** Beats between two changes, never below two — a panel that changed hands
 * every beat would be a strobe, not a seat. */
function every(world: World): number {
  return Math.max(2, Math.round(world.cfg.swapEveryBeats));
}

/** Where a placement ends, in steps of the wave; no end is infinity. */
function endOf(f: PlacedFault): number {
  return f.beats === TO_THE_END ? Number.POSITIVE_INFINITY : f.at + f.beats;
}

/** Whether this placement has the panels away on a step it covers. */
function awayAt(world: World, f: PlacedFault, step: number): boolean {
  return faultCovers(f, step) && Math.floor((step - f.at) / every(world)) % 2 === 0;
}

/** The first step after `step` on which this placement changes hands, or infinity. */
function nextChange(world: World, f: PlacedFault, step: number): number {
  if (step < f.at) return f.at;
  const end = endOf(f);
  if (step >= end) return Number.POSITIVE_INFINITY;
  const e = every(world);
  const boundary = f.at + (Math.floor((step - f.at) / e) + 1) * e;
  if (boundary < end) return boundary;
  return awayAt(world, f, step) ? end : Number.POSITIVE_INFINITY;
}

/** The last step at or before `step` on which this placement changed hands, or −infinity. */
function lastChange(world: World, f: PlacedFault, step: number): number {
  if (step < f.at) return Number.NEGATIVE_INFINITY;
  const end = endOf(f);
  if (step >= end) {
    // Home on the end beat only if they were away on the beat before it.
    return awayAt(world, f, end - 1)
      ? end
      : f.at + Math.floor((end - 1 - f.at) / every(world)) * every(world);
  }
  const e = every(world);
  return f.at + Math.floor((step - f.at) / e) * e;
}

function swaps(world: World): PlacedFault[] {
  return world.faults.filter((f) => f.kind === "swap");
}

/** Whether this wave places THE SWAP at all, now or later. */
export function swapInWave(world: World): boolean {
  return swaps(world).length > 0;
}

/** Whether THE SWAP has the panels traded **right now**. Read by `handedOver`
 * and by nobody else: a reader that wants to know whose panel it is asks that. */
export function swapTraded(world: World): boolean {
  const step = faultStep(world);
  return swaps(world).some((f) => awayAt(world, f, step));
}

/** Beats until the panels next change hands, or 0 when no change is coming. */
export function swapChangeIn(world: World): number {
  const step = faultStep(world);
  let soonest = Number.POSITIVE_INFINITY;
  for (const f of swaps(world)) soonest = Math.min(soonest, nextChange(world, f, step));
  return Number.isFinite(soonest) ? soonest - step : 0;
}

/**
 * Beats until the change while the warning is running, and 0 outside it —
 * `handoverWarning`'s answer for this fault, and the one number every look and
 * the siren are counted in, so no two of them can disagree about the beat it
 * starts on (`test/copies-table.ts`).
 */
export function swapWarning(world: World): number {
  const away = swapChangeIn(world);
  return away > 0 && away <= Math.max(1, Math.round(world.cfg.swapWarnBeats)) ? away : 0;
}

/**
 * Beats since the panels last changed hands — 0 on the beat they did — or −1
 * when they have not changed in this wave. A picture of one form becoming the
 * other runs across the beat this is 0 on.
 */
export function swapChangedAgo(world: World): number {
  const step = faultStep(world);
  let latest = Number.NEGATIVE_INFINITY;
  for (const f of swaps(world)) latest = Math.max(latest, lastChange(world, f, step));
  return Number.isFinite(latest) && latest <= step ? step - latest : -1;
}
