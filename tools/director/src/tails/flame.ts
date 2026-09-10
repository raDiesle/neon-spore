import { BEAT_SECONDS, SVG } from "../skins/types.js";
import { type Tail, type TailContext, verticalFade } from "./types.js";

/**
 * A flame that leaves the body narrow, opens into a belly a third of the way
 * back and frays out into nothing — **what a dart's thrust is in the game**,
 * under the three knots SHOCK strings down it.
 *
 * `packages/render/src/dart-torch.ts`'s `torchJet`, redrawn here on
 * 10 September 2026, the day the owner took SHOCK into the game over BRAID and
 * CINDERS and asked for the flame those were judged against to be kept where
 * they are. SHOCK is that flame with an interior, so this is still on the
 * field every frame a dart is; it is on this axis as the control the other
 * two are read against.
 *
 * ## What it is, and why it is the shape it is
 *
 * PLUME, the tongue it replaced, is widest where it starts and comes to a
 * point — the profile of a *beam*, which is what every aimed thing in this
 * game looks like and the one thing a dart's thrust must not be confused
 * with. A dart is not shooting; it is being thrown. So the two ends are
 * turned round: a nozzle, a belly where a plume expanding into vacuum is
 * actually widest, and a fray the gradient has run out of before the outline
 * closes — what ends the flame is the flame running out.
 *
 * Three passes and not one, the renderer's own order: a dim wide envelope, the
 * body's colour, a hot narrow core — a flame is a bright thing inside a dim
 * one, and the order is what makes the edge soft instead of drawn. The
 * near-white at the root is the one second colour, as on PLUME.
 *
 * It breathes: the reach flickers a few per cent on a clock of its own, which
 * in the game is the body's id so two darts never flicker together, and here
 * is the card's name for the same reason. A flame that held exactly still for
 * a beat is a cone with a light in it.
 *
 * Drawn straight up like every value on this axis: a card has no diagonal to
 * lean along, and the profile is the whole question.
 */
/** Half-widths as shares of the body's half-width: at the nozzle, at the
 * belly and at the fray — `dart-torch.ts`'s ROOT, BELLY and FRAY. */
const ROOT = 0.16;
const BELLY = 0.46;
const FRAY = 0.54;
/** How far back the belly sits, as a share of the reach. */
const BELLY_AT = 0.34;
/** The envelope and the core, as multiples of the flame's own width. */
const HAZE = 1.7;
const CORE = 0.42;
/** The reach at full heat, in body heights, and the flicker on it, as a share
 * and in radians a beat. In the game the reach is `0.9 + 2.1 · heat` body
 * radii; a card's far half is a gradient running to nothing, so it is given
 * PLUME's length to have somewhere to run out in. */
const REACH = 1.9;
const FLICKER = 0.07;
const FLICKER_RATE = 37;

/** One pass of the flame: the outline down one side, round the fray and back
 * up the other, at `wide` times the flame's width, filled from the shared
 * ramp. */
function pass(ctx: TailContext, paint: string, wide: number, alpha: number): SVGPathElement {
  // Widths off the smaller radius: in the game every body the flame is behind
  // is `tile * 0.4` round, and a slick is twice as wide as it is tall here.
  const rx = Math.min(ctx.extent.w, ctx.extent.h) * 0.5 * wide;
  const ry = ctx.extent.h / 2;
  const reach = ry * REACH * 2;
  const x = ctx.centre.x;
  const y0 = ctx.centre.y;
  const belly = y0 - reach * BELLY_AT;
  const top = y0 - reach;
  const p = document.createElementNS(SVG, "path");
  p.setAttribute(
    "d",
    `M ${(x - rx * ROOT).toFixed(2)} ${y0.toFixed(2)}` +
      ` Q ${(x - rx * BELLY).toFixed(2)} ${(y0 - reach * BELLY_AT * 0.55).toFixed(2)}` +
      ` ${(x - rx * BELLY).toFixed(2)} ${belly.toFixed(2)}` +
      ` Q ${(x - rx * BELLY).toFixed(2)} ${(top + reach * 0.3).toFixed(2)}` +
      ` ${(x - rx * FRAY).toFixed(2)} ${top.toFixed(2)}` +
      ` L ${(x + rx * FRAY).toFixed(2)} ${top.toFixed(2)}` +
      ` Q ${(x + rx * BELLY).toFixed(2)} ${(top + reach * 0.3).toFixed(2)}` +
      ` ${(x + rx * BELLY).toFixed(2)} ${belly.toFixed(2)}` +
      ` Q ${(x + rx * BELLY).toFixed(2)} ${(y0 - reach * BELLY_AT * 0.55).toFixed(2)}` +
      ` ${(x + rx * ROOT).toFixed(2)} ${y0.toFixed(2)} Z`,
  );
  p.setAttribute("fill", paint);
  p.setAttribute("fill-opacity", alpha.toFixed(2));
  p.setAttribute("stroke", "none");
  return p;
}

/** A per-card phase off the name, so two cards never flicker together. */
function phaseOf(name: string): number {
  let phase = 0;
  for (let i = 0; i < name.length; i++) phase += name.charCodeAt(i);
  return phase;
}

export const FLAME: Tail<"flame"> = {
  id: "flame",
  label: "FLAME",
  hint: "narrow at the nozzle, bellied a third of the way back, frayed into nothing — the flame a dart's thrust is, under SHOCK's knots",
  reachUp: REACH * (1 + FLICKER),
  shipped: "dart — dart-torch.ts, torchJet, under the knots of dart-shock.ts",
  build(ctx) {
    // Nothing at the fray, the body's colour through the belly, strongest at
    // the nozzle: the ramp runs along the flame, and `verticalFade` is where
    // that axis is fixed.
    const paint = verticalFade(ctx, "flame", [
      ["0%", "0"],
      ["35%", "0.4"],
      ["70%", "0.85"],
      ["100%", "1"],
    ]);
    const flame = document.createElementNS(SVG, "g");
    flame.appendChild(pass(ctx, paint, HAZE, 0.16));
    flame.appendChild(pass(ctx, paint, 1, 0.8));
    flame.appendChild(pass(ctx, paint, CORE, 0.9));
    ctx.body.appendChild(flame);

    const root = document.createElementNS(SVG, "circle");
    root.setAttribute("cx", String(ctx.centre.x));
    const r = Math.min(ctx.extent.w, ctx.extent.h) / 2;
    root.setAttribute("cy", (ctx.centre.y - r * 0.22).toFixed(2));
    root.setAttribute("r", (r * 0.3).toFixed(2));
    root.setAttribute("fill", "#FFF6D8");
    root.setAttribute("fill-opacity", "0.95");
    ctx.body.appendChild(root);

    // The flicker: the whole flame stretched a few per cent about the nozzle,
    // one transform a frame and nothing allocated.
    const x = ctx.centre.x.toFixed(2);
    const y = ctx.centre.y.toFixed(2);
    const phase = phaseOf(ctx.name);
    ctx.onFrame(({ t }) => {
      const flick = 1 + FLICKER * Math.sin((t / BEAT_SECONDS) * FLICKER_RATE + phase);
      flame.setAttribute(
        "transform",
        `translate(${x} ${y}) scale(1 ${flick.toFixed(4)}) translate(-${x} -${y})`,
      );
    });
  },
};
