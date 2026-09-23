import { blobRadiusMul, type Point } from "@neon-spore/content";
import { midCol, type SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawFang, drawTearLip, drawTearMass } from "./reprise-flesh.js";
import { splinePath } from "./spline.js";

/**
 * THE REPRISE, drawn: the top edge of the field torn open, the wave that has
 * just come down still inside it, and one tooth in the tear for every body it
 * has not given back yet.
 *
 * **It is the only thing either seat is shown while an echo runs.** The bodies
 * are drawn nowhere — not on the field, not on the radar, not as a siren
 * (`sim/reprise.ts`, `unseen.ts`, `radar-blip.ts`) — so everything the pair has
 * to play off is here: *how many are still owed*, and *one has just gone*.
 * Nothing else may be, and the two things most obviously missing are missing on
 * purpose:
 *
 * - **No colour.** It is the rock grey every mechanism in this game wears
 *   (`vane-draw.ts`). A red tooth for a red body would hand the navigator half
 *   of what they were supposed to have remembered, and the half that is hardest
 *   to hold.
 * - **No column.** It hangs dead centre and does not move sideways for
 *   anything. A swallow is the same picture whichever column the body it just
 *   sent is falling down.
 *
 * **It is a tear and not a body**, and the difference is the whole of the
 * drawing. The shape started as the draft `tools/shape-sheet` offers at the
 * *Reverse wave* idea — THE BREACH, a torn hole with something rising in it —
 * turned over, since the owner replaced that design with this one on 16
 * September 2026 and a wave sent again comes from where waves come from. Drawn
 * as one closed contour it read as a slug with two eyes, which is the failure
 * `forms/anchored.ts` warns about in as many words: the moment a shape encloses
 * an area it starts reading as a creature. So the rim is **an open stroke along
 * the field's own top edge**, torn and lifted at both ends, drawn over the dark
 * the mouth holds — and the count hangs *from* that line rather than sitting
 * inside the body, where a row of marks is a row of teeth and never a face.
 *
 * Nothing here is held between frames except the swallow, which is the one fact
 * a count read fresh cannot carry (`reprise-fx.ts`).
 */

/** Half the tear's width, in tiles: three columns across, which is the widest
 * thing at the top of the field that is still obviously not the field. */
const HALF = 1.35;

/** How far the mouth hangs below the tear at rest, in tiles. */
const DEEP = 0.72;

/** The dark the tear holds, as a closed contour: the field's top edge across
 * the top, and a lobed mass hanging below it. `rise` is how far it is pushed
 * down through the opening. */
function mouthPoints(px: number, y0: number, w: number, deep: number, t: number): Point[] {
  const N = 26;
  const pts: Point[] = [{ x: px - w, y: y0 }];
  for (let i = 1; i < N; i++) {
    const a = Math.PI * (i / N);
    const m = blobRadiusMul(a, 3, 0.07, 0.03, t, 9.4);
    pts.push({ x: px - Math.cos(a) * w * m, y: y0 + Math.sin(a) * deep * m });
  }
  pts.push({ x: px + w, y: y0 });
  return pts;
}

/** The tear itself, as an open stroke: flat along the field's top edge, lifted
 * and flared out of it where it was torn. A hole with a clean edge reads as a
 * door and a hole with a torn one reads as damage, which is the whole claim
 * this shape makes about where the wave went. */
function tearPoints(px: number, y0: number, w: number, lift: number): Point[] {
  return [
    { x: px - w * 1.34, y: y0 - lift * 1.15 },
    { x: px - w * 1.1, y: y0 - lift * 0.35 },
    { x: px - w * 0.86, y: y0 },
    { x: px, y: y0 + lift * 0.12 },
    { x: px + w * 0.86, y: y0 },
    { x: px + w * 1.1, y: y0 - lift * 0.35 },
    { x: px + w * 1.34, y: y0 - lift * 1.15 },
  ];
}

/**
 * **The middle of the mouth the tear holds open**, for the one word this boss
 * says to the navigator (`boss-cue-read-s.ts`).
 *
 * Exported rather than spelled a second time in the reading, which is
 * `vane-grip.ts`'s arrangement for `vaneBearingY` and for its reason: a mark
 * worked out twice is a mark standing where the picture is not. The place is
 * the *rest* pose deliberately — the middle column, half the mouth's depth
 * below the field's own top edge — and it does not take `swallow` or `open`,
 * because a frame that breathed with the tear would be the count's own
 * movement said a second time, and a cue is a reading of `World` and never of
 * `Effects`.
 *
 * It does not move sideways for anything, which is the whole reason a word may
 * stand here at all: the tear hangs on `midCol` whichever column the body it
 * has just sent is falling down.
 */
export function repriseTearCenter(l: Layout, cfg: SimConfig): { x: number; y: number } {
  return { x: tileCX(l, midCol(cfg)), y: l.gridTop + l.tile * DEEP * 0.5 };
}

/**
 * **The whole fixture** — the torn edge's flared tips across the top and the
 * mass hanging below them — for a caption pointed at this boss
 * (`caption-anchor-boss-f.ts`).
 *
 * The *rest* pose, for `repriseTearCenter`'s reason above and one more: the
 * clench and the breath are read off `swallow` and `Effects`, and a ring that
 * breathed with the tear would be the count's own movement said twice. The
 * width is the tear's rather than the mouth's, because the tear is the
 * silhouette — `tearPoints` runs out to `w * 1.34` on either side.
 */
export function repriseTearBox(
  l: Layout,
  cfg: SimConfig,
): { x: number; y: number; rx: number; ry: number } {
  const at = repriseTearCenter(l, cfg);
  return { x: at.x, y: at.y, rx: l.tile * HALF * 1.34, ry: l.tile * DEEP * 0.5 };
}

export function drawReprise(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  echoing: boolean,
  left: number,
  swallow: number,
  time: number,
): void {
  const px = tileCX(l, midCol(cfg));
  // The field's own top edge, and not a line above it: what is torn open is
  // the place every wave in this game arrives through.
  const y0 = l.gridTop;
  // **Open exactly while there is a body owed**, and all but shut the rest of
  // the time: the pair can tell from the silhouette alone whether the field in
  // front of them is a field they can see. A swallow keeps it open past the
  // last body of a stretch — the echo takes itself off on that beat
  // (`closeEcho`), and a mouth that shut on the same frame would take the one
  // twitch that matters most with it.
  const open = echoing || swallow > 0;
  // A swallow clenches the tear and pushes the mass down through it, which is
  // one gesture read twice: narrower across, longer down. The slow term under
  // it is the mouth breathing, so a mechanism with nothing to do is still alive
  // and a pair who looked away for a beat can find it again.
  const w = l.tile * HALF * (1 - 0.08 * swallow);
  const deep =
    l.tile * DEEP * (open ? 1 : 0.12) * (1 + 0.07 * Math.sin((time / 5.5) * Math.PI * 2)) +
    l.tile * 0.34 * swallow;

  const mouth = splinePath(mouthPoints(px, y0, w, deep, time), true);
  drawTearMass(ctx, mouth, px, y0, w, deep);
  // A dim edge on the mass, so it reads as something held in the opening
  // rather than as a shadow the tear happens to be lying on.
  strokeGlow(ctx, mouth, PALETTE.dim, STROKE.inner, open ? 0.55 : 0.3);

  if (open) drawOwed(ctx, l, px, y0, w, left, swallow);

  // Last, and over the dark it holds: the tear is the silhouette, and a rim
  // painted under the mass it opens on is a rim the eye never finds.
  const rim = tearPoints(px, y0, w, l.tile * (open ? 0.42 : 0.18));
  drawTearLip(ctx, rim, px, l.tile, open);
  const tear = splinePath(rim, false);
  strokeGlow(ctx, tear, PALETTE.rock, STROKE.outline * 1.4, open ? 0.9 : 0.5);
}

/**
 * **The count, as a shape and never as a digit.** One tooth in the tear for
 * every body the running echo still has to send, and a tooth goes with the
 * body it stood for — so the row shortens as the echo plays and the pair reads
 * *three left* off a length rather than off a number (`beatbox-count.ts` is the
 * precedent, and says why a row can tell a pair things a body cannot).
 *
 * The one that has just gone is drawn on its way out rather than taken off
 * between two frames: without it a swallow is a clench with nothing to explain
 * it, and the pair would be told a body had arrived and left to work out for
 * themselves that this was what the count did.
 */
function drawOwed(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  px: number,
  y0: number,
  w: number,
  left: number,
  swallow: number,
): void {
  const shown = left + (swallow > 0 ? 1 : 0);
  if (shown === 0) return;
  // A stretch is as long as its author wrote it, so the row has no ceiling of
  // its own: the teeth close up instead, which keeps the whole count in the
  // tear at any length and leaves a short one — the count about to matter —
  // spaced where it reads at a glance.
  const step = Math.min(l.tile * 0.4, (w * 1.5) / shown);
  const x0 = px - (step * (shown - 1)) / 2;
  const long = l.tile * DEEP * 0.82;
  const half = Math.min(step * 0.3, l.tile * 0.1);
  for (let i = 0; i < shown; i++) {
    // The last tooth is the one going, and it goes by shortening and dimming
    // together — one that only faded would still be a mark in the row at the
    // moment the pair is counting what is left.
    const going = swallow > 0 && i === shown - 1;
    const f = going ? swallow : 1;
    const x = x0 + step * i;
    const tipY = y0 + long * (0.2 + 0.8 * f);
    drawFang(ctx, x, y0 + l.tile * 0.04, tipY, half, going ? f : 1);
    const tooth = new Path2D();
    tooth.moveTo(x, y0 + l.tile * 0.04);
    tooth.lineTo(x, tipY);
    strokeGlow(ctx, tooth, PALETTE.rock, STROKE.inner, 0.5, going ? f : 1);
  }
}
