import { SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * A filled tongue back along the body's own axis, three soft balls down it and
 * a near-white root — **what a dart's thrust was until 8 September 2026.**
 *
 * `packages/render/src/dart.ts`'s `drawDartJet`, redrawn here at the moment
 * the owner took TORCH into the game instead (`src/dart-torch.ts`). The look
 * is not gone, it is rehoused: CLAUDE.md keeps a look that is taken out where
 * it can still be seen, and the only place a mark left behind a body can be
 * seen is beside the other marks left behind bodies.
 *
 * ## What it is, and what was wrong with it
 *
 * Three parts. A triangle whose base is against the body and whose apex is a
 * tile away, filled flat in the body's own colour under `lighter`. Three halos
 * down its length, shrinking and dimming. A near-white ball at the root,
 * because the hottest part of a flame is where it leaves the thing it pushes.
 *
 * The triangle is the argument against it. Widest where it starts, two hard
 * edges, ending in a point — that is the profile of a **beam**, which is what
 * a lance and every aimed thing in this game looks like, and it is the one
 * thing a dart's thrust must not be confused with. A dart is not shooting; it
 * is being thrown. TORCH turns the two ends round.
 *
 * Drawn here running straight up, like every value on this axis: a card has no
 * diagonal to lean along, and the shape of the taper is the whole question.
 */
const REACH = 1.9;
/** Half-width at the body, as a share of the body's own half-width. */
const WIDE = 0.5;
const BALLS = 3;

export const PLUME: Tail<"plume"> = {
  id: "plume",
  label: "PLUME",
  hint: "a hard-edged tongue coming to a point, three balls down it — what a dart's thrust used to be",
  reachUp: REACH,
  build(ctx) {
    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    const top = ctx.centre.y - ry * REACH * 2;

    const tongue = document.createElementNS(SVG, "path");
    tongue.setAttribute(
      "d",
      `M ${ctx.centre.x - rx * WIDE} ${ctx.centre.y}` +
        ` L ${ctx.centre.x} ${top}` +
        ` L ${ctx.centre.x + rx * WIDE} ${ctx.centre.y} Z`,
    );
    tongue.setAttribute("fill", ctx.colour);
    // `0.42 * heat` in the renderer, at the full heat a card holds.
    tongue.setAttribute("fill-opacity", "0.42");
    tongue.setAttribute("stroke", "none");
    ctx.body.appendChild(tongue);

    for (let k = 1; k <= BALLS; k++) {
      const ball = document.createElementNS(SVG, "circle");
      const along = ((ctx.centre.y - top) * k) / 3.2;
      ball.setAttribute("cx", String(ctx.centre.x));
      ball.setAttribute("cy", (ctx.centre.y - along).toFixed(2));
      ball.setAttribute("r", (rx * (0.62 - k * 0.11)).toFixed(2));
      ball.setAttribute("fill", ctx.colour);
      ball.setAttribute("fill-opacity", (0.7 - k * 0.14).toFixed(3));
      ctx.body.appendChild(ball);
    }

    const root = document.createElementNS(SVG, "circle");
    root.setAttribute("cx", String(ctx.centre.x));
    root.setAttribute("cy", (ctx.centre.y - ry * 0.35).toFixed(2));
    root.setAttribute("r", (rx * 0.34).toFixed(2));
    // The one near-white in the renderer's own version, kept as a value the
    // card can carry without importing the game's palette.
    root.setAttribute("fill", "#FFF6D8");
    root.setAttribute("fill-opacity", "0.9");
    ctx.body.appendChild(root);
  },
};
