import { NO_TETHER } from "@neon-spore/sim";
import { antiphonOrganUnder } from "./antiphon-grip.js";
import { balloonHandleCircle, balloonHandleSeat } from "./balloon-handles.js";
import { choirArrowCircle, showsChoirArrows } from "./choir-arrows.js";
import { filamentGrabUnder } from "./filament-grip.js";
import { instarMarkUnder } from "./instar-marks.js";
import { hitCircle, type Layout } from "./layout.js";
import { lidCordCircle } from "./lid-string.js";
import { mazeStringCircle } from "./maze-string.js";
import { orreryRingUnder } from "./orrery-grab.js";
import { queenMarkUnder } from "./queen-grip.js";
import { sinewHandleUnder } from "./sinew-handles.js";
import { stareLidUnder } from "./stare-lid.js";
import { surgeBulbUnder } from "./surge-grip.js";
import { tetherGrabCircle } from "./tether.js";
import type { Field, Touch } from "./touch.js";

/**
 * The handles: the things drawn **on the field** that a hand takes hold of and
 * carries, as opposed to the strips and lobes below the band.
 *
 * **THE ORRERY's ring is the sixth and it is not in this file**, because it is
 * not a circle: it is an ellipse the width of the field, hit-tested by bearing
 * and drawn with the mark that says it turns, and both halves of that live
 * together in `orrery-grab.ts` for the reason the header there gives. It is
 * asked **last**, which is not a decision about which control wins — a wave
 * with the orrery in it has no maze, no warden, no lid and no balloon — but
 * about what a miss falls through to: the ring hangs over the top rows where
 * this boss's own rocks come in, and a thumb that misses the line should find
 * the rock behind it exactly as it would with no ring there.
 *
 * THE SINEW's pair is the seventh and lives with its drawing in
 * `sinew-handles.ts` for THE ORRERY's reason: the rest a thumb is answered at
 * is the rest the ring is drawn from, and one file keeps them one fact.
 * THE SURGE's bulb is the eighth and the first taken by both seats at
 * once, in `surge-grip.ts` for the same reason. THE ANTIPHON's organ is the
 * ninth, on the one screen that shows it, in `antiphon-grip.ts`.
 *
 * There are five of them here — THE MAZE's string, THE WARDEN's rope, THE LID's
 * cord, THE CHOIR's two arrows and THE BALLOON's two handles — and that is why
 * they are here rather than in `touch.ts` next door. The last pair is the one
 * that is not the pilot's: a balloon has a handle for each seat, and which
 * side belongs to whom is `balloonHandleSeat`'s
 * (`balloon-handles.ts`). Both answer
 * the same shape of question (is this seat allowed, is this round running, is
 * the press inside the resting circle) and neither is a creature, so the file
 * that owns the decision table for the whole control scheme was carrying two
 * copies of one idea and had reached its length limit doing it.
 *
 * **Asked before anything else on the field**, because a handle hangs over the
 * field the creatures fall through and a hand on it is not a hand on whatever
 * is behind it.
 *
 * Every circle here is the **resting** one, never where the handle has swung
 * to. By the time it has swung, the pointer is captured and nothing is
 * hit-tested again — and a circle that moved under the finger would be a
 * control you could only grab while it was doing nothing.
 *
 * It imports its types from `touch.ts` and `touch.ts` imports this function
 * back. The types are erased, so there is no cycle at runtime: what is left is
 * one direction, the decision table calling the handles.
 */
export function handleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  return (
    mazeStringUnder(l, x, y, field) ??
    wardenRopeUnder(l, x, y, field) ??
    lidCordUnder(l, x, y, field) ??
    balloonHandleUnder(l, x, y, field) ??
    choirArrowUnder(l, x, y, field) ??
    sinewHandleUnder(l, x, y, field) ??
    surgeBulbUnder(l, x, y, field) ??
    antiphonOrganUnder(l, x, y, field) ??
    orreryRingUnder(l, x, y, field) ??
    instarMarkUnder(l, x, y, field) ??
    filamentGrabUnder(l, x, y, field) ??
    stareLidUnder(l, x, y, field) ??
    // THE BULB QUEEN's two marks, under BROOD and SCREAM (`queen-grip.ts`).
    queenMarkUnder(l, x, y, field)
  );
}

/**
 * THE BALLOON's handles, and the first on this field that are **not** the
 * pilot's — one each. Which side belongs to which seat is
 * `balloonHandleSeat`'s and is asked here rather than decided here, so the
 * circle a finger is answered at and the circle the picture draws are one
 * fact (`balloon-handles.ts`).
 *
 * The nearest wins when two overlap, which is `lidCordUnder`'s rule and
 * `creatureAt`'s before it: a thumb covers more than a handle, and the body a
 * player meant is the one they put their thumb closest to. It matters more
 * here than it ever has — a wave puts several of these up at once on purpose,
 * and grabbing the wrong one is grabbing a body the other seat is not on.
 */
function balloonHandleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const side = field.seat === 1 ? -1 : 1;
  if (balloonHandleSeat(side) !== field.seat) return null;
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (c.kind !== "balloon") continue;
    const circle = balloonHandleCircle(l, field.cfg, c, field.beat, field.beatPhase, side);
    if (!hitCircle(circle, x, y)) continue;
    const d = Math.hypot(x - circle.x, y - circle.y);
    if (d >= bestDist) continue;
    best = c.id;
    bestDist = d;
  }
  if (best === null) return null;
  const target = side === -1 ? "balloonLeft" : "balloonRight";
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id: best },
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y, id: best },
  };
}

/**
 * THE CHOIR's two arrows, and only the pilot's for the fourth time and the
 * same reason: player 2 is the seat that fires and carries both colours, so a
 * membrane either of them could open would be a creature one phone could play.
 *
 * The **last** handle asked, and the ordering is deliberate. These two sit
 * against the walls of the field, where nothing else in the game is drawn and
 * where a body could still be falling behind one — so a thumb that finds an
 * arrow was reaching for an arrow, and a thumb that misses one falls through
 * to whatever is behind it exactly as it would if no membrane were up.
 *
 * Their resting circle *is* their grab circle: an arrow does not travel, it is
 * a switch a hand throws, and the whole gesture is how far the hand has come
 * from where it took hold (`choirArrowHeard`).
 *
 * `showsChoirArrows` is the one gate, shared with the drawing, so an arrow
 * can never be answered where none was drawn.
 */
function choirArrowUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (field.seat !== 1 || !showsChoirArrows(l, field.creatures)) return null;
  for (const side of [-1, 1] as const) {
    if (!hitCircle(choirArrowCircle(l, side), x, y)) continue;
    const target = side === -1 ? "choirLeft" : "choirRight";
    return {
      player: 1,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
      hold: { kind: "drag", target, player: 1, originX: x, originY: y },
    };
  }
  return null;
}

/**
 * THE MAZE's string, and only the pilot's: the wheel is the half of the round
 * player 2 cannot reach (`mazeStringHeard`), so a press from her seat falls
 * through to whatever is behind the handle. The grab reports zero — it *is* the
 * origin — and the origin stays here, on the device whose finger it is
 * (`Command` in `packages/sim/src/types.ts` has why).
 */
function mazeStringUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (field.maze === null || field.maze.phase !== "read" || field.seat !== 1) return null;
  if (!hitCircle(mazeStringCircle(l, field.cfg), x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "mazeString", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "mazeString", player: 1, originX: x, originY: y },
  };
}

/**
 * THE WARDEN's rope, and only the pilot's for the same shape of reason: player
 * 2 is the seat that fires and carries both colours, so the rope is player 1's
 * every cycle (`wardenTetherHeard`). One seat pulls, the other shoots, and
 * neither can reach the other's half.
 */
function wardenRopeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = field.warden;
  if (b === null || b.tetherId === NO_TETHER || field.seat !== 1) return null;
  if (field.creatures.every((c) => c.id !== b.tetherId)) return null;
  // The **pupil's** column, not the tether creature's: the line is authored in
  // the middle of the ring and never moves, but the handle on the end of it
  // hangs under the eye, which walks a column or two a beat. Answering at the
  // creature's column meant the ball was outside its own button for most of
  // every cycle, and the control read as intermittent rather than as missing
  // (`tetherHandleCircle`, and `GRAB` beside it for the size).
  if (!hitCircle(tetherGrabCircle(l, field.cfg, b.pupilCol), x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "wardenTether", player: 1, originX: x, originY: y },
  };
}

/**
 * THE LID's cord, and only the pilot's for the third time and the same reason:
 * player 2 is the seat that fires and carries both colours, so a lid either of
 * them could open would be a creature one phone could play.
 *
 * The one handle that is **many**. A maze has one string and a warden one rope,
 * so both are addressed by their target name alone; a wave may put three lids
 * on the field at once, so the press carries the body's id and every move after
 * it repeats it (`Command` in `packages/sim/src/command-types.ts`).
 *
 * The nearest cord wins when two overlap, which is `creatureAt`'s rule and for
 * its reason: a thumb covers more than a handle, and the body a player meant is
 * the one they put their thumb closest to.
 */
function lidCordUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (field.seat !== 1) return null;
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (c.kind !== "lid") continue;
    const circle = lidCordCircle(l, field.cfg, c, field.beatPhase);
    if (!hitCircle(circle, x, y)) continue;
    const d = Math.hypot(x - circle.x, y - circle.y);
    if (d >= bestDist) continue;
    best = c.id;
    bestDist = d;
  }
  if (best === null) return null;
  return {
    player: 1,
    command: {
      kind: "drag",
      target: "lidString",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: best,
    },
    hold: { kind: "drag", target: "lidString", player: 1, originX: x, originY: y, id: best },
  };
}

// **Where a handle is standing**, as against where a finger may grab one, is
// `handle-place.ts` next door — cut out when THE BALLOON's two took this file
// over its limit, along the seam the header above already draws. Re-exported
// here so nothing that reached for `handleCircle` through this file had to
// move.
export { handleCircle } from "./handle-place.js";
