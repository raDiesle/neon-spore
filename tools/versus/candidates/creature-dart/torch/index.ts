import { DART_LOOK } from "../../../../../packages/render/src/dart-look.js";
import { patch, type Variant } from "../../../variant.js";
import { torchJet } from "./paint.js";

/**
 * `creature:dart` / `torch` — the plume turned round, so it reads as something
 * burning rather than as something pointing.
 *
 * What the game draws today is a filled triangle: its base is against the
 * body's tail and its apex is a tile away in the dark. That is the profile of
 * a **beam**. It is widest where it starts, its two long edges are hard, and
 * it ends in a point — which is what a lance, a laser and every aimed thing in
 * this game looks like, and the one thing a dart's thrust must not be
 * confused with. A dart is not shooting; it is being thrown.
 *
 * TORCH swaps the two ends. The flame leaves the tail narrow, opens into a
 * belly a third of the way back, and frays. Its far half is not an outline at
 * all — the fill is a gradient along the plume's own axis and it reaches zero
 * before the shape closes, so what ends the flame is the flame running out. A
 * dimmer, wider copy of the same path sits under it as an envelope, which is
 * where the soft edge comes from, and the near-white root stays exactly where
 * it is: the hottest part of a flame is where it leaves the thing it is
 * pushing.
 *
 * **The rule is untouched and that is the whole discipline of it.** The heat
 * comes from `dartThrust`, the direction from `dartHeading`, and the length
 * from the shipped `0.9 + 2.1 · heat`. A candidate that lengthened the plume
 * or lit it a beat earlier would be arguing about the creature under cover of
 * arguing about its picture; every number below the belly is a width or an
 * alpha.
 *
 * How it can lose, and both ways are the same objection from opposite ends.
 * **A soft flame may not read at all at 26 px** — the shipped triangle is
 * crude precisely because a hard edge survives being small, and a gradient
 * that fades into the field is the first thing a phone throws away. And **the
 * flicker may fight the lean**: the body already tips toward the diagonal it
 * is taking, and a plume whose length breathes seven per cent at six cycles a
 * beat could read as a second, smaller signal beside it rather than as one
 * body under thrust. The pair at tempo settles both; nothing else can.
 */
export const DART_TORCH: Variant = {
  slot: "creature:dart",
  name: "torch",
  sentence:
    "a flame that leaves the tail narrow, bellies out and frays into nothing — an exhaust, where the shipped plume is a hard-edged spike pointing away",
  dir: "tools/versus/candidates/creature-dart/torch",
  patches: [
    patch({
      target: DART_LOOK,
      // `creatures.ts` reads the export itself, so the module's own record is
      // the whole route there is — `variant.ts` on where a namespace is the
      // honest answer.
      reached: () => DART_LOOK,
      where: {
        file: "packages/render/src/dart-look.ts",
        symbol: "DART_LOOK",
        type: "DartLook",
      },
      fields: { jet: torchJet },
    }),
  ],
};
