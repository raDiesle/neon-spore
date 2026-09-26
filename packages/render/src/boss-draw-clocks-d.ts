import type { World } from "@neon-spore/sim";
import { drawCyst } from "./cyst-draw.js";
import { drawDavit } from "./davit-draw.js";
import type { Effects } from "./effects.js";
import { drawGrindstone } from "./grindstone-draw.js";
import type { Layout } from "./layout.js";
import { drawPlumb } from "./plumb-draw.js";
import type { ViewState } from "./renderer.js";
import { drawSling } from "./sling-draw.js";
import { drawTrivet } from "./trivet-draw.js";

/**
 * **The clock bosses, drawn — page four**: the pairs from THE SLING on, each
 * two halves of one fight with one half to a seat, as page three's are.
 *
 * Cut from `boss-draw-clocks-c.ts` on 26 September 2026, when THE CYST and
 * THE GRINDSTONE landing side by side had put that page at 254 lines. There
 * is no seam in the bosses here the way there was at page three; the cut is
 * where the page was full, and the next pair appends here.
 *
 * **The order inside is the order they were built in** and nothing depends on
 * it: every arm returns, and no two of these bosses are ever installed at once.
 */

/** Whichever boss is installed, once the null is out of the way. */
type Installed = NonNullable<World["boss"]>;

/** The kinds this file draws. Appended, like every list of boss kinds. */
export const LATE_PAIR_KINDS = ["sling", "trivet", "plumb", "davit", "cyst", "grindstone"] as const;

export type LatePairBoss = Extract<Installed, { kind: (typeof LATE_PAIR_KINDS)[number] }>;

/** Whether this is one of them — a guard, for `isClockBoss`'s reason. */
export function isLatePairBoss(boss: Installed): boss is LatePairBoss {
  return (LATE_PAIR_KINDS as readonly string[]).includes(boss.kind);
}

export function drawLatePairBoss(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: LatePairBoss,
  /** Whichever of `effects.boss` is this boss's (`effects-boss.ts`). */
  effects: Effects,
): void {
  const { world } = view;
  const { beat } = world;
  const { beatPhase, time } = view;

  // THE SLING: a fork over the middle column, a cord off each tine drawn by
  // its own seat's thumb, loosed toward whichever column the cup asks for.
  // Both screens are drawn the same — the other seat has to see which cord is
  // lit and which is already drawn to say so (`sling-draw.ts`). Nothing of it
  // outlives a frame yet: its hands and effects are the second half of its
  // look.
  if (boss.kind === "sling") {
    drawSling(ctx, l, world, boss, beat, beatPhase, time);
    return;
  }

  // THE TRIVET: a three-legged stand splayed over the middle of the field,
  // each outer foot swung down by one seat's chord and the hub, once both are
  // planted, shot. Both screens are drawn the same — the other seat has to see
  // which foot is lit to say so (`trivet-draw.ts`). What outlives a frame —
  // a plant's thud, a clamp's flare, the hub's flash, the hull's shudder — is
  // `effects.boss.trivet` (`trivet-fx.ts`).
  if (boss.kind === "trivet") {
    drawTrivet(ctx, l, world, boss, beat, beatPhase, time, effects.boss.trivet);
    return;
  }

  // THE PLUMB: a lopsided bob hung over the middle column, a ball on a chain
  // at each end of its beam brought true by one seat holding its phone level,
  // a core in its belly both cannons are asked to hit. Both screens are drawn
  // the same — the other seat has to see whose bubble is off to say so
  // (`plumb-draw.ts`). A weight's settle, a drift's jolt, the core's hit and
  // the free swing's release are `effects.boss.plumb` (`plumb-fx.ts`).
  if (boss.kind === "plumb") {
    drawPlumb(ctx, l, world, boss, beat, beatPhase, time, effects.boss.plumb);
    return;
  }

  // THE DAVIT: a crane boom over the middle column, swung by whichever seat's
  // lean is steering it and let go by a loose off each seat's own thumb, a
  // hook on the end of its slack chain both cannons are asked to hit. Both
  // screens are drawn the same — the other seat has to see which half the
  // lean is steering and how far the lit step's window has run
  // (`davit-draw.ts`).
  if (boss.kind === "davit") {
    drawDavit(ctx, l, world, boss, beat, beatPhase, time);
    return;
  }

  // THE CYST: a four-lobed sac, each flank tapped still by one seat and
  // pinched shut by the other, a core both cannons hit (`cyst-draw.ts`); a
  // crack's thud, a sprung flank and the core's flash are `cyst-fx.ts`.
  if (boss.kind === "cyst") {
    drawCyst(ctx, l, world, boss, beat, beatPhase, time, effects.boss.cyst);
    return;
  }

  // THE GRINDSTONE: two flats ground, a caliper bitten, the axle shot
  // (`grindstone-draw.ts`); a flat's clean flash, the caliper's flare, the
  // axle's flash and the snap free are `grindstone-fx.ts`.
  drawGrindstone(ctx, l, world, boss, beat, beatPhase, time, effects.boss.grindstone);
}
