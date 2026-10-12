import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { bodyPath, drop, type GooBody } from "../../../../packages/render/src/goo-body.js";
import { call } from "../../../../packages/render/src/goo-call.js";
import { paintGoo } from "../../../../packages/render/src/goo-drop-look.js";
import { greenAt } from "../../../../packages/render/src/goo-ending.js";
import { grown } from "../../../../packages/render/src/goo-enter.js";
import { boil } from "../../../../packages/render/src/goo-fizz.js";
import {
  fieldSplash,
  type Hold,
  overHeld,
  pressOf,
} from "../../../../packages/render/src/goo-grab.js";
import { ENDING, SPAWN } from "../../../../packages/render/src/goo-moment.js";
import { clamp01, settle } from "../../../../packages/render/src/goo-noise.js";
import type { Press } from "../../../../packages/render/src/goo-press.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import type { HoldLook, HoldView } from "./view.js";

/**
 * **The GOO hold**: the PULL LAB's shipped look — the RIPPLES · STILL drop
 * (`goo-drop-look.ts`), taken with a SQUISH (`goo-grab.ts`), boiled away with FIZZ
 * once counted (`goo-fizz.ts`) — on a thumb that stays put. Nothing travels, so
 * where the pull carries the drop, the hold leans it towards a thumb sliding
 * off and goes red as the thumb nears the limit, as the pull's drop does at
 * the edge of its path.
 *
 * What tells one GOO hold from another is **how the beats being held are
 * shown** (`Progress`): the drop filling, dots round it, the drop blooming, a
 * thumbprint lighting, the thumb sinking in. A refusal or a slip is the
 * drop going red and shuddering where it is, the progress draining out.
 */

/** The colour progress is shown in: green while it fills, red as a failure drains it. */
export type Tone = "good" | "red";

export interface Progress {
  readonly name: string;
  readonly sentence: string;
  /** The drop's body, `fill` of the way through the hold. */
  body?(b: GooBody, fill: number, v: HoldView): GooBody;
  /** How deep the thumb is in the drop while held, given the SQUISH's own. */
  depth?(squish: number, fill: number): number;
  /** Inside the drop, clipped to `path`, over everything the drop paints. */
  inside?(v: HoldView, drawn: GooBody, path: Path2D, fill: number, tone: Tone): void;
  /** Round the drop, over the field — drawn under it. */
  around?(v: HoldView, fill: number, tone: Tone): void;
}

export function gooHold(p: Progress): HoldLook {
  return {
    name: p.name,
    sentence: p.sentence,
    ownsEdge: true,
    paint(v) {
      if (v.ending !== null) fizzOut(v, p, v.ending);
      if (v.mark) mark(v, p);
    },
  };
}

/** The mark: coming in, waiting, held, or failing where it is. */
function mark(v: HoldView, p: Progress): void {
  const { ctx, at, r, time } = v;
  const g = grown(v.born);
  if (g < 0.02) return;
  const tone: Tone = v.failure !== null ? "red" : "good";
  if (v.held) fieldSplash(ctx, at, r, GOO, v.grabbed);
  p.around?.(v, v.fill, tone);
  const turn = { held: v.held, grabbed: v.grabbed, lifted: v.lifted };
  let body: GooBody;
  let red = 0;
  let press: Press | undefined;
  const hold: Hold = { at, r, way: v.way, near: v.near, grabbed: v.grabbed, time };
  if (v.held) {
    const into = smoothstep(clamp01(v.grabbed / 0.3));
    body = drop(at, r, {
      lean: v.way,
      stretch: 0.3 * v.near ** 1.5,
      shake: 0.12 * v.near + 0.03 * into,
      squash: 1 + 0.4 * settle(v.grabbed, 7, 19),
    });
    red = 0.7 * v.near;
    const squish = pressOf(hold);
    press = { depth: p.depth?.(squish.depth, v.fill) ?? squish.depth, way: v.way };
  } else if (v.failure !== null) {
    const k = clamp01(v.failure / 0.9);
    body = drop(at, r, { squash: 1 + 0.35 * settle(v.failure, 6, 18), shake: 0.3 * (1 - k) });
    red = 0.9 * (1 - smoothstep(k));
  } else {
    if (v.born >= SPAWN) call(ctx, at, r, GOO, time);
    body = drop(at, r * g, { squash: 1 + 0.07 * Math.sin(time * 3.4) });
  }
  body = p.body?.(body, v.fill, v) ?? body;
  const drawn = paintGoo(ctx, body, GOO, time, { red }, turn, press);
  if (p.inside)
    clipped(ctx, bodyPath(drawn, GOO, time), (path) => p.inside?.(v, drawn, path, v.fill, tone));
  if (v.held) overHeld(ctx, hold, GOO);
}

/** FIZZ where the mark was counted: green at once, boiling away into bubbles. */
function fizzOut(v: HoldView, p: Progress, e: number): void {
  const u = clamp01(e / ENDING);
  const left = (1 - u) ** 1.3;
  if (left > 0.04) {
    const full = p.body?.(drop(v.at, v.r * left, { shake: 0.25 * u }), 1, v);
    const b = full ?? drop(v.at, v.r * left, { shake: 0.25 * u });
    const turn = { held: false, grabbed: 9, lifted: e };
    const tint = { red: 0, green: greenAt(e), alpha: 0.4 + 0.6 * left };
    paintGoo(v.ctx, b, GOO, v.time, tint, turn);
  }
  boil(v.ctx, v.at, v.r, u, left);
}

function clipped(ctx: CanvasRenderingContext2D, path: Path2D, f: (p: Path2D) => void): void {
  ctx.save();
  ctx.clip(path);
  f(path);
  ctx.restore();
}

/** The colour of `tone`, and its brighter edge. */
export function toneHex(tone: Tone): { hex: string; rim: string } {
  return tone === "red"
    ? { hex: PALETTE.red, rim: PALETTE.redRim }
    : { hex: PALETTE.good, rim: PALETTE.goodRim };
}

/** A point at `a` radians from the top, clockwise, `d` from `at`. */
export function clock(at: Point, d: number, a: number): Point {
  return { x: at.x + Math.sin(a) * d, y: at.y - Math.cos(a) * d };
}
