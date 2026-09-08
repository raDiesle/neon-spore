import { SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * Four short bars lying **across** the line behind the body, shrinking and
 * fading with age — the track a thing is on, not a mark on the thing.
 *
 * It was `creature:dart` / `wake` on VERSUS, offered against that creature's
 * plume, and the owner moved it here on 8 September 2026 rather than deciding
 * it. That is the right address for it and always was: VERSUS asks *which of
 * these two for this creature*, and what this value actually proposes is a way
 * for **anything** falling down a column to say it is travelling. This axis is
 * the only page in the project where that question is asked of every body at
 * once.
 *
 * ## Bars, and not a line down the middle
 *
 * Every other proposal here draws the path: the ribbon, the streak, the wedge.
 * This one draws the *rungs* of it. Each bar is a place the body has already
 * been, so distance from the body is age, and the far ones are shorter,
 * thinner and dimmer — a track receding rather than a ladder painted on the
 * field.
 *
 * It is also the only one that leaves **gaps**. `docs/tower-defence.md` reads
 * off Neon Pulsefire that separating dots are what say speed, and this is that
 * claim drawn at a body's own scale rather than a projectile's — a ribbon says
 * *followed*, a row of gaps says *fast*.
 *
 * ## Where it can lose
 *
 * Four marks in a tile is a lot of picture for a body two columns wide moving
 * quickly; it may read as busy where a plume reads as one shape. And a track
 * says the body is somewhere it is not — the marks stand on tiles that have
 * been left, and a pair reading columns out loud has to be sure the brightest
 * thing in a lane is the thing they are naming.
 */
const MARKS = 4;
/** Where the first bar sits above the body and the gap to the next, in body
 * half-heights. */
const FIRST = 0.66;
const GAP = 0.5;
/** Half-length of the nearest bar and what each one further back loses, as
 * shares of the body's half-width. */
const SPAN = 0.5;
const SHRINK = 0.085;
const FADE = 0.2;

export const WAKE: Tail<"wake"> = {
  id: "wake",
  label: "WAKE",
  hint: "four short bars left across the line behind it, shrinking and fading with age — rungs, not a ribbon",
  reachUp: FIRST + GAP * (MARKS - 1),
  build(ctx) {
    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    for (let k = 0; k < MARKS; k++) {
      const up = ry * (FIRST + k * GAP) * 2;
      const half = rx * Math.max(0.1, SPAN - k * SHRINK);
      const bar = document.createElementNS(SVG, "line");
      bar.setAttribute("x1", (ctx.centre.x - half).toFixed(2));
      bar.setAttribute("x2", (ctx.centre.x + half).toFixed(2));
      const y = (ctx.centre.y - up).toFixed(2);
      bar.setAttribute("y1", y);
      bar.setAttribute("y2", y);
      bar.setAttribute("stroke", ctx.colour);
      bar.setAttribute("stroke-width", (ctx.weight * Math.max(0.5, 1.6 - k * 0.3)).toFixed(2));
      bar.setAttribute("stroke-opacity", Math.max(0.08, 1 - k * FADE).toFixed(3));
      bar.setAttribute("stroke-linecap", "round");
      ctx.body.appendChild(bar);
    }
  },
};
