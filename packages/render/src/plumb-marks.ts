import {
  type Color,
  PLUMB_UNREAD,
  type PlumbState,
  plumbLitStep,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { PLUMB_VIAL_MILLI, plumbArrived, plumbAsked, plumbSkew } from "./plumb-pose.js";
import {
  plumbCore,
  plumbCoreAt,
  plumbGlass,
  plumbHook,
  plumbLift,
  plumbVialPath,
} from "./plumb-shape.js";
import { seamColour } from "./seam-marks.js";

/**
 * **THE PLUMB's marks**: the two things that say what a step asks — a level's
 * glass, which is *hold your phone like this*, and the lit core, which is
 * *shoot here, in this colour*. Cut from `plumb-draw.ts` the day it was
 * written, along the line its second half grows on: the cue words and the
 * sparks come here.
 *
 * A step's colour is THE SEAM's (`seamColour`), called rather than copied.
 */

/**
 * The core in the sac's belly, drawn in the sac's frame: dark, and only as
 * much of it as the bob has turned to show; pale glass once both weights are
 * true; and while a shot is owed, the step's colour with a ring round it
 * closing as the window runs out. `size` and `bright` are its hurt
 * (`core-hurt.ts`).
 */
export function drawPlumbCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  turn: number,
  hurt: { size: number; bright: number },
  lit: boolean,
  fire: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  if (turn <= 0.02) return;
  const c = plumbCore(l);
  const r = Math.max(0.5, c.r * hurt.size);
  const core = new Path2D();
  core.ellipse(c.x, c.y, r * turn, r, 0, 0, Math.PI * 2);
  if (fire === null) {
    ctx.fillStyle = rgba(lit ? PALETTE.plumbGlass : PALETTE.plumbBronzeDark, lit ? 0.55 : 0.9);
    ctx.fill(core);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.plumbGlass, (lit ? 0.9 : 0.3) * turn);
    ctx.stroke(core);
    return;
  }
  const { body, rim } = seamColour(fire.color);
  const pulse = 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2);
  ctx.fillStyle = rgba(body, hurt.bright * pulse);
  ctx.fill(core);
  strokeGlow(ctx, core, rim, STROKE.inner, 0.8 + hurt.bright);
  const ring = new Path2D();
  ring.arc(c.x, c.y, c.r * 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fire.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}

/**
 * Glass `side`: a spirit level under its ball, the bubble at the lean the
 * seat's phone reports. Lit pale green-white while the step asks that phone
 * level, with the range it must hold inside marked on the vial; the bubble
 * brightens once it is inside. A phone not yet read has its bubble dim and
 * pinned at the vial's end, which is what *hold it up* looks like.
 */
export function drawPlumbGlass(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: PlumbState,
  side: 0 | 1,
  beatPhase: number,
): void {
  const g = plumbGlass(l, side);
  const asked = plumbAsked(s, side);
  const range = plumbLitStep(s)?.rangeMilli ?? 0;
  const vial = plumbVialPath(g.hw, g.hh);
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.fillStyle = rgba(PALETTE.plumbBronzeDark, 0.85);
  ctx.fill(vial);
  const track = g.hw - g.hh;
  if (asked) {
    const pulse = 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2);
    strokeGlow(ctx, vial, PALETTE.plumbGlass, STROKE.inner, pulse, 0.6);
    const tick = new Path2D();
    const at = track * Math.min(1, range / PLUMB_VIAL_MILLI);
    for (const x of [-at, at]) {
      tick.moveTo(x, -g.hh * 1.5);
      tick.lineTo(x, g.hh * 1.5);
    }
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.plumbGlass, 0.9);
    ctx.stroke(tick);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(asked ? PALETTE.plumbGlass : PALETTE.plumbBronze, asked ? 0.95 : 0.5);
  ctx.stroke(vial);

  const tilt = s.tiltMilli[side];
  const unread = tilt === PLUMB_UNREAD;
  const x = unread ? track : track * Math.max(-1, Math.min(1, tilt / PLUMB_VIAL_MILLI));
  const inside = asked && !unread && Math.abs(tilt) <= range;
  const bubble = new Path2D();
  bubble.ellipse(x, 0, g.hh * 1.3, g.hh * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.plumbGlass, unread ? 0.2 : inside ? 0.95 : 0.55);
  ctx.fill(bubble);
  if (inside) strokeGlow(ctx, bubble, PALETTE.plumbGlass, STROKE.inner, 1.2);
  ctx.restore();
}

const HALF_W = 0.9;
const HALF_H = 0.62;

/**
 * The lit step's word: `LEVEL` on the glass a seat's phone is asked to bring
 * true, `BOTH` across the pair once a step asks it of both at once, and
 * `FIRE` on the core once it is lit — the anchor is the hook already carrying
 * the drop-in lift (`plumbLift`), matching `drawPlumb`'s own translate.
 */
export function plumbCues(
  l: Layout,
  world: World,
  s: PlumbState,
  beatPhase: number,
): readonly BossCue[] {
  const step = plumbLitStep(s);
  if (step === null) return [];
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const hook = plumbHook(l, world.cfg);
  const arrived = plumbArrived(s, world, world.beat, beatPhase);
  const anchor = { x: hook.x, y: hook.y - plumbLift(l, arrived) };
  if (step.ask === "fire") {
    if (!s.coreLit) return [];
    const core = plumbCoreAt(l, anchor, plumbSkew(s, beatPhase));
    return [{ seat: null, kind: "PRESS", word: "FIRE", x: core.x, y: core.y, ...frame, seed: 147 }];
  }
  if (step.ask === "both") {
    const g0 = plumbGlass(l, 0);
    const g1 = plumbGlass(l, 1);
    const x = anchor.x + (g0.x + g1.x) / 2;
    const y = anchor.y + g0.y;
    const halfW = (g1.x - g0.x) / 2 + g0.hw;
    return [{ seat: null, kind: "HOLD", word: "BOTH", x, y, halfW, halfH: g0.hh, seed: 146 }];
  }
  const side: 0 | 1 = step.ask === "left" ? 0 : 1;
  const seat: 1 | 2 = side === 0 ? 1 : 2;
  const g = plumbGlass(l, side);
  return [
    {
      seat,
      kind: "HOLD",
      word: "LEVEL",
      x: anchor.x + g.x,
      y: anchor.y + g.y,
      ...frame,
      seed: side === 0 ? 144 : 145,
    },
  ];
}
