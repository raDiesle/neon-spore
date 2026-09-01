/**
 * THE VEIL's *form*: the silhouette a cloud has, and the vapour standing
 * around it.
 *
 * Its own file beside `veil.ts` because the two answer different questions.
 * This one is the shape — where the heaps stand, how they breathe, where the
 * bottom edge is, where a bolt can start from — and it is the half a shape
 * tool would want if the cloud ever earns a card. Next door is the *paint*:
 * which colours, how see-through, which seat, and the two seconds of red a
 * wrong shot buys.
 */

/**
 * The billows a cloud is made of: a flat base with four heaps standing on it,
 * as offsets and radii in units of `r`.
 *
 * **Not `blobPath`.** Every other body in this game is a lobed contour and the
 * first version of this was too — seven shallow lobes, on the reasoning that a
 * thunderhead is a stack of billows and a lobe is a billow. It drew a spiky
 * star. A lobed contour has one radius per angle, so its dips are *notches*
 * cut inward from a circle, and a cloud's shape is the opposite: overlapping
 * heaps whose outline is the union of their edges and never dips between them.
 * So this is five subpaths filled as one, which unions them.
 *
 * **Flat underneath and stepped on top, which is what a cloud is.** The
 * previous arrangement was three heaps of roughly equal size on a base that
 * was almost as tall as they were, and it read as a bunch of grapes: the
 * silhouette went up and down twice on the way across. A cloud does not. Its
 * bottom is one straight line — the condensation level, the same height all
 * the way along — and its top is heaps that step up to a shoulder and back
 * down. So the base here is wide and shallow with its centre pushed *down*,
 * the flanking heaps are small, and the two in the middle are the tall ones
 * with the taller one off centre. The eye reads that as weather at a glance
 * and does not have to be told.
 *
 * The union is also why there is no outline stroke in `veil.ts`. Stroking a
 * path with five subpaths draws the seams *inside* the silhouette, which reads
 * as five bubbles rather than one cloud; the rim is a slightly larger copy
 * filled underneath instead.
 */
const BILLOWS: readonly { dx: number; dy: number; r: number; ry?: number }[] = [
  { dx: 0, dy: 0.3, r: 1.02, ry: 0.34 },
  { dx: -0.62, dy: 0.12, r: 0.38 },
  { dx: -0.26, dy: -0.1, r: 0.53 },
  { dx: 0.2, dy: -0.26, r: 0.6 },
  { dx: 0.66, dy: 0.06, r: 0.4 },
];

/** How far the whole shape reaches below its centre — the base's own bottom,
 * which is the flat line a cloud sits on. */
export const VEIL_FLATTEN = 0.64;

/** And how far it reaches *above* it — the tallest heap's own top. What stands
 * over a cloud (`veil-marks.ts`) is lifted clear of this rather than of a
 * number typed beside it, so a reshaped cloud does not leave a ring inside its
 * own weather. */
export const VEIL_TOP = 0.86;

/** How much a heap breathes on the contour clock, and how far it drifts. Both
 * are shared with `cloudEdge` below, which has to land on the same outline the
 * fill draws or a bolt starts in mid-air. */
const SWELL = 0.045;
const DRIFT = 0.02;

function swellOf(i: number, t: number): number {
  return 1 + SWELL * Math.sin(t * 0.8 + i * 1.7);
}

function driftOf(i: number, t: number): number {
  return DRIFT * Math.sin(t * 0.55 + i * 2.3);
}

/**
 * The silhouette, as one path with five subpaths in it — filled `nonzero`, so
 * what comes out is their union and never their outlines. Each heap breathes
 * on the contour clock, slowly and by a couple of percent, which is the same
 * order of movement `blobPath`'s wobble gives every other body in the game.
 */
export function cloudPath(r: number, t: number): Path2D {
  const p = new Path2D();
  for (const [i, b] of BILLOWS.entries()) {
    const swell = swellOf(i, t);
    p.ellipse(
      (b.dx + driftOf(i, t)) * r,
      b.dy * r,
      b.r * r * swell,
      (b.ry ?? b.r) * r * swell,
      0,
      0,
      Math.PI * 2,
    );
  }
  return p;
}

/** A point on the cloud's outline and the direction the shape faces there. */
export interface CloudEdge {
  x: number;
  y: number;
  /** Outward unit normal — where a bolt off this point should go. */
  nx: number;
  ny: number;
}

/**
 * Where on the border, from an angle out of the cloud's own centre.
 *
 * **A ray against the union, not a point on one heap.** The first version
 * picked a billow and an angle round *its* ellipse, which is cheap and wrong:
 * the heaps overlap, so most of any one heap's outline is buried inside its
 * neighbours, and a bolt starting there is a bolt drawn across the middle of
 * the cloud. What the eye wants — and what the owner asked for — is lightning
 * coming off the *edge*, so this casts a ray from the centre and takes the
 * farthest billow it leaves. That point is on the silhouette by construction,
 * whatever the heaps do next door.
 *
 * The normal is the ray itself. A true normal to the union would have to know
 * which billow won and differentiate its ellipse; radial is within a few
 * degrees of that everywhere on a shape this round, and it is never wrong
 * about the important part, which is *outward*.
 *
 * The vertical squash is in the ray, not in the answer: the cloud is about
 * twice as wide as it is tall, so an evenly spread angle would put most of the
 * bolts on the two flanks. `SQUASH` biases the direction back toward the
 * vertical so they land evenly along the outline instead.
 */
const SQUASH = 0.55;

export function cloudEdge(r: number, t: number, angle: number): CloudEdge {
  const dx = Math.cos(angle) * SQUASH;
  const dy = Math.sin(angle);
  const len = Math.hypot(dx, dy) || 1;
  const nx = dx / len;
  const ny = dy / len;

  let far = 0;
  for (const [i, b] of BILLOWS.entries()) {
    const swell = swellOf(i, t);
    const cx = (b.dx + driftOf(i, t)) * r;
    const cy = b.dy * r;
    const rx = b.r * r * swell;
    const ry = (b.ry ?? b.r) * r * swell;
    // Where the ray leaves this ellipse: the far root of the quadratic in the
    // ellipse's own normalised space. `disc < 0` is a billow the ray misses.
    const ax = nx / rx;
    const ay = ny / ry;
    const ox = -cx / rx;
    const oy = -cy / ry;
    const qa = ax * ax + ay * ay;
    const qb = 2 * (ox * ax + oy * ay);
    const qc = ox * ox + oy * oy - 1;
    const disc = qb * qb - 4 * qa * qc;
    if (disc <= 0 || qa <= 0) continue;
    const hit = (-qb + Math.sqrt(disc)) / (2 * qa);
    if (hit > far) far = hit;
  }

  return { x: nx * far, y: ny * far, nx, ny };
}

/**
 * The fog the cloud stands in.
 *
 * It replaces the three wisps that used to fall out of the underside. Those
 * were asked for as "floating downwards" and they read as rain — three blobs
 * detaching on a cycle and sinking is drizzle, whatever colour it is, and this
 * creature is not a weather report: it is a container with a body in it and a
 * clock over it. The owner said take the rain out.
 *
 * What is here instead is the thing rain was standing in the way of. A soft
 * radial haze around the whole shape, drawn *under* it, gives the bolts on the
 * rim something to light: a strike at the left edge now brightens the air to
 * its left instead of stopping dead at the contour, which is the difference
 * between lightning inside a cutout and lightning inside weather. It does not
 * move on its own — it breathes with the beat and nothing else — so it never
 * competes with the count.
 */
export function drawVeilFog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  beats: number,
  hex: string,
  alpha: number,
): void {
  const breath = 1 + 0.05 * Math.sin(beats * Math.PI);
  const outer = r * 1.55 * breath;
  if (outer <= 0 || alpha <= 0.002) return;
  const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, outer);
  g.addColorStop(0, `${hex}5E`);
  g.addColorStop(0.55, `${hex}2A`);
  g.addColorStop(1, `${hex}00`);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, outer, outer * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
