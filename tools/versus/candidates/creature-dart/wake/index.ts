import { dartHex, dartThrust } from "../../../../../packages/render/src/dart.js";
import * as dartLook from "../../../../../packages/render/src/dart-look.js";
import { torchJet } from "../../../../../packages/render/src/dart-torch.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { dartHeading } from "../../../../../packages/sim/src/dart.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:dart` / `wake` — the flame is the shipped one, and behind it the
 * body leaves a **trail of cooling embers down the lane it came from**.
 *
 * **What the shipped side is.** A flame a tile long, and then nothing. A dart
 * crossing the field is a lit shape with no history: the frame it is on says
 * where it is and says nothing about where it has been, which on the fastest
 * thing in the game is the one fact both seats are trying to read.
 *
 * **What this argues.** That a thrown body should be legible from its trail —
 * that a pair should be able to answer *which way is it going* from a still
 * frame, and answer it from the field rather than from the arrow on the strip.
 * Eight embers hang back up the diagonal, each smaller and dimmer than the one
 * in front, spaced widening apart so the trail thins as it goes rather than
 * stopping. They are placed off the body's own position and heading and hold no
 * state of their own — nothing here remembers a previous frame, so a dart that
 * is restarted has no tail to clear (CLAUDE.md on `Effects`).
 *
 * The flame itself is the shipped one, drawn whole and untouched: this argues
 * about what a dart leaves behind and not about what its thrust looks like, and
 * a pair judging it against `braid` should know the two are answering different
 * questions.
 *
 * **How it can lose.** *The lane fills up.* A dart's run crosses most of the
 * field, and a wave may send several; eight marks each is a lot of light in
 * lanes the pair also has to read a colour out of. Watch it on the wave where
 * darts arrive together — if the trails start reading as a body, or as the
 * beam THE LANCE leaves, the creature has borrowed a word that is already
 * taken.
 */

/** How many embers hang behind the body, how far back the last one sits as a
 * share of the flame's own reach, and how the spacing opens as it goes.
 * Widening rather than even: a trail that thins reads as one that is being
 * left, and an evenly spaced one reads as a drawn line. */
const EMBERS = 8;
const TAIL = 3.4;
const SPREAD = 1.5;

/** How big the nearest ember is as a share of the body radius, and what is left
 * of that at the far end. */
const SIZE = 0.3;
const SIZE_END = 0.08;

/** The shipped reach curve and body radius, called rather than restated. */
const REACH_BASE = 0.9;
const REACH_HEAT = 2.1;
const BODY = 0.4;

export const DART_WAKE: Variant = {
  slot: "creature:dart",
  name: "wake",
  sentence:
    "the shipped flame, and behind it eight cooling embers down the lane the body came from — a dart you can read the heading of from one still frame",
  dir: "tools/versus/candidates/creature-dart/wake",
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
          const dir = dartHeading(c);
          const r = l.tile * BODY;
          const reach = r * (REACH_BASE + REACH_HEAT * heat);
          const hex = dartHex(c);
          const bx = -dir * Math.SQRT1_2;
          const by = -Math.SQRT1_2;
          // The trail first, under the flame: the newest part of a wake is the
          // part the flame is still standing in.
          for (let i = 0; i < EMBERS; i++) {
            const t = (i + 1) / EMBERS;
            const along = reach * TAIL * t ** SPREAD;
            const fade = (1 - t) ** 1.6;
            // It survives a beat with no thrust in it, faintly. A dart's heat
            // comes and goes on its own clock (`dartThrust`), and a trail that
            // vanished with the flame would flash rather than trail.
            const lit = 0.22 + 0.78 * heat;
            halo(
              ctx,
              x + bx * along,
              y + by * along,
              r * (SIZE + (SIZE_END - SIZE) * t),
              hex,
              0.42 * fade * lit,
            );
          }
          torchJet(ctx, l, c, x, y, beatPhase);
        },
      },
    }),
  ],
};
