import {
  type Creature,
  faultOn,
  malfunctionColor,
  occupiesCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import { aimColumn, cannonAnswers } from "./autopilot-aim.js";

/**
 * **THE JAM, on AUTO**: a cannon that fires by itself on the beat, alternating
 * its colours, with player 2's trigger taken away (`malfunction.ts`).
 *
 * The only thing left to the pair is where the cannon stands when it goes off,
 * so player 1 reads the colour the next beat has loaded and stands under the
 * lowest body wearing it. With nothing of that colour on the field the cannon
 * waits in the nearest column nothing stands in, since a runaway shot into a
 * lure breaches the hull like any other (`lure-exit.ts`).
 */

type Press = Omit<TimedCommand, "tick">;

/** The body nearest the hull `take` accepts. */
function lowest(w: World, take: (c: Creature) => boolean): Creature | undefined {
  let best: Creature | undefined;
  for (const c of w.creatures) {
    if (take(c) && (best === undefined || c.row > best.row)) best = c;
  }
  return best;
}

/** The empty column nearest the cannon, or where it stands when none is. */
function emptyCol(w: World): number {
  let best = w.cannonCol;
  let far = Number.POSITIVE_INFINITY;
  for (let col = 0; col < w.cfg.cols; col++) {
    if (w.creatures.some((c) => occupiesCol(c, col))) continue;
    const d = Math.abs(col - w.cannonCol);
    if (d < far) [best, far] = [col, d];
  }
  return best;
}

/** Player 1's presses under a runaway cannon, or `null` when none is in force. */
export function steerRunaway(w: World): Press[] | null {
  const m = faultOn(w, "cannon");
  if (m === null) return null;
  // The fault reads the beat `onBeat` is about to count, so the colour it
  // fires next is the one it would have loaded a beat on from here.
  const next = malfunctionColor({ ...w, waveBeat: w.waveBeat + 1 }, m);
  const body = lowest(w, (c) => cannonAnswers(c) && c.color === next);
  const col = body ? aimColumn(body) : emptyCol(w);
  return w.cannonCol === col ? [] : [{ player: 1, command: { kind: "cannonCol", col } }];
}
