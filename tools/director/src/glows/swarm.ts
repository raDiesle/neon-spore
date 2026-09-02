import { SVG } from "../skins/types.js";
import type { Glow } from "./types.js";

/**
 * One soft cloud under the whole figure, rather than a halo per body.
 *
 * This is the cheapest thing on the axis and, in the source, the strongest —
 * which is why it was built before the per-body ones rather than after. `docs/tower-defence.md`'s "Three more frames" section
 * reads the finding: Neon Pulsefire's twenty green squares are not twenty
 * glows, they are **one** soft green cloud with twenty hard outlines punched
 * into it. The per-body version of that look is the expensive one *and* the
 * weaker one.
 *
 * What it can say that nothing else here can is **group**. A column of falling
 * slicks has never had a way to read as one thing, and a cloud they share is
 * it. On a single card that reading is only half visible — a lone body under a
 * cloud is a body under a cloud — so this card is a proposal that has to be
 * finished by imagining four of them. Say so in the switcher line rather than
 * letting a reader judge it as if it were HALO.
 *
 * Static: no `onFrame`, nothing mutated, one ellipse and one gradient. It
 * ignores the contour entirely, which is the point — a cloud that followed the
 * silhouette would be HALO with extra steps.
 */
/** How far past the body the cloud reaches, as a multiple of its half-extent. */
const CLOUD = 1.34;

export const SWARM: Glow<"swarm"> = {
  id: "swarm",
  label: "SWARM",
  hint: "one soft cloud the whole group would share, not a halo per body — imagine four of these",
  layer: "under",
  spread: CLOUD - 1,
  build(ctx) {
    const grad = document.createElementNS(SVG, "radialGradient");
    grad.setAttribute("id", `${ctx.uid}-swarm`);
    for (const [offset, alpha] of [
      ["0%", "0.55"],
      ["45%", "0.28"],
      ["100%", "0"],
    ] as const) {
      const s = document.createElementNS(SVG, "stop");
      s.setAttribute("offset", offset);
      s.setAttribute("stop-color", ctx.colour);
      s.setAttribute("stop-opacity", alpha);
      grad.appendChild(s);
    }
    ctx.defs.appendChild(grad);

    const cloud = document.createElementNS(SVG, "ellipse");
    cloud.setAttribute("cx", String(ctx.centre.x));
    cloud.setAttribute("cy", String(ctx.centre.y));
    cloud.setAttribute("rx", String((ctx.extent.w / 2) * CLOUD));
    cloud.setAttribute("ry", String((ctx.extent.h / 2) * CLOUD));
    cloud.setAttribute("fill", `url(#${ctx.uid}-swarm)`);
    cloud.setAttribute("stroke", "none");
    ctx.body.appendChild(cloud);
  },
};
