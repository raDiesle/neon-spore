import { LIGHT_HALF } from "@neon-spore/content";
import {
  type CystState,
  cystGuarding,
  cystLitStep,
  cystSide,
  cystStepCol,
  midCol,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { coreHurt } from "./core-hurt.js";
import type { CystFx } from "./cyst-fx.js";
import { drawCystCore, drawCystFlash, drawCystMark } from "./cyst-marks.js";
import {
  cystArrived,
  cystHeldShare,
  cystLeft,
  cystPose,
  cystPosed,
  cystSplit,
} from "./cyst-pose.js";
import {
  type CystPose,
  cystCentre,
  cystCrackPath,
  cystLift,
  cystR,
  cystSacPath,
  cystTip,
} from "./cyst-shape.js";
import { drawCystBud, drawCystSpore } from "./cyst-story.js";
import { fieldX } from "./field-flip.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE CYST**: a four-lobed sac over the middle column (BULB · CLOVER), its
 * left and right lobes the two flanks, each tapped still by one seat and
 * pinched shut by the other, a core under the skin that both cannons are
 * asked to hit once both flanks have cracked (§34).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: a tap and
 * a pinch are each one seat's, but the partner has to see the flank shudder
 * to say *tap*, and see it stop dead to say *pinch*.
 *
 * **Flesh, and dull**: a mauve sac, a pale scar where a flank cracked, and
 * the only colour on it is what a step asks for — the lit flank in white, the
 * core, the bud in their cannon's colour. **Its health is the core**, smaller
 * and brighter for every hit it has taken.
 *
 * The spore and the bud, two of the three story steps, are `cyst-story.ts`;
 * the swell is the outline blown up (`cyst-pose.ts`). What outlives a frame is
 * `fx` (`cyst-fx.ts`), told the core's colour here.
 */
export function drawCyst(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: CystState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: CystFx,
): void {
  const cfg = world.cfg;
  const arrived = cystArrived(s, cfg.cystStillBeats, beat, beatPhase);
  const split = cystSplit(s, cfg.cystSplitBeats, beat, beatPhase);
  const home = cystCentre(l, cfg);
  const y = home.y - cystLift(l, arrived) + fx.thud * l.tile;
  const pose = cystPose(world, s, beat, beatPhase, time);
  pose.shake[0] += fx.spring(0);
  pose.shake[1] += fx.spring(1);
  const step = cystLitStep(s);
  const left = cystLeft(world, s, beat, beatPhase);

  ctx.save();
  ctx.globalAlpha = (0.2 + 0.8 * arrived) * (1 - 0.7 * split);
  ctx.translate(home.x + fx.hurt.shakeX(time, l.tile), y);

  const side = cystSide(s);
  for (const mark of [0, 1] as const) {
    const state = side !== mark ? "idle" : s.phase === "frozen" ? "stilled" : "lit";
    if (split <= 0) drawCystMark(ctx, l, mark, state, left, beatPhase);
  }

  if (split > 0) {
    for (const half of [0, 1] as const) {
      const out = half === 0 ? -1 : 1;
      ctx.save();
      ctx.translate(out * split * l.tile * 1.1, split * l.tile * 0.8);
      ctx.rotate(out * split * 0.35);
      const clip = new Path2D();
      clip.rect(half === 0 ? -l.tile * 4 : 0, -l.tile * 4, l.tile * 4, l.tile * 8);
      ctx.clip(clip);
      drawSac(ctx, l, s, pose, time, fx.hurt.value);
      ctx.restore();
    }
  } else {
    drawSac(ctx, l, s, pose, time, fx.hurt.value);
    drawLitFlank(ctx, l, world, s, pose, beatPhase);
  }

  if (step?.ask === "fire") fx.tell(cystColourRim(step.color));
  const firing = step !== null && step.ask === "fire" && s.bared;
  const lit = firing ? { color: step.color, left } : null;
  const hurt = coreHurt(s.hits);
  drawCystCore(ctx, l, hurt.size * (1 - 0.5 * split), hurt.bright, s.bared, lit, beatPhase);

  // A spore or a bud is the step lit, or the one just answered easing out.
  const told =
    s.phase === "lit" ? s.steps[s.cursor] : s.phase === "rest" ? s.steps[s.cursor - 1] : undefined;
  const rest = cfg.cystRestBeats;
  if (told?.ask === "spit") {
    const dx = fieldX(l, cystStepCol(midCol(cfg), told)) - home.x;
    const out = cystPosed(s, "spit", rest, beat, beatPhase);
    const sink = s.phase === "lit" ? 1 - left : 1;
    const tip = cystTip(l, Math.PI / 2, pose);
    drawCystSpore(ctx, l, tip, out, sink, dx, l.hullY - y, beatPhase);
  }
  if (told?.ask === "bud") {
    const dx = fieldX(l, cystStepCol(midCol(cfg), told)) - home.x;
    const grown = cystPosed(s, "bud", rest, beat, beatPhase);
    drawCystBud(ctx, l, grown, dx, told.color, s.phase === "lit" ? left : 0, beatPhase);
  }
  drawCystFlash(ctx, l, fx.flash, fx.split);
  ctx.restore();
}

/** A fire step's rim, told to the fx so a core hit bursts in the colour it was shot in. */
function cystColourRim(color: "red" | "cyan" | "either"): string {
  return color === "red" ? PALETTE.redRim : color === "cyan" ? PALETTE.cyanRim : PALETTE.hullRim;
}

/** The sac: mauve fill, the key light on it, its outline, the blow over it, and each flank's scar. */
function drawSac(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: CystState,
  pose: CystPose,
  time: number,
  hurt: number,
): void {
  const sac = cystSacPath(l, pose);
  const r = cystR(l);
  ctx.fillStyle = rgba(PALETTE.cystSac, 0.95);
  ctx.fill(sac);
  ctx.save();
  ctx.clip(sac);
  litRound(ctx, 0, -r * 0.15, r * 1.3, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.6));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.cystSacDark, 0.95);
  ctx.stroke(sac);
  drawHurt(ctx, sac, hurt);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.cystScar, 0.85);
  for (const side of [0, 1] as const) {
    if (s.cracks[side] > 0) ctx.stroke(cystCrackPath(l, side, pose));
  }
}

/**
 * The flank a step is about, lit white along its lobe — or, on a swell, the
 * whole outline; a stilled flank's crack spreading by the share held; and a
 * guard's scar glowing, since the same scar is what it holds shut.
 */
function drawLitFlank(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: CystState,
  pose: CystPose,
  beatPhase: number,
): void {
  const step = cystLitStep(s);
  if (step === null) return;
  const pulse = 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2);
  const sac = cystSacPath(l, pose);
  if (step.ask === "swell") {
    strokeGlow(ctx, sac, PALETTE.hullRim, STROKE.outline, pulse, 0.7);
    return;
  }
  const side = cystSide(s);
  if (side === null) return;
  const r = cystR(l);
  ctx.save();
  const half = new Path2D();
  half.rect(side === 0 ? -r * 3 : r * 0.45, -r * 3, r * 2.55, r * 6);
  ctx.clip(half);
  strokeGlow(ctx, sac, PALETTE.hullRim, STROKE.outline, pulse, 0.7);
  ctx.restore();
  if (cystGuarding(s)) {
    strokeGlow(ctx, cystCrackPath(l, side, pose), PALETTE.cystScar, STROKE.outline, pulse);
    return;
  }
  const held = s.phase === "frozen" ? cystHeldShare(world, s, beatPhase) : 0;
  if (held <= 0) return;
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.strokeStyle = rgba(PALETTE.cystScar, 0.95);
  ctx.stroke(cystCrackPath(l, side, pose, held));
}
