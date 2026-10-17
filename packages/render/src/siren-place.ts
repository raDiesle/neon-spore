import type { World } from "@neon-spore/sim";
import { bossSirenRight } from "./comms-boss.js";
import type { Layout } from "./layout.js";
import type { SeatNames } from "./seat-name.js";
import { BAR_HALF_W } from "./siren-lightbar.js";
import { PILL_H, pillWidth, SIREN_PAD, seatChip } from "./siren-seats.js";

/**
 * Where the siren stands on a screen, and where a finger lands on it — the
 * numbers `siren.ts` draws at and `apps/game` hit-tests against, in one place
 * so the two cannot drift apart. Its own file since 17 October 2026, when the
 * tap that hides the bar pushed `siren.ts` past its ceiling.
 */

/** Clear of the run's line, which ends at y = 23. */
const TOP = 24;
/** From that line to the bar's middle: half a chip and its ring's reach, and
 * enough more that a chip clears the P1 · P2 · TEST switch a device playing
 * alone keeps over the top middle (`apps/game/src/game.css`, `#viewSwitch`,
 * which ends at about 29). */
const MID_DROP = PILL_H / 2 + 8;
/** Between a chip and the bar. */
export const GAP = 4;

/** How far under the chips the duty word's middle sits. */
export const DUTY_DROP = 8;
/** Half the duty word's own height, which is what hangs under its middle. */
const DUTY_HALF = 4;

/** How far round the bar a tap still lands on it: a fingertip, not a pixel. */
const HIT_X = 10;
const HIT_Y = 8;

/**
 * Where the bar's middle is on this screen. Exported for the director's
 * WORDINGS page, which points a label at it — from these numbers rather than
 * a copy of them, so the label follows the bar if it ever moves.
 *
 * The bar is the middle of the screen, whatever the names measure: a chip
 * grows outward from it on its own side.
 */
export function sirenCentre(l: Layout, _names?: SeatNames): { x: number; y: number } {
  return { x: l.width / 2, y: TOP + MID_DROP };
}

/**
 * **Pinned right rather than centred, for a boss whose own picture holds the
 * top middle** — THE FLUE's, whose sight, studs and middle tendon stand on
 * the column the bar would cover (the owner, 6 October 2026: *show siren top
 * right*). The same row, so nothing stacked under it moves; the cluster's
 * right end held off the ☰ by `SIREN_PAD`, and never left of the middle, which
 * is where long names would push it.
 */
function sirenRightX(l: Layout, names?: SeatNames): number {
  const right = BAR_HALF_W + GAP + pillWidth(seatChip("p2", names));
  return Math.max(l.width / 2, l.width - SIREN_PAD - right);
}

/** The lowest row the cluster claims whenever it is drawn, call or none. */
export function sirenBottom(l: Layout): number {
  // The word is drawn on its middle, so half of it hangs under its baseline.
  return sirenCentre(l).y + PILL_H / 2 + DUTY_DROP + DUTY_HALF;
}

/** The bar's middle across on this screen: pinned right for a boss that holds
 * the top middle, the middle of the screen otherwise. */
export function barX(l: Layout, world: World, names?: SeatNames): number {
  return bossSirenRight(world) ? sirenRightX(l, names) : sirenCentre(l).x;
}

/**
 * Whether a press at (x, y) is on the bar — the tap that hides it, and the tap
 * on the same place that brings it back. The bar's own box and a fingertip
 * round it; the chips and the word are not part of it, because a press on a
 * name is a press somebody meant for the field under it.
 */
export function sirenHit(
  l: Layout,
  world: World,
  x: number,
  y: number,
  names?: SeatNames,
): boolean {
  const cx = barX(l, world, names);
  const cy = sirenCentre(l).y;
  return Math.abs(x - cx) <= BAR_HALF_W + HIT_X && Math.abs(y - cy) <= PILL_H / 2 + HIT_Y;
}
