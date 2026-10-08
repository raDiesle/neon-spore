import type { World } from "@neon-spore/sim";
import { drawCapstan } from "./capstan-draw.js";
import type { Effects } from "./effects.js";
import { drawGall } from "./gall-draw.js";
import type { Layout } from "./layout.js";
import { drawPlumb } from "./plumb-draw.js";
import type { ViewState } from "./renderer.js";
import { drawSling } from "./sling-draw.js";
import { drawTrapeze } from "./trapeze-draw.js";

/**
 * **The clock bosses, drawn — page four**: the pairs from THE SLING on, each
 * two halves of one fight with one half to a seat, as page three's are.
 *
 * Cut from `boss-draw-clocks-c.ts` on 26 September 2026, when THE CYST and
 * THE GRINDSTONE (both since retired) landing side by side had put that page at 254 lines. There
 * is no seam in the bosses here the way there was at page three; the cut is
 * where the page was full. It filled again with THE GALL and THE TRAPEZE, and
 * from THE FLUE on is page five (`boss-draw-clocks-e.ts`).
 *
 * **The order inside is the order they were built in** and nothing depends on
 * it: every arm returns, and no two of these bosses are ever installed at once.
 */

/** Whichever boss is installed, once the null is out of the way. */
type Installed = NonNullable<World["boss"]>;

/** The kinds this file draws. Appended, like every list of boss kinds. */
export const LATE_PAIR_KINDS = ["sling", "plumb", "capstan", "gall", "trapeze"] as const;

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
  // lit and which is already drawn to say so (`sling-draw.ts`). All that
  // outlives a frame is, behind `?raster=1`, the painted draw over a cord
  // loosed true (`sling-fx.ts`): its hands and effects are the second half of
  // its look.
  if (boss.kind === "sling") {
    drawSling(ctx, l, world, boss, beat, beatPhase, time, effects.boss.sling, effects.bolts);
    effects.boss.sling.draw.draw(ctx);
    return;
  }

  // THE PLUMB: a lopsided bob hung over the middle column, a ball on a chain
  // at each end of its beam brought true by one seat holding its phone level,
  // a core in its belly both cannons are asked to hit. Both screens are drawn
  // the same — the other seat has to see whose bubble is off to say so
  // (`plumb-draw.ts`). A weight's settle, a drift's jolt, the core's hit and
  // the free swing's release are `effects.boss.plumb` (`plumb-fx.ts`).
  if (boss.kind === "plumb") {
    drawPlumb(ctx, l, world, boss, beat, beatPhase, time, effects.boss.plumb, effects.bolts);
    return;
  }

  // THE CAPSTAN: a rusted drum on its side in a cradle, rocked by one seat's
  // lean so one end face comes round and worn bright by the other's thumb, a
  // core under a cap in its middle both cannons hit (`capstan-draw.ts`); a
  // band's scrub and ring, a window's thud and the core's flash are `capstan-fx.ts`.
  if (boss.kind === "capstan") {
    drawCapstan(ctx, l, world, boss, beat, beatPhase, time, effects.boss.capstan, effects.bolts);
    return;
  }

  // THE GALL: a nodule on a raised seam across the field, pinched shut by
  // the seat nearer it and jumping to another of four points as a close
  // lands, the root bared under the peeled seam and shot (`gall-draw.ts`); a
  // pinch's flare, a close's ghost, the lips' tear and the root's flash are `gall-fx.ts`.
  if (boss.kind === "gall") {
    drawGall(ctx, l, world, boss, beat, beatPhase, time, effects.boss.gall, effects.bolts);
    return;
  }

  // THE TRAPEZE: a canvas pennant on a boom hanging from a turned spindle,
  // tapped still over the lit column by one seat and caught by the other's
  // swipe, the spindle shot (`trapeze-draw.ts`); the flag's eased place and
  // a mistimed swipe's limp flutter are `trapeze-fx.ts`.
  drawTrapeze(ctx, l, world, boss, beat, beatPhase, time, effects.boss.trapeze, effects.bolts);
}
