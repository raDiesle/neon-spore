import {
  type Color,
  type Creature,
  fenceCrackCols,
  fenceGapCols,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE FENCE, on AUTO**: a wall the width of the field that goes over the
 * ship, answered by where the shield stands when it lands (`fence.ts`).
 *
 * A fence breaks the hull unless the dome stands in a column it is open in.
 * AUTO has both screens, so it sees the gaps the wave authored. Player 2
 * carries the shield to the open column nearest it. A fence with no gap has
 * cracks instead (`fence-crack.ts`), each wanting a bolt of its own colour, so
 * player 1 stands the cannon under the first crack and player 2 fires that
 * colour. The column it opens is a gap like any other, and the shield goes
 * there next.
 */

type Press = Omit<TimedCommand, "tick">;

/** The fence nearest the hull, if any. */
function lowestFence(w: World): Creature | undefined {
  let best: Creature | undefined;
  for (const c of w.creatures) {
    if (c.kind === "fence" && (best === undefined || c.row > best.row)) best = c;
  }
  return best;
}

/** The open column of the lowest fence nearest the shield, or `null` when
 * there is no fence or it is shut all the way across. */
export function fenceGap(w: World): { col: number; row: number } | null {
  const fence = lowestFence(w);
  if (fence === undefined) return null;
  let best: number | null = null;
  for (const col of fenceGapCols(w.cfg, fence)) {
    if (best === null || Math.abs(col - w.shieldCol) < Math.abs(best - w.shieldCol)) best = col;
  }
  return best === null ? null : { col: best, row: fence.row };
}

/** The crack the cannon burns through a fence with no way through yet, or
 * `null` when there is nothing to burn. */
export function fenceCrack(w: World): { col: number; color: Color } | null {
  const fence = lowestFence(w);
  if (fence === undefined || fenceGapCols(w.cfg, fence).length > 0) return null;
  return fenceCrackCols(w.cfg, fence)[0] ?? null;
}

/** The cannon's presses at a fence's crack, or `null` when there is none. */
export function burnFence(w: World, free: boolean): Press[] | null {
  const crack = fenceCrack(w);
  if (crack === null) return null;
  if (w.cannonCol !== crack.col)
    return [{ player: 1, command: { kind: "cannonCol", col: crack.col } }];
  return free ? [{ player: 2, command: { kind: "fire", color: crack.color } }] : [];
}
