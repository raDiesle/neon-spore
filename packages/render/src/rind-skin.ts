import { smoothstep } from "./ease.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import type { RindShed } from "./rind-look.js";

/**
 * THE SHIPPED SHED — the owner's picture of it: it should look like it is
 * shrinking, hit with a shrink cannon, with a glow explosion around it and the
 * full skin thrown away from the body into the space. A look asked for by
 * name: the first of `CLAUDE.md`'s three exemptions.
 *
 * The paint alone, cut out of `rind-shed.ts` when the shed got a record
 * (`rind-look.ts`) so that a second answer could sit beside this one. Nothing
 * here changed a pixel in the move: `drawShed` runs the two halves in the
 * order the effect always ran them, on the same numbers.
 *
 * **The crush.** The silhouette it was wearing, collapsing onto the body it
 * now is. This is the shrinking, and it is a ghost rather than an ease on the
 * creature for a reason the grip cares about: a rind is grippable and
 * `creatureRadius` is what a thumb is hit-tested against, so a body eased
 * between two sizes is a body drawn at one size and grabbed at another for the
 * length of the ease. The body steps; the outline it left behind moves.
 *
 * **The husk.** The same contour, left where it was and thrown outward — the
 * skin, off the body, into the space around it — thinning and going out as it
 * goes, in a bloom of the body's own colour. It comes apart into plates on the
 * way, so it reads as material rather than as a shockwave.
 *
 * Both start on the same frame from the same outline and go opposite ways: the
 * split is the whole picture.
 */

/** The share of the life the old silhouette takes to fall onto the new one.
 * Short: this is a cannon hit, not a body settling. */
const CRUSH = 0.3;
/**
 * How far past the size it came off at the husk travels, in that size. Under
 * half, and the bound is the field rather than taste: a rind arrives wearing
 * three whole bodies, so its skin is already the widest thing out there, and
 * one that doubled would cover the columns either side. `rind.ts` says the size
 * is a picture of what is left and never a claim on the field — a husk three
 * lanes wide would argue with the number player 1 just said.
 */
const REACH = 0.45;
/** Plates the skin comes apart into on the way out. Enough to read as a
 * surface breaking up, few enough that each one is still a piece. */
const PLATES = 9;

/** One frame of the shipped shed. */
export function drawShed(s: RindShed): void {
  drawCrush(s);
  drawHusk(s);
}

/**
 * The shrinking. The outline of the size it was, falling onto the size it is
 * and fading out as it arrives, so it merges into the body rather than stopping
 * on top of it. `smoothstep` and not a linear fall: a crush that arrives at
 * full speed reads as a cut, and the flat end is what makes the body look like
 * it settled at the smaller size rather than having always been that size.
 *
 * Exported for a candidate that keeps the shrink and argues about the skin:
 * a rind's size is its health bar, and the crush is the picture of it going
 * down a step, which a look about the material coming off has no reason to
 * redraw.
 */
export function drawCrush(s: RindShed): void {
  const { ctx, x, y, path, unit, rim, t, was, now } = s;
  const k = smoothstep(Math.min(1, t / CRUSH));
  if (k >= 1) return;
  const r = was + (now - was) * k;
  const scale = r / unit;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = (1 - k) * 0.75;
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(0.6, r * 0.09) / scale;
  ctx.stroke(path);
  ctx.restore();
}

/**
 * The skin, off the body and into the space around it. Out fast and then
 * slowing — `1 - (1 - t)²` rather than `smoothstep` — because something thrown
 * leaves at its top speed and is spent by the end, which is the opposite shape
 * of curve to the crush above and reads as the opposite event.
 */
function drawHusk(s: RindShed): void {
  const { ctx, x, y, path, unit, hex, t, was } = s;
  const k = 1 - (1 - t) ** 2;
  const r = was * (1 + REACH * k);
  const alpha = (1 - t) ** 1.6;
  // The bloom. Quantised to a quarter of the body it came off: `haloSprite`
  // caches one canvas per (colour, radius), and a radius that grows every
  // frame would mint a fresh one every frame — `glow.ts` says so.
  const step = Math.max(2, was * 0.25);
  halo(ctx, x, y, Math.round((r * 0.85) / step) * step, hex, alpha * 0.5);

  const scale = r / unit;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = hex;
  ctx.globalAlpha = alpha * 0.9;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Thinning as it stretches: the same amount of skin over a bigger contour.
  // Divided by the scale, so the width is in screen pixels and not in a
  // contour's own units, which the transform would otherwise stretch too.
  ctx.lineWidth = Math.max(0.5, was * 0.18 * (1 - k * 0.75)) / scale;
  ctx.stroke(path);
  ctx.restore();

  drawPlates(s, r, alpha);
}

/**
 * The skin breaking up on the way out — short arcs riding just past the husk,
 * each turned by its own amount. Without them the husk is a ring, and a ring
 * expanding out of a body is the grammar this game already spends on a shield
 * failing (`clasp-break.ts`). Plates say *surface*, which is what came off.
 */
function drawPlates(s: RindShed, r: number, alpha: number): void {
  const { ctx, x, y, hex, t, was } = s;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = hex;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(0.6, was * 0.13 * (1 - t * 0.6));
  for (let i = 0; i < PLATES; i++) {
    // Each plate keeps the angle it broke off at and drifts a little past the
    // husk, so the ring never sweeps as one piece.
    const a = (i / PLATES) * Math.PI * 2 + sinHash(i * 7.1) * 0.6;
    const d = r * (1.02 + 0.22 * sinHash(i * 3.7) * t);
    const arc = 0.12 + 0.16 * sinHash(i * 11.3);
    ctx.globalAlpha = alpha * (0.5 + 0.5 * sinHash(i * 2.3));
    ctx.beginPath();
    ctx.arc(x, y, d, a - arc, a + arc);
    ctx.stroke();
  }
  ctx.restore();
}
