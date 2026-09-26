import { MAX_BEARING_STEP, NO_BEARING, TURN } from "./bearing.js";
import {
  instarActing,
  instarMarkCol,
  instarPanel,
  instarSeatHears,
  instarStep,
  type SceneMark,
  type SceneState,
  sceneBoss,
} from "./instar.js";
import { answerMark, slipMark } from "./instar-marks.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * A thumb on one of THE INSTAR's marks — or THE NETTLE's, on the same engine.
 *
 * Every mark is the one `instarMark` target with `id` naming which, and the
 * six gestures are read off what a `drag` already carries rather than six
 * commands: the **grab** is the first `on` from a seat whose thumb was not on
 * the mark, a **move** is every `on` after it, the **lift** is `on: false`.
 * From those, with the crank's bearing and the sinew's depth:
 *
 * - `tap` counts grabs. A thumb held down is one slap, not a slap a tick.
 * - `pullDown` / `pullUp` **stand at** the depth the thumb is carrying the part,
 *   in its own direction, less what the part has pushed back while the thumb
 *   was on it (`ref`, grown by the beat — `instar-step.ts`); the other
 *   direction is nought. A lift before the
 *   step lands lets the part go — back to nought, and the partner's pull
 *   slips with it on the beat if it was already there (`instar-step.ts`).
 * - `swipeDown` arms on a carry past `instarSwipeMilli` and counts on the lift
 *   that follows: an egg is off the body when the thumb comes away, not when
 *   it is dragged. The furthest the carry has gone is kept on the way, so the
 *   ring can fill before the lift (`instarSwipeAlong`).
 * - `turn` winds clockwise like the crank (`crank.ts`): the step between two
 *   bearings, up to half a turn, is progress; anticlockwise is nothing. The
 *   answer is said once a quarter turn rather than once a tick, so the sound
 *   is a ratchet and not a hum.
 * - `hold` is only the thumbs' bookkeeping here: the beat counts it
 *   (`instar-step.ts`). A thumb coming off before it is done is the hold
 *   broken, back to nought.
 *
 * **The wrong seat is refused, and told so.** A mark for player 1 pressed by
 * player 2 does nothing to the count and pushes `instarRefuse`, which is the
 * one thing this boss says to a player about *whose* mark it is — the mark's
 * own geometry says it first, and this is what happens when it was not read.
 */

const P1 = 1;
const P2 = 2;

export function instarHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "instarMark") return;
  const s = sceneBoss(world);
  if (s === null || !instarActing(s)) return;
  const i = command.id ?? -1;
  const mark = instarStep(s)?.marks[i];
  // A panel verb's mark is a place, not a handle: the panel answers it
  // (`scene-panel.ts`), and a thumb on it is a thumb on nothing.
  if (mark === undefined || instarPanel(mark.gesture)) return;
  if (!instarSeatHears(mark.seat, player)) {
    if (command.on)
      world.events.push({
        type: "instarRefuse",
        mark: i,
        player,
        col: instarMarkCol(world.cfg, mark),
      });
    return;
  }
  const bit = player === 1 ? P1 : P2;
  const was = s.thumbs[i] ?? 0;
  const grab = command.on && (was & bit) === 0;
  s.thumbs[i] = command.on ? was | bit : was & ~bit;
  if (mark.gesture === "tap") {
    if (grab) answerMark(world, s, i, 1);
  } else if (mark.gesture === "pullDown" || mark.gesture === "pullUp") {
    pull(world, s, i, mark, command);
  } else if (mark.gesture === "swipeDown") {
    swipe(world, s, i, command);
  } else if (mark.gesture === "turn") {
    turn(world, s, i, command);
  } else if (!command.on && (s.progress[i] ?? 0) > 0) {
    slipMark(world, s, i);
  }
}

function pull(world: World, s: SceneState, i: number, mark: SceneMark, command: Command): void {
  if (command.kind !== "drag") return;
  if (!command.on) {
    if ((s.progress[i] ?? 0) > 0) slipMark(world, s, i);
    return;
  }
  const depth = command.fromYMilli ?? 0;
  const pushed = Math.max(0, s.ref[i] ?? NO_BEARING);
  const along = Math.max(0, (mark.gesture === "pullDown" ? depth : -depth) - pushed);
  // Said once, halfway: a pull that spoke on every tick of the carry would
  // be a hum, and the part giving is `instarDone`'s own sound.
  const half = Math.floor(mark.need / 2);
  const say = along >= half && (s.progress[i] ?? 0) < half;
  answerMark(world, s, i, along, true, say);
}

function swipe(world: World, s: SceneState, i: number, command: Command): void {
  if (command.kind !== "drag") return;
  const need = world.cfg.instarSwipeMilli;
  if (command.on) {
    const carried = Math.min(need, Math.max(0, command.fromYMilli ?? 0));
    s.ref[i] = Math.max(s.ref[i] ?? NO_BEARING, carried);
    return;
  }
  const armed = (s.ref[i] ?? NO_BEARING) >= need;
  s.ref[i] = NO_BEARING;
  if (armed) answerMark(world, s, i, 1);
}

function turn(world: World, s: SceneState, i: number, command: Command): void {
  if (command.kind !== "drag") return;
  // The hand off, or a hand just on: no reference yet, the way the crank
  // reads a press (`crank.ts`).
  if (!command.on || command.fromMilli < 0) {
    s.ref[i] = NO_BEARING;
    return;
  }
  const at = ((command.fromMilli % TURN) + TURN) % TURN;
  const from = s.ref[i] ?? NO_BEARING;
  s.ref[i] = at;
  if (from === NO_BEARING) return;
  const step = (at - from + TURN) % TURN;
  if (step === 0 || step > MAX_BEARING_STEP) return;
  const before = s.progress[i] ?? 0;
  const quarter = TURN / 4;
  const say = Math.floor((before + step) / quarter) > Math.floor(before / quarter);
  answerMark(world, s, i, step, false, say);
}
