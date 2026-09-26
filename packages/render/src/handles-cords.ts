import { NO_TETHER } from "@neon-spore/sim";
import { hitCircle, type Layout } from "./layout.js";
import { lidCordCircle } from "./lid-string.js";
import { mazeStringGrab, mazeStringRim } from "./maze-string.js";
import { PULL_GRAB } from "./pull-knob.js";
import { tetherGrabCircle } from "./tether.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The three cords**: THE MAZE's string, THE WARDEN's rope and THE LID's
 * cord, the three handles `handles.ts` was first written for and the pilot's
 * every one. Cut out of that file when THE RATCHET's two took it to within
 * eleven lines of its limit, along the seam its header already drew: these
 * three are the ones answered *in* the file, and everything else it asks is
 * a page of its own. The order they are asked in did not move with them.
 */

/**
 * THE MAZE's string, and only the pilot's: the wheel is the half of the round
 * player 2 cannot reach (`mazeStringHeard`), so a press from her seat falls
 * through to whatever is behind the handle. The grab reports zero — it *is* the
 * origin — and the origin stays here, on the device whose finger it is
 * (`Command` in `packages/sim/src/types.ts` has why).
 */
export function mazeStringUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const phase = bossOf(field, "maze")?.phase; // under `grip` the hand is the brace (`maze-grip.ts`)
  if ((phase !== "read" && phase !== "grip") || field.seat !== 1) return null;
  if (!hitCircle(mazeStringGrab(l, field.cfg), x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "mazeString", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: {
      kind: "drag",
      target: "mazeString",
      player: 1,
      originX: x,
      originY: y,
      // Read round the drum, not sideways: the lever's channel is an arc.
      rim: mazeStringRim(l, field.cfg, x, y),
    },
  };
}

/**
 * THE WARDEN's rope, and only the pilot's for the same shape of reason: player
 * 2 is the seat that fires and carries both colours, so the rope is player 1's
 * every cycle (`wardenTetherHeard`). One seat pulls, the other shoots, and
 * neither can reach the other's half.
 */
export function wardenRopeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "warden");
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
export function lidCordUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (field.seat !== 1) return null;
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (c.kind !== "lid") continue;
    // Widened by `PULL_GRAB`, the owner's rule for every handle you pull.
    const rest = lidCordCircle(l, field.cfg, c, field.beatPhase);
    const circle = { ...rest, r: rest.r * PULL_GRAB };
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
