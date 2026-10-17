import type { Point } from "@neon-spore/content";
import { bodyPath, drop, type GooBody } from "./goo-body.js";
import { paintGoo } from "./goo-drop-look.js";
import { type Hold, overHeld, pressOf } from "./goo-grab.js";
import { settle } from "./goo-noise.js";
import { GOO, type GooStyle } from "./goo-style.js";
import { drawMarkWait } from "./mark-feedback.js";
import { noteMark } from "./mark-spots.js";
import { PULL_SIZE } from "./pull-knob.js";
import { soakWater } from "./soak-water.js";

/**
 * **Every hold on the field, drawn as the HOLD LAB's**: SOAK on the PULL LAB's
 * drop, so a hold reads as the pull's sibling. The owner, 13 October 2026, on
 * CONTROLS › ON THE FIELD: *i can still see old "hold" visuals usages, it
 * should be our new standard button … and why it still stays text "hold" -
 * its not our standard control visual.* It is what the red circle with a
 * thumbprint in it was, and a hold says no word, as a pull
 * says none (`saysHold`, `handle-word.ts`).
 *
 * Waiting, the drop breathes and ripples call the thumb (`soakCall`); held, the
 * thumb sinks into it and SOAK's water wells up `fill` of the way to the rim
 * (`soak-water.ts`), with the waiting clock on its shoulder as every hold in
 * the labs wears one (`hold-goo/wait.ts`). The partner's is the drop dimmed
 * and not calling, as the pull's knob is on the other screen; the caller
 * lays the partner's ring and clock over it as over every partner's mark.
 */

/**
 * A hold's drop's radius, in the cue frame's shorter half-extent — the
 * thumbprint circle's it took the place of, and every press's since.
 *
 * **Tied to the pull's knob**, so a hold, a press, a rub and a pull on one
 * boss are one size: the owner, 17 October 2026, *all on screen controls
 * should have same size … take "pull" as the basis*. CUE_FRAME's shorter half
 * is 0.66 of a tile and a pull handle 0.3, so this puts the drop within a
 * hundredth of a tile of the knob drawn `PULL_SIZE` times larger. It was 0.9
 * until the pull came down with it.
 */
export const HOLD_MARK_R = 0.45 * PULL_SIZE;

/** How one hold is asked to be drawn — `drawSoakHold`'s last argument. */
export interface SoakHoldDraw {
  time: number;
  /** A thumb is on it. */
  held?: boolean;
  /** How much of the hold is done, 0..1: the water's reach. */
  fill?: number;
  /** Seconds since it was taken, for the SQUISH; long ago if not known. */
  grabbed?: number;
  /** The partner's: dimmed, and no call. */
  theirs?: boolean;
}

/** The clock's radius over the drop's, and how far up and right the shoulder is. */
const CLOCK = 0.6;
const SHOULDER = 0.9;

export function drawSoakHold(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: SoakHoldDraw,
): void {
  SOAK_HOLD.paint(ctx, at, r, o);
}

/**
 * The paint, held where a test can swap it, as `PULL_KNOB`'s is: a boss's
 * test asks *is the hold there, held, how full* (`test/soak-spy.ts`), and the
 * drop lights itself with gradients a test counting the boss's own would
 * count too.
 */
export const SOAK_HOLD = { paint: paintSoakHold };

function paintSoakHold(ctx: CanvasRenderingContext2D, at: Point, r: number, o: SoakHoldDraw): void {
  const { time } = o;
  const held = o.held === true;
  const fill = Math.max(0, Math.min(1, o.fill ?? 0));
  const grabbed = o.grabbed ?? 9;
  noteMark(ctx, at.x, at.y, r);
  ctx.save();
  if (o.theirs) ctx.globalAlpha *= 0.4;
  const hold: Hold = { at, r, way: { x: 0, y: 0 }, near: 0, grabbed, time };
  if (!held && !o.theirs) soakCall(ctx, at, r, GOO, time);
  const body = held
    ? drop(at, r, { squash: 1 + 0.4 * settle(grabbed, 7, 19), shake: 0.03 })
    : drop(at, r, { squash: 1 + 0.07 * Math.sin(time * 3.4) });
  // SINK's thumb: only a little way in when taken, deeper as the hold is done.
  const press = held
    ? { depth: pressOf(hold).depth * (0.3 + 0.7 * fill), way: hold.way }
    : undefined;
  const turn = { held, grabbed, lifted: held ? 0 : 9 };
  const drawn = paintGoo(ctx, body, GOO, time, { red: 0 }, turn, press);
  if (fill > 0) water(ctx, drawn, time, fill);
  if (held) overHeld(ctx, hold, GOO);
  ctx.restore();
  if (held && !o.theirs) {
    const off = r * SHOULDER;
    drawMarkWait(ctx, at.x + off, at.y - off, r * CLOCK, time);
  }
}

function water(ctx: CanvasRenderingContext2D, drawn: GooBody, time: number, fill: number): void {
  ctx.save();
  ctx.clip(bodyPath(drawn, GOO, time));
  soakWater(ctx, drawn, time, fill, "good");
  ctx.restore();
}

/**
 * **What calls the thumb to a hold no hand has yet**: a breathing halo and
 * ripples out of the drop, two at a time — the pull's call until the owner
 * took WHITE RINGS · FLASH for it on 12 October 2026 (`goo-call.ts`). That
 * one flashes on the beat of the path's dots, and a hold has no path, so the
 * hold keeps this.
 */
export function soakCall(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
): void {
  const breathe = 0.5 + 0.5 * Math.sin(time * 4);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(at.x, at.y, r * 0.7, at.x, at.y, r * 2.5);
  halo.addColorStop(0, style.neon);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.globalAlpha = 0.16 + 0.18 * breathe;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = style.neon;
  for (const lag of [0, 0.5]) {
    const u = (time * 0.85 + lag) % 1;
    ctx.globalAlpha = 0.7 * (1 - u);
    ctx.lineWidth = r * 0.08 * (1 - u) + 0.3;
    ctx.stroke(bodyPath({ at, r: r * (1.12 + 0.9 * u), seed: 29 }, style, time));
  }
  ctx.restore();
}
