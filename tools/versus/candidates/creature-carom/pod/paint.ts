import { METEOR } from "../../../../../packages/content/src/index.js";
import {
  beaconPulse,
  drawFacets,
  headingAngle,
  plate,
  quad,
  RIDGE,
} from "../../../../../packages/render/src/carom-facet.js";
import type { CrustDraw } from "../../../../../packages/render/src/carom-look.js";
import {
  beacon,
  chevron,
  emberLip,
  rivet,
  scorched,
  shieldShare,
} from "../../../../../packages/render/src/carom-marks.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * POD — the stripe is the hatch ring, and the beacon stands on a mast.
 *
 * The one that keeps the hull plain. The outer faces are bare plate with a
 * row of rivets along the ridge — a vertex and a mid-face each — so the
 * plating reads as built rather than as cut. The rescue stripe goes on the
 * bevel instead: fourteen segments, two to a face, white and dark by turns
 * all the way round, which is the ring a hatch wears and puts the livery
 * where the eye already is — beside the glass. The shield is the nose and
 * half of each shoulder, scorched, with an ember crescent standing just
 * inside the nose's edge. The beacon is on a short mast off the tail, out
 * past the silhouette, flashing on the beat: a capsule's antenna light.
 *
 * **How it can lose.** *A striped ring round a lit window is a target.* If
 * the alternating bevel reads as a bullseye drawing the eye off the colour
 * in the glass, or a mast a fifth of a radius long is lost at 26 px, the
 * stripe belongs on the hull and this loses.
 */
export function pod(d: CrustDraw): void {
  const angle = headingAngle(d.dir);
  const pulse = beaconPulse(d.beat);
  const step = (Math.PI * 2) / METEOR.sides;
  drawFacets(
    d,
    angle,
    (f, ring) => {
      const lit = ring === "outer" ? f.outerLit : f.innerLit;
      return scorched(plate(lit), d.ember, shieldShare(f, METEOR.sides));
    },
    (ctx, faces) => {
      // The hatch ring: each bevel face cut in two, white then dark, shaded
      // by the face it sits on, the shield's segments left scorched.
      const ridge = d.r * RIDGE;
      for (const f of faces) {
        if (shieldShare(f, METEOR.sides) >= 1) continue;
        const a0 = f.bearing - step / 2;
        const mid = f.bearing;
        const a1 = f.bearing + step / 2;
        ctx.fillStyle = chevron(true, f.innerLit);
        ctx.fill(quad(a0, mid, ridge, d.glass));
        ctx.fillStyle = chevron(false, f.innerLit);
        ctx.fill(quad(mid, a1, ridge, d.glass));
      }
      for (const f of faces) {
        rivet(ctx, f.ridgeA, d.r, f.outerLit);
        const mid = {
          x: (f.ridgeA.x + f.ridgeB.x) / 2,
          y: (f.ridgeA.y + f.ridgeB.y) / 2,
        };
        rivet(ctx, mid, d.r, f.outerLit);
      }
      for (const f of faces) emberLip(ctx, f, d.ember, shieldShare(f, METEOR.sides));
      // The crescent just inside the nose: the shield's own heat.
      ctx.beginPath();
      ctx.arc(0, 0, d.r * 0.88, -step * 0.9, step * 0.9);
      ctx.strokeStyle = rgba(d.ember, 0.5);
      ctx.lineWidth = STROKE.inner;
      ctx.stroke();
      // The mast and its light, off the tail.
      const tail = faces[4];
      if (!tail) return;
      const base = { x: tail.rimA.x * 0.96, y: tail.rimA.y * 0.96 };
      const tip = { x: tail.rimA.x * 1.22, y: tail.rimA.y * 1.22 };
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.strokeStyle = d.metal;
      ctx.lineWidth = STROKE.inner;
      ctx.lineCap = "round";
      ctx.stroke();
      beacon(ctx, tip, d.r, d, pulse, 0.1);
    },
  );
}
