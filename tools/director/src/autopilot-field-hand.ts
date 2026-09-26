import {
  beatPhaseTicks,
  type Color,
  type Creature,
  guardArmed,
  guardWindowTicks,
  isWardable,
  occupiesCol,
  shieldRow,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on an ordinary wave**: the cannon and the shield
 * together, which no boss hand plays because no boss is only that.
 *
 * AUTO was bosses only, and a wave of slimes and rocks under TEST was the one
 * place a person alone still needed a second thumb. The rule played is the
 * one the pair says out loud: player 1 stands the cannon under the body
 * nearest the hull and player 2 fires its colour; player 2 carries the shield
 * under the rock nearest the hull and player 1 triggers it as that rock comes
 * onto the dome's row. Each seat's commands are its own
 * (`content/controls.ts`), so P1 and P2 on AUTO split along the same line.
 *
 * A hand for the plain field and nothing more: a creature with a verb of its
 * own — a hold, a reach, a drag — is not answered here, and the wave it is on
 * is one AUTO only half plays.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });
const carry = (col: number): Press => ({ player: 2, command: { kind: "shieldCol", col } });
const trigger: Press = { player: 1, command: { kind: "guard" } };

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

/** The body nearest the hull that `take` says is this thumb's to answer. */
function lowest(w: World, take: (c: Creature) => boolean): Creature | undefined {
  let best: Creature | undefined;
  for (const c of w.creatures) {
    if (take(c) && (best === undefined || c.row > best.row)) best = c;
  }
  return best;
}

/** The cannon's half: under the lowest coloured body, and its colour when free. */
function cannon(w: World): Press[] {
  const body = lowest(w, (c) => c.color !== null && !isWardable(c.kind));
  if (body === undefined || body.color === null) return [];
  if (w.cannonCol !== body.col) return [aim(body.col)];
  return free(w) ? [fire(body.color)] : [];
}

/**
 * The shield's half. The dome is triggered in the last stretch of the beat
 * before the rock reaches its row, short enough that the window is still open
 * on the beat it arrives (`guardArmed`, `resolveHull`).
 */
function shield(w: World): Press[] {
  const rock = lowest(w, (c) => isWardable(c.kind));
  if (rock === undefined) return [];
  if (!occupiesCol(rock, w.shieldCol)) return [carry(rock.col)];
  if (rock.row < shieldRow(w.cfg) - 1 || guardArmed(w)) return [];
  const toBeat = ticksPerBeat(w.cfg) - beatPhaseTicks(w.cfg, w.tick);
  return toBeat <= guardWindowTicks(w.cfg) / 2 ? [trigger] : [];
}

/** Both halves, each seat's presses its own. */
export const fieldHand: Hand = (w) => [...cannon(w), ...shield(w)];
