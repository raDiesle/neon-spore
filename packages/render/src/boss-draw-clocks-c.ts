import type { World } from "@neon-spore/sim";
import type { Effects } from "./effects.js";
import { drawGimbal } from "./gimbal-draw.js";
import { drawHasp } from "./hasp-draw.js";
import type { Layout } from "./layout.js";
import { drawRatchet } from "./ratchet-draw.js";
import type { ViewState } from "./renderer.js";
import { drawSpool } from "./spool-draw.js";

/**
 * **The clock bosses, drawn — page three**: the pairs asked for by name, each
 * two halves of one fight with one half to a seat.
 *
 * Cut from `boss-draw-clocks-b.ts` on 23 September 2026, when THE HASP and THE
 * SPOOL landing side by side had put that page at 247 lines, along a seam the
 * bosses have: every one from THE GIMBAL on is `bosses-choreographed.md`'s
 * *five more*, and each keeps a half from each seat
 * (`view-role-clocks-c.ts`, cut the same day on the same line). Like page
 * two, every one of them is handed its own field of `effects.boss`.
 *
 * **The order inside is the order they were built in** and nothing depends on
 * it: every arm returns, and no two of these bosses are ever installed at once.
 */

/** Whichever boss is installed, once the null is out of the way. */
type Installed = NonNullable<World["boss"]>;

/** The kinds this file draws. Appended, like every list of boss kinds. */
export const PAIR_KINDS = ["gimbal", "spool", "hasp", "ratchet"] as const;

export type PairBoss = Extract<Installed, { kind: (typeof PAIR_KINDS)[number] }>;

/** Whether this is one of them — a guard, for `isClockBoss`'s reason. */
export function isPairBoss(boss: Installed): boss is PairBoss {
  return (PAIR_KINDS as readonly string[]).includes(boss.kind);
}

export function drawPairBoss(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: PairBoss,
  /** Whichever of `effects.boss` is this boss's (`effects-boss.ts`). */
  effects: Effects,
): void {
  const { world } = view;
  const { beat } = world;
  const { beatPhase, time } = view;

  // THE GIMBAL: a sealed drum in a yoke over the middle of the field inside
  // two rings set at right angles, one to a seat and neither ever shown the
  // other's (`view-role-clocks-c.ts`). Its health is the rim — three teeth to
  // a ring, one sheared per alignment, the spent ones drawn as the sockets
  // they left (`gimbal-draw.ts`). What outlives a frame — the kick of a shear, the rock of a slip, the glare
  // of the seam — is `effects.boss.gimbal` (`gimbal-fx.ts`).
  if (boss.kind === "gimbal") {
    drawGimbal(ctx, l, world, boss, beat, beatPhase, time, effects.boss.gimbal);
    return;
  }

  // THE SPOOL: a thread-spool slung sideways across the top, its line run
  // down to the hull. Both screens see the spool and how fast the line runs;
  // the pilot alone his brake, the navigator alone the zone and the line's
  // length against it (`view-role-clocks-c.ts`). What outlives a frame — the
  // shudder of a slip, the jolt of a rib, the glare of the loosing — is
  // `effects.boss.spool` (`spool-draw.ts`, `spool-fx.ts`).
  if (boss.kind === "spool") {
    drawSpool(ctx, l, world, boss, beat, beatPhase, time, effects.boss.spool);
    return;
  }

  // THE HASP: three clasps down the middle column, a latch on the pilot's
  // screen alone and the wheel on the navigator's alone, the row on both
  // (`view-role-clocks-c.ts`). What outlives a frame — the dim of a seize, the
  // flare of a burn, the jolt of a hasp giving — is `effects.boss.hasp`
  // (`hasp-draw.ts`, `hasp-fx.ts`).
  if (boss.kind === "hasp") {
    drawHasp(ctx, l, world, boss, beat, beatPhase, time, effects.boss.hasp);
    return;
  }

  // THE RATCHET: a rack of seven plates climbing a strut down the middle
  // column past a pawl, both screens shown the whole of it; the catch on the
  // navigator's screen alone and the pawl's pad on the pilot's alone
  // (`view-role-clocks-c.ts`). What outlives a frame — the jolt and click of
  // a clean tooth, the hull's shudder — is `effects.boss.ratchet`
  // (`ratchet-draw.ts`, `ratchet-fx.ts`).
  drawRatchet(ctx, l, world, boss, beat, beatPhase, effects.boss.ratchet);
}
