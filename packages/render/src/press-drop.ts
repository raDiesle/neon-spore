import type { Point } from "@neon-spore/content";
import { smoothstep } from "./ease.js";
import { bodyPath, drop, type GooBody } from "./goo-body.js";
import { paintGoo } from "./goo-drop-look.js";
import { grown } from "./goo-enter.js";
import { SPAWN } from "./goo-moment.js";
import { clamp01, settle } from "./goo-noise.js";
import { GOO } from "./goo-style.js";
import { noteMark } from "./mark-spots.js";
import { tapCall } from "./press-call.js";
import { frontPath, soakWater, type Tone, WELL } from "./soak-water.js";

/**
 * **Every press, drawn as THE PRESS LAB's** — the HOLD LAB's drop told apart
 * from a hold by everything a finger does to it (the owner, 13 October 2026:
 * *visual should be same as decided in "hold" but we need somehow to
 * distinguish between them … likely there should be no visual for pressing
 * down, but the button pops up top again fast*), lifted out of the director
 * when THE BLISTER's TAP took it as its control (the owner, 15 October 2026:
 * *they should follow our standard tap control visuals*):
 *
 * - **nothing sinks**: no thumbprint, no dent, no water welling up under a
 *   resting thumb, no clock — a press is not waited through;
 * - **it pops up**: every press springs the drop up and taller at once and
 *   lets it settle, with a white ring off its rim;
 * - **it calls in a tap rhythm** rather than the hold's slow breathing
 *   (`press-call.ts`), so the two marks differ before either is touched;
 * - **a lapse** is the drop going red and shuddering where it is, the count
 *   draining out — the hold's refusal. As the gap nears it, the drop reddens.
 *
 * Inside it, **STEPS**: SOAK's water cut into the presses, one terrace a
 * press, each a jump; the terraces still to come are faint contours on the
 * empty drop, so a mark of one press has none and a mark of ten is banded
 * close (the owner, 13 October 2026: *it should ideally already indicate
 * somehow how many times roundabout it is required to tap/press*).
 */

/** What a press is drawn from — THE PRESS LAB's view, and the game's. */
export interface PressDropView {
  readonly ctx: CanvasRenderingContext2D;
  readonly at: Point;
  readonly r: number;
  readonly time: number;
  /** How many presses the mark asks. */
  readonly times: number;
  /** Presses to show done, whole. */
  readonly done: number;
  /** The same, smooth, as a press steps it up or a lapse drains it. */
  readonly shown: number;
  /** Seconds since the last press landed, for its pop. */
  readonly pressed: number;
  /** How near the presses are to lapsing, 0..1. */
  readonly near: number;
  /** Seconds since the mark came in. */
  readonly born: number;
  /** Seconds into a lapse, while it is shown; `null` otherwise. */
  readonly failure: number | null;
  /** The partner's: it does not call. */
  readonly quiet?: boolean;
}

/** How far a press has the drop popped up, `t` seconds after it: all the way at once,
 * then springing back down through a wobble. */
export const popOf = (t: number): number => (t < 1 ? settle(t, 10, 26) : 0);

/** A drop never pressed has turned freely all along (`goo-soft.ts`'s `Turn`). */
const FREE = { held: false, grabbed: 99, lifted: 99 };

/** The tone the count is drawn in: red through a lapse, and blinking red as one nears. */
export function toneOf(v: PressDropView): Tone {
  if (v.failure !== null) return "red";
  return v.near > 0.6 && Math.sin(v.time * 22) > 0 ? "red" : "good";
}

/** The press on the field: the drop, its call or its pop, and STEPS in it. */
export function paintPressDrop(v: PressDropView): void {
  const { ctx, at, r, time } = v;
  const g = grown(v.born);
  if (g < 0.02) return;
  let body: GooBody;
  let red = 0;
  if (v.failure !== null) {
    const k = clamp01(v.failure / 0.9);
    body = drop(at, r, { squash: 1 + 0.35 * settle(v.failure, 6, 18), shake: 0.3 * (1 - k) });
    red = 0.9 * (1 - smoothstep(k));
  } else {
    let hop = 0;
    if (v.done === 0 && v.born >= SPAWN && v.quiet !== true) hop = tapCall(v);
    const pop = Math.max(popOf(v.pressed), 0.6 * hop);
    const up: Point = { x: at.x, y: at.y - r * 0.28 * Math.max(0, pop) };
    body = drop(up, r * g, { squash: 1 - 0.3 * pop, shake: 0.1 * v.near ** 2 });
    red = 0.6 * v.near ** 2;
  }
  const drawn = paintGoo(ctx, body, GOO, time, { red, green: 0 }, FREE);
  ctx.save();
  ctx.clip(bodyPath(drawn, GOO, time));
  steps(v, drawn, toneOf(v));
  ctx.restore();
  popRing(v, drawn);
}

/** SOAK's water up to the presses done, and the terraces still to come. */
function steps(v: PressDropView, drawn: GooBody, tone: Tone): void {
  const n = v.times;
  const { ctx, time } = v;
  // SOAK's reach eases out; the terraces are evenly spaced, so the fill is put
  // where SOAK's own easing lands on the even one.
  const q = Math.min(1, v.shown / n);
  soakWater(ctx, drawn, time, 1 - (1 - q) ** (1 / 2.2), tone);
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = GOO.neon;
  ctx.lineWidth = Math.max(0.5, drawn.r * 0.035);
  for (let k = Math.max(1, v.done + 1); k < n; k++) {
    ctx.globalAlpha = 0.4;
    ctx.stroke(frontPath(drawn, time, WELL + ((1 - WELL) * k) / n, 0));
  }
}

/** The white ring a press throws off the rim, wide and gone in a third of a second. */
function popRing(v: PressDropView, b: GooBody): void {
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

/** How one press on the field is asked to be drawn — `drawPressDrop`'s last argument. */
export interface PressDropDraw {
  time: number;
  /** How many presses it asks, and how many are done. */
  times: number;
  done: number;
  /** Seconds since the last press landed; long ago if not known. */
  pressed?: number;
  /** The partner's: dimmed, and no call — as the HOLD LAB's drop is (`soak-hold.ts`). */
  theirs?: boolean;
}

/**
 * A press as the game asks for one: no lapse, as THE BLISTER's blows never
 * lapse, and the call's rhythm running off the clock since nothing in the
 * world says when the mark came in. Every tap on the field is this since 15
 * October 2026 — a `TAP` cue (`cue-helper.ts`), THE INSTAR's and THE
 * NETTLE's tap marks (`instar-marks.ts`), THE LAMPREY's tooth
 * (`lamprey-marks.ts`) — the owner: *they should follow our standard tap
 * control visuals*.
 */
export function drawPressDrop(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: PressDropDraw,
): void {
  noteMark(ctx, at.x, at.y, r);
  const done = Math.max(0, Math.min(o.times, o.done));
  ctx.save();
  if (o.theirs) ctx.globalAlpha *= 0.4;
  paintPressDrop({
    ctx,
    at,
    r,
    time: o.time,
    times: Math.max(1, o.times),
    done,
    shown: done,
    pressed: o.pressed ?? 99,
    near: 0,
    born: SPAWN + o.time,
    failure: null,
    quiet: o.theirs === true,
  });
  ctx.restore();
}
