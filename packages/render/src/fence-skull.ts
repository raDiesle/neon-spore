import { halo, strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The skull the current draws over the dome when the wall above it is shut.**
 *
 * A fence is answered by the column alone, and the pair's one confirmation is
 * negative: the arcs between the wire and the dome *stop* when the dome is
 * standing in a way through (`fence-arc.ts`). That is a good ending and a poor
 * warning — a fan of bolts is what this creature looks like all the way down,
 * so a fan of bolts over a shut column looks exactly like a fan of bolts over
 * one nobody has answered yet. The owner asked for the danger to be said out
 * loud: *show some skull made of electricity between the lightning animations
 * when the shield is below a fence without a gap, some tile above the shield —
 * this should indicate that it is dangerous and should be prevented.*
 *
 * So this: a skull struck out of the same current, hanging a tile over the
 * dome, in the wall's own blue with a white-hot rim. It is **not a body** and
 * it is not drawn like one — no contour out of `blobPath`, no lobes — because
 * it is the current making a shape rather than a thing standing in the field.
 *
 * **It flashes between the strikes rather than sitting there.** The bolts are
 * struck at `STRIKE_HZ` and this comes and goes at a fraction of that, so it
 * is caught in the gaps of the fan the way a face is caught in lightning. A
 * sign that stayed lit would become furniture in about two waves, and the pair
 * would stop reading it exactly when a wall was over them.
 *
 * **It says the column and nothing else.** Everything about it is placed off
 * the dome, so it is the same skull over every shut column on every wall — it
 * cannot tell the navigator *which way* to move, which is the pilot's sentence
 * and the whole of the creature.
 */

/** How wide the skull is, in tiles. About one: big enough to be read at a
 * glance on a phone, small enough to sit between the wire and the dome without
 * covering either. */
const WIDTH = 1.05;

/** Times a second the whole sign comes and goes, and the share of each cycle it
 * is lit for. Slower than the bolts, so it is a face in the flashes. */
const BLINK_HZ = 2.6;
const LIT = 0.55;

/** Times a second the jag is struck again — the bolts' own rate, so the skull
 * is made of the same material as the fan around it. */
const STRIKE_HZ = 22;

/** How far a point strays from the drawn outline, as a share of the width. */
const JITTER = 0.055;

/**
 * How bright the sign is right now, 0 when it is between flashes. Exported so
 * the caller can skip the whole draw on the dark half of the blink rather than
 * paying for a path it is about to draw at zero alpha.
 */
export function skullFlash(time: number): number {
  const phase = (((time * BLINK_HZ) % 1) + 1) % 1;
  if (phase > LIT) return 0;
  // Up fast and down slow inside the lit half, so it strikes rather than
  // breathes.
  const t = phase / LIT;
  return Math.min(1, Math.sin(Math.PI * t) * 1.4);
}

/** One point of the skull, in the unit square, jittered on the strike clock. */
function jag(x: number, y: number, seed: number, strike: number): [number, number] {
  return [x + signedHash(seed, 1, strike) * JITTER, y + signedHash(seed, 2, strike) * JITTER];
}

/** A closed run of jittered points, as a path in unit space. */
function run(
  pts: readonly (readonly [number, number])[],
  strike: number,
  seed: number,
  close: boolean,
  cx: number,
  cy: number,
  size: number,
): Path2D {
  const path = new Path2D();
  pts.forEach(([px, py], i) => {
    const [jx, jy] = jag(px, py, seed + i, strike);
    const x = cx + jx * size;
    const y = cy + jy * size;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  if (close) path.closePath();
  return path;
}

/** The cranium and cheeks, as one closed contour in unit space. */
const CRANIUM = [
  [-0.5, 0.02],
  [-0.46, -0.28],
  [-0.3, -0.46],
  [0, -0.52],
  [0.3, -0.46],
  [0.46, -0.28],
  [0.5, 0.02],
  [0.32, 0.16],
  [0.26, 0.3],
  [-0.26, 0.3],
  [-0.32, 0.16],
] as const;

/** The jaw hanging under it. Nearly as wide as the cheeks it hangs from: a
 * narrower one read as a neck at the size this is drawn on a phone. */
const JAW = [
  [-0.3, 0.28],
  [-0.27, 0.52],
  [0.27, 0.52],
  [0.3, 0.28],
] as const;

/** One eye socket, on the left; the right one is this mirrored. */
const SOCKET = [
  [-0.32, -0.2],
  [-0.12, -0.22],
  [-0.09, -0.02],
  [-0.24, 0.05],
  [-0.34, -0.06],
] as const;

/** The nose, a wedge between the sockets. */
const NOSE = [
  [0, -0.06],
  [0.07, 0.1],
  [-0.07, 0.1],
] as const;

/**
 * The sign itself, centred on `cx`/`cy`. `force` is the fan's own nearness, so
 * the warning grows with the thing it is warning about.
 */
export function drawFenceSkull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cx: number,
  cy: number,
  force: number,
  time: number,
): void {
  const flash = skullFlash(time);
  if (flash <= 0) return;
  const size = l.tile * WIDTH;
  const strike = Math.floor(time * STRIKE_HZ);
  const alpha = flash * (0.55 + 0.45 * force);

  ctx.save();
  ctx.globalAlpha = alpha;
  // The dark behind it, so the sockets read as holes rather than as two more
  // lines, and so the bolts already drawn between the wire and the dome do not
  // run straight through the face. The wall's own deep violet, the shade a cut
  // column is scorched in.
  ctx.fillStyle = "#150632";
  ctx.fill(run(CRANIUM, strike, 0, true, cx, cy, size));
  ctx.fill(run(JAW, strike, 40, true, cx, cy, size));

  const wide = Math.max(1.6, l.tile * 0.045);
  const fine = Math.max(1.2, l.tile * 0.03);
  strokeGlow(ctx, run(CRANIUM, strike, 0, true, cx, cy, size), PALETTE.arc, wide, 1.6);
  strokeGlow(ctx, run(JAW, strike, 40, true, cx, cy, size), PALETTE.arc, wide, 1.4);
  // The sockets and the nose in the hot white, which is what makes the shape
  // resolve into a face rather than into a knot of current.
  const mirror = SOCKET.map(([x, y]) => [-x, y] as const);
  for (const [i, eye] of [SOCKET, mirror].entries()) {
    strokeGlow(ctx, run(eye, strike, 60 + i * 20, true, cx, cy, size), PALETTE.arcRim, fine, 1.4);
  }
  strokeGlow(ctx, run(NOSE, strike, 100, true, cx, cy, size), PALETTE.arcRim, fine, 1.2);
  // The teeth: four ticks across the jaw, struck on the same clock.
  const teeth = new Path2D();
  for (let i = 1; i < 5; i++) {
    const x = cx + (-0.28 + (0.56 * i) / 5) * size;
    teeth.moveTo(x, cy + 0.28 * size);
    teeth.lineTo(x, cy + (0.48 + signedHash(i, 7, strike) * 0.04) * size);
  }
  strokeGlow(ctx, teeth, PALETTE.arcRim, fine, 1);
  halo(ctx, cx, cy, size * 0.9, PALETTE.arc, 0.35 * alpha);
  ctx.restore();
}
