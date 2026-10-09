import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **What a bolt in a column meets of a core hung over the middle one**, the
 * judgement ten bosses made in seventeen identical lines each — THE TRAPEZE,
 * CAPSTAN, GALL, GOVERNOR, PLUMB and SLING, THE DAVIT, THE GRINDSTONE
 * and THE HALTER until the owner took them out on 8 October 2026, THE RIME
 * until 9 October, and THE
 * FLUE until its rework of 5 October 2026 gave it an ember to shoot in place
 * of a core.
 *
 * - `null`: a column with none of the core in it.
 * - `"armour"`: the core's column while it is shut, or open on a step that is
 *   not a fire step. It costs nothing (`shot-out.ts`).
 * - `"target"`: open on a fire step, in the step's colour, or either colour on
 *   a step authored `"either"`, the white core.
 * - `"wrong"`: open on a fire step, in the other colour: a colour missed.
 *
 * Pure, so the picture asks it where a bolt stops (`render/core-stop.ts`) and
 * the boss's `…Struck` acts on the same answer through `coreTaken`.
 */
export type CoreVerdict = "target" | "wrong" | "armour" | null;

/** A step the core is lit for, if it asks for fire. */
export interface CoreStep {
  ask: string;
  color: Color | "either";
}

/**
 * A second ask a bolt answers besides fire, in a column of its own: THE
 * OCULUS's look, THE VISE's spit.
 */
export interface CoreAside {
  ask: string;
  /** The column the step asking it is answered in. */
  col: number;
}

/**
 * The verdict for a bolt of `color` in `col`, with the core `open` and `step`
 * lit. On a step asking `aside.ask` the answer is in `aside.col` rather than
 * the middle; the middle column stays the core's armour all the same.
 */
export function coreVerdict(
  world: World,
  col: number,
  color: Color,
  open: boolean,
  step: CoreStep | null,
  aside?: CoreAside,
): CoreVerdict {
  const mid = midCol(world.cfg);
  const away = aside !== undefined && step !== null && step.ask === aside.ask;
  const shut = col === mid ? "armour" : null;
  if (col !== (away ? aside.col : mid)) return shut;
  if (!open || step === null || (step.ask !== "fire" && !away)) return shut;
  return step.color === "either" || color === step.color ? "target" : "wrong";
}

/**
 * Acts on a verdict's colour: a colour missed or met on the balance sheet.
 * True only when the core takes the hit, which the boss then counts.
 */
export function coreTaken(world: World, verdict: CoreVerdict, step: CoreStep | null): boolean {
  if (verdict === "wrong") missedColor(world);
  if (verdict !== "target") return false;
  if (step !== null && step.color !== "either") metColor(world);
  return true;
}
