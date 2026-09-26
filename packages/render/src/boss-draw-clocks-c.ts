import type { World } from "@neon-spore/sim";
import { drawCyst } from "./cyst-draw.js";
import { drawDavit } from "./davit-draw.js";
import type { Effects } from "./effects.js";
import { drawGimbal } from "./gimbal-draw.js";
import { drawHasp } from "./hasp-draw.js";
import { drawKeel } from "./keel-draw.js";
import type { Layout } from "./layout.js";
import { drawMantle } from "./mantle-draw.js";
import { drawOculus } from "./oculus-draw.js";
import { drawPlumb } from "./plumb-draw.js";
import { drawRatchet } from "./ratchet-draw.js";
import type { ViewState } from "./renderer.js";
import { drawRime } from "./rime-draw.js";
import { drawSeam } from "./seam-draw.js";
import { drawSling } from "./sling-draw.js";
import { drawSpool } from "./spool-draw.js";
import { drawTrivet } from "./trivet-draw.js";
import { drawValve } from "./valve-draw.js";
import { drawVise } from "./vise-draw.js";

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
export const PAIR_KINDS = [
  "gimbal",
  "spool",
  "hasp",
  "ratchet",
  "mantle",
  "keel",
  "valve",
  "seam",
  "oculus",
  "vise",
  "rime",
  "sling",
  "trivet",
  "plumb",
  "davit",
  "cyst",
] as const;

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
  if (boss.kind === "ratchet") {
    drawRatchet(ctx, l, world, boss, beat, beatPhase, time, effects.boss.ratchet);
    return;
  }

  // THE MANTLE: a plated shell over the middle of the field, pried open a
  // pair of plates at a time by both thumbs pulling together. Both screens
  // are drawn the same — both valves, both handles and the one cord between
  // them — because the sum is the point (`mantle-draw.ts`). What outlives a
  // frame — the kick of a shear, the core's flare, the hull's shudder — is
  // `effects.boss.mantle` (`mantle-fx.ts`).
  if (boss.kind === "mantle") {
    drawMantle(ctx, l, world, boss, beat, beatPhase, time, effects.boss.mantle);
    return;
  }

  // THE KEEL: a spine of six segments arched along the top of the field,
  // locked rigid a joint at a time. Both screens are drawn the same — whose
  // thumb a joint wants is which half it sits over, and both have to see it
  // (`keel-draw.ts`). What outlives a frame — the jolt of a lock, each seam's
  // snap, the hull's shudder — is `effects.boss.keel` (`keel-fx.ts`).
  if (boss.kind === "keel") {
    drawKeel(ctx, l, world, boss, beat, beatPhase, time, effects.boss.keel);
    return;
  }

  // THE VALVE: a squat drum over the middle of the field, a wheel in its face
  // the pilot turns onto a mark and a pin the navigator's tap freezes it for.
  // Both screens are drawn the same — each thumb times itself off the other's
  // half (`valve-draw.ts`). Nothing of it outlives a frame yet: its effects are
  // the second half of its look.
  if (boss.kind === "valve") {
    drawValve(ctx, l, world, boss, beat, beatPhase, time);
    return;
  }

  // THE SEAM: a shelled ridge down the middle column, a crack along its spine
  // widening at the three points that are its health. Both screens are drawn
  // the same — which seat answers a step is the colour it asks for
  // (`seam-draw.ts`). Nothing of it outlives a frame yet: its effects are the
  // second half of its look.
  if (boss.kind === "seam") {
    drawSeam(ctx, l, world, boss, beat, beatPhase, time);
    return;
  }

  // THE OCULUS: a lens of six leaves over the middle column, shut a pair at a
  // time by both thumbs holding together, a core in the socket behind them.
  // Both screens are drawn the same — a hold asks both seats at once
  // (`oculus-draw.ts`). What outlives a frame — the thud of a shut pair, the
  // core's flash, the hull's shudder — is `effects.boss.oculus` (`oculus-fx.ts`).
  if (boss.kind === "oculus") {
    drawOculus(ctx, l, world, boss, beat, beatPhase, time, effects.boss.oculus);
    return;
  }

  // THE VISE: a seed-case of two lobes over the middle column, each pinched
  // shut by one seat, a kernel in the hollow both cannons are asked to hit.
  // Both screens are drawn the same — the other seat has to see which lobe is
  // lit to say so (`vise-draw.ts`). What outlives a frame — a crack's thud,
  // a sprung lobe, the kernel's flash, the hull's shudder — is
  // `effects.boss.vise` (`vise-fx.ts`).
  if (boss.kind === "vise") {
    drawVise(ctx, l, world, boss, beat, beatPhase, time, effects.boss.vise);
    return;
  }

  // THE RIME: a frosted pane over the middle column, each half wiped clear by
  // one seat, a core behind it both cannons are asked to hit. Both screens
  // are drawn the same — the other seat has to see which half is lit to say
  // so (`rime-draw.ts`). Nothing of it outlives a frame yet: its hands and
  // effects are the second half of its look.
  if (boss.kind === "rime") {
    drawRime(ctx, l, world, boss, beat, beatPhase, time);
    return;
  }

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
  // (`davit-draw.ts`). Nothing of it outlives a frame yet: its hands and
  // effects are the second half of its look.
  if (boss.kind === "davit") {
    drawDavit(ctx, l, world, boss, beat, beatPhase, time);
    return;
  }

  // THE CYST: a four-lobed sac over the middle column, each flank tapped
  // still by one seat and pinched shut by the other, a core under the skin
  // both cannons are asked to hit. Both screens are drawn the same
  // (`cyst-draw.ts`). What outlives a frame — a crack's thud, a sprung flank,
  // the core's flash and the split's — is `effects.boss.cyst` (`cyst-fx.ts`).
  drawCyst(ctx, l, world, boss, beat, beatPhase, time, effects.boss.cyst);
}
