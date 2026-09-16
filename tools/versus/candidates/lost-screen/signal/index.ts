import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { veil, words } from "./paint.js";

/**
 * `lost:screen` / `signal` — the picture itself fails: the whole screen breaks
 * into fourteen torn bands slipping sideways against each other, and the band
 * the hull's own line is in is left open over the breach column.
 *
 * **What the shipped side is.** A flat grey veil and a card of type, for
 * `breach-hole`'s reasons.
 *
 * **What this argues.** That the loudest thing available here is the medium
 * rather than the message. The other two answers put something *on* the screen
 * — a shaft of dark, a pair of plates — and this one claims the screen is what
 * broke. It is the only one whose picture keeps moving: the bands re-tear six
 * times a second, so it never settles into a card, which is exactly what a
 * screen the pair is meant to talk over rather than dismiss wants.
 *
 * **How it can lose.** A picture that never settles is a picture two people
 * have to talk across, and this one jitters the heading as well. It is also
 * the one answer here that says nothing about the ship at all — a fault in the
 * display is not a hole in a hull.
 */
export const LOST_SIGNAL: Variant = {
  slot: "lost:screen",
  name: "signal",
  sentence:
    "the whole screen breaks into fourteen torn bands slipping sideways against each other six times a second — the picture itself failing rather than a card laid over it — with the band the hull's line is in left open over the column it hit",
  dir: "tools/versus/candidates/lost-screen/signal",
  screenshot: { freezeSeconds: 2.5 },
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil, words },
    }),
  ],
};
