import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { at, disc, inside } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * NUCLEUS — one heavy thing loose in a shell.
 *
 * It was `creature:bulb` / `nucleus`, and the owner sent it here on 9 September
 * 2026 with the other three offered to that body.
 *
 * Where CHAMBERS multiplies the interior, this reduces it to one object and
 * gives that object a *position*: a single dense core, off centre, orbiting
 * slowly inside the body, with a short dark mark on the wall behind it. The
 * body stops being a decorated disc and becomes a shell with something in it —
 * and because the core passes behind the middle and comes back, it reads as
 * hollow rather than as flat.
 *
 * **It is the only value on this axis where one mark occludes another.** The
 * wall mark is drawn first and the core over it, so a near core covers it and a
 * far one does not — a one-line consequence of `facet`'s `near`, and the
 * cheapest depth cue there is.
 *
 * On the row it is the minimum case: everything else here is a population, and
 * this is the argument that one placed object says more than a dozen.
 */

const REACH = 0.46;
const SPIN = 0.5;
const CORE = 0.34;
const DIM = 0.3;
/** How far the wall mark sits behind the core, in radians of its own orbit. */
const LAG = 0.5;

const CORE_PIN: Pin = pin(0, 0.18, 1);
const WALL_PIN: Pin = pin(-LAG, 0.18, 1);

export const NUCLEUS: Filling<"nucleus"> = {
  id: "nucleus",
  label: "NUCLEUS",
  hint: "one dense core orbiting inside the shell, over the mark it has left on the wall behind it",
  build(ctx: FillingContext) {
    const g = inside(ctx, "nucleus");
    const reach = Math.min(ctx.extent.w, ctx.extent.h) * 0.5 * REACH;
    const body = at(0);
    // Order is the whole occlusion: the wall mark goes down first and the core
    // over it, so nothing has to decide anything per frame.
    const wall = disc(reach * CORE * 0.7 * WALL_PIN.cosLat, ctx.colour, 0.35);
    const core = disc(reach * CORE * CORE_PIN.cosLat, ctx.colour, 0.8);
    body.appendChild(wall);
    body.appendChild(core);
    g.appendChild(body);

    const set = (el: SVGGElement, q: Pin, theta: number, fade: number): void => {
      const f = facet(q, theta);
      if (!f.near) {
        el.setAttribute("display", "none");
        return;
      }
      el.removeAttribute("display");
      el.setAttribute(
        "transform",
        `translate(${(f.x * reach).toFixed(2)} ${(f.y * reach).toFixed(2)}) scale(${f.sx.toFixed(4)} 1)`,
      );
      el.setAttribute("opacity", (surfaceDim(DIM, f.lit) * fade).toFixed(3));
    };

    const step = (t: number): void => {
      set(wall, WALL_PIN, t * SPIN, 0.45);
      set(core, CORE_PIN, t * SPIN, 1);
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
