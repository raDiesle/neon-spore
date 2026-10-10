import type { Point } from "@neon-spore/content";
import { PALETTE, type PullKnobDraw } from "@neon-spore/render";
import { noteMark } from "../../../../packages/render/src/mark-spots.js";
import { drawWayArrow } from "../../../../packages/render/src/way-arrow.js";
import { drop } from "./body.js";
import { paintGoo } from "./drop-look.js";
import { grown } from "./enter.js";
import { type Hold, heldBody, overHeld, underHeld } from "./grab.js";
import { momentOf, SPAWN } from "./moment.js";
import { mix } from "./noise.js";
import { call } from "./parts.js";
import type { GooStyle } from "./style.js";

/**
 * **The drop under the hand**: OOZE's drop made TAR's slime, wherever the
 * hand has it. Waiting, it breathes and ripples call the thumb; taken, it
 * goes as the bar's grab has it (`grab.ts`) and red as its rim nears the
 * edge of the path.
 * Once counted or refused it is not drawn here — the channel plays the same
 * drop through its ending or its failure (`track.ts`), until it is home.
 */
export function gooKnob(style: GooStyle) {
  return (ctx: CanvasRenderingContext2D, on: Point, r: number, o: PullKnobDraw): void => {
    const m = momentOf(o.held, o.time, o.after, r);
    const at = { x: on.x + m.off.x, y: on.y + m.off.y };
    noteMark(ctx, at.x, at.y, r);
    if (m.owner !== "knob") return;
    const way = o.way ? { x: o.way.dx, y: o.way.dy } : { x: 0, y: 0 };
    // Coming in, the drop and its arrow grow together (`enter.ts`).
    const g = grown(m.enter);
    if (g < 0.02) return;
    const rr = r * g;
    ctx.save();
    if (o.theirs) ctx.globalAlpha = 0.4;
    if (!o.held && !o.theirs && m.enter >= SPAWN) call(ctx, at, r, style, o.time);
    const hold: Hold = { at, r: rr, way, near: m.near, grabbed: m.grabbed, time: o.time };
    if (o.held) underHeld(ctx, hold, style);
    const body = o.held
      ? heldBody(hold)
      : drop(at, rr, { squash: 1 + 0.07 * Math.sin(o.time * 3.4) });
    paintGoo(ctx, body, style, o.time, { red: 0.7 * m.near, alpha: o.theirs ? 0.4 : 1 }, way);
    if (o.held) overHeld(ctx, hold, style);
    if (o.way) {
      const heads = o.either ? 2 : 1;
      paintArrow(ctx, at, rr, style, { ...o.way, heads, held: o.held, time: o.time });
    }
    ctx.restore();
  };
}

/** The way to pull, inside the drop and the loudest thing on it: dark under, neon
 * round, near-white on top. `r` is the drop's radius as drawn, so it grows with it. */
export function paintArrow(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  a: { dx: number; dy: number; heads: 1 | 2; held: boolean; time: number },
): void {
  const reach = r * (a.held ? 1.05 : 1.15 + 0.07 * Math.sin(a.time * 6));
  const path = (): void => drawWayArrow(ctx, at.x, at.y, reach, a.dx, a.dy, a.time, a.heads);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.background;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = r * 0.36;
  path();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = style.neon;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = r * 0.5;
  path();
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = mix(style.neon, "#FFFFFF", 0.7);
  ctx.globalAlpha = 1;
  ctx.lineWidth = r * 0.17;
  path();
  ctx.restore();
}
