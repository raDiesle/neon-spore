import { type SkinContext, type SkinFrame, SVG } from "../skins/types.js";

/**
 * What a body leaves behind it as it falls.
 *
 * The sixth axis on SHAPES, and the first one that is about the field rather
 * than about the body. Every creature in this game **falls down a column** —
 * that is the whole of the motion the field has, and the one thing no card on
 * this page has ever shown. A contour sways in place because a card has
 * nowhere to fall to, so the axis that asks *what does this look like on its
 * way down* had to be invented rather than derived.
 *
 * ## The tail draws upward, and the body does not move
 *
 * That is how the game itself does it. `creatures.ts` says of its own trail
 * that it strings out "up, since row only grows toward the hull", and
 * `torch.ts` draws a wedge from the top of the field down to the rock. The
 * fall is implied by what is behind, not by animating a card that has a frame
 * two hundred pixels tall and a field twelve tiles deep.
 *
 * That is also why this is not GLOW's `TRAIL`. That value rides `frame.pose` —
 * a body's own sway, a fraction of a tile, going nowhere. This is travel, in
 * one direction, at the speed the field actually moves.
 *
 * ## Two of these are already in the game
 *
 * `HALOES` is what a slick and a bulb wear today and `WEDGE` is what a torch
 * wears. They are on the axis as the controls, so a proposal is compared
 * against the real thing on the same row rather than against a memory of it —
 * and `docs/shipped-looks.md` says exactly what the renderer draws.
 */
export type TailContext = SkinContext;

/** The moment a tail is being drawn at. The skin's frame, like every axis. */
export type TailFrame = SkinFrame;

/** One tail: its name in the switcher, how far it reaches, how it draws. */
export interface Tail<Id extends string = string> {
  readonly id: Id;
  readonly label: string;
  readonly hint: string;
  /**
   * How far the tail reaches **upward** past the contour, as a multiple of the
   * body's own height.
   *
   * Upward and not in every direction, unlike `Glow.spread` and `Hit.spread`.
   * A tail is the one asymmetric thing on this page: it reaches two or three
   * body-heights behind and nothing at all in front, and padding the frame
   * evenly for it would waste as much room below the body as it used above —
   * on a 92 px card that is the difference between a legible body and a small
   * one. `shape-figure.ts` grows the box upward alone and moves the centre to
   * match.
   */
  readonly reachUp: number;
  /**
   * Where the game already draws this, or absent if it is a proposal.
   *
   * The axis carries the shipped looks as its own controls, so this is not
   * decoration: it is what separates *what we do* from *what we could do* on a
   * row where both are drawn the same way. The switcher marks it, the OVERVIEW
   * caption marks it, and `docs/shipped-looks.md` is the long version.
   *
   * A look is offered and never replaced — CLAUDE.md — and an axis where the
   * shipped answer is not on the page is an axis that quietly proposes
   * replacing it.
   */
  readonly shipped?: string;
  build(ctx: TailContext): void;
}

/**
 * One `<stop>` of a fade: how far along the ramp it sits, and how opaque the
 * card's own colour is there.
 */
export type FadeStop = readonly [offset: string, alpha: string];

/**
 * The `<defs>` half of a painted tail, which RIBBON, WEDGE and SMOKE were each
 * writing out by hand.
 *
 * Only the stop table ever differed between the three — the id keyed on
 * `ctx.uid`, the `<stop>` per row, the `stop-color` taken from the card, and
 * the append into `ctx.defs` were the same nine lines each time. A tail now
 * says what its ramp *is* and gets the `url(#…)` back.
 *
 * It lives in this file rather than one of its own because `tails.test.ts`
 * counts the files in the directory against the length of `TAILS`: a seventh
 * file there is a seventh tail, and this is not one.
 */
function fade(ctx: TailContext, grad: SVGElement, id: string, stops: readonly FadeStop[]): string {
  grad.setAttribute("id", `${ctx.uid}-${id}`);
  for (const [offset, alpha] of stops) {
    const s = document.createElementNS(SVG, "stop");
    s.setAttribute("offset", offset);
    s.setAttribute("stop-color", ctx.colour);
    s.setAttribute("stop-opacity", alpha);
    grad.appendChild(s);
  }
  ctx.defs.appendChild(grad);
  return `url(#${ctx.uid}-${id})`;
}

/**
 * A ramp running **along** a tail rather than across it.
 *
 * `objectBoundingBox` with `x1 = x2` makes it vertical whatever the shape's
 * proportions turn out to be, which is the part that is easy to get subtly
 * wrong: a wedge two body-heights tall and a fifth as wide, given a diagonal
 * axis, fades across its own width instead of away from the body.
 */
export function verticalFade(ctx: TailContext, id: string, stops: readonly FadeStop[]): string {
  const grad = document.createElementNS(SVG, "linearGradient");
  grad.setAttribute("x1", "0");
  grad.setAttribute("y1", "0");
  grad.setAttribute("x2", "0");
  grad.setAttribute("y2", "1");
  return fade(ctx, grad, id, stops);
}

/** A ramp out from the middle of the shape it paints — SMOKE's soft-edged puff. */
export function radialFade(ctx: TailContext, id: string, stops: readonly FadeStop[]): string {
  return fade(ctx, document.createElementNS(SVG, "radialGradient"), id, stops);
}
