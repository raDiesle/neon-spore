import { hullRow } from "./config.js";
import { gripsCreature } from "./grip.js";
import { clampSpanCol, spanOf } from "./span.js";
import { bodyCenterCol, type Command, type Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE PUSH: the same hand read a third way.
 *
 * A finger held on something falling already slows it (`grip.ts`) and, for
 * player 1, already steers every shot into it (`lock.ts`). Carried sideways it
 * now does one thing more: the body it is on steps **one column**, the way the
 * hand went, and then holds still for a beat before it may be carried again.
 *
 * **It is the grip's gesture and not a new control.** Nothing new is drawn,
 * nothing new is pressed, and the price is the one the grip already charges —
 * a thumb on the field is a thumb off the strip below it, so the seat carrying
 * a rock out of the shield's way is the seat not moving their own lobe. What
 * it buys is the answer a pair has never had to a rock in the wrong column:
 * before this, the only two answers were the shield reaching it in time or the
 * hull taking it.
 *
 * **One column, and then a beat of quiet.** A body that could be carried every
 * beat could be walked the width of the field by one thumb, which is a way of
 * making the shield's column stop mattering. `gripPushPauseBeats` is the beat
 * that has to pass with the body standing still, and it is counted on the body
 * rather than on the hand — two hands on one rock alternating would otherwise
 * be twice the speed of one, and what the rule is about is how fast a body may
 * cross the field.
 *
 * **The hand names a displacement and the rule counts columns out of it.** A
 * `drag` is cumulative from the grab and never an increment
 * (`command-types.ts`), so `GripPush.milli` is the whole distance the finger
 * has come and `GripPush.cols` is how much of it has already been spent. A
 * command lost on the wire heals itself: the next one says the same thing.
 */

/** A hand that has taken hold of a body and carried it. */
export interface GripPush {
  /**
   * Thousandths of a tile this hand has come from where it grabbed — the
   * device's own report, never an increment (`Command`'s `drag`).
   */
  milli: number;
  /**
   * How much of that carry has already been spent, in whole columns, signed
   * the way it went. Without it a hand that had earned one column would go on
   * earning it every beat: the displacement it reports does not go back to
   * nought once the body has moved.
   */
  cols: number;
}

/** This seat's hand, or null while it is carrying nothing. Read through this
 * rather than by name, the way `gripsCreature` is asked which field is whose. */
export function gripPushOf(world: World, player: 1 | 2): GripPush | null {
  return player === 1 ? world.pushP1 : world.pushP2;
}

/** Both hands let go of whatever they were carrying. Called wherever a grip
 * changes: a carry belongs to one body and one grab, and one kept past either
 * would spend columns the hand never earned (`setGrip`). */
export function clearGripPush(world: World, player: 1 | 2): void {
  if (player === 1) world.pushP1 = null;
  else world.pushP2 = null;
}

/**
 * The hand moving, and the whole of the gesture.
 *
 * **Either seat**, for the reason the grip itself is either seat: the field
 * belongs to both and is not split between them.
 *
 * A carry that names a body this seat is not holding is dropped rather than
 * remembered, `setGrip`'s rule exactly — the command was delayed by a few
 * ticks and whatever it named may have been shot in the meantime.
 */
export function gripPushHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "gripBody") return;
  if (!command.on || command.id === undefined || !gripsCreature(world, player, command.id)) {
    clearGripPush(world, player);
    return;
  }
  const spent = gripPushOf(world, player)?.cols ?? 0;
  const push = { milli: command.fromMilli, cols: spent };
  if (player === 1) world.pushP1 = push;
  else world.pushP2 = push;
}

/**
 * Every body a hand is carrying, moved a column — **on the beat, beside the
 * fall rather than instead of it**.
 *
 * On the beat for the reason everything on the field is: bodies land on tile
 * centres all at once, and a column that changed on a tick would be a body
 * arriving between two of the numbers the pair is reading out to each other.
 * Beside the fall rather than instead of it because a carried rock is still a
 * falling rock — what the hand buys is a lane, never a beat, and the beat it
 * would buy is the grip's own job.
 *
 * Called after `beat.ts`'s fall loop, which has already written `fromCol` for
 * every body it stepped, so the step is drawn as a glide rather than a jump.
 */
export function carryGrips(world: World): void {
  for (const c of world.creatures) {
    // **A body standing on the ship's row has arrived and does not move
    // again** — `resolveHull` is about to break the hull with it, and what it
    // must break is the column the pair watched it come down in. The fall loop
    // makes the same refusal in the same words.
    if (c.row >= hullRow(world.cfg)) continue;
    const dir = carryDir(world, c);
    if (dir === 0) continue;
    if (!carryIsReady(world, c)) continue;
    const to = clampSpanCol(c.col + dir, world.cfg.cols, spanOf(c));
    // Against the wall: the hand spends nothing and the pause is not started,
    // so a thumb pressed on into the edge of the field is simply a thumb held
    // on a body — which is the grip, and still slows it.
    if (to === c.col) continue;
    c.col = to;
    c.pushBeat = world.beat;
    say(world, c, dir, spend(world, c, dir));
  }
}

/** Which way the hands on this body are pulling: one column, or none.
 *
 * Two hands pulling opposite ways cancel, and the body holds — the one place
 * in the game where the two seats can work against each other, and it resolves
 * the only way it honestly can. Neither spends a column for it, so whoever
 * lets go first sends it. */
function carryDir(world: World, c: Creature): -1 | 0 | 1 {
  return Math.sign(handDir(world, 1, c) + handDir(world, 2, c)) as -1 | 0 | 1;
}

/** Which way one seat's hand has earned a column, out of how far it has come
 * and how much of that it has already spent. */
function handDir(world: World, player: 1 | 2, c: Creature): -1 | 0 | 1 {
  if (!gripsCreature(world, player, c.id)) return 0;
  const push = gripPushOf(world, player);
  if (push === null) return 0;
  // `Math.trunc` and not a floor: a hand is as far from where it grabbed in
  // one direction as in the other, and a floor would earn a column half a tile
  // sooner going left than going right.
  const earned = Math.trunc(push.milli / world.cfg.gripPushMilli);
  return Math.sign(earned - push.cols) as -1 | 0 | 1;
}

/** The column is spent by every hand that asked for it, and by no hand that
 * asked for the other one or for nothing. */
function spend(world: World, c: Creature, dir: -1 | 1): (1 | 2)[] {
  const paid: (1 | 2)[] = [];
  for (const player of [1, 2] as const) {
    if (handDir(world, player, c) !== dir) continue;
    const push = gripPushOf(world, player);
    if (push === null) continue;
    push.cols += dir;
    paid.push(player);
  }
  return paid;
}

/**
 * The lane change, said out loud.
 *
 * A carry moved a rock out of the shield's way and pushed nothing, so the seat
 * that is not holding it heard the column change only if they happened to be
 * watching — on the one mechanic whose entire point is that the two of them are
 * looking at different things. `ship.gripSlip` already says a hand coming off,
 * which is the same class of thing.
 *
 * **`spend` says who paid, and this only reads its answer.** A hand gripping
 * the body is not necessarily a hand that asked for this column — the other
 * seat may have been pulling the other way and lost, and it is charged nothing
 * and has said nothing. Asking `handDir` a second time here would be that rule
 * written out twice, and `spend` has already moved the numbers it reads.
 * `bodyCenterCol` for the column, so a wide rock is panned where the pair sees
 * it rather than at its left edge.
 */
function say(world: World, c: Creature, dir: -1 | 1, paid: readonly (1 | 2)[]): void {
  for (const player of paid) {
    world.events.push({ type: "carry", player, col: bodyCenterCol(c, c.col), row: c.row, dir });
  }
}

/**
 * Whether this body has stood still long enough to be carried again. A body
 * that has never been carried has no beat to count from and is always ready.
 *
 * Exported because the picture asks it too: a ring that looked the same on the
 * beat a hand can move a rock and on the beat it cannot is a control saying
 * nothing about the one thing the player is waiting for. Called rather than
 * re-derived — `world.beat - c.pushBeat` written out a second time in render/
 * is a second copy of the rule, and it would drift.
 */
export function carryIsReady(world: World, c: Creature): boolean {
  if (c.pushBeat === undefined) return true;
  return world.beat - c.pushBeat > world.cfg.gripPushPauseBeats;
}
