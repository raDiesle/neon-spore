import type { World } from "@neon-spore/sim";
import { drawBaton } from "./baton-draw.js";
import { drawCurtain } from "./curtain-draw.js";
import { drawDiastole } from "./diastole-draw.js";
import type { Effects } from "./effects.js";
import { drawGorge } from "./gorge-draw.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { drawLedger } from "./ledger-draw.js";
import { drawOrrery } from "./orrery-draw.js";
import type { ViewState } from "./renderer.js";
import { drawSinew } from "./sinew-draw.js";
import { drawSurge } from "./surge-draw.js";
import { drawTaster } from "./taster-draw.js";
import { drawThroat } from "./throat-draw.js";
import { drawUndertowLobes } from "./undertow-lobe.js";

/**
 * **The clock bosses, drawn** — the ones from
 * `docs/spec/bosses-choreographed.md` whose whole difficulty is a beat count
 * the pair says out loud.
 *
 * Cut out of `boss-draw.ts` when THE TASTER's branch took that file over its
 * 250-line limit, along the seam `packages/sim` already cuts three files down
 * (`bosses-clocks.ts`, `config-boss-clocks.ts`, `boss-entries-clocks.ts`):
 * next door is a boss with a *body on the field* — a queen among the
 * creatures, a warden on its rope, a pile of stone, a whole second ship — and
 * every one of these hangs over the top of the field with nothing of itself on
 * the grid, is read straight off its own state every frame, and is one call.
 * That is also why they are the half that grows: nine more of them are
 * designed, and each is a branch with a paragraph over it.
 *
 * **The order inside is the order they were built in** and nothing depends on
 * it: every arm returns, and no two of these bosses are ever installed at once.
 */

/** Whichever boss is installed, once the null is out of the way. */
type Installed = NonNullable<World["boss"]>;

/** The kinds this file draws. Appended, like every list of boss kinds. */
const CLOCK_KINDS = [
  "diastole",
  "orrery",
  "baton",
  "throat",
  "undertow",
  "candle",
  "gorge",
  "curtain",
  "taster",
  "sinew",
  "ledger",
  "surge",
] as const;

export type ClockBoss = Extract<Installed, { kind: (typeof CLOCK_KINDS)[number] }>;

/**
 * Whether this is one of them — a guard rather than a lookup, so the call site
 * next door hands this file a narrowed boss and its own `assertNever`-shaped
 * chain of arms is left with exactly the bosses it still draws itself.
 */
export function isClockBoss(boss: Installed): boss is ClockBoss {
  return (CLOCK_KINDS as readonly string[]).includes(boss.kind);
}

export function drawClockBoss(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: ClockBoss,
  /** The plating without the cannon on it, for the one that comes up through
   * it (`undertow-lobe.ts`). */
  skinY: SurfaceY,
  /** For the one whose snap outlives a frame (`effects-boss.ts`). */
  effects: Effects,
): void {
  const { world } = view;

  // THE DIASTOLE, and it is above row 0 for THE VANE's reason: the twin lobe
  // hangs off the top edge, so there is no body of it among the creatures. The
  // seat is read off the layout inside, because the split here is symmetric —
  // each screen is shown one chamber beating and one still (`diastole-draw.ts`).
  if (boss.kind === "diastole") {
    drawDiastole(ctx, l, world.cfg, boss, world.beat, view.beatPhase, view.time);
    return;
  }

  // THE ORRERY: a core in the middle column inside three flattened orbits,
  // above and across the top of the field rather than on it — nothing of it is
  // among the creatures, for THE VANE's reason. Two of the three rings are
  // drawn solid on any one screen, which is the encounter rather than a trick
  // of the drawing, and the corridor of light down the middle is the one beat
  // a shot can reach the core (`orrery-draw.ts`).
  if (boss.kind === "orrery") {
    drawOrrery(ctx, l, world.cfg, boss, world.beat, view.beatPhase, view.time);
    return;
  }

  // THE BATON: an arm down the middle column with the bead in it, the same on
  // both screens — the split is on the band, where the seat that just acted
  // is greyed for a beat (`band-lock.ts`). Off the tick and not only the
  // beat, because the bead's flight is three beats long and a shot has to
  // meet it where the simulation says it is (`baton-draw.ts`).
  if (boss.kind === "baton") {
    drawBaton(ctx, l, world.cfg, boss, world.tick, world.beat, view.beatPhase, view.time);
    return;
  }

  // THE THROAT: a gullet down the middle of the frame with its mouth walking
  // one row of it, the same on both screens. It is above and across the field
  // rather than on it — nothing of it is among the creatures, for THE VANE's
  // reason — and it is the first boss the field is drawn *through*: shots pass
  // up the tube and bodies are hauled up the column under the mouth
  // (`throat-draw.ts`).
  if (boss.kind === "throat") {
    drawThroat(ctx, l, world.cfg, boss, world.beat, view.beatPhase, view.time);
    return;
  }

  // THE UNDERTOW: the half of it that is above the hull line — a lobe standing
  // in its breach, and once, the body — drawn here so the ship pass paints
  // over where it came from. The plate it came up through, the seams and the
  // rise are on the finished ship instead (`undertow-draw.ts`).
  if (boss.kind === "undertow") {
    drawUndertowLobes(ctx, l, world.cfg, boss, world.beat, view.beatPhase, view.time, skinY);
    return;
  }

  // THE CANDLE draws nothing among the bodies: it is a light, and a light
  // goes *over* the dark, so the glow is drawn by the same pass that lays
  // the black on the field — after every body and before the ship
  // (`candle-dark.ts`, `candle-glow.ts`).
  if (boss.kind === "candle") return;

  // THE GORGE: a sack across seven columns above row 0, the seat read off
  // the layout inside (`gorge-draw.ts`).
  if (boss.kind === "gorge") {
    drawGorge(ctx, l, world.cfg, boss, world.beat, view.beatPhase, view.time);
    return;
  }

  // THE CURTAIN: a body among the creatures and its hand ring over it, for
  // THE CAIRN's reason, and the core behind it read by seat (`curtain-draw.ts`).
  if (boss.kind === "curtain") {
    drawCurtain(ctx, l, world, boss, world.beat, view.beatPhase, view.time, view.names);
    return;
  }

  // THE TASTER: a low crest across the whole width of the field above row 0
  // with a fan of blades standing out of it, one per column — nothing of it
  // among the creatures, for THE VANE's reason. Both screens see every blade;
  // what differs is the one number each seat is given about them
  // (`taster-draw.ts`, `taster-read.ts`).
  if (boss.kind === "taster") {
    drawTaster(ctx, l, world, boss, view.beatPhase, view.time);
    return;
  }

  // THE SINEW: a tendon from the top edge down to a mass, with a handle on
  // each side of the mass — one per seat — and the strain band across the
  // tendon read by seat. What outlives a frame — the snap's whip and its
  // flash — is `effects.boss.sinew` (`sinew-draw.ts`, `sinew-fx.ts`).
  if (boss.kind === "sinew") {
    drawSinew(ctx, l, world, boss, world.beat, view.beatPhase, view.time, effects.boss.sinew);
    return;
  }

  // THE LEDGER: a tall split body high in the field on one thick cord running
  // down into the ship's own plating, and the field is drawn *through* it the
  // way THE THROAT's gullet is. Both screens see the body, the seam and the
  // cord — and only the navigator's sees where the cord is rooted, which is
  // this boss's whole split (`ledger-draw.ts`, `view-role-clocks.ts`). What
  // outlives a frame — the whip back up the cord, the shock through the hull,
  // the flash of the tear — is `effects.boss.ledger` (`ledger-fx.ts`).
  if (boss.kind === "ledger") {
    drawLedger(ctx, l, world, boss, world.beat, view.beatPhase, view.time, effects.boss.ledger);
    return;
  }

  // THE SURGE: a ribbed bulb hung over the middle of the field with a seam
  // round its equator, a grip mark on each flank for the two thumbs that
  // share it, and the gauge along the seam read by seat — the notches on
  // the pilot's screen, the pressure on the navigator's. What outlives a
  // frame — the sink after a vent, the jolt of a burst, the jet — is
  // `effects.boss.surge` (`surge-draw.ts`, `surge-fx.ts`).
  drawSurge(ctx, l, world, boss, world.beat, view.beatPhase, view.time, effects.boss.surge);
}
