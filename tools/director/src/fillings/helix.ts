import { facet, LAT_LIMIT, pin, surfaceDim } from "@neon-spore/content";
import { SVG } from "../skins/types.js";
import { at, GYRE_TURN, inside, organelle } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * HELIX — something coiled is growing inside the ball, and it is winding.
 *
 * It was `creature:gyre` / `helix` on VERSUS. The owner took ORBIT on
 * 10 September 2026 and said he liked all of them and wanted the rest kept
 * here, *to create new upcoming enemies with this inside effect*.
 *
 * ## What it says
 *
 * One strand wound round the inside of the wall from the bottom of the ball
 * to the top — thirty beads on a helix, each pinned at a longitude and a
 * latitude and carried round by the turn, the near ones drawn bright and the
 * far ones seen dimly through the mass, a thread between neighbours on the
 * same side so the strand reads as one thing and breaks where it goes over
 * the limb. The last bead is the head: bigger, brighter, the one thing a
 * nucleus was for.
 *
 * And the strand *creeps*. On top of the turn the coil advances along itself
 * on a slow clock of its own — a bead is born faint at the bottom and fades
 * into the head as it arrives — so it is not a pattern rotating but a thing
 * moving through the fluid. The two clocks are not multiples of each other,
 * so the coil never comes back to the same picture. A helix wound to the
 * number is a spring, and a spring is a made thing; this one sags off a true
 * helix by a little, the way a strand grown round the inside of something does.
 */

const BEADS = 30;
const WINDS = 2.4;
const REACH = 0.7;
const POLE = LAT_LIMIT * 0.95;
const BEAD = 0.07;
const HEAD = 0.16;
/** What a far bead keeps of a near one's light, through the mass, and what a
 * bead keeps where the surface has turned from the light. */
const THROUGH = 0.45;
const FLOOR = 0.45;
/** Seconds for the coil to creep one bead's length along itself. */
const CREEP_SECONDS = 2.9;
const WANDER = 0.11;
const WANDER_TURNS = 3.7;

function bead(s: number) {
  const lat = -POLE + 2 * POLE * s + WANDER * Math.sin(s * WANDER_TURNS * Math.PI * 2);
  return pin(s * WINDS * Math.PI * 2, lat, REACH);
}

function thread(ctx: FillingContext, alpha: number): SVGPathElement {
  const p = document.createElementNS(SVG, "path");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", ctx.colour);
  p.setAttribute("stroke-opacity", alpha.toFixed(3));
  p.setAttribute("stroke-width", (ctx.weight * 0.8).toFixed(3));
  p.setAttribute("stroke-linecap", "round");
  return p;
}

export const HELIX: Filling<"helix"> = {
  id: "helix",
  label: "HELIX",
  hint: "one strand coiled round the inside of the ball, thirty beads on a helix turning with the body and creeping up into a head — a thing moving through the fluid, not marks on it",
  build(ctx: FillingContext) {
    const g = inside(ctx, "helix");
    const r = organelle(ctx);
    const body = at(ctx.centre.x, ctx.centre.y);
    g.appendChild(body);

    // The far side's thread and beads under, the near side's over. Each bead
    // is one circle that is moved between the two layers as it crosses the
    // limb — cheaper than two of everything, and the order is what matters.
    const far = thread(ctx, 0.5 * THROUGH);
    const farBeads = document.createElementNS(SVG, "g");
    const near = thread(ctx, 0.5);
    const nearBeads = document.createElementNS(SVG, "g");
    body.appendChild(far);
    body.appendChild(farBeads);
    body.appendChild(near);
    body.appendChild(nearBeads);
    const beads = Array.from({ length: BEADS + 1 }, () => {
      const c = document.createElementNS(SVG, "circle");
      c.setAttribute("fill", ctx.colour);
      nearBeads.appendChild(c);
      return c;
    });

    const step = (t: number): void => {
      const theta = t * GYRE_TURN;
      const creep = (t / CREEP_SECONDS) % 1;
      let dNear = "";
      let dFar = "";
      let prevNear: string | null = null;
      let prevFar: string | null = null;
      for (let i = 0; i <= BEADS; i++) {
        const isHead = i === BEADS;
        const s = isHead ? 1 : (i + creep) / BEADS;
        const f = facet(bead(s), theta);
        const life = isHead ? 1 : Math.min(1, s * BEADS, (1 - s) * BEADS);
        const keep = (f.near ? 1 : THROUGH) * life;
        const x = f.x * r;
        const y = f.y * r;
        const here = `${x.toFixed(2)} ${y.toFixed(2)}`;
        const c = beads[i];
        if (!c) continue;
        const layer = f.near ? nearBeads : farBeads;
        if (c.parentNode !== layer) layer.appendChild(c);
        c.setAttribute("cx", x.toFixed(2));
        c.setAttribute("cy", y.toFixed(2));
        c.setAttribute(
          "r",
          (r * (isHead ? HEAD : BEAD) * Math.max(0.15, Math.abs(f.sx))).toFixed(2),
        );
        c.setAttribute(
          "fill-opacity",
          ((isHead ? 0.95 : 0.6) * keep * surfaceDim(FLOOR, f.lit)).toFixed(3),
        );
        if (f.near) {
          if (prevNear !== null) dNear += `M${prevNear}L${here}`;
          prevNear = here;
          prevFar = null;
        } else {
          if (prevFar !== null) dFar += `M${prevFar}L${here}`;
          prevFar = here;
          prevNear = null;
        }
      }
      near.setAttribute("d", dNear);
      far.setAttribute("d", dFar);
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
