import { dartHex, dartThrust } from "../../../../../packages/render/src/dart.js";
import * as dartLook from "../../../../../packages/render/src/dart-look.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { dartHeading } from "../../../../../packages/sim/src/dart.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:dart` / `braid` — two flames wound round one axis, half a turn
 * apart, so the exhaust twists instead of tapering.
 *
 * **What the shipped side is.** One closed shape: narrow at the nozzle, a belly
 * a third of the way back, a fray at the end. Everything inside it is a
 * gradient along a straight line, so the flame is the same picture on every
 * frame with a slightly different length — the motion is a length changing and
 * nothing else, which is a tween.
 *
 * **What this argues.** That a flame is turbulent, and that the cheapest honest
 * way to say so is to draw it as two ribbons rather than one cone. Each ribbon
 * is sampled along the axis and pushed sideways by a sine of its own distance
 * back, so it winds; the two are half a cycle apart, so where one is out the
 * other is in and the pair crosses four times down the reach. The whole braid
 * turns slowly on the beat, which means a still frame of it is never the same
 * still frame twice — motion that is grown rather than interpolated between two
 * poses.
 *
 * The reach, the heat and the direction are the shipped ones and are asked for
 * (`dart.ts`), so this argues about the picture and not about the rule.
 *
 * **How it can lose.** *It reads as a rope, or as nothing.* Two thin ribbons
 * have far less area than one filled cone, and at the size a dart draws at they
 * may add up to a fainter thrust than the one they replace — which on a
 * creature whose whole tell is *this one is being thrown* is a real loss. And a
 * braid is a shape the game already uses for a thing that is held: THE COIL's
 * tether and THE WARDEN's rope are both wound lines. If a dart's exhaust reads
 * as a cord trailing off it, that is the wrong word entirely.
 */

/** How many samples one ribbon is drawn from. Sixteen: enough that the wind
 * reads as a curve rather than as a zigzag, few enough to stay a gesture. */
const STEPS = 16;

/** How far a ribbon swings off the axis at its widest, as a share of the body
 * radius, and how many full turns it makes over the whole reach. */
const SWING = 0.4;
const TURNS = 1.6;

/** Radians per beat the whole braid rolls at. Slow against the flicker, so what
 * the eye reads is a twist travelling rather than a strobe. */
const ROLL = 9;

/** How wide a ribbon is at the nozzle and at the fray, as shares of the body
 * radius. It thins rather than frays: what ends this flame is the ribbon
 * running out of light, which the gradient does. */
const RIBBON = 0.3;
const RIBBON_END = 0.1;

/** The shipped reach curve and body radius, called rather than restated. */
const REACH_BASE = 0.9;
const REACH_HEAT = 2.1;
const BODY = 0.4;

export const DART_BRAID: Variant = {
  slot: "creature:dart",
  name: "braid",
  sentence:
    "two ribbons of flame wound round one axis half a turn apart and rolling on the beat — a thrust that twists instead of a cone that only gets longer",
  dir: "tools/versus/candidates/creature-dart/braid",
  patches: [
    patch({
      target: dartLook.DART_LOOK,
      reached: () => dartLook.DART_LOOK,
      where: {
        file: "packages/render/src/dart-look.ts",
        symbol: "DART_LOOK",
        type: "DartLook",
      },
      fields: {
        jet: (ctx, l, c, x, y, beatPhase) => {
          const heat = dartThrust(c, beatPhase);
          if (heat <= 0.01) return;
          const dir = dartHeading(c);
          const r = l.tile * BODY;
          const reach = r * (REACH_BASE + REACH_HEAT * heat);
          const hex = dartHex(c);
          // Back up the diagonal the body is running down, and the normal to
          // it — a direction rather than a distance.
          const bx = -dir * Math.SQRT1_2;
          const by = -Math.SQRT1_2;
          const px = -by;
          const py = bx;
          const roll = beatPhase * ROLL + c.id;
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.lineCap = "round";
          for (const side of [0, Math.PI]) {
            for (let i = 0; i < STEPS; i++) {
              const t = i / (STEPS - 1);
              const along = reach * t;
              // The swing dies at the nozzle and opens with distance: a flame
              // leaves the thing it is pushing straight and only breaks up once
              // it is clear of it.
              const swing = SWING * r * t * Math.sin(t * TURNS * Math.PI * 2 + roll + side);
              const cx = x + bx * along + px * swing;
              const cy = y + by * along + py * swing;
              const wide = r * (RIBBON + (RIBBON_END - RIBBON) * t);
              // Alpha falls with distance, which is what ends the flame — the
              // ribbon has no closing outline anywhere.
              const fade = (1 - t) ** 1.4;
              ctx.fillStyle = rgba(hex, heat * 0.8 * fade);
              ctx.beginPath();
              ctx.arc(cx, cy, wide, 0, Math.PI * 2);
              ctx.fill();
              if (t < 0.34) {
                ctx.fillStyle = rgba(PALETTE.sparkDim, heat * 0.55 * fade);
                ctx.beginPath();
                ctx.arc(cx, cy, wide * 0.45, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
          // The root, right at the tail and near-white: the hottest part of a
          // flame is where it leaves the thing it is pushing, and it is the one
          // mark both ribbons share.
          halo(ctx, x + bx * r * 0.22, y + by * r * 0.22, r * 0.3 * heat, PALETTE.sparkDim, heat);
        },
      },
    }),
  ],
};
