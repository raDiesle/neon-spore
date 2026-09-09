import { HULL, hullAngleAtX, hullRadiusMul } from "../../../../../packages/content/src/index.js";
import type { BandAttach, CeilingRise } from "../../../../../packages/render/src/band-join.js";
import { seamBottom, seamRise, seamTop } from "../../../../../packages/render/src/band-seam.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { hullClock, hullSpan } from "../../../../../packages/render/src/hull-frame.js";
import type { Circle, Layout } from "../../../../../packages/render/src/layout.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";

/**
 * WHAT EVERY ANSWER WRITTEN ON 9 SEPTEMBER 2026 IS MADE OF.
 *
 * Four candidates went into this slot at once and they share three problems,
 * because the owner named all three about the card that was already there:
 * *left side top is not connected properly*, *the gradient on top ship looks
 * different than control panel, because control panel has no gradient at all*,
 * and it should feel like *one single alien living ship where everything is
 * grown together*. Those are one question with three symptoms, and an answer
 * that solved them four times over in four candidate directories would be four
 * chances to solve them four slightly different ways — which would make the
 * vote a vote on the arithmetic in here rather than on the four shapes it is
 * supposed to be about.
 *
 * So the fixes live here once and the candidates differ only in **what grows
 * in the chamber**, which is the thing being argued about.
 *
 * It sits inside `fused/` rather than beside `variant.ts` for the reason
 * `roof/paint.ts` does: a slot is removed whole when it is decided
 * (`bun run versus adopt`), and a shared file one directory up would outlive
 * every candidate that used it. `both/index.ts` already imports across two
 * sibling directories, so the shape of this is not new.
 */

/**
 * WHERE A GROWN THING'S TOP EDGE STARTS — and it is **above the roof**, not on
 * it.
 *
 * This is the whole of the first defect. `organs/paint.ts` starts each trunk at
 * `ceilingY(c.x)`: the height of the membrane at the *button's* x, drawn as a
 * flat top edge reaching a couple of radii either side of it. The membrane is
 * not flat over that span — that is the entire point of a roof that follows the
 * hull — so wherever it stands higher than the button's own x, the trunk's top
 * edge is a straight line hanging in mid-air with a gap of daylight above it.
 * At the left of the panel, where the hull's contour falls away fastest, that
 * gap is a finger wide and reads exactly as what the owner called it: not
 * connected properly.
 *
 * A tuned fudge — sampling the roof three times, or nudging the top up by a
 * fixed amount — fixes the picture it was tuned on and reopens somewhere else.
 * The fix that cannot come apart is to draw the shape starting *above the
 * highest the membrane can ever reach* and let the chamber's own clip cut it:
 * `band.ts` clips every attachment to `chamberPath`, so the trim is the
 * membrane spline itself, to the pixel, at every x. Nothing is drawn twice and
 * nothing is sampled twice, so there is no second copy of the contour to drift.
 */
export function sky(l: Layout): number {
  return seamTop(l) - Math.max(2, seamRise(l) * 0.6);
}

/**
 * The pale the ship's belly reads as, in the seat's own colours.
 *
 * The hull is filled dark and then lit — a bloom, an inner light, a sweep and
 * a key light, none of which the panel gets — so the underside of the ship a
 * finger's width above the membrane is a pale lavender and the tissue a
 * finger's width below it is nearly black. That step is the second thing the
 * owner named, and `skin.flesh[0]` alone does not reach it — which is a
 * measurement and not a guess. A column of pixels through the shipped picture
 * reads `rgb(98,81,148)` a few pixels above the membrane and `rgb(74,40,130)` a
 * few pixels below it: the *value* barely moves, and the green channel halves.
 * The step is a step in **saturation**, because the belly is lit by a key light
 * and the tissue is not, and adding more of the tissue's own violet widens it
 * rather than closing it. What closes it is nearly the seat's rim — its palest
 * colour — which is what a lit surface goes toward. Both ends of the mix are
 * the seat's own, so player two's chamber is washed in player two's light.
 */
export function belly(skin: SeatSkin): string {
  return mixHex(skin.flesh[0], skin.rim, 0.78);
}

/**
 * THE SHIP'S OWN RAMP, CARRIED PAST THE MEMBRANE.
 *
 * The owner offered two ways out of the step: *either we reduce gradient or
 * have gradient flowing into control panel more so there is no visual
 * difference when going top to bottom*. This is the second, and it is the one a
 * candidate in this slot can reach — `attach` is drawn inside the chamber, so a
 * candidate may paint the panel and may not repaint the ship.
 *
 * It is additive, over most of the chamber, and it is deliberately long: a wash
 * that faded out in half a tile would be a *second* edge a little lower down
 * rather than no edge at all.
 *
 * **The ramp starts at `seamBottom`, which is the lowest the membrane can
 * hang.** A gradient holds its first stop for everything above it, so every
 * part of the chamber between the membrane and that line — the whole of the
 * strip whose height changes with x — is washed at full strength whatever the
 * roof is doing there. Starting it at the membrane's *highest* point instead is
 * what the first pass did, and it left the deep parts of the contour a quarter
 * of the way down the ramp before the tissue under them had begun: the wash was
 * strongest where the roof was highest, which is precisely backwards.
 */
export function wash(d: BandAttach): void {
  const { ctx, l, skin } = d;
  const grad = ctx.createLinearGradient(0, seamBottom(l), 0, l.bandTop + l.bandHeight * 0.85);
  grad.addColorStop(0, rgba(belly(skin), 0.27));
  grad.addColorStop(0.3, rgba(skin.flesh[0], 0.1));
  grad.addColorStop(0.65, rgba(skin.flesh[1], 0.04));
  grad.addColorStop(1, rgba(skin.flesh[2], 0));
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.fillRect(0, sky(l), l.width, l.bandTop + l.bandHeight - sky(l));
  ctx.globalCompositeOperation = "source-over";
}

/**
 * The hull's own ripple as a rise, which is `roof/paint.ts`'s claim and is
 * written again here rather than imported for one reason: three of these four
 * candidates want it with something added, and importing through a candidate
 * that may be dropped would make ROOF load-bearing for cards that are not
 * arguing its case.
 *
 * Every number in it is still **called** — `hullSpan` and `hullClock` are the
 * ellipse and the clock `hull-frame.ts` measures the ship with, `hullAngleAtX`
 * is the one map from a screen x onto it, and `HULL`'s three fields are the
 * ripple itself. A hand copy of any of them would be a panel rippling at a rate
 * the ship does not.
 */
export function hullRise(l: Layout, x: number, time: number): number {
  const { cx, rx } = hullSpan(l);
  const mul = hullRadiusMul(
    hullAngleAtX(x, cx, rx),
    HULL.lobes,
    HULL.depth,
    HULL.wobble,
    hullClock(time),
    HULL.seed,
  );
  const swing = Math.max(1e-3, HULL.depth + HULL.wobble);
  return clamp01(0.5 + (mul - 1) / (2 * swing));
}

/**
 * How strongly a point on the roof is under the pull of a control below it, 0
 * nowhere near one and 1 directly over one.
 *
 * A membrane with an organ hanging off it hangs *lower* where the organ is, and
 * that is the cheapest way to say the roof and the thing under it are one piece
 * of tissue rather than two that happen to touch. `CeilingRise` is handed every
 * control on the screen for exactly this, and nothing shipped has used the
 * argument.
 */
export function pull(x: number, lobes: readonly Circle[], reach: number): number {
  let most = 0;
  for (const c of lobes) {
    const k = (x - c.x) / Math.max(1, c.r * reach);
    const at = Math.exp(-k * k);
    if (at > most) most = at;
  }
  return most;
}

/** A roof that is the hull's ripple with the controls pulling down on it. */
export function saggingRoof(reach: number, weight: number): CeilingRise {
  return (l, x, time, lobes) => clamp01(hullRise(l, x, time) - pull(x, lobes, reach) * weight);
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0.5));
}

/** A bell of width `s` centred on `c`, for a profile written as a sum of them. */
export function bell(p: number, c: number, s: number): number {
  return Math.exp(-(((p - c) / s) ** 2));
}
