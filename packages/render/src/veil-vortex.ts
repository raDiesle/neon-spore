import { facet, pin, surfaceDim } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import type { VeilMassDraw } from "./veil-look.js";

/**
 * VORTEX — a kept look for THE VEIL's cloud, drawn only on the SHAPES page's
 * LIBRARY.
 *
 * It stood in `creature:veil` on VERSUS, decided 11 September 2026: the owner
 * kept ANVIL (`veil-mass.ts`) and said "move the versus alternatives all to
 * 'Shapes' page". It sits in this package, beside the record it once patched,
 * because it is written against this package's internals; nothing on the
 * field imports it, and the game's bundle drops it. The argument it made,
 * from its VERSUS card:
 *
 * `creature:veil` / `vortex` — the cloud is a storm seen from a little above:
 * three arms of vapour winding into a dark eye on a turning disc.
 *
 * **What the shipped side is.** Nine heaps on a mass that turns, and the mass
 * is a ball. A ball is the honest shape for a cumulus, and it is also the shape
 * with the least to say about *which way* it turns: heaps come forward and go
 * back, and the eye has to hold two frames to know the sense of it.
 *
 * **What this argues.** That the one cloud in the game with lightning on the
 * beat is a *storm*, and a storm has a picture of its own — the spiral, seen
 * from above, that every satellite frame of one shows. The shapes page's part
 * is `spore-cluster` — *five grains at five sizes, each on its own drift* —
 * and here forty-two grains are strung along three arms of a spiral that
 * winds a turn and a half into the middle. The arms lie on a **disc seen from
 * a little above**: the same projection every placed surface in this
 * repository uses, with the axis stood up so `facet`'s toward-us coordinate
 * becomes screen height — the near half of the disc lower and the far half
 * higher — and the disc turns on the shipped six-beat clock, so the two sides
 * of the pair turn together and the grains on the near half sweep one way
 * while the grains on the far half sweep the other. That opposition is the
 * whole cue: it is what a turning ring looks like and what nothing flat can
 * do.
 *
 * A grain on the near half is broad and bright and takes the crest where it
 * squares to the key; a grain on the far half is small and dim and seen
 * through the ones in front. The arms brighten toward the eye, as an eyewall
 * does, and the eye itself is left the shipped gradient's own dark — the
 * hole a storm has in the middle, and on player one's screen the place the
 * body inside is easiest to read.
 *
 * **How it can lose.** *It reads as a whirlpool and not as a cloud.* The rim
 * player two finds this body by is a cumulus outline, flat underneath and
 * heaped on top, and a spiral inside it may argue with the silhouette round
 * it — a hurricane in a cloud-shaped window. The grains are soft and the disc
 * is squashed for that reason, and if the two still read as two things, the
 * pile inside the pile was the right cloud.
 */

/** Three arms, and how many grains along each. */
const ARMS = 3;
const GRAINS = 14;
/** How many turns an arm makes from the rim to the eye. */
const TURNS = 1.5;
/** How far out the outermost grain sits, and how much wider than tall the disc
 * is drawn — the cloud is a flat thing. */
const REACH = 0.82;
const WIDE = 1.25;
/** The disc seen from above: how much of its depth becomes screen height. */
const TILT = 0.62;
/** Where the disc's centre sits, in shares of the reach: a little above the
 * cloud's own centre, because the cloud is taller above it than below. */
const LIFT = -0.1;
/** The eye: how far in the innermost grain stops, as a share of `REACH`. */
const EYE = 0.16;
/** A grain's radius as a share of the cloud's reach, at the rim and at the eye. */
const GRAIN_RIM = 0.21;
const GRAIN_EYE = 0.13;
/** How many beats one turn takes: the shipped heaps' six (`veil-mass.ts`). */
const TURN_BEATS = 6;
/** What a grain keeps of its light turned away from the key. */
const DIM = 0.3;
/** The crest a grain takes squared to the key — `veil.ts`'s `EDGE`. */
const CREST = "#A79EE8";

/** Every grain, pinned once at its own longitude and reach along the arm;
 * `facet` places it per frame. The latitude is nought — a disc is the equator
 * and nothing else. */
const PINS = Array.from({ length: ARMS }, (_, a) =>
  Array.from({ length: GRAINS }, (_, g) => {
    const s = g / (GRAINS - 1);
    const reach = REACH * (EYE + (1 - EYE) * s);
    return { pin: pin((a / ARMS) * Math.PI * 2 + s * TURNS * Math.PI * 2, 0, reach), s };
  }),
).flat();

export function vortex(d: VeilMassDraw): void {
  const { ctx, r, path, beats } = d;
  const theta = (beats / TURN_BEATS) * Math.PI * 2;
  const crest = d.haze(CREST);

  ctx.save();
  ctx.globalAlpha = d.seeThrough ? 0.66 : 1;
  ctx.clip(path);
  ctx.fillStyle = d.bottom;
  ctx.fill(path, "nonzero");

  // Far half of the disc first, then the near half over it.
  for (const near of [false, true]) {
    for (let i = 0; i < PINS.length; i++) {
      const g = PINS[i];
      if (!g) continue;
      const f = facet(g.pin, theta);
      if (f.near !== near) continue;
      // Toward the eye the grains are brighter and closer together, as an
      // eyewall is; each breathes on its own count, off the beat.
      const inward = 1 - g.s;
      const breath = 1 + 0.12 * Math.sin(beats * 1.0 + i * 1.7);
      const lit = surfaceDim(DIM, f.lit);
      const hex = near
        ? mixHex(d.top, crest, lit * (0.45 + 0.55 * inward))
        : mixHex(d.top, crest, 0.15 * inward);
      const rad = r * (GRAIN_RIM + (GRAIN_EYE - GRAIN_RIM) * inward) * breath * (near ? 1 : 0.75);
      ctx.save();
      // The disc: `facet`'s across coordinate is screen x, and its toward-us
      // coordinate is screen y — near is low — which is a ring seen from above.
      ctx.translate(f.x * r * WIDE, LIFT * r + f.sx * r * TILT * REACH);
      ctx.scale(1, 0.72);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
      grad.addColorStop(0, rgba(hex, near ? 1 : 0.7));
      grad.addColorStop(0.6, rgba(hex, near ? 0.8 : 0.4));
      grad.addColorStop(1, rgba(hex, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}
