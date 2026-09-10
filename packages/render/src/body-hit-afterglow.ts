import { hash01 } from "./backdrop.js";
import type { Strike } from "./body-hit.js";
import { mixHex, rgba } from "./hex.js";

/**
 * AFTERGLOW — the nucleus is the last thing to go.
 *
 * The two answers beside this are about material: skin and fluid. This is
 * about **light**, because the slick's interior is a nucleus that sends a
 * bright out along its veins (`body-bloom.ts`), and a body that was doing
 * something with light should die by it. On the beat the skin is gone at
 * once — no petals, no drops — and what is left standing is the nucleus:
 * one core in each sac, swelling and burning hotter over the first third of
 * the strike, its colour pushed from the body's red through the rim colour
 * toward white, with a soft halo of the same. Then each core collapses to a
 * point and lets go of a ring of light that runs outward and thins to
 * nothing. Over all of it the outline the body had hangs as an
 * **afterimage** — the contour stroked once in the rim colour, fading
 * through the whole strike, the way a bright shape stays on the eye after it
 * is gone.
 *
 * It leaves nothing on the ship. The other two both put something on the
 * hull; this one says a slick was mostly light and leaves only the shape of
 * where it was, which is the plainest possible answer to *which creature
 * that was*.
 *
 * Everything is the body's red or that red pushed toward white; nothing here
 * is a second hue, and the shot's colour and the body's are one.
 *
 * **How it can lose.** *A swelling core is a body that is still there.* The
 * cores grow for a third of a second before they collapse, and a pair
 * reading the lane may see a slick that shrank rather than a slick that
 * died. The afterimage is what says *gone* — a stroke with nothing inside
 * it — and the cores are additive light rather than a fill, so they cannot
 * read as a solid. If at 26 px they still do, this loses.
 */

/** The two sacs' cores, as `body-bloom.ts` places them. */
const SACS = [-0.42, 0.42];
/** When the cores let go, as a share of the strike. */
const COLLAPSE_AT = 0.35;
/** How far a released ring runs, as a share of the body. */
const RING_REACH = 1.8;

function contour(ctx: CanvasRenderingContext2D, s: Strike): void {
  ctx.beginPath();
  for (let i = 0; i < s.outline.length; i++) {
    const p = s.outline[i] as { x: number; y: number };
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
}

export function afterglow(ctx: CanvasRenderingContext2D, s: Strike): void {
  const k = Math.min(1, s.age / s.life);
  const r = Math.max(s.rx, s.ry);

  // The afterimage: the outline it had, fading through the whole strike.
  contour(ctx, s);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = rgba(s.rim, 0.9 * (1 - k) * (1 - k));
  ctx.stroke();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < SACS.length; i++) {
    const cx = (SACS[i] as number) * s.rx;
    const jitter = (hash01(s.seed + i) - 0.5) * 0.2 * s.ry;
    const cy = jitter;
    if (k < COLLAPSE_AT) {
      // Swelling and burning: the core grows and its colour goes to white.
      const c = k / COLLAPSE_AT;
      const heat = c * c;
      const core = r * (0.12 + 0.3 * c);
      const hot = mixHex(mixHex(s.hex, s.rim, Math.min(1, heat * 1.4)), "#FFFFFF", heat * 0.6);
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, core * 2.6);
      halo.addColorStop(0, rgba(hot, 0.9));
      halo.addColorStop(0.35, rgba(s.hex, 0.45));
      halo.addColorStop(1, rgba(s.hex, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, core * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hot;
      ctx.beginPath();
      ctx.arc(cx, cy, core, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // The collapse: a point, and a ring of light let go of it.
      const c = (k - COLLAPSE_AT) / (1 - COLLAPSE_AT);
      const ring = r * RING_REACH * (1 - (1 - c) * (1 - c));
      const point = Math.max(0.5, r * 0.42 * (1 - Math.min(1, c * 3)));
      ctx.fillStyle = rgba("#FFFFFF", 1 - Math.min(1, c * 3));
      ctx.beginPath();
      ctx.arc(cx, cy, point, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = Math.max(0.5, r * 0.16 * (1 - c));
      ctx.strokeStyle = rgba(s.rim, 0.9 * (1 - c));
      ctx.beginPath();
      ctx.arc(cx, cy, ring, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = Math.max(0.5, r * 0.06 * (1 - c));
      ctx.strokeStyle = rgba(s.hex, 0.6 * (1 - c));
      ctx.beginPath();
      ctx.arc(cx, cy, ring * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}
