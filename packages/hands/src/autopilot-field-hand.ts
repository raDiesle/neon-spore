import {
  beatPhaseTicks,
  type Color,
  type Creature,
  guardArmed,
  guardWindowTicks,
  isWardable,
  MILLI,
  occupiesCol,
  shieldRow,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { aimColumn, cannonAnswers } from "./autopilot-aim.js";
import { shake } from "./autopilot-harpoon.js";
import { holdLid, lidShut } from "./autopilot-lid.js";
import { catchMoult } from "./autopilot-moult.js";
import { catchPod, hanging } from "./autopilot-pod-hand.js";
import type { Hand } from "./hand.js";

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
 * A hand for the plain field, and its pods — shot loose, followed down and
 * swallowed, a husk let past (`autopilot-pod-hand.ts`). THE CLASP is the
 * shield's half too: the dome comes up in its column and breaks it. A few
 * creatures with a verb of their own have theirs in a file beside this one:
 * THE SHELL's column and THE LURE left alone (`autopilot-aim.ts`), THE MOULT
 * caught or turned (`autopilot-moult.ts`), a control THE LIMPET or THE LEECH
 * has harpooned kept moving (`autopilot-harpoon.ts`), and THE LID held open
 * while it is shot (`autopilot-lid.ts`). Any other creature with a verb of its
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

/**
 * The cannon's half: a falling pod first, then under the lowest coloured body
 * and its colour when free — a lid held open first — then a hanging pod shot loose
 * (`autopilot-pod-hand.ts`). Any colour frees a pod.
 */
function cannon(w: World): Press[] {
  const off = shake(w, "leech", w.cannonCol);
  if (off !== null) return [aim(off)];
  const chase = catchPod(w);
  if (chase !== null) return chase;
  const moult = catchMoult(w);
  if (moult !== null) return moult;
  const body = lowest(w, cannonAnswers);
  const pod = body ? undefined : hanging(w);
  const col = body ? aimColumn(body) : pod ? Math.round(pod.colMilli / MILLI) : null;
  if (col === null) return [];
  const hold = holdLid(w, body);
  if (w.cannonCol !== col) return [aim(col), ...hold];
  if (lidShut(w, body)) return hold;
  return free(w) ? [fire(body?.color ?? "red")] : [];
}

/**
 * The shield's half, under rocks and under THE CLASP, whose shield breaks
 * wherever it stands once the dome comes up in its column. The dome is triggered in the last stretch of the beat
 * before the rock reaches its row, short enough that the window is still open
 * on the beat it arrives (`guardArmed`, `resolveHull`).
 */
function shield(w: World): Press[] {
  const off = shake(w, "limpet", w.shieldCol);
  if (off !== null) return [carry(off)];
  const rock = lowest(w, (c) => isWardable(c.kind) || c.kind === "moult" || c.kind === "clasp");
  if (rock === undefined) return [];
  if (!occupiesCol(rock, w.shieldCol)) return [carry(rock.col)];
  // A clasp is broken at any row, the moment the dome comes up in its column.
  if (rock.kind === "clasp") return guardArmed(w) ? [] : [trigger];
  if (rock.row < shieldRow(w.cfg) - 1 || guardArmed(w)) return [];
  const toBeat = ticksPerBeat(w.cfg) - beatPhaseTicks(w.cfg, w.tick);
  return toBeat <= guardWindowTicks(w.cfg) / 2 ? [trigger] : [];
}

/** Both halves, each seat's presses its own. */
export const fieldHand: Hand = (w) => [...cannon(w), ...shield(w)];
