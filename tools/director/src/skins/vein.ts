import { auraPass, clipGroup, corePass, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * CORE with filaments under the skin, clipped to the body.
 *
 * The one treatment here that is genuinely *detail* in the sense
 * `docs/spec/graphics.md` forbids, and so the one that actually settles the
 * argument the skin switcher exists to hold.
 */

/**
 * Filaments for one body, in the contour's own units.
 *
 * They **branch**, and that is the whole of it. The first version struck every
 * strand from one point, which is what a radial sample naturally gives you and
 * which reads as a sunburst — a made thing, a wheel — at exactly the moment
 * the word being reached for is *grown*. A vascular texture is not lines from
 * a centre, it is a few trunks that fork, and fork again, each fork thinner
 * and shorter than its parent. Two levels is enough to say it.
 *
 * Everything is seeded from the name, so a shape's skin is its own and is the
 * same on every reload; nothing here is animated, so the texture rides under
 * the membrane with the body instead of crawling on it.
 */
function filaments(name: string, reach: number): string[] {
  const rand = streamFor(name);
  const out: string[] = [];

  /** One strand, walked outward from a point, forking while depth remains. */
  const grow = (x: number, y: number, angle: number, len: number, depth: number): void => {
    // A slight curve per strand: straight is a spoke, curved is a vessel.
    const bend = (rand() - 0.5) * 0.7;
    const mx = x + Math.cos(angle) * len * 0.5;
    const my = y + Math.sin(angle) * len * 0.5;
    const ex = x + Math.cos(angle + bend) * len;
    const ey = y + Math.sin(angle + bend) * len;
    out.push(
      `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    );
    if (depth <= 0) return;
    // Two children, splaying either side of where the parent was heading.
    for (const side of [-1, 1]) {
      if (rand() < 0.25) continue;
      grow(
        ex,
        ey,
        angle + bend + side * (0.4 + rand() * 0.5),
        len * (0.45 + rand() * 0.2),
        depth - 1,
      );
    }
  };

  const trunks = 4 + Math.floor(rand() * 3);
  const originX = (rand() - 0.5) * reach * 0.25;
  const originY = (rand() - 0.5) * reach * 0.25;
  for (let i = 0; i < trunks; i++) {
    const a = (i / trunks) * Math.PI * 2 + rand() * 0.7;
    grow(originX, originY, a, reach * (0.3 + rand() * 0.2), 2);
  }
  return out;
}

function veins(ctx: SkinContext): void {
  const g = clipGroup(ctx);
  for (const d of filaments(ctx.name, ctx.reach)) {
    const f = document.createElementNS(SVG, "path");
    f.setAttribute("d", d);
    f.setAttribute("fill", "none");
    f.setAttribute("stroke", ctx.colour);
    f.setAttribute("stroke-opacity", "0.3");
    f.setAttribute("stroke-width", String(ctx.weight * 0.45));
    f.setAttribute("stroke-linecap", "round");
    g.appendChild(f);
  }
}

export const VEIN: Skin<"vein"> = {
  id: "vein",
  label: "VEIN",
  hint: "filaments under the skin — detail, on purpose",
  build(ctx) {
    fillPass(ctx);
    corePass(ctx);
    veins(ctx);
    auraPass(ctx);
    rimPass(ctx);
  },
};
