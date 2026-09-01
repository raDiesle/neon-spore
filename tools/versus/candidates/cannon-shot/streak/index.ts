import * as bullets from "../../../../../packages/render/src/bullets.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `cannon:shot` / `streak` — the shot is a line, and the head is barely there.
 *
 * The failure this slot is aimed at is a shot that reads as a brighter flash
 * where it started rather than as a thing leaving the ship. `streak` answers
 * it with the whole mass: a constant tail two and a half tiles long at more
 * than twice the shipped opacity and three times the width, with the solid
 * head cut to two thirds and its halo pulled in. There is no moment at which
 * the object is a dot, so there is nothing for a dot to fail to travel.
 *
 * The shipped tail cannot do this and it is worth saying why, because it is
 * the whole argument. It runs back to the *tile centre the shot left*, so its
 * length is a sawtooth: full at the boundary, nothing an instant later, all
 * the way up the column. An eye reading a sawtooth reads a flicker. A constant
 * `2.6` reads a trajectory.
 *
 * How it can lose. Twelve tiles a beat times two and a half tiles of tail is
 * most of a column lit at once, and the field is eleven columns of creatures
 * the two players are naming to each other. If a volley reads as bars of light
 * rather than as shots, the thing that travelled is no longer countable, and
 * counting is what the other player is doing.
 */
export const SHOT_STREAK: Variant = {
  slot: "cannon:shot",
  name: "streak",
  sentence: "a constant tail two and a half tiles long, and almost no head — the shot is the line",
  dir: "tools/versus/candidates/cannon-shot/streak",
  // Event-shaped, not continuous: `versus-pose.ts`'s `SHOT · BEING LAID`
  // replays the press-to-departure act every `EVENT_CADENCE_SECONDS`, and the
  // question this candidate answers is what the tail looks like while it is
  // still travelling — not at the muzzle and not after it has struck. Frozen
  // partway into the first replay, with the bolt mid-column, rather than left
  // running: a picture documenting this look, not an instrument for judging
  // its motion.
  screenshot: { freezeSeconds: 0.48 },
  patches: [
    patch({
      target: bullets.SHOT_LOOK,
      // No accessor: `drawBullets` reads the export itself, picking between it
      // and `LANCE_LOOK` per bullet. The module namespace is the whole route.
      reached: () => bullets.SHOT_LOOK,
      where: {
        file: "packages/render/src/bullets.ts",
        symbol: "SHOT_LOOK",
        type: "ShotLook",
      },
      fields: {
        tailBack: () => 2.6,
        tailAlpha: 0.8,
        tailWidth: 6,
        haloMul: 0.22,
        haloAlpha: 0.6,
        coreMul: 0.09,
        ringMul: 0,
        ringWidth: 0,
        ringColor: null,
      },
    }),
  ],
};
