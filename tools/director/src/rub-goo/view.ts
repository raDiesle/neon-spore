import type { Point } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { ENDING } from "../../../../packages/render/src/goo-moment.js";
import { clamp01 } from "../../../../packages/render/src/goo-noise.js";
import {
  type LabRub,
  nearLapse,
  RUB_AT,
  RUB_R,
  type RubAsk,
  type RubSeats,
  TOGETHER,
  VERDICT_SECONDS,
} from "../rub-lab-rule.js";

/**
 * **What a RUB LAB look is told**, read once a frame from the rule's state
 * (`rub-lab-rule.ts`), as `press-goo/view.ts` is THE PRESS LAB's. A look draws
 * from this and nothing else, so the sheet and the live lab draw the same thing.
 */
export interface RubView {
  readonly ctx: CanvasRenderingContext2D;
  readonly at: Point;
  readonly r: number;
  readonly time: number;
  readonly ask: RubAsk;
  readonly seats: RubSeats;
  /** The mark is on the field to be rubbed. */
  readonly mark: boolean;
  /** A thumb took the mark and is on it now. */
  readonly held: boolean;
  /** Where that thumb is from where it took the mark. */
  readonly offset: Point;
  /** Turns to show done, whole — what is rubbed, or a lapse draining back to none. */
  readonly done: number;
  /** The same, smooth: a turn steps it up over `STEP`, a lapse drains it over `DRAIN`. */
  readonly shown: number;
  /** Seconds since the last turn that counted, and since the last one made alone. */
  readonly turned: number;
  readonly lonely: number;
  /** How near the turns are to lapsing, 0..1. */
  readonly near: number;
  /** BOTH AT ONCE: how much the other seat is rubbing now, 0..1; always 1 for ONE SEAT. */
  readonly partner: number;
  readonly born: number;
  readonly ending: number | null;
  readonly failure: number | null;
}

/** Seconds a turn takes to step the count shown up, and a lapse to drain it. */
export const STEP = 0.12;
export const DRAIN = 0.5;

/** A look for the one generic rub. */
export interface RubLook {
  readonly key: string;
  readonly name: string;
  readonly sentence: string;
  paint(v: RubView): void;
}

export function viewOf(
  ctx: CanvasRenderingContext2D,
  h: LabRub,
  ask: RubAsk,
  seats: RubSeats,
  time: number,
): RubView {
  const failing = h.last === "lapsed" && h.age < VERDICT_SECONDS;
  const counting = h.last === "counted" && h.age < ENDING;
  let done = h.done;
  let shown = h.done > 0 ? h.done - 1 + smoothstep(clamp01(h.turned / STEP)) : 0;
  if (failing) {
    shown = h.had * (1 - smoothstep(clamp01(h.age / DRAIN)));
    done = Math.ceil(shown - 1e-6);
  }
  return {
    ctx,
    at: RUB_AT,
    r: RUB_R,
    time,
    ask,
    seats,
    mark: !h.waiting,
    held: h.down && h.onIt,
    offset: h.offset,
    done,
    shown,
    turned: h.turned,
    lonely: h.lonely,
    near: nearLapse(h),
    partner: seats === "one" ? 1 : 1 - smoothstep(clamp01((h.partner - TOGETHER * 0.6) / 0.25)),
    born: h.born,
    ending: counting ? h.age : null,
    failure: failing ? h.age : null,
  };
}
