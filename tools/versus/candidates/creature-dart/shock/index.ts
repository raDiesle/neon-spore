import { dartHex, dartThrust } from "../../../../../packages/render/src/dart.js";
import * as dartLook from "../../../../../packages/render/src/dart-look.js";
import { torchJet } from "../../../../../packages/render/src/dart-torch.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { dartHeading } from "../../../../../packages/sim/src/dart.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:dart` / `shock` — the flame has **structure inside it**: three
 * bright knots strung down its axis, the way a thrust that is actually pushing
 * something does.
 *
 * **What the shipped side is.** A flame in three passes — a dim wide envelope,
 * the body colour, a hot narrow core — each a smooth gradient from the nozzle
 * to nothing. It is a good flame and it is completely even: whatever the eye
 * lands on inside it looks the same as everywhere else, so the shape reads but
 * the *volume* does not.
 *
 * **What this argues.** That the one thing an exhaust has that a smear does not
 * is a repeating mark. Three knots sit along the axis at fixed fractions of the
 * reach, each smaller and dimmer than the one before it, and each breathes on
 * its own clock — a fifth of a cycle apart, which is the difference between
 * three lamps and a flame. The shipped plume is drawn underneath, untouched, so
 * this is the same silhouette with an interior rather than a second flame.
 *
 * The reach, the heat, the direction and the flicker are all the shipped ones
 * (`dart-torch.ts`) and are asked for rather than restated: a candidate that
 * changed how far a dart's flame goes would be arguing about the rule under the
 * cover of arguing about the picture.
 *
 * **How it can lose.** *It reads as a string of beads.* Three round marks in a
 * line is exactly what a chain of bubbles looks like, and a dart is a small
 * body — at the width the field draws one, the knots may be four pixels apart
 * and stop being inside the flame at all. Watch it against THE STRAND, whose
 * whole creature is bodies threaded on a line: if a dart's exhaust starts
 * rhyming with a thread of beads, that is fatal rather than fixable.
 */

/** Where the knots sit along the flame, as shares of the reach, and how big
 * each is as a share of the body radius. Nearest is biggest: a thrust is
 * hottest where it leaves the nozzle and everything after that is cooling. */
const KNOT_AT = [0.22, 0.46, 0.72] as const;
const KNOT_SIZE = [0.34, 0.24, 0.15] as const;

/** Radians per beat each knot breathes at, and how deep. Three rates that are
 * not multiples of one another, so the knots never pulse together — parts that
 * breathe on the same beat read as one flat object. */
const PULSE_RATE = [23, 31, 41] as const;
const PULSE = 0.26;

/** The shipped reach curve, called rather than re-derived: a flame that is its
 * own length is a second copy of `dart-torch.ts`' arithmetic. */
const REACH_BASE = 0.9;
const REACH_HEAT = 2.1;
/** The body radius the exhaust is measured in, which is `dart-torch.ts`' own. */
const BODY = 0.4;

export const DART_SHOCK: Variant = {
  slot: "creature:dart",
  name: "shock",
  sentence:
    "three bright knots strung down the flame, each breathing on its own clock — an exhaust with something happening inside it instead of one even gradient",
  dir: "tools/versus/candidates/creature-dart/shock",
  patches: [
    patch({
      target: dartLook.DART_LOOK,
      // No accessor: `creatures.ts` reads the export itself, once per dart per
      // frame. The module namespace is the whole route there is.
      reached: () => dartLook.DART_LOOK,
      where: {
        file: "packages/render/src/dart-look.ts",
        symbol: "DART_LOOK",
        type: "DartLook",
      },
      fields: {
        jet: (ctx, l, c, x, y, beatPhase) => {
          // The shipped flame first and whole. What this candidate argues is
          // what is *in* it, so replacing it would be arguing two things.
          torchJet(ctx, l, c, x, y, beatPhase);
          const heat = dartThrust(c, beatPhase);
          if (heat <= 0.01) return;
          const dir = dartHeading(c);
          const r = l.tile * BODY;
          const reach = r * (REACH_BASE + REACH_HEAT * heat);
          // Back up the diagonal the body is running down — a direction and
          // not a distance, which is why it is a unit vector rather than the
          // two constants that say how far a run goes.
          const bx = -dir * Math.SQRT1_2;
          const by = -Math.SQRT1_2;
          const hex = dartHex(c);
          for (let i = 0; i < KNOT_AT.length; i++) {
            const at = KNOT_AT[i] ?? 0;
            const size = KNOT_SIZE[i] ?? 0;
            const rate = PULSE_RATE[i] ?? 0;
            const beat = 1 + PULSE * Math.sin(beatPhase * rate + c.id + i);
            const along = reach * at;
            // The body's own colour under a narrow pale centre: the same two
            // lights every other glow in this game is made of, and the pale one
            // is gone within a fifth of the mark.
            halo(ctx, x + bx * along, y + by * along, r * size * beat, hex, heat * 0.55);
            halo(
              ctx,
              x + bx * along,
              y + by * along,
              r * size * beat * 0.4,
              PALETTE.sparkDim,
              heat * 0.5,
            );
          }
        },
      },
    }),
  ],
};
