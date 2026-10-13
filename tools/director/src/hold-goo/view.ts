import type { Point } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { ENDING } from "../../../../packages/render/src/goo-moment.js";
import { clamp01 } from "../../../../packages/render/src/goo-noise.js";
import {
  HOLD_AT,
  HOLD_R,
  type HoldAsk,
  type LabHold,
  nearSlip,
  VERDICT_SECONDS,
} from "../hold-lab-rule.js";

/**
 * **What a HOLD LAB look is told**, read once a frame from the rule's state
 * (`hold-lab-rule.ts`) — the HOLD LAB's `GooMoment`. A look draws from this
 * and nothing else, so the sheet and the live lab draw the same thing.
 */
export interface HoldView {
  readonly ctx: CanvasRenderingContext2D;
  readonly at: Point;
  readonly r: number;
  readonly time: number;
  readonly ask: HoldAsk;
  /** The mark is on the field to be taken, or under the thumb. */
  readonly mark: boolean;
  readonly held: boolean;
  /** How much of the hold to show done, 0..1: what is held, or a failure draining. */
  readonly fill: number;
  /** How near the thumb is to sliding off, 0..1, and the way it is off the middle. */
  readonly near: number;
  readonly way: Point;
  /** Seconds since the mark was taken, let go, and came in. */
  readonly grabbed: number;
  readonly lifted: number;
  readonly born: number;
  /** Seconds into a count's ending (FIZZ), while it plays; `null` otherwise. */
  readonly ending: number | null;
  /** Seconds into a refusal or a slip, while it is shown; `null` otherwise. */
  readonly failure: number | null;
}

/** Seconds a refused or slipped hold's red drains out of the fill. */
export const DRAIN = 0.5;

/** A look for the one generic hold. */
export interface HoldLook {
  readonly name: string;
  readonly sentence: string;
  paint(v: HoldView): void;
}

export function viewOf(
  ctx: CanvasRenderingContext2D,
  h: LabHold,
  ask: HoldAsk,
  time: number,
): HoldView {
  const held = h.phase === "held";
  const failing =
    !held && (h.last === "refused" || h.last === "slipped") && h.age < VERDICT_SECONDS;
  const d = Math.hypot(h.off.x, h.off.y);
  let fill = held ? h.fill : 0;
  if (failing) fill = h.from.fill * (1 - smoothstep(clamp01(h.age / DRAIN)));
  return {
    ctx,
    at: HOLD_AT,
    r: HOLD_R,
    time,
    ask,
    mark: !h.waiting,
    held,
    fill,
    near: nearSlip(h),
    way: d > 0.5 ? { x: h.off.x / d, y: h.off.y / d } : { x: 0, y: 0 },
    grabbed: h.grabbed,
    lifted: h.lifted,
    born: h.born,
    ending: h.last === "counted" && h.age < ENDING ? h.age : null,
    failure: failing ? h.age : null,
  };
}
