import { METEOR } from "../../../../../packages/content/src/index.js";
import {
  beaconPulse,
  drawFacets,
  headingAngle,
  plate,
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

/**
 * LIFEBOAT — the whole hull is livery, and the beacon throws a flash.
 *
 * The loud one. Every face behind the shield is a band of the rescue stripe
 * running from the silhouette down to the glass — outer ring and bevel in one
 * colour, so the stripe reads as a band across a solid and not as a rim
 * pattern: white, dark, white, white, dark, white round from one shoulder to
 * the other, symmetric about the tail. The shield is the nose face alone,
 * scorched hard, with the ember lip along it. Two rivets per face sit along
 * the ridge. The beacon is larger and on the beat it throws a cone of the
 * body's colour off the tail, the flash a rescue light makes.
 *
 * **How it can lose.** *Too much on a tile.* A band on every face and a
 * flash every beat is a lot of picture for twenty-six pixels that also have
 * to show a colour through a window; if the eye goes to the stripes and not
 * to the glass, this loses to `capsule`.
 */
export function lifeboat(d: CrustDraw): void {
  const angle = headingAngle(d.dir);
  const pulse = beaconPulse(d.beat);
  const light = new Set([1, 3, 4, 6]);
  drawFacets(
    d,
    angle,
    (f, ring) => {
      const lit = ring === "outer" ? f.outerLit : f.innerLit;
      if (f.i === 0) return scorched(plate(lit), d.ember, 1);
      return chevron(light.has(f.i), lit);
    },
    (ctx, faces) => {
      for (const f of faces)
        emberLip(ctx, f, d.ember, f.i === 0 ? 1 : 0.35 * shieldShare(f, METEOR.sides));
      for (const f of faces) {
        if (f.i === 0) continue;
        const a = {
          x: f.ridgeA.x * 0.7 + f.ridgeB.x * 0.3,
          y: f.ridgeA.y * 0.7 + f.ridgeB.y * 0.3,
        };
        const b = {
          x: f.ridgeA.x * 0.3 + f.ridgeB.x * 0.7,
          y: f.ridgeA.y * 0.3 + f.ridgeB.y * 0.7,
        };
        rivet(ctx, a, d.r, f.outerLit);
        rivet(ctx, b, d.r, f.outerLit);
      }
      const tail = faces[4];
      if (!tail) return;
      const at = { x: tail.rimA.x * 0.92, y: tail.rimA.y * 0.92 };
      // The flash: a cone of the body's colour thrown back off the tail, only
      // while the pulse is up.
      const flash = Math.max(0, pulse - 0.25) / 0.75;
      if (flash > 0) {
        const reach = d.r * (0.8 + 0.8 * flash);
        ctx.beginPath();
        ctx.moveTo(at.x, at.y);
        ctx.lineTo(at.x - reach, at.y - reach * 0.55);
        ctx.lineTo(at.x - reach, at.y + reach * 0.55);
        ctx.closePath();
        ctx.fillStyle = rgba(d.glow, 0.35 * flash);
        ctx.fill();
      }
      beacon(ctx, at, d.r, d, pulse, 0.15);
    },
  );
}
