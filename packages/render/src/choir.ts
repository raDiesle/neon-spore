import { choirArmed, choirFusePhase } from "@neon-spore/sim";
import { CHOIR_LOOK } from "./choir-look.js";
import { choirMembranePath } from "./choir-shape.js";
import type { Body } from "./creature-body.js";
import { hazed } from "./depth.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * THE CHOIR as it stands before the pilot's gesture: **two rounded bodies in
 * one membrane, inside a single tile**, leaning on each other and drifting.
 *
 * **It is SYMBIOSIS, and this file is on its third draft for getting there.**
 * The first invented a picture — three dots suspended inside a grey membrane.
 * The second read HERALD off the drafts page and made three bodies across
 * three lanes, which the owner rejected in the plainest terms: *I expected
 * shapes like Symbiosis — rounded, 2 shapes, can be in one tile — and when
 * shaking they merge into one, and this one becomes the slick or bulb. Right
 * now you hide with 3 grey blobs what is behind.* So it is **two**, it is
 * **one tile**, and it is **see-through**. `cluster("SYMBIOSIS", "two bodies
 * in one membrane, safe while touching", { bodies: 2, spread: 2.4, floor:
 * 0.12 })` in `tools/shape-sheet/src/drafts/creatures.ts` is the subject, and
 * the two orbit each other there rather than sitting in a row — which is what
 * the angle below is.
 *
 * **It hides nothing behind it.** That was the owner's own complaint about the
 * draft before this one, and it is the reason the skin is a membrane rather
 * than a fill: the grid, the beat flash and anything falling behind read
 * straight through it, and what is solid is the rim. A soap film is what this
 * creature was always described as, and an opaque body was never that.
 *
 * **The grey is the creature, not a placeholder.** Every other body on this
 * field says which trigger answers it the moment it is drawn — that is what
 * `livingKindForColor` and the two ammunition colours are for. This one says
 * nothing, because until the two have drawn together there is no trigger that
 * answers it at all, and a body tinted red would be the field promising player
 * 2 a shot that will bounce. `PALETTE.rock` is the game's own word for
 * *nothing you carry reaches this*.
 *
 * **The outline is the sheet's own trace and not an approximation of it.** Two
 * blob contours drawn over each other read as two bodies with two rims, which
 * is what the draft before this one did and what the owner rejected. A
 * metaball field traced by marching squares is one skin with a waist in it,
 * and it is the same `isoLoops` the shape sheet draws SYMBIOSIS with —
 * `packages/content/src/metaball.ts`, moved there from the tool so that the
 * game and the sheet cannot come to disagree about what this shape is.
 *
 * **No silhouette, and none needed.** Every other living body walks a lobed
 * contour out of `CreatureSilhouette`; this one has no rim of its own at all,
 * because what makes its shape is where two fields add up. A lobed silhouette
 * would also have been a tell — a bulb rim would name cyan before a colour was
 * ever drawn.
 *
 * **Nothing here is drawn after the merge.** The kind changes on the instant
 * and the lane never moves (`sim/choir.ts`), so the thing standing there a
 * frame later is an ordinary slick or bulb in the same column, with an ordinary
 * colour and its own motion, drawn by `drawLiving` like anything else — which
 * is exactly the *one shape like a bulb or a slick* the owner asked for.
 *
 * It takes a `Body` rather than loose arguments because it is a row in
 * `creature-body.ts`'s table and a wrapper for one row is a wrapper that has to
 * be kept in step with the record. The type comes back from that file, which is
 * a type-only cycle and the arrangement `handles.ts` and `touch.ts` stand in.
 */

/**
 * **How lit the pair is, and how much of the body's colour has arrived.**
 *
 * Three states and one number for each, which is the sequence the owner asked
 * for said as arithmetic:
 *
 *  - **Waiting.** Two grey balls, the light they throw is the plain one every
 *    unreachable body throws, and no colour anywhere.
 *  - **Charged**, after the first move — a shake or an arrow. They *glow like
 *    they are preparing to do a reaction*, and the faintest wash of the colour
 *    they are going to become comes into the light. It is a hint and not an
 *    answer: enough for the navigator to start reaching for a trigger, not
 *    enough to read off a still frame.
 *  - **Closing**, after the second. Both go further with `close`, so the more
 *    of the transformation has happened the more of the final colour is there,
 *    and by the time the film is shut the pair is already nearly the colour the
 *    slick or bulb arrives in.
 *
 * The charged state is **the world's, not the body's**: the gesture is made at
 * the field rather than at any one membrane (`choirArmed`), so every one of
 * them lights at once — which is also what the merge does to them.
 */
function choirGlow(b: Body, close: number): { lit: number; tint: string } {
  const armed = choirArmed(b.world) !== null;
  // A charged pair is a third of the way lit before the second move lands, and
  // the closing takes it the rest of the way. `close` alone would leave the
  // window — the part the pilot has to act inside — the one stretch of this
  // creature with no picture on it.
  const lit = close > 0 ? 0.33 + 0.67 * close : armed ? 0.33 : 0;
  // The colour the body is going to be, mixed into the grey by however much of
  // the transformation has happened. A choir with no colour authored has none
  // to arrive, which nothing builds — `authorsColor` is set on the kind.
  const hue = b.c.color === null ? null : b.c.color === "red" ? PALETTE.red : PALETTE.cyan;
  const tint = hue === null ? PALETTE.rock : mixHex(PALETTE.rock, hue, lit * 0.85);
  return { lit, tint };
}

export function drawChoir(b: Body): void {
  const { ctx, l, world, near } = b;
  const haze = (h: string): string => hazed(world.cfg, h, near);
  // **The closing is read off the world, not off a clock this file keeps.**
  // `choirFuseTick` is on the body and in the fingerprint, so how far shut the
  // film is and whether a shot reaches it are one number on both phones — and
  // a run restarted mid-close cannot leave a stale transient behind, because
  // there is no transient. It is the arrangement `veilArmourPhase` already
  // has, and the reason the merge needs nothing in `Effects` at all.
  const close = choirFusePhase(world, b.c);
  const { lit, tint } = choirGlow(b, close);

  // Through a record rather than by painting here, so a second answer to *what
  // a soap film with two bodies in it is made of* can be drawn beside this one
  // at the size it ships at (`choir-look.ts`, `docs/versus.md`).
  CHOIR_LOOK.skin({
    ctx,
    l,
    x: b.x,
    y: b.y,
    time: b.time,
    close,
    lit,
    tint: haze(tint),
    path: choirMembranePath(l, b.x, b.y, b.time, close),
  });
}
