import { NO_TETHER } from "@neon-spore/sim";
import { hitCircle, type Layout } from "./layout.js";
import { lidCordCircle } from "./lid-string.js";
import { mazeStringCircle } from "./maze-string.js";
import { tetherHandleCircle } from "./tether.js";
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
    command: { kind: "drag", target: "mazeString", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "mazeString", player: 1, originX: x },
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
  const rope = field.creatures.find((c) => c.id === b.tetherId);
  if (rope === undefined) return null;
  if (!hitCircle(tetherHandleCircle(l, field.cfg, rope.col), x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "wardenTether", player: 1, originX: x },
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
    const circle = lidCordCircle(l, c, field.beatPhase);
    if (!hitCircle(circle, x, y)) continue;
    const d = Math.hypot(x - circle.x, y - circle.y);
    if (d >= bestDist) continue;
    best = c.id;
    bestDist = d;
  }
  if (best === null) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "lidString", on: true, fromMilli: 0, id: best },
    hold: { kind: "drag", target: "lidString", player: 1, originX: x, id: best },
  };
}
