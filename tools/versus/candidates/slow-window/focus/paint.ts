import { flatCenter, flatRadius } from "../../../../../packages/render/src/creature-place.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import {
  instarMarkPoint,
  instarMarkRadius,
} from "../../../../../packages/render/src/instar-shape.js";
import { type Layout, tileCX } from "../../../../../packages/render/src/layout.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { gripsCreature } from "../../../../../packages/sim/src/grip.js";
import { instarBoss, instarStep } from "../../../../../packages/sim/src/instar.js";
import type { World } from "../../../../../packages/sim/src/world.js";

/**
 * The field goes out except where the pair's hands are, and the light left
 * closes on them as the window runs down.
 *
 * `wash` sinks the far half of the field and leaves the near half alone;
 * `frame`, `gutter` and `drain` draw on the furniture. This one asks where the
 * pair are *acting* and lights only that: a mark on a boss with a gesture owed
 * to it, a body somebody has a hand on, and the cannon's own column, which is
 * an action even on a frame where nothing is held. Everything else goes under.
 *
 * The lit spots tighten as the window is spent, so the picture is not a timer
 * standing to one side — it is the pair's own attention being narrowed onto
 * the thing they have to do, which is what THE SLOW buys them the beats for.
 *
 * **It is the wash's argument turned round.** The wash's risk is that it takes
 * contrast off the marks the pair have to read at the worst possible moment.
 * Here the marks are the one thing that keeps full contrast and the empty
 * field pays instead — the same weight of ink, spent the other way up.
 *
 * **There is no tint in the dark, and that was not the first answer.** A veil
 * of the ship's violet over the unlit field — `wash`'s trick, so the picture
 * is a held breath rather than a screen with its backlight off — was drawn
 * through the same holes as the darkness, so at the shut the lit spots were
 * the only places *without* violet in them and the whole thing read inverted:
 * three dark discs on a brightening field. The dark here is the ground's own
 * colour and nothing else.
 *
 * **The rim is why there is a rim.** Darkness alone is not enough: the first
 * shot of this candidate put its clear spots exactly where they belong — both
 * jaw marks and the muzzle — and none of them could be seen, because a hole in
 * a veil over the boss's own black mouth looks like the mouth. A thin lit edge
 * on the closing circle is the smallest thing that makes the aperture legible,
 * and it is drawn as light rather than as a ring round a target on purpose:
 * it brightens as it tightens, which a reticle does not.
 *
 * **It reads its anchors fresh from the world every frame**, so a thumb that
 * moves takes the light with it and a hand let go takes it away on the same
 * frame. Nothing is remembered between frames and nothing goes in `Effects`
 * (`render/test/restart.test.ts`).
 *
 * **How it can lose.** It is the heaviest of the five: a field that goes dark
 * everywhere but two spots is a big statement for two beats, and a pair who
 * are mid-sentence may lose the body they were about to name. It leans on
 * there being something to light — on a frame with no hand down and an empty
 * cannon column it darkens the field around a single spot at the muzzle, which
 * is the least useful thing it could say. And a boss that is not THE INSTAR
 * has no marks for it to find: every other boss falls back to grips and the
 * muzzle alone, and that is a per-boss gap and not a general answer.
 */

/** How dark the unlit field goes on the beat the window shuts. */
const DEEP = 0.72;

/** And how much of that it already has on the beat it opens. */
const ARRIVES = 0.62;

/**
 * Where the veil reaches its weight, as a share of the run down the field. It
 * is not nought: a veil at full strength from its first row draws a hard line
 * across the field at `gridTop`, and the first shot of this candidate drew
 * exactly that one — the same edge `wash` and `gutter` each had to lose.
 */
const ONSET = 0.14;

/** The clear spot's radius at the open, in anchor radii. */
const WIDE = 3.4;

/** And at the shut. */
const TIGHT = 1.4;

/** How far past the clear spot the darkness takes to arrive, as a multiple of
 * it. A hard edge would be a spotlight cut out of paper. */
const FEATHER = 2.1;

/** The lit edge of the aperture, as a share of a tile, and its weight at the
 * open and at the shut. */
const RIM = 0.05;
const RIM_LIT = 0.3;
const RIM_SHUT = 0.85;

/** The muzzle's own spot, as a share of a tile. */
const MUZZLE = 0.5;

interface Spot {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/**
 * Every place on the field somebody's thumb is owed or already down.
 *
 * Grips are asked of `gripsCreature` per body rather than read off the two
 * grip fields, for the reason that call exists: which field is whose is
 * `grip.ts`'s business (`world-ship.ts`).
 */
function spots(world: World, l: Layout, beatPhase: number): Spot[] {
  const out: Spot[] = [];
  const instar = instarBoss(world);
  const step = instar === null ? null : instarStep(instar);
  if (step !== null) {
    const r = instarMarkRadius(l, world.cfg);
    for (const mark of step.marks) {
      const at = instarMarkPoint(l, mark);
      out.push({ x: at.x, y: at.y, r });
    }
  }
  for (const c of world.creatures) {
    if (!gripsCreature(world, 1, c.id) && !gripsCreature(world, 2, c.id)) continue;
    const { x, y } = flatCenter(l, c, beatPhase);
    out.push({ x, y, r: flatRadius(l, world.cfg, c, beatPhase) });
  }
  // The pilot's column, whatever else is true of the field.
  out.push({ x: tileCX(l, world.cannonCol), y: l.hullY, r: l.tile * MUZZLE });
  return out;
}

/** The veil's weight down the field, so the onset is one rule and not three. */
function veil(ctx: CanvasRenderingContext2D, l: Layout, hex: string, deep: number) {
  const grad = ctx.createLinearGradient(0, l.gridTop, 0, l.hullY);
  grad.addColorStop(0, rgba(hex, 0));
  grad.addColorStop(ONSET, rgba(hex, deep));
  grad.addColorStop(1, rgba(hex, deep));
  return grad;
}

export const actionFocus: SlowLook["paint"] = (ctx, l, world, view, win) => {
  // It arrives with the window and tightens: the dark deepens and the lit
  // spots shrink together, so the last beat is the narrowest and the blackest.
  const t = win.through;
  const deep = DEEP * (ARRIVES + (1 - ARRIVES) * t);
  const top = l.gridTop;
  // To the hull and no further: below it is the ship's own tissue, drawn over
  // this pass, and nothing here has anything to say about a hand on a strip.
  const height = l.hullY - top;
  if (deep <= 0 || height <= 0) return;
  const lit = spots(world, l, view.beatPhase).map((s) => ({
    ...s,
    clear: s.r * (WIDE + (TIGHT - WIDE) * t),
    // How much veil there is to cut through this far down: a spot in the
    // onset must not leave a halo darker than the ground around it.
    weight: Math.min(1, Math.max(0, (s.y - top) / (height * ONSET))),
  }));
  ctx.save();
  ctx.beginPath();
  ctx.rect(l.gridLeft, top, l.gridWidth, height);
  ctx.clip();
  // The veil, with a hole punched at every spot: one fill, so two spots that
  // overlap do not darken each other's ground twice.
  ctx.beginPath();
  ctx.rect(l.gridLeft, top, l.gridWidth, height);
  for (const s of lit) {
    // `moveTo` first: an `arc` that continues the last subpath draws a line to
    // the circle from wherever the pen was, which here is a corner of the rect.
    ctx.moveTo(s.x + s.clear * FEATHER, s.y);
    ctx.arc(s.x, s.y, s.clear * FEATHER, 0, Math.PI * 2);
  }
  ctx.fillStyle = veil(ctx, l, PALETTE.background, deep);
  ctx.fill("evenodd");
  for (const s of lit) {
    // The falloff into each hole, so the edge of the light is a light's edge.
    const outer = s.clear * FEATHER;
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, outer);
    grad.addColorStop(0, rgba(PALETTE.background, 0));
    grad.addColorStop(Math.min(0.99, s.clear / outer), rgba(PALETTE.background, 0));
    grad.addColorStop(1, rgba(PALETTE.background, deep * s.weight));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, outer, 0, Math.PI * 2);
    ctx.fill();
    // And the aperture itself, which is the only part of this that is light.
    ctx.lineWidth = l.tile * RIM;
    ctx.strokeStyle = rgba(PALETTE.hullRim, RIM_LIT + (RIM_SHUT - RIM_LIT) * t);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.clear, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
};
