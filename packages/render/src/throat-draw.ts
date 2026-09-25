import type { Point } from "@neon-spore/content";
import type { SimConfig, ThroatState } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";
import { drawEversion, evertedRings } from "./throat-evert.js";
import { paintBand, paintLimp, paintTube } from "./throat-flesh.js";
import { drawThroatGrips } from "./throat-grip.js";
import { drawThroatLock } from "./throat-lock.js";
import { drawMouth } from "./throat-mouth.js";
import { drawThroatReceipt } from "./throat-receipt.js";
import { type Ring, rings } from "./throat-shape.js";

/**
 * THE THROAT, drawn: a gullet of ring muscles hanging from the top of the
 * frame, narrowing to a mouth one column wide that walks its own row.
 *
 * **The silhouette is the health bar** (`docs/spec/bosses.md` §11.0), and on
 * this boss it is the whole of it: a ring a gum has choked goes slack for good,
 * loses its tension and hangs limp inside the tube, so how many taut muscles
 * are left is how many gums the fight still needs. There is no bar and no
 * count. A tube whose rings have all gone is one that cannot hold its own shape
 * and sags across the field, which is the last picture before it everts.
 *
 * **Both screens draw the same gullet**, and the split of this fight is in what
 * is *said* about it: the navigator alone is told which column the mouth will
 * be in on its next inhale and how long until that beat (`throat-lock.ts`).
 * Nothing about the tube as it stands right now is kept from either seat — the
 * mouth's column this beat is what a fling is judged against, and a picture
 * that hid it from the seat who owns the fling would be a boss with no answer
 * at all.
 *
 * **`crowded` goes quiet on the count while a body is held**, `throatCinched`'s
 * reason applied to the other readout: `PRESS FIRE` on a body standing in the
 * mouth and `HOLD BRAKE` on one climbing under it both stand close enough to
 * the mouth's own row that `NEXT INHALE` had nowhere left to sit — the label
 * and the word landed on top of each other, on the one screen that ever draws
 * both (queue, 20 September 2026). A word already answering the beat is the
 * count answered too, so the readout stepping aside for it loses nothing the
 * pair did not already have.
 *
 * **Grey, except the lip.** Shots pass straight through the tube and no hand
 * can take hold of it (`sim/throat.ts`), so the body of it is `rock` — THE
 * VANE's arm and THE BATON's spine, and the honest colour for a mechanism
 * nothing can be fired at. `throat-mouth.ts` argues the one exception.
 *
 * Nothing here is held between frames. Every number comes off the boss and the
 * beat (`throat-shape.ts`), so a restart cannot show this fight the last
 * one's gullet. The one thing handed in is the blow of a choked ring — how
 * red the skin still shows (`boss-blows.ts`); its shake is the caller's.
 */

/** How far past a ring the skin between two of them bows outward. */
const SKIN_BOW = 0.14;

export function drawThroat(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
  time: number,
  /** Whether the throat is holding a body right now — `boss-cue-read-k.ts`'s
   * own question, asked again here for `drawThroatLock`'s reason. */
  crowded: boolean,
  hurt = 0,
): void {
  // The eversion feeds the tube through its own mouth, so the gullet above
  // shortens from the top as it goes: the rings still to come through are the
  // ones left, and they keep their own stations (`throat-evert.ts`). Drawn
  // first, under the lip, so a ring on its way out passes behind it.
  const through = b.phase === "everts" ? Math.floor(evertedRings(cfg, b, beat, beatPhase)) : 0;
  if (b.phase === "everts") drawEversion(ctx, l, cfg, b, beat, beatPhase, time);

  const shape = rings(l, cfg, b, beat, beatPhase).slice(through);
  if (shape.length > 0) {
    // Two rings or more, or there is no *between* for the skin to be: a lone
    // ring left at the end of the eversion drew a flat line across the field,
    // which the last frames of it made plain.
    if (shape.length > 1) drawSkin(ctx, l, shape, time, hurt);
    // Top down, so a ring's band sits over the skin above it and the gullet
    // reads as a stack of muscles seen from outside rather than as a ladder of
    // hoops. The top one is the gullet's opening.
    for (const [i, ring] of shape.entries()) drawRing(ctx, l, ring, time, i === 0);
  }
  drawMouth(ctx, l, cfg, b, beat, beatPhase, time);
  // The two hands the gullet hands out as it loses, over the tube and the
  // lip they are taken on and under the readout, which is words
  // (`throat-grip.ts`).
  if (b.phase !== "everts") drawThroatGrips(ctx, l, cfg, b, beat, beatPhase, time);
  drawThroatLock(ctx, l, cfg, b, beat, beatPhase, time, crowded);
  // What the last thing into the mouth did, on both screens (`throat-receipt.ts`).
  drawThroatReceipt(ctx, l, cfg, b, beat, beatPhase);
}

/**
 * The tube between the rings: one closed shape down each side, bowing out
 * between one ring and the next.
 *
 * Filled against the background rather than left open, for `docs/alive.md`'s
 * reason — a mechanism the field shows through is a mechanism with a hole in
 * it — and dark, so a taut ring reads as a highlight on a body and not as a
 * wire in space. A wet streak runs down its lit side (`throat-flesh.ts`).
 */
function drawSkin(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  shape: Ring[],
  time: number,
  hurt: number,
): void {
  const left: Point[] = [];
  const right: Point[] = [];
  const lit: Point[] = [];
  for (let i = 0; i < shape.length; i++) {
    const ring = shape[i];
    if (ring === undefined) continue;
    // A slow breathing sway, a hair's width, off the frame clock rather than
    // the world's — the baton's spine does the same so a hanging thing is not
    // a ruled line. It is the same on both screens because `time` is a frame
    // clock and never a rule.
    const sway = Math.sin(time * 0.7 + i * 0.6) * l.tile * 0.02;
    left.push({ x: ring.x - ring.rx + sway, y: ring.y });
    right.push({ x: ring.x + ring.rx + sway, y: ring.y });
    lit.push({ x: ring.x - ring.rx * 0.5 + sway, y: ring.y + ring.ry });
    const next = shape[i + 1];
    if (next === undefined) continue;
    const my = (ring.y + next.y) / 2;
    const mr = ((ring.rx + next.rx) / 2) * (1 + SKIN_BOW);
    const mx = (ring.x + next.x) / 2 + sway;
    left.push({ x: mx - mr, y: my });
    right.push({ x: mx + mr, y: my });
  }
  const skin = splinePath([...left, ...right.reverse()], true);
  paintTube(ctx, skin, splinePath(lit, false), l.tile);
  drawHurt(ctx, skin, hurt);
}

/**
 * One ring muscle.
 *
 * Three states rather than two: a taut ring is a lit band of muscle, a taut ring with
 * the gulp in it has its crest lit in the hull's rim for the beat the
 * contraction is passing through, and a slack one is a dark limp band **drawn
 * inside its own station** — the design's *hangs limp inside the tube*, which
 * is also the only way a spent muscle can still be seen to be there. A ring
 * simply left out would make a choked gullet look shorter rather than weaker.
 */
function drawRing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  ring: Ring,
  time: number,
  mouth: boolean,
): void {
  const band = { ...ring, tile: l.tile, time, mouth };
  if (ring.slack > 0) paintLimp(ctx, band);
  else paintBand(ctx, band);
}
