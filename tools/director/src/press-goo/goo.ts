import type { Point } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { bodyPath, drop, type GooBody } from "../../../../packages/render/src/goo-body.js";
import { paintGoo } from "../../../../packages/render/src/goo-drop-look.js";
import { grown } from "../../../../packages/render/src/goo-enter.js";
import { SPAWN } from "../../../../packages/render/src/goo-moment.js";
import { clamp01, settle } from "../../../../packages/render/src/goo-noise.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { fizzAway, type Tone } from "../hold-goo/goo.js";
import { tapCall } from "./call.js";
import type { PressLook, PressView } from "./view.js";

/**
 * **The GOO press**: THE HOLD LAB's drop — the same RIPPLES · STILL drop, at
 * the same size in the same place, boiled away with the same FIZZ once
 * counted (`hold-goo/goo.ts`) — told apart from a hold by everything a finger
 * does to it (the owner, 13 October 2026: *visual should be same as decided
 * in "hold" but we need somehow to distinguish between them … likely there
 * should be no visual for pressing down, but the button pops up top again
 * fast*):
 *
 * - **nothing sinks**: no thumbprint, no dent, no water welling up under a
 *   resting thumb, no clock — a press is not waited through;
 * - **it pops up**: every press springs the drop up and taller at once and
 *   lets it settle, with a white ring off its rim;
 * - **it calls in a tap rhythm** rather than the hold's slow breathing
 *   (`call.ts`), so the two marks differ before either is touched;
 * - **a lapse** is the drop going red and shuddering where it is, the count
 *   draining out — the hold's refusal. As the gap nears it, the drop reddens.
 *
 * How many presses it asks, and how many are done, is a `Count` — the looks
 * THE PRESS LAB offers on its picker (`looks.ts`).
 */

export interface Count {
  readonly key: string;
  readonly name: string;
  readonly sentence: string;
  /** The call before the first press, in place of the tap call; how high it hops the drop, 0..1. */
  call?(v: PressView): number;
  /** The drop's body, given what is done. */
  body?(b: GooBody, v: PressView): GooBody;
  /** How green the drop itself is, 0..1. */
  green?(v: PressView): number;
  /** Inside the drop, clipped to it, over everything the drop paints. */
  inside?(v: PressView, drawn: GooBody, tone: Tone): void;
  /** Over the drop and the field round it, unclipped. */
  over?(v: PressView, drawn: GooBody, tone: Tone): void;
}

export function gooPress(c: Count): PressLook {
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

/** How far a press has the drop popped up, `t` seconds after it: all the way at once,
 * then springing back down through a wobble. */
export const popOf = (t: number): number => (t < 1 ? settle(t, 10, 26) : 0);

/** A drop never pressed has turned freely all along (`goo-soft.ts`'s `Turn`). */
const FREE = { held: false, grabbed: 99, lifted: 99 };

/** The tone a look draws its count in: red through a lapse, and blinking red as one nears. */
export function toneOf(v: PressView): Tone {
  if (v.failure !== null) return "red";
  return v.near > 0.6 && Math.sin(v.time * 22) > 0 ? "red" : "good";
}

function mark(v: PressView, c: Count): void {
  const { ctx, at, r, time } = v;
  const g = grown(v.born);
  if (g < 0.02) return;
  const tone = toneOf(v);
  let body: GooBody;
  let red = 0;
  if (v.failure !== null) {
    const k = clamp01(v.failure / 0.9);
    body = drop(at, r, { squash: 1 + 0.35 * settle(v.failure, 6, 18), shake: 0.3 * (1 - k) });
    red = 0.9 * (1 - smoothstep(k));
  } else {
    let hop = 0;
    if (v.done === 0 && v.born >= SPAWN) hop = c.call ? c.call(v) : tapCall(v);
    const pop = Math.max(popOf(v.pressed), 0.6 * hop);
    const up: Point = { x: at.x, y: at.y - r * 0.28 * Math.max(0, pop) };
    body = drop(up, r * g, { squash: 1 - 0.3 * pop, shake: 0.1 * v.near ** 2 });
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
  popRing(v, drawn);
}

/** The white ring a press throws off the rim, wide and gone in a third of a second. */
function popRing(v: PressView, b: GooBody): void {
  const k = v.pressed / 0.32;
  if (v.done === 0 || k >= 1) return;
  const { ctx, time } = v;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "#FFFFFF";
  ctx.globalAlpha = 0.85 * (1 - k) ** 2;
  ctx.lineWidth = b.r * 0.1 * (1 - k) + 0.4;
  ctx.stroke(bodyPath({ ...b, r: b.r * (1.08 + 0.55 * k) }, GOO, time));
  ctx.restore();
}
