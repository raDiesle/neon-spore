import { faultOn } from "./fault-placed.js";
import type { World } from "./world.js";

/**
 * THE FLIP: **one seat's field is drawn about its own middle, and everything
 * in it is really in the mirrored column.**
 *
 * A body drawn falling down the left wall is falling down the right one, at
 * the same row, at the same speed, in the same colour. Nothing about the
 * simulation changes — not the fall, not the beat, not what a bolt does — and
 * that is the whole of the design: the flip is a fact about a *picture*, and
 * the picture is the only thing that is wrong. So the seat holding the turned
 * screen has to say every column backwards before it means anything to the
 * other one, and the shield goes to the far side of the field from the body
 * its owner can see.
 *
 * **Why it is a fault and not a mechanic of its own.** The owner asked for it
 * on 16 September 2026 as a sixth malfunction: painted with the brush the
 * director already has, wearing the blue every fault wears, so a pair that has
 * met one recognises the family before reading a word. It swallows no press
 * and breaks no button — THE CODEX's kind of fault, where every control works
 * and what has changed is what the pair can believe.
 *
 * **Why the fold is here and not in render/.** `ideas.md` holds the answer THE
 * VANE learned the hard way: a flip the simulation never hears about has
 * nothing to hash, nothing to replay and nothing the director can show. The
 * *seat* is therefore authored on the placed fault and hashed with it
 * (`hash-faults.ts`), and render asks this file whose picture is turned. What
 * render then does with the answer is its own — one column arithmetic in
 * `render/field-flip.ts`, reaching the bodies on the field and leaving the
 * strips alone, because turning the finger the same way as the eye would
 * cancel the whole mechanic out.
 *
 * **One seat, never both.** The wave names the pilot or the navigator, and the
 * type says so. A flip on both screens is a wave where the two agree with each
 * other again and only the controls are strange — a different wave, and one
 * nobody has asked for — so it is not a thing an author can write by accident.
 */

/** Whose picture is turned, or null. */
export function flipSeat(world: World): 1 | 2 | null {
  const fault = faultOn(world, "flip");
  return fault !== null && fault.kind === "flip" ? fault.seat : null;
}

/** Whether this wave turns a screen at all, in force or still to come — a fact
 * about the wave rather than about the beat, for a panel or a page. */
export function flipInWave(world: World): boolean {
  return world.faults.some((f) => f.kind === "flip");
}
