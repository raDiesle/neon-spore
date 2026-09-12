import * as look from "../../../../../packages/render/src/countdown-look.js";
import { patch, type Variant } from "../../../variant.js";
import { fuseCount, fuseOver } from "./paint.js";

/**
 * `creature:countdown` / `fuse` — a cord coiled once round the body, burning
 * back toward a cap at twelve with a spark on its end; what is left is the
 * count.
 *
 * **What the shipped side is.** Notches cut into the rim, one gone per beat,
 * and a halo on zero. Still between beats: nothing on the body moves until
 * the beat lands.
 *
 * **What this argues.** That the count should move, and should say *hurry*.
 * A fuse is the one picture everybody already has for "this long left": the
 * burning end crawls round the rim through every beat, a quarter turn a
 * beat, with a spark on it and embers coming off, and the ash behind it
 * shows the whole turn so the length left reads as a share. On zero the cord
 * is gone and the body is lit the shipped way. The cap it runs into is on
 * both screens and never changes; the navigator sees a disc with a nub.
 *
 * **How it can lose.** *A spark is a second thing to look at on every
 * frame.* Embers on a body that is not the one being shot may pull the eye
 * on a field two people are reading, and a cord outside the rim makes the
 * body a third wider than its column says it is.
 */
export const COUNTDOWN_FUSE: Variant = {
  slot: "creature:countdown",
  name: "fuse",
  sentence:
    "a cord coiled once round the body outside the rim, burning back toward a cap at twelve with a spark and embers on its end — a quarter turn a beat — and the body lit on zero",
  dir: "tools/versus/candidates/creature-countdown/fuse",
  patches: [
    patch({
      target: look.COUNTDOWN_LOOK,
      reached: () => look.COUNTDOWN_LOOK,
      where: {
        file: "packages/render/src/countdown-look.ts",
        symbol: "COUNTDOWN_LOOK",
        type: "CountdownLook",
      },
      fields: { over: fuseOver, count: fuseCount },
    }),
  ],
};
