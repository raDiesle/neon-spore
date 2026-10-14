import type { Point } from "@neon-spore/content";
import { drop, type GooBody } from "./goo-body.js";
import { paintGoo } from "./goo-drop-look.js";
import { GOO } from "./goo-style.js";
import { noteMark } from "./mark-spots.js";
import { drawRubZigzag, rubSway } from "./rub-zigzag.js";

/**
 * **Every rub on the field, drawn as THE RUB LAB's**: its drop — THE HOLD
 * LAB's, the same RIPPLES · STILL goo — with ZIGZAG on it, one stroke for
 * every turn the rub asks, lit green as the turns are made
 * (`rub-zigzag.ts`). The owner, 14 October 2026: *about "rub lab": apply
 * "zigzag" and remove other variants. apply to all usages in game.* It is
 * what the red line with an arrow sliding in at it from each side was
 * (the owner's of 3 October 2026), and the row of pips THE
 * CHOIR counted its turns in.
 *
 * Untouched, the drop calls by wagging — left-right-left-right, quick, then a
 * rest, a swish off each side — where a hold's breathes and ripples
 * (`soak-hold.ts`), so the two are told apart before either is touched. Once
 * a turn is made, or a thumb is on it, it stops calling and the zigzag says
 * the rest. The lab's drop smears after the thumb; the field's knows no
 * thumb's place, and stands.
 */

/** How one rub is asked to be drawn — `drawRubDrop`'s last argument. */
export interface RubDropDraw {
  time: number;
  /** Turns the rub asks, and how many of them are made. */
  turns: number;
  done: number;
  /** A thumb is rubbing it: no call. */
  held?: boolean;
}

/** A drop never pressed has turned freely all along (`goo-soft.ts`'s `Turn`). */
const FREE = { held: false, grabbed: 99, lifted: 99 };

export function drawRubDrop(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: RubDropDraw,
): void {
  noteMark(ctx, at.x, at.y, r);
  const calling = o.held !== true && o.done <= 0;
  const sway = calling ? rubSway(o.time) : 0;
  const way = { x: Math.sign(sway) || 1, y: 0 };
  const k = Math.abs(sway) * 0.8;
  const slop = r * 0.22 * k;
  const body = drop({ x: at.x + way.x * slop, y: at.y }, r, {
    lean: way,
    stretch: 0.42 * k,
    point: 2.2,
    squash: 1 + 0.08 * k,
  });
  ctx.save();
  const drawn = paintGoo(ctx, body, GOO, o.time, { red: 0, green: 0 }, FREE);
  drawRubZigzag(ctx, drawn, o.turns, Math.min(o.done, o.turns), "good");
  if (calling) swishes(ctx, drawn, way, 0.7 * k);
  ctx.restore();
}

/** The call's motion lines off the side the drop leans to, white and faint. */
function swishes(ctx: CanvasRenderingContext2D, b: GooBody, way: Point, a: number): void {
  if (a <= 0.02) return;
  const towards = Math.atan2(way.y, way.x);
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "#FFFFFF";
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 3; i++) {
    const ring = b.r * (1.35 + 0.2 * i + 0.25 * (1 - a));
    const spread = 0.42 - 0.08 * i;
    ctx.globalAlpha = a * (0.9 - 0.22 * i);
    ctx.lineWidth = Math.max(0.6, b.r * (0.09 - 0.02 * i));
    ctx.beginPath();
    ctx.arc(b.at.x, b.at.y, ring, towards - spread, towards + spread);
    ctx.stroke();
  }
  ctx.restore();
}
