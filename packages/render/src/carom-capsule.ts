import { METEOR } from "@neon-spore/content";
import { beaconPulse, drawFacets, headingAngle, plate } from "./carom-facet.js";
import type { CrustDraw } from "./carom-look.js";
import { beacon, chevron, emberLip, rivet, scorched, shieldShare } from "./carom-marks.js";

/**
 * CAPSULE — FACET pointed along its heading, marked the way a capsule is.
 *
 * The restrained one of the three. The faces are FACET's, but the stone no
 * longer rolls: its nose is on the diagonal it walks, so the same face goes
 * first all the way across and turns over at the wall. The nose face and
 * half of each shoulder are the shield — soot-dark, warmed by the ember, with
 * the ember burning along the nose's edge. The four rear faces carry the
 * rescue stripe on their outer ring only: dark, white, white, dark, so the
 * band is symmetric about the tail and flips clean at the wall. A rivet
 * stands at every ridge vertex, and the beacon sits on the tail vertex,
 * small, flashing the body's colour on the beat. The bevel stays plain plate.
 *
 * **How it can lose.** *A stripe on a three-pixel ring is a dotted line.*
 * The outer ring is a quarter of the radius, so at 26 px each band is a few
 * pixels; if the stripe reads as noise on the rim rather than as livery,
 * `lifeboat` is the answer, not this.
 */
export function capsule(d: CrustDraw): void {
  const angle = headingAngle(d.dir);
  const pulse = beaconPulse(d.beat);
  drawFacets(
    d,
    angle,
    (f, ring) => {
      const lit = ring === "outer" ? f.outerLit : f.innerLit;
      const shield = shieldShare(f, METEOR.sides);
      if (shield > 0) return scorched(plate(lit), d.ember, shield);
      if (ring === "outer" && f.i >= 2 && f.i <= 5) return chevron(f.i === 3 || f.i === 4, lit);
      return plate(lit);
    },
    (ctx, faces) => {
      for (const f of faces) emberLip(ctx, f, d.ember, shieldShare(f, METEOR.sides));
      for (const f of faces) rivet(ctx, f.ridgeA, d.r, f.outerLit);
      const tail = faces[4];
      if (tail) beacon(ctx, { x: tail.rimA.x * 0.9, y: tail.rimA.y * 0.9 }, d.r, d, pulse);
    },
  );
}
