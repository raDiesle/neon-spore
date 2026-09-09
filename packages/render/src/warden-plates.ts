import { surfaceLit, type WardenOpening } from "@neon-spore/content";
import type { SimConfig, WardenState } from "@neon-spore/sim";
import { mixHex, rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE WARDEN's armour, and the only place on the field that says how far in the
 * pair is.
 *
 * Its own file, cut out of `warden.ts` when the skin landed and that file went
 * past its 250-line ceiling. The seam is a real one: next door is the *body* —
 * two contours cut against each other, where the hole is, what it is made of —
 * and this is a **readout**, drawn from a count rather than from a shape, and
 * it is the one part of the boss that has to survive a restart looking the same
 * (`drawPlates` on why the missing plate is chosen by index).
 */

/**
 * Everything the armour is drawn from. `ctx` is in field pixels with no
 * transform of the body's own, so `(cx, cy)` is where the ring stands and `r`
 * is how far it reaches; `cut` is the opening the shot comes up through, and a
 * plate that ignored it would close the way in again with a line two pixels
 * wide.
 */
export interface WardenPlatesDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly cx: number;
  readonly cy: number;
  /** How far the body reaches from its own centre, in pixels. */
  readonly r: number;
  readonly b: WardenState;
  readonly cfg: SimConfig;
  /** The wall clock in seconds. */
  readonly time: number;
  readonly cut: WardenOpening | null;
}

/**
 * How wide the whole ring makes one plate's slot, in radians: a turn split
 * between however many plates the fight was authored with.
 *
 * Exported because the paint at the bottom of this file places its armour by
 * calling it — the plate that is missing is the readout, and a second copy of
 * where a plate goes would be a health bar with two answers.
 */
export function plateArc(cfg: SimConfig): number {
  return (Math.PI * 2) / Math.max(1, cfg.wardenPlates);
}

/** How much of its own slot a plate fills; the rest is the seam to the next. */
export const PLATE_SPAN = 0.76;

/**
 * Where plate `k` starts, this instant. The plate's place follows from its
 * index and never from its order in the ring, which is what makes a gap stay
 * where it was opened across a restart; the sine is the whole of the ring's own
 * motion, a hair of drift at a fifth of a radian a second.
 */
export function plateStart(k: number, arc: number, time: number): number {
  return k * arc + arc * 0.12 + Math.sin(time * 0.2) * 0.01;
}

/**
 * A plate's span with the opening taken out of it, as the pieces that are
 * left. A band of armour drawn across the way in would close the shot lane
 * again with a line two pixels wide, which is all it takes: the player reads
 * the silhouette, not the fill rule.
 */
export function clear(a0: number, a1: number, cut: WardenOpening | null): Array<[number, number]> {
  if (cut === null) return [[a0, a1]];
  const out: Array<[number, number]> = [];
  for (const turn of [-Math.PI * 2, 0, Math.PI * 2]) {
    const m0 = cut.from + turn;
    const m1 = cut.to + turn;
    if (m1 <= a0 || m0 >= a1) continue;
    if (m0 > a0) out.push([a0, m0]);
    a0 = Math.max(a0, m1);
  }
  if (a0 < a1) out.push([a0, a1]);
  return out;
}

/** Where the armour band stands, as shares of the body's radius. The ring it
 * replaced was one arc at 0.94 stroked at `STROKE.outline * 2.2`, so these two
 * are that same band given an inside and an outside rather than a new place to
 * be — the boss's silhouette did not move when the slab arrived. */
const INNER = 0.9;
const OUTER = 0.985;

/** How far a plate stands off the rim, in the same shares — the wall you see
 * because the plate is a slab and not a line. It is small on purpose: a lip a
 * player could measure would change the boss's silhouette, and the silhouette
 * is the readout. */
const LIFT = 0.035;

/** How much of the rock's own value a plate keeps where it faces away from the
 * light. A shadow is cool and never black (`docs/style-guide.md`), so the floor
 * is the body's own dark rather than nothing. */
const FLOOR = 0.16;

/** How far the breath carries a plate, in shares of the radius, and how long it
 * takes. Slow and tiny: a ring of armour that pumped would read as a body
 * breathing, and this is a machine bolted to one. */
const BREATH = 0.008;
const BREATH_RATE = 0.55;

/**
 * The light a plate takes, given the bearing its outer face points along.
 *
 * The face is edge-on to us — it is on the rim of a ring drawn face-on — so its
 * normal lies in the screen plane at that same bearing, which is `surfaceLit`
 * read at latitude `a` with the longitude square to us. That is the projection
 * being *called* at the one case it has for a rim, rather than a dot product
 * written out here from `KEY`'s two components.
 */
function litAt(a: number): number {
  return surfaceLit(Math.cos(a), Math.sin(a), 1, 0);
}

/** One band of armour between two radii, from bearing `s` to bearing `e`. */
function slab(
  cx: number,
  cy: number,
  r: number,
  inner: number,
  outer: number,
  s: number,
  e: number,
): Path2D {
  const p = new Path2D();
  p.arc(cx, cy, r * outer, s, e);
  p.arc(cx, cy, r * inner, e, s, true);
  p.closePath();
  return p;
}

/**
 * THE PLATES, as gaps rather than as a bar: one comes off per opened eye and
 * the gap never fills, so the silhouette says how far in the pair is without a
 * number anywhere on the screen. Which plate is missing follows from its index,
 * so a plate that has gone stays gone in the same place on both screens and
 * across a restart.
 *
 * Each is a slab with a thickness, a wall you can see and a light that stays
 * where the light is.
 *
 * It was one arc stroked in `PALETTE.rock` at a couple of pixels, at one
 * brightness the whole way round, on the biggest body the game ever draws. The
 * owner took BEVEL out of VERSUS on 9 September 2026 and this is it.
 *
 * Four marks per piece, in the order a solid is built: the wall it stands on,
 * the face, the lit edge along its outer rim, and the seam of shadow where it
 * meets the body. `docs/style-guide.md`'s five zones with the cast shadow left
 * out — nothing in this game casts onto anything else, and the reflected light
 * is the last stop inside the face's own ramp rather than a pass of its own.
 */
export function drawPlates(d: WardenPlatesDraw): void {
  const { ctx, cx, cy, r, b, time, cut } = d;
  const arc = plateArc(d.cfg);

  ctx.save();
  ctx.lineCap = "butt";
  for (let k = 0; k < b.plates; k++) {
    const a0 = plateStart(k, arc, time);
    // Each plate breathes on a phase of its own, so the ring reads as a row of
    // separate slabs rather than as one thing scaled up and down.
    const lift = LIFT + BREATH * Math.sin(time * BREATH_RATE + k * 1.3);
    for (const [s, e] of clear(a0, a0 + arc * PLATE_SPAN, cut)) {
      const lit = litAt((s + e) / 2);
      const face = mixHex(PALETTE.rockDark, PALETTE.rock, FLOOR + (1 - FLOOR) * lit);
      const inner = INNER + lift;
      const outer = OUTER + lift;

      // The wall: the same band, sunk back to where the rim is, drawn dark. It
      // is what the eye reads as the height of the slab — the shipped arc has
      // none, which is the whole of what a line is.
      ctx.fillStyle = PALETTE.rockDark;
      ctx.fill(slab(cx, cy, r, INNER - lift * 0.4, outer - lift, s, e));

      // The face.
      ctx.fillStyle = face;
      ctx.fill(slab(cx, cy, r, inner, outer, s, e));

      // The lit edge along the outer rim, and only where the light reaches it:
      // a specular that ran the whole ring would be a light that follows the
      // armour round, which is the failure `docs/dimensional.md` names.
      if (lit > 0.15) {
        ctx.strokeStyle = rgba(PALETTE.text, 0.1 + 0.55 * lit);
        ctx.lineWidth = STROKE.outline * 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, r * outer, s, e);
        ctx.stroke();
      }

      // The seam where the plate meets the body — the contact shadow, without
      // which the whole ring floats a hair off the boss and reads as printed on
      // it. It is darkest where the plate is brightest, which is what a lit
      // solid standing on a surface does.
      ctx.strokeStyle = rgba(PALETTE.background, 0.35 + 0.35 * lit);
      ctx.lineWidth = STROKE.outline;
      ctx.beginPath();
      ctx.arc(cx, cy, r * inner, s, e);
      ctx.stroke();
    }
  }
  ctx.restore();
}
