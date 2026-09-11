import { SVG } from "../skins/types.js";
import { at, GYRE_TURN, inside, nucleus, organelle } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * VORTEX — the inside is a throat, not a ball.
 *
 * It was `creature:gyre` / `vortex` on VERSUS. The owner took ORBIT on
 * 10 September 2026 and said he liked all of them and wanted the rest kept
 * here, *to create new upcoming enemies with this inside effect*.
 *
 * ## What it says
 *
 * The fluid is seen from above and a little in front, and it goes *down*: five
 * terraces, each deeper than the last, each darker, each drawn higher on the
 * picture than the one outside it because a viewer looking down into a funnel
 * sees its far wall. Three arms of light spiral down the terraces at the
 * body's rate and faster as they get deeper, which is what fluid going down a
 * hole does and what a pattern going round a disc never does. The nucleus
 * sits at the bottom of the throat, the thing everything is drawn toward.
 *
 * The depth cue is the funnel's own asymmetry: an arm on the far wall is seen
 * face-on and bright, and the same arm half a turn later is on the near wall,
 * foreshortened and dimmed by the lip in front of it — one period of
 * brightness per turn laid over the arms' own three-fold pattern.
 *
 * Not `facet`, on purpose: that is a sphere turning about a vertical axis seen
 * from the side, and a funnel is a surface of revolution about an axis pointing
 * *at* the viewer and tipped away, which is a different projection.
 */

const TERRACES = 5;
/** How far the innermost terrace has dropped, as a share of the radius, and
 * how far an ellipse across the throat is flattened. */
const DROP = 0.3;
const TILT = 0.56;
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";
const MOUTH = 0.9;
const THROAT = 0.2;
const ARMS = 3;
/** Extra turns the bottom of an arm has made over the top of it. */
const TWIST = 1.6;
const STEPS = 14;
const NUCLEUS = 0.13;

/** Where a point on the throat's wall lands: `t` is depth, 0 at the mouth and
 * 1 at the bottom; `a` its bearing round the axis. `near` is 1 on the far
 * wall, seen face on, and 0 on the near wall behind the lip. */
function wall(r: number, t: number, a: number): { x: number; y: number; near: number } {
  const rho = r * (MOUTH - (MOUTH - THROAT) * t);
  const sinA = Math.sin(a);
  return { x: Math.cos(a) * rho, y: sinA * rho * TILT - t * r * DROP, near: 0.5 - 0.5 * sinA };
}

function ellipse(r: number, t: number, fill: string, alpha: number): SVGEllipseElement {
  const rho = r * (MOUTH - (MOUTH - THROAT) * t);
  const e = document.createElementNS(SVG, "ellipse");
  e.setAttribute("cx", "0");
  e.setAttribute("cy", (-t * r * DROP).toFixed(2));
  e.setAttribute("rx", rho.toFixed(2));
  e.setAttribute("ry", (rho * TILT).toFixed(2));
  e.setAttribute("fill", fill);
  e.setAttribute("fill-opacity", alpha.toFixed(3));
  return e;
}

export const VORTEX: Filling<"vortex"> = {
  id: "vortex",
  label: "VORTEX",
  hint: "the middle is a throat — five terraces going down, three arms of light spiralling into it faster as they go, the nucleus at the bottom",
  build(ctx: FillingContext) {
    const g = inside(ctx, "vortex");
    const r = organelle(ctx);
    const body = at(ctx.centre.x, ctx.centre.y);
    g.appendChild(body);

    // The terraces, outermost first: the mouth is the fluid's lit surface and
    // every terrace inside it is a step down into shadow. A hole is dark at
    // the bottom.
    for (let i = 0; i < TERRACES; i++) {
      const t = i / (TERRACES - 1);
      body.appendChild(i === 0 ? ellipse(r, t, ctx.colour, 0.3) : ellipse(r, t, SHADOW, 0.34));
    }
    // Each terrace's far lip catches the light; the near edge is the
    // underside of a step — the one thing that separates these from a target.
    for (let i = 0; i < TERRACES; i++) {
      const t = i / (TERRACES - 1);
      const rho = r * (MOUTH - (MOUTH - THROAT) * t);
      const ry = rho * TILT;
      const cy = -t * r * DROP;
      const a0 = Math.PI * 1.1;
      const a1 = Math.PI * 1.9;
      const lip = document.createElementNS(SVG, "path");
      lip.setAttribute(
        "d",
        `M${(Math.cos(a0) * rho).toFixed(2)} ${(cy + Math.sin(a0) * ry).toFixed(2)} A${rho.toFixed(2)} ${ry.toFixed(2)} 0 0 1 ${(Math.cos(a1) * rho).toFixed(2)} ${(cy + Math.sin(a1) * ry).toFixed(2)}`,
      );
      lip.setAttribute("fill", "none");
      lip.setAttribute("stroke", ctx.colour);
      lip.setAttribute("stroke-opacity", (0.45 * (1 - 0.6 * t)).toFixed(3));
      lip.setAttribute("stroke-width", (ctx.weight * (i === 0 ? 1.4 : 0.9)).toFixed(3));
      body.appendChild(lip);
    }

    // The arms: one line per step, since each step has its own brightness.
    const arms: SVGLineElement[][] = [];
    for (let k = 0; k < ARMS; k++) {
      const steps: SVGLineElement[] = [];
      for (let i = 1; i <= STEPS; i++) {
        const l = document.createElementNS(SVG, "line");
        l.setAttribute("stroke", ctx.colour);
        l.setAttribute("stroke-linecap", "round");
        l.setAttribute("stroke-width", (ctx.weight * (2.2 - 1.2 * (i / STEPS))).toFixed(3));
        body.appendChild(l);
        steps.push(l);
      }
      arms.push(steps);
    }

    body.appendChild(nucleus(ctx, r, NUCLEUS, -r * DROP + r * 0.06));

    const step = (t: number): void => {
      const flow = t * GYRE_TURN;
      for (let k = 0; k < ARMS; k++) {
        const base = flow + (k * Math.PI * 2) / ARMS;
        let prev = wall(r, 0, base);
        const steps = arms[k] ?? [];
        for (let i = 1; i <= STEPS; i++) {
          const d = i / STEPS;
          const p = wall(r, d, base + d * d * TWIST * Math.PI * 2);
          const l = steps[i - 1];
          if (l) {
            l.setAttribute("x1", prev.x.toFixed(2));
            l.setAttribute("y1", prev.y.toFixed(2));
            l.setAttribute("x2", p.x.toFixed(2));
            l.setAttribute("y2", p.y.toFixed(2));
            l.setAttribute("stroke-opacity", ((0.4 + 0.6 * p.near) * (1 - 0.4 * d)).toFixed(3));
          }
          prev = p;
        }
      }
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
