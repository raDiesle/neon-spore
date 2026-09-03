import { SVG } from "../skins/types.js";
import { type Tail, verticalFade } from "./types.js";

/**
 * A tapering gradient wedge running away above the body — **what a torch
 * wears in the game today**, and the closest thing the project has to a
 * meteor tail.
 *
 * `packages/render/src/torch.ts`'s `drawTorchTail`. Four points: narrow at the
 * far end, wide where the rock is, filled with a gradient that is transparent
 * at the top and strongest at the body. Ember orange in the game; here it
 * takes the card's own colour, because the axis is about the *shape* of a tail
 * and a row of orange cards would be comparing hues.
 *
 * ## The two things it does that nothing else here does
 *
 * It runs **all the way to the top of the field** rather than a body-length or
 * two. That is a real design statement and it is why a torch reads as having
 * come from somewhere rather than as having appeared: the tail is longer than
 * the screen. A card cannot show that honestly — a frame is 92 px and a field
 * is twelve tiles — so `reachUp` here is as long as the frame will bear and
 * the card is a fair sample of it rather than the whole thing.
 *
 * And it is **wider at the body than behind it**, which is the opposite of
 * what a stroke-based trail does. A wedge that swells toward the object reads
 * as something being dragged; one that swells away reads as something being
 * sprayed. The game chose the first and it is worth knowing that was a choice.
 *
 * The torch also only draws it once it has actually travelled — `c.row !==
 * c.fromRow` — because a streak behind a rock still sitting in its socket
 * would read as a fall that has not started.
 *
 * The gradient runs *along* the wedge and not across it — `verticalFade` in
 * `types.ts` is where that axis is set, and why.
 */
const WIDE_AT_BODY = 0.9;
const NARROW_AT_END = 0.12;
const REACH = 2.6;

export const WEDGE: Tail<"wedge"> = {
  id: "wedge",
  label: "WEDGE",
  hint: "a tapering gradient wedge running off the top — what a torch wears in the game today",
  reachUp: REACH,
  shipped: "torch — torch.ts, drawTorchTail",
  build(ctx) {
    const paint = verticalFade(ctx, "wedge", [
      ["0%", "0"],
      ["75%", "0.1"],
      ["100%", "0.3"],
    ]);

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    const topY = ctx.centre.y - ry * REACH * 2;
    const wedge = document.createElementNS(SVG, "path");
    wedge.setAttribute(
      "d",
      `M ${ctx.centre.x - rx * NARROW_AT_END} ${topY}` +
        ` L ${ctx.centre.x + rx * NARROW_AT_END} ${topY}` +
        ` L ${ctx.centre.x + rx * WIDE_AT_BODY} ${ctx.centre.y}` +
        ` L ${ctx.centre.x - rx * WIDE_AT_BODY} ${ctx.centre.y} Z`,
    );
    wedge.setAttribute("fill", paint);
    wedge.setAttribute("stroke", "none");
    ctx.body.appendChild(wedge);
  },
};
