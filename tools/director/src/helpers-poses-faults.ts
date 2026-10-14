import type { PlacedFault, World } from "@neon-spore/sim";
import { fresh, living, POSE_TPB, type Pose, run } from "./pose-kit.js";

/**
 * The frames CONTROLS › HELPERS draws for a **fault** (`helpers-faults.ts`,
 * and SHIELD STUCK ON in `helpers-shield.ts`): a wave with one fault placed
 * from its first beat to its end, and a body or two falling under it so the
 * field is a field. Beside `helpers-poses.ts`, which is the frames for the
 * bodies, on line count.
 */

/** The middle of eleven columns. */
const COL = 5;

/** From the wave's first beat to its end. */
const WHOLE = { at: 0, beats: 0 } as const;

/** `fault`, placed from beat 0 to the end, two bodies on their way, `beats` in. */
function faulted(fault: PlacedFault, beats: number): World {
  const w = fresh([living("red", COL - 2), living("cyan", COL + 2, 1)], [], null, {}, 0, [fault]);
  run(w, POSE_TPB * beats);
  return w;
}

const pose = (name: string, fault: PlacedFault, beats: number, crop: Pose["crop"]): Pose => ({
  name,
  note: name,
  crop,
  build: () => faulted(fault, beats),
});

/** The cannon firing on its own: the lantern, its beam and its words. */
export const CANNON_FAULT = pose(
  "HELPERS · THE CANNON FIRES ALONE",
  { kind: "cannon", color: "red", ...WHOLE },
  3,
  "full",
);

/** The same, cut to the band: the torn button and the one that holds it off. */
export const CANNON_FAULT_BAND = pose(
  "HELPERS · THE CANNON'S BUTTON TORN",
  { kind: "cannon", color: "red", ...WHOLE },
  3,
  "ship",
);

/** The shield stuck on: the lantern's beam on the dome and SHIELD STUCK ON. */
export const SHIELD_FAULT = pose(
  "HELPERS · THE SHIELD STUCK ON",
  { kind: "shield", ...WHOLE },
  3,
  "full",
);

/** THE CODEX: the haze over the field, on player 1's screen only. */
export const CODEX_ON = pose(
  "HELPERS · THE COLOURS SWAPPED",
  { kind: "codex", ...WHOLE },
  3,
  "full",
);

/** THE FLIP on player 1's screen: the glass down the middle, and MIRRORED. */
export const FLIP_ON = pose(
  "HELPERS · THE SCREEN MIRRORED",
  { kind: "flip", seat: 1, ...WHOLE },
  3,
  "full",
);
