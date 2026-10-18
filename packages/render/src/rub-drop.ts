import type { Point } from "@neon-spore/content";
import { drop } from "./goo-body.js";
import { paintGoo } from "./goo-drop-look.js";
import { GOO } from "./goo-style.js";
import { noteMark } from "./mark-spots.js";
import { drawRubZigzag, rubSway, SWAY } from "./rub-zigzag.js";

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
 * Untouched, the drop calls by shaking — three hard knocks each way, quick,
 * then a rest — and every knock throws a wave off the side it hit, three
 * bold arcs spreading out and fading, where a hold's breathes and ripples
 * (`soak-hold.ts`) and a press's hops and rings all round (`press-call.ts`),
 * so the three are told apart before any is touched. The owner, 18 October
 * 2026: *increase the shaking movement to be stronger and the waves of the
 * shake more visible — right now its hardly distinguishable from press.* Once
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
  const k = Math.abs(sway);
  const slop = r * 0.42 * k;
  const body = drop({ x: at.x + way.x * slop, y: at.y }, r, {
    lean: way,
    stretch: 0.6 * k,
    point: 2.2,
    squash: 1 + 0.14 * k,
  });
  ctx.save();
  const drawn = paintGoo(ctx, body, GOO, o.time, { red: 0, green: 0 }, FREE);
  drawRubZigzag(ctx, drawn, o.turns, Math.min(o.done, o.turns), "good");
  if (calling) waves(ctx, at, r, o.time);
  ctx.restore();
}

/** Seconds a knock's wave takes to spread and go. */
const WAVE = 0.42;

/** The waves the shake throws: at each knock — each peak of the wag — three arcs
 * off that side, spreading out from the mark and fading, neon round a white core. */
function waves(ctx: CanvasRenderingContext2D, at: Point, r: number, time: number): void {
  const s = Math.max(0, time) % SWAY.round;
  ctx.save();
  ctx.lineCap = "round";
  for (let j = 0; j < 2 * SWAY.wags; j++) {
    const u = (s - SWAY.wag * (0.25 + 0.5 * j)) / WAVE;
    if (u < 0 || u >= 1) continue;
    const towards = j % 2 === 0 ? 0 : Math.PI;
    for (let i = 0; i < 3; i++) {
      const ring = r * (1.75 + 0.3 * i + 0.8 * u);
      const spread = 0.5 - 0.08 * i;
      const a = (1 - u) ** 1.3 * (1 - 0.22 * i);
      const w = Math.max(0.8, r * (0.15 - 0.03 * i) * (1 - 0.5 * u));
      ctx.beginPath();
      ctx.arc(at.x, at.y, ring, towards - spread, towards + spread);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.6 * a;
      ctx.strokeStyle = GOO.neon;
      ctx.lineWidth = w * 2.4;
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = a;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = w;
      ctx.stroke();
    }
  }
  ctx.restore();
}
