import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { bodyPath, drop, type GooBody } from "../../../../packages/render/src/goo-body.js";
import { paintGoo } from "../../../../packages/render/src/goo-drop-look.js";
import { grown } from "../../../../packages/render/src/goo-enter.js";
import { SPAWN } from "../../../../packages/render/src/goo-moment.js";
import { clamp01, settle } from "../../../../packages/render/src/goo-noise.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import type { Tone } from "../../../../packages/render/src/soak-water.js";
import { fizzAway } from "../hold-goo/goo.js";
import type { RubLook, RubView } from "./view.js";

/**
 * **The GOO rub**: THE HOLD LAB's drop — the same RIPPLES · STILL drop, at the
 * same size in the same place, boiled away with the same FIZZ once counted —
 * told apart from a hold and a press by what a thumb does to it, as THE PRESS
 * LAB's is (`press-goo/goo.ts`):
 *
 * - **it smears after the thumb**: nothing sinks and nothing pops; the drop
 *   leans and draws out the way the thumb has gone, and is dragged a little
 *   after it, so a scrub across it slops it side to side;
 * - **every turn throws a swish** — motion lines off the side it turned at,
 *   white; a turn made alone on BOTH AT ONCE throws a grey one, counting nothing;
 * - **it calls by wagging**: untouched, it sways left-right-left-right, quick,
 *   then rests, with a swish each way — where a hold breathes and a press
 *   taps (`SWAY`), so the three marks differ before any is touched;
 * - **a lapse** is the drop going red and shuddering where it is, the count
 *   draining out — the press's refusal.
 *
 * How many turns it asks, and how many are done, is a `Rubbed` — the looks
 * THE RUB LAB offers on its picker (`looks.ts`, `looks-b.ts`).
 */

export interface Rubbed {
  readonly key: string;
  readonly name: string;
  readonly sentence: string;
  /** The drop's body, given what is done. */
  body?(b: GooBody, v: RubView): GooBody;
  /** How green the drop itself is, 0..1. */
  green?(v: RubView): number;
  /** Inside the drop, clipped to it, over everything the drop paints. */
  inside?(v: RubView, drawn: GooBody, tone: Tone): void;
  /** Over the drop and the field round it, unclipped. */
  over?(v: RubView, drawn: GooBody, tone: Tone): void;
}

export function gooRub(c: Rubbed): RubLook {
  return {
    key: c.key,
    name: c.name,
    sentence: c.sentence,
    paint(v) {
      if (v.ending !== null) fizzAway(v, v.ending, (b) => c.body?.(b, v) ?? b);
      if (v.mark) mark(v, c);
    },
  };
}

/** The wag a mark no thumb has touched calls with: two quick sways each way, then
 * a rest. Signed, -1 leaning left to 1 right. */
const SWAY = { wag: 0.3, wags: 2, round: 1.5 };

export function swayOf(v: RubView): number {
  const s = Math.max(0, v.born - SPAWN) % SWAY.round;
  const span = SWAY.wag * SWAY.wags;
  if (s >= span + SWAY.wag * 0.5) return 0;
  const fade = s < span ? 1 : 1 - (s - span) / (SWAY.wag * 0.5);
  return Math.sin((2 * Math.PI * s) / SWAY.wag) * fade;
}

/** A drop never pressed has turned freely all along (`goo-soft.ts`'s `Turn`). */
const FREE = { held: false, grabbed: 99, lifted: 99 };

/** The tone a look draws its count in: red through a lapse, and blinking red as one nears. */
export function toneOf(v: RubView): Tone {
  if (v.failure !== null) return "red";
  return v.near > 0.6 && Math.sin(v.time * 22) > 0 ? "red" : "good";
}

/** How far the drop is smeared, and which way: the thumb's offset, or the call's wag. */
function smearOf(v: RubView): { way: Point; k: number } {
  if (v.held) {
    const d = Math.hypot(v.offset.x, v.offset.y);
    if (d < 0.5) return { way: { x: 1, y: 0 }, k: 0 };
    return { way: { x: v.offset.x / d, y: v.offset.y / d }, k: clamp01(d / (v.r * 1.1)) };
  }
  if (v.done > 0 || v.born < SPAWN) return { way: { x: 1, y: 0 }, k: 0 };
  const s = swayOf(v);
  return { way: { x: Math.sign(s) || 1, y: 0 }, k: Math.abs(s) * 0.8 };
}

function mark(v: RubView, c: Rubbed): void {
  const { ctx, at, r, time } = v;
  const g = grown(v.born);
  if (g < 0.02) return;
  const tone = toneOf(v);
  const smear = smearOf(v);
  let body: GooBody;
  let red = 0;
  if (v.failure !== null) {
    const k = clamp01(v.failure / 0.9);
    body = drop(at, r, { squash: 1 + 0.35 * settle(v.failure, 6, 18), shake: 0.3 * (1 - k) });
    red = 0.9 * (1 - smoothstep(k));
  } else {
    const slop = r * 0.22 * smear.k;
    const centre = { x: at.x + smear.way.x * slop, y: at.y + smear.way.y * slop };
    body = drop(centre, r * g, {
      lean: smear.way,
      stretch: 0.42 * smear.k,
      point: 2.2,
      squash: 1 + 0.08 * smear.k,
      shake: 0.1 * v.near ** 2,
    });
    red = 0.6 * v.near ** 2;
  }
  body = c.body?.(body, v) ?? body;
  const tint = { red, green: c.green?.(v) ?? 0 };
  const drawn = paintGoo(ctx, body, GOO, time, tint, FREE);
  if (c.inside) {
    ctx.save();
    ctx.clip(bodyPath(drawn, GOO, time));
    c.inside(v, drawn, tone);
    ctx.restore();
  }
  c.over?.(v, drawn, tone);
  if (v.failure === null) swishes(v, drawn, smear.way, smear.k);
}

/** Seconds a swish takes to fly off and go. */
const SWISH = 0.28;

/** The motion lines off the side the drop is smeared to: white on a turn just
 * counted, grey on one made alone, faint on the call's wag. */
function swishes(v: RubView, b: GooBody, way: Point, k: number): void {
  const turn = v.done > 0 && v.turned < SWISH ? 1 - v.turned / SWISH : 0;
  const alone = v.lonely < SWISH ? 1 - v.lonely / SWISH : 0;
  const call = v.held || v.done > 0 ? 0 : 0.7 * k;
  const a = Math.max(turn, alone, call);
  if (a <= 0.02) return;
  const { ctx } = v;
  const towards = Math.atan2(way.y, way.x);
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = alone > turn ? PALETTE.dim : "#FFFFFF";
  if (alone <= turn) ctx.globalCompositeOperation = "lighter";
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
