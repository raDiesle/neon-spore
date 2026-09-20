import type { Command } from "./types.js";
import { NO_WELL_GRIP, type WellState, wellBoss, wellMaxOffsetMilli } from "./well.js";
import type { World } from "./world.js";

/**
 * **The pilot's thumb on the seam**, off the wire, on the tick.
 *
 * The seam is the one sector of the clock face that holds no column — the
 * place the field's two walls meet when the row is rolled into a circle. It
 * is the only part of this picture that answers nothing on the flat field, so
 * a hand on it takes nothing away from the game the pair are already playing:
 * the cannon, the shield and every hour keep the hand they had.
 *
 * One thumb, two meanings, read off the face rather than off the thumb:
 *
 * - while the face is `rolling`, holding the seam **stops** it, on the budget
 *   `well-step.ts` spends;
 * - once it is `wound`, carrying the seam **turns** it, and at twelve the
 *   face is square again and the cycle starts over.
 *
 * That is two gestures on one handle and no new thing to find, which is the
 * whole point: a pair who put a thumb on the seam because it is the brightest
 * line on the face learn both by holding it at two different moments. In any
 * language it is four words twice — *hold it*, then *turn it home*.
 *
 * **The pilot's seat, and only his.** He is the one the well is drawn for
 * (`showsWell`); she has the flat field with plain columns on it and is the
 * one he has to ask. A hand of hers on the seam would be her turning a
 * picture she cannot see, so it is dropped without a sound, as `queenMark`
 * drops the other seat's.
 *
 * On the tick, and the carry is cumulative from the grab (`fromMilli`), so a
 * move the wire coalesced away still arrives (`docs/spec/latency.md`). One
 * tile of thumb is one sector of face: there is no scale in here on purpose,
 * because the pilot is putting a thing he can see back where he can see it
 * belongs, and a gearing between his hand and the picture is a thing to learn
 * for no gain.
 */
export function wellHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "wellSeam") return;
  if (player !== 1) return;
  const b = wellBoss(world);
  if (b === null) return;
  if (!command.on) {
    b.gripMilli = NO_WELL_GRIP;
    return;
  }
  // A fresh grab records where the seam stood when it was taken hold of. A
  // move inside a grab already has one and must not re-anchor: `fromMilli`
  // counts from the grab, so re-reading it here would make every move the
  // first millimetre of a new carry and the seam would never travel.
  if (b.gripMilli === NO_WELL_GRIP) b.gripMilli = b.offsetMilli;
  if (b.phase !== "wound") return;
  turn(world, b, b.gripMilli + command.fromMilli);
}

/** The carry itself: the seam put where the thumb has taken it, and home is
 * the end of it. */
function turn(world: World, b: WellState, toMilli: number): void {
  const max = wellMaxOffsetMilli(world.cfg);
  b.offsetMilli = Math.max(0, Math.min(max, toMilli));
  if (b.offsetMilli > 0) return;
  // Square again: the hours are the columns, and the hold is given back for
  // the next slip the way THE CAIRN gives its own back when a rock leaves.
  b.phase = "still";
  b.phaseBeat = world.waveBeat;
  b.heldBeats = 0;
  world.events.push({ type: "wellHome" });
}
