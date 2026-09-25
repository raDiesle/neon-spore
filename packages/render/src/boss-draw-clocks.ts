import { throatHolds, type World } from "@neon-spore/sim";
import { drawBaton } from "./baton-draw.js";
import { drawBatonGrip } from "./baton-grip.js";
import { drawFxBoss, FX_KINDS, isFxBoss } from "./boss-draw-clocks-b.js";
import { drawPairBoss, isPairBoss, PAIR_KINDS } from "./boss-draw-clocks-c.js";
import { drawCurtain } from "./curtain-draw.js";
import { drawDiastoleClamp } from "./diastole-clamp.js";
import { drawDiastole } from "./diastole-draw.js";
import type { Effects } from "./effects.js";
import { drawGorge } from "./gorge-draw.js";
import { drawGorgeGrip } from "./gorge-grip.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { drawOrrery } from "./orrery-draw.js";
import type { ViewState } from "./renderer.js";
import { drawTaster } from "./taster-draw.js";
import { drawTasterGrips } from "./taster-grip.js";
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
 * That is also why they are the half that grows: each is a branch with a
 * paragraph over it, and at THE HIVE's the page was cut once more, on the
 * seam `effects-boss.ts` draws — the seven whose picture keeps a transient
 * are `boss-draw-clocks-b.ts`'s, handed across in one guarded call below.
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
  ...FX_KINDS,
  ...PAIR_KINDS,
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
  /** For the seven whose picture keeps a transient (`boss-draw-clocks-b.ts`). */
  effects: Effects,
): void {
  const { world } = view;

  // THE DIASTOLE, and it is above row 0 for THE VANE's reason: the twin lobe
  // hangs off the top edge, so there is no body of it among the creatures. The
  // seat is read off the layout inside, because the split here is symmetric —
  // each screen is shown one chamber beating and one still (`diastole-draw.ts`).
  // The clamp's ring is drawn after the chambers and from here rather than
  // from inside, since it reads the shelf the chambers hang on
  // (`diastole-clamp.ts`, `diastoleY`).
  if (boss.kind === "diastole") {
    drawDiastole(ctx, l, world.cfg, boss, world.beat, view.beatPhase, view.time);
    drawDiastoleClamp(ctx, l, world.cfg, boss, l.role, world.beat, view.beatPhase, view.time);
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
    // And the two rings the arm itself asks for, after it, so they stand on
    // the sockets and nothing stands on them (`baton-grip.ts`).
    drawBatonGrip(ctx, l, world.cfg, boss, l.role, world.beat, view.beatPhase, view.time);
    return;
  }

  // THE THROAT: a gullet down the middle of the frame with its mouth walking
  // one row of it, the same on both screens. It is above and across the field
  // rather than on it — nothing of it is among the creatures, for THE VANE's
  // reason — and it is the first boss the field is drawn *through*: shots pass
  // up the tube and bodies are hauled up the column under the mouth
  // (`throat-draw.ts`).
  if (boss.kind === "throat") {
    const crowded = world.creatures.some((c) => throatHolds(world, c));
    drawThroat(ctx, l, world.cfg, boss, world.beat, view.beatPhase, view.time, crowded);
    return;
  }

  // THE UNDERTOW: the half of it that is above the hull line — a lobe standing
  // in its breach, and once, the body — drawn here so the ship pass paints
  // over where it came from. The plate it came up through, the seams and the
  // rise are on the finished ship instead (`undertow-draw.ts`).
  if (boss.kind === "undertow") {
    // The blow of a lobe taken shakes whatever of it still stands, and only
    // that: the plate is on the ship and stays where the hull is.
    const hurt = effects.boss.undertow.hurt;
    const shake = hurt.shakeX(view.time, l.tile);
    const { beatPhase, time } = view;
    const cfg = world.cfg;
    drawUndertowLobes(ctx, l, cfg, boss, world.beat, beatPhase, time, skinY, hurt.value, shake);
    return;
  }

  // THE CANDLE draws nothing among the bodies: it is a light, and a light
  // goes *over* the dark, so the glow is drawn by the same pass that lays
  // the black on the field — after every body and before the ship
  // (`candle-dark.ts`, `candle-glow.ts`).
  if (boss.kind === "candle") return;

  // THE GORGE: a sack across seven columns above row 0, the seat read off
  // the layout inside (`gorge-draw.ts`).
  // The blow of a landed rupture shakes the sack and the rings on it as one.
  if (boss.kind === "gorge") {
    const hurt = effects.boss.gorge.hurt;
    ctx.save();
    ctx.translate(hurt.shakeX(view.time, l.tile), 0);
    drawGorge(ctx, l, world.cfg, boss, world.beat, view.beatPhase, view.time, hurt.value);
    // And its two thumbs' rings, on the seat's screen each is (`gorge-grip.ts`).
    drawGorgeGrip(ctx, l, world.cfg, boss, l.role, world.beat, view.beatPhase, view.time);
    ctx.restore();
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
    const hurt = effects.boss.taster.hurt;
    ctx.save();
    ctx.translate(hurt.shakeX(view.time, l.tile), 0);
    drawTaster(ctx, l, world, boss, view.beatPhase, view.time, hurt.value);
    // And its three thumbs, over the fan for THE GORGE's reason eight branches
    // up: a ring is drawn on the thing it takes hold of, and one under a blade
    // would be a handle the boss paints over (`taster-grip.ts`).
    drawTasterGrips(ctx, l, world.cfg, boss, view.beatPhase, world.beat, view.time);
    ctx.restore();
    return;
  }

  // The ones since THE SINEW, each with a transient of its own, are page
  // two's (`boss-draw-clocks-b.ts`), and the pairs from THE GIMBAL on, each
  // with a half to a seat, page three's (`boss-draw-clocks-c.ts`).
  if (isFxBoss(boss)) drawFxBoss(ctx, l, view, boss, effects);
  else if (isPairBoss(boss)) drawPairBoss(ctx, l, view, boss, effects);
}
