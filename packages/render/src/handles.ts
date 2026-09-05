import {
  type DragTarget,
  lidHandleMilli,
  lidIsHeld,
  NO_TETHER,
  occupiesCol,
  type World,
  wardenHandleMilli,
} from "@neon-spore/sim";
import { fieldPoint, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { lidCordCircle } from "./lid-string.js";
import { mazeStringCircle, mazeStringHandle } from "./maze-string.js";
import { tetherGrabCircle } from "./tether.js";
import type { Field, Touch } from "./touch.js";

/**
 * The handles: the things drawn **on the field** that a hand takes hold of and
 * carries, as opposed to the strips and lobes below the band.
 *
 * There are three of them now — THE MAZE's string, THE WARDEN's rope and THE
 * LID's cord — and that is why they are here rather than in `touch.ts` next
 * door. Both answer
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
    lidCordUnder(l, x, y, field)
  );
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

/**
 * Where a handle is *standing*, as opposed to where it rests.
 *
 * `handleUnder` above answers where a finger may grab, and that is always the
 * resting circle: by the time a handle has swung the pointer is captured and
 * nothing is hit-tested again. This answers the other question, and two things
 * ask it — the ghost hand in a guide's rehearsal, and the caption pointing at
 * one. A thumb drawn at the rest while the cord it is holding swings away is a
 * hand that has visibly let go.
 *
 * Each of the three comes out of the file that draws it, so the hand cannot
 * stand where the handle is not. Null wherever the handle is not on the field:
 * the wheel between rounds, a warden with no line, a wave with no eye in it.
 */
export function handleCircle(
  l: Layout,
  world: World,
  target: DragTarget,
  beatPhase: number,
  col?: number,
): Circle | null {
  const cfg = world.cfg;
  if (target === "mazeString") {
    const m = world.boss?.kind === "maze" ? world.boss : null;
    if (m === null || m.phase !== "read") return null;
    const rest = mazeStringCircle(l, cfg);
    return { x: mazeStringHandle(l, cfg, m).x, y: rest.y, r: rest.r };
  }
  if (target === "wardenTether") {
    const b = world.boss?.kind === "warden" ? world.boss : null;
    if (b === null || b.tetherId === NO_TETHER) return null;
    const at = fieldPoint(l, wardenHandleMilli(world, b));
    return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
  }
  // A cord hangs off a body, so which body has to be said: the one in the
  // column the film named, and otherwise the first on the field.
  const lid = world.creatures.find(
    (c) => c.kind === "lid" && (col === undefined || occupiesCol(c, col)),
  );
  if (!lid) return null;
  // Held, the handle is wherever the hand carried it; loose, it hangs under
  // the body and follows it down, which is `lidCordCircle`'s own answer.
  if (!lidIsHeld(lid)) return lidCordCircle(l, cfg, lid, beatPhase);
  const at = fieldPoint(l, lidHandleMilli(cfg, lid));
  return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
}
