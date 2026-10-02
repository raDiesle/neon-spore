import type { World } from "@neon-spore/sim";
import { drawBurgee } from "./burgee-draw.js";
import { drawCapstan } from "./capstan-draw.js";
import { drawCyst } from "./cyst-draw.js";
import { drawDavit } from "./davit-draw.js";
import type { Effects } from "./effects.js";
import { drawFlue } from "./flue-draw.js";
import { drawGall } from "./gall-draw.js";
import { drawGovernor } from "./governor-draw.js";
import { drawGrindstone } from "./grindstone-draw.js";
import { drawHalter } from "./halter-draw.js";
import { drawLamprey } from "./lamprey-draw.js";
import type { Layout } from "./layout.js";
import { drawMimic } from "./mimic-draw.js";
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
export const LATE_PAIR_KINDS = [
  "sling",
  "trivet",
  "plumb",
  "davit",
  "cyst",
  "grindstone",
  "halter",
  "capstan",
  "gall",
  "burgee",
  "flue",
  "governor",
  "lamprey",
  "mimic",
] as const;

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
    drawSling(ctx, l, world, boss, beat, beatPhase, time, effects.boss.sling);
    effects.boss.sling.draw.draw(ctx);
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
    effects.boss.trivet.plant.draw(ctx);
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
    drawDavit(ctx, l, world, boss, beat, beatPhase, time, effects.boss.davit);
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
  if (boss.kind === "grindstone") {
    drawGrindstone(ctx, l, world, boss, beat, beatPhase, time, effects.boss.grindstone);
    return;
  }

  // THE HALTER: a plated slab hugged shut along a seam of three segments,
  // each parted while one seat touches nothing and the other holds both
  // grips, the bared centre shot; its tell is the tremor stopping
  // (`halter-draw.ts`). Nothing of it outlives a frame.
  if (boss.kind === "halter") {
    drawHalter(ctx, l, world, boss, beat, beatPhase, time, effects.boss.halter.verdicts);
    return;
  }

  // THE CAPSTAN: a rusted drum on its side in a cradle, rocked by one seat's
  // lean so one end face comes round and worn bright by the other's thumb, a
  // core under a cap in its middle both cannons hit (`capstan-draw.ts`); a
  // band's scrub and ring, a window's thud and the core's flash are `capstan-fx.ts`.
  if (boss.kind === "capstan") {
    drawCapstan(ctx, l, world, boss, beat, beatPhase, time, effects.boss.capstan);
    return;
  }

  // THE GALL: a nodule on a raised seam across the field, pinched shut by
  // the seat nearer it and jumping to another of four points as a close
  // lands, the root bared under the peeled seam and shot (`gall-draw.ts`); a
  // pinch's flare, a close's ghost, the lips' tear and the root's flash are `gall-fx.ts`.
  if (boss.kind === "gall") {
    drawGall(ctx, l, world, boss, beat, beatPhase, time, effects.boss.gall);
    return;
  }

  // THE BURGEE: a canvas pennant on a boom hanging from a turned spindle,
  // tapped still over the lit column by one seat and caught by the other's
  // swipe, the spindle shot (`burgee-draw.ts`); the flag's eased place and
  // a mistimed swipe's limp flutter are `burgee-fx.ts`.
  if (boss.kind === "burgee") {
    drawBurgee(ctx, l, world, boss, beat, beatPhase, time, effects.boss.burgee);
    return;
  }

  // THE FLUE: a slotted flue across the field, its ember stopped dead by one
  // seat sending nothing and tapped three times by the other, a core bared
  // under a damper and shot (`flue-draw.ts`); a tap's tick, a notch's flare,
  // the damper's thud and the core's flash are `flue-fx.ts`.
  if (boss.kind === "flue") {
    drawFlue(ctx, l, world, boss, beat, beatPhase, time, effects.boss.flue, effects.bolts);
    return;
  }

  // THE GOVERNOR: a flywheel's needle sweeping on its own under a flyball
  // governor, braked by one seat's chord on the yoke and tapped by the other
  // on the lit mark, the hub it turns on shot (`governor-draw.ts`); its
  // marks' verdicts on a touch are `governor-verdicts.ts`.
  if (boss.kind === "governor") {
    drawGovernor(ctx, l, world, boss, beat, beatPhase, time, effects.boss.governor, effects.bolts);
    return;
  }

  // THE LAMPREY: an eel bitten onto the hull and crawling along it, held
  // under by one seat while the other taps its lit tooth out, then reared
  // with its gullet lit and shot (`lamprey-draw.ts`); its marks' verdicts on
  // a touch are `lamprey-verdicts.ts`.
  if (boss.kind === "lamprey") {
    drawLamprey(ctx, l, world, boss, beat, beatPhase, time, effects.boss.lamprey);
    return;
  }

  // THE MIMIC: a mantle over the top of the field wearing a sign on one
  // screen and mottle on the other, the pad on the drawer's, split on its
  // lit core at the last (`mimic-draw.ts`); its receipts are `mimic-fx.ts`.
  drawMimic(ctx, l, world, boss, beat, beatPhase, time, effects.boss.mimic);
}
