import { SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * A hard bright line straight up from the body — the bullet's tail, put on a
 * falling body.
 *
 * `packages/render/src/bullets.ts` draws exactly this behind every shot, and
 * says why in one line: a tail behind the head, so the direction is legible
 * even at twelve tiles a beat. That is the only claim this value makes, and it
 * is the cheapest thing on the axis by a distance — one line, one alpha, no
 * gradient and no per-frame work at all.
 *
 * It is a proposal here rather than a control because **no creature wears it**.
 * The question it asks is whether the thing that works for a shot works for a
 * body: a shot is a point and a line reads as its path, while a slick is a
 * blob and a hairline coming out of the top of it may read as a stalk. That is
 * the sort of thing nobody can settle by arguing.
 */
export const STREAK: Tail<"streak"> = {
  id: "streak",
  label: "STREAK",
  hint: "one hard line straight up — what every bullet already wears, tried on a body",
  reachUp: 2.2,
  build(ctx) {
    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    const line = document.createElementNS(SVG, "line");
    line.setAttribute("x1", String(ctx.centre.x));
    line.setAttribute("y1", String(ctx.centre.y));
    line.setAttribute("x2", String(ctx.centre.x));
    line.setAttribute("y2", (ctx.centre.y - ry * 2.2 * 2).toFixed(2));
    line.setAttribute("stroke", ctx.colour);
    // `SHOT_LOOK.tailWidth` is 2 against a 1.6 outline, so the tail is a shade
    // heavier than the rim it comes off. Held to the same ratio here rather
    // than to the same pixels, since a card's scale is not the field's.
    line.setAttribute("stroke-width", (ctx.weight * 1.25).toFixed(2));
    line.setAttribute("stroke-opacity", "0.35");
    line.setAttribute("stroke-linecap", "round");
    ctx.body.appendChild(line);
    // Unused, but the line has to be as wide as the body is to look deliberate
    // rather than accidental at a glance.
    void rx;
  },
};
