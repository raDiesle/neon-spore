import {
  type Creature,
  hullRow,
  mawOpen,
  moultIsPod,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE MOULT, on AUTO**: a body that is a rock and a cargo by turns, answered
 * as whichever it is when it lands (`moult.ts`).
 *
 * The shield's half needs nothing new: the field hand carries the dome under a
 * moult as it does under a rock and triggers it as the body comes onto the
 * dome's row, and a dome raised under a cargo does nothing. This is the
 * cannon's half. Over the last stretch of the fall the moult steers into the
 * cannon's column, so player 1 stands the cannon under it and holds the maw
 * open for as long as it wears its cargo, this beat or the next. Nothing is
 * fired at it: nothing kills it.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const intake: Press = { player: 1, command: { kind: "intake" } };

/** The moult nearest the hull, once it is within its steering stretch. */
function landing(w: World): Creature | undefined {
  const from = hullRow(w.cfg) - w.cfg.podHomeTiles - 1;
  let best: Creature | undefined;
  for (const c of w.creatures) {
    if (c.kind === "moult" && c.row >= from && (!best || c.row > best.row)) best = c;
  }
  return best;
}

/** Player 1's presses for a moult coming in, or `null` when none is. */
export function catchMoult(w: World): Press[] | null {
  const body = landing(w);
  if (body === undefined) return null;
  if (w.cannonCol !== body.col) return [aim(body.col)];
  const cargo = moultIsPod(w.cfg, w.waveBeat) || moultIsPod(w.cfg, w.waveBeat + 1);
  return cargo && !mawOpen(w) ? [intake] : [];
}
