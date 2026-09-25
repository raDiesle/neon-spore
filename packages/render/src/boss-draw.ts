import { repriseClock, wardenHatchMilli, wardenLidsMilli, wardenTether } from "@neon-spore/sim";
import { drawClockBoss, isClockBoss } from "./boss-draw-clocks.js";
import { cairnBody, drawCairn } from "./cairn.js";
import { drawPileHand } from "./cairn-hand.js";
import { drawCairnSettle, showsCairnSettle } from "./cairn-settle.js";
import type { Effects } from "./effects.js";
import { chartOf, drawFleetChart } from "./fleet-chart.js";
import { drawFleetGrip } from "./fleet-grip-draw.js";
import { drawFleetHulls } from "./fleet-hulls.js";
import { drawFleetMarks, drawFleetSights } from "./fleet-marks.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { drawMaze } from "./maze-draw.js";
import { drawMirror } from "./mirror.js";
import { drawMirrorGrip, mirrorHandPlace } from "./mirror-grip.js";
import { drawQueen } from "./queen.js";
import type { ViewState } from "./renderer.js";
import { drawReprise } from "./reprise-draw.js";
import { drawRepriseFuse } from "./reprise-fuse.js";
import { drawShipHand } from "./ship-hand.js";
import { drawSplice } from "./splice-draw.js";
import { drawTether } from "./tether.js";
import { drawVane } from "./vane-draw.js";
import { drawWarden, wardenRopeAnchor } from "./warden.js";
import { drawWardenGrip, wardenGripCircle } from "./warden-grip.js";

/**
 * Whichever boss the wave installed, drawn among the creatures.
 *
 * Its own file, because there is more than one of them now and the renderer's
 * job is the order things are drawn in, not which boss is on the field: two
 * bosses in `canvas2d` read as two special cases in a list of ordinary draws,
 * and there are nine more of them in `docs/spec/bosses.md`.
 */
export function drawBoss(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  effects: Effects,
  /** The plating without the cannon on it, for the one boss that comes up
   * through it (`undertow-lobe.ts`). Absent, the flat hull line. */
  skinY: SurfaceY = () => l.hullY,
): void {
  const { world } = view;
  const boss = world.boss;
  if (boss === null) return;

  if (boss.kind === "queen") {
    const queen = world.creatures.find((c) => c.id === boss.creatureId);
    if (!queen) return;
    drawQueen(
      ctx,
      l,
      world.cfg,
      queen,
      boss,
      world.beat,
      world.waveBeat,
      view.time,
      view.beatPhase,
      effects.queenShake,
      world.cfg.queenEggGrowShare,
    );
    return;
  }

  if (boss.kind === "warden") {
    const body = world.creatures.find((c) => c.id === boss.creatureId);
    if (!body) return;
    // The hatch is the rope's tension, or the swipe, with nothing eased in
    // between: how far it stands open is the other seat's only readout of a
    // hand they cannot see (`sim/warden-open.ts`). The eye's own radius
    // follows it, and the rope is tied to the eye, so all three read this one
    // number. The lids behind it part with it under WATCH and with player 2's
    // thumb under NARROW — the second number, and the second hand shown.
    const openness = wardenHatchMilli(world, boss) / 1000;
    const lids = wardenLidsMilli(world, boss) / 1000;
    // A plate off shakes the whole of it, rope and rings with the body
    // (`boss-hurt.ts`); the rope is gone the tick a plate comes off.
    const fx = effects.boss.warden;
    ctx.save();
    ctx.translate(fx.hurt.shakeX(view.time, l.tile), 0);
    drawWarden(
      ctx,
      l,
      world.cfg,
      body,
      boss,
      world.waveBeat,
      world.beat,
      view.beatPhase,
      view.time,
      openness,
      lids,
      fx.hurt.value,
    );
    // The rope is drawn after the ring it comes out of, and before the snap-back
    // a cut one leaves behind — which `effects` draws with everything else that
    // is transient. Both leave from the eye, and the eye walks.
    const anchor = wardenRopeAnchor(l, body, boss, openness);
    if (wardenTether(world)) drawTether(ctx, l, world, boss, body, openness, view.time);
    // A rope that snapped back no longer exists in the world, so its leaving is
    // the one part of this boss the picture has to remember for itself.
    fx.draw(ctx, l, world.cfg, anchor);
    // The eye as a handle, under NARROW and GLARE, over the rope and the
    // snap-back (`warden-grip.ts`); and the rings the thumb, the throw and
    // the slam leave behind them, which the picture remembers for itself.
    const { role, beatPhase, time } = view;
    drawWardenGrip(ctx, l, world.cfg, world, body, boss, role, beatPhase, time);
    fx.grip.draw(ctx, wardenGripCircle(l, body, boss));
    ctx.restore();
    return;
  }

  if (boss.kind === "cairn") {
    const body = cairnBody(world, boss);
    if (!body) return; // The last unit came away; there is no pile left.
    drawCairn(ctx, l, body, boss, view.time);
    // A hand on it, over the stack rather than under it — the field's grip
    // pass runs before the boss is drawn, and a ring behind seven rocks was
    // no ring at all (`cairn-hand.ts`).
    drawPileHand(ctx, l, world, body, boss.units, view.time, view.names);
    // And, on one screen of the two, the lane the pile is about to drop one
    // into. After the pile, because it stands on the stone that is going and
    // has to be read over it (`cairn-settle.ts`).
    if (showsCairnSettle(l)) {
      drawCairnSettle(ctx, l, world, boss, body, view.beatPhase, view.time);
    }
    return;
  }

  // THE REPRISE: recording or playing, how many bodies it holds or still
  // owes, how many unseen are still falling, and a swallow as each one goes —
  // the moments the picture has to remember for itself (`reprise-fx.ts`). No
  // body among the creatures, for the vane's reason.
  if (boss.kind === "reprise") {
    const clock = repriseClock(world);
    const phase = clock === null ? null : clock.echo ? "play" : "rec";
    const eggs = clock?.count ?? 0;
    const fx = effects.boss.reprise;
    fx.note(phase, eggs, view.time);
    drawReprise(ctx, l, world.cfg, {
      phase,
      eggs,
      standing: view.unseen ?? 0,
      fx,
      beatPhase: view.beatPhase,
      time: view.time,
    });
    // And how long until the dark, or how far through it (`reprise-fuse.ts`).
    if (clock) drawRepriseFuse(ctx, l, clock, view.beatPhase);
    return;
  }
  // The clock bosses next door: nine of them hang over the top of the field
  // with nothing of themselves on the grid, and each is one call read off its
  // own state (`boss-draw-clocks.ts`). They were arms of this file until THE
  // TASTER's took it over its limit, and they are the half of this list that
  // grows — the page they come from has nine more designed.
  if (isClockBoss(boss)) {
    drawClockBoss(ctx, l, view, boss, skinY, effects);
    return;
  }

  if (boss.kind === "vane") {
    // No body among the creatures: the arm hangs off the top edge, so there is
    // nothing of it on the grid to find.
    drawVane(ctx, l, world, boss, view.beatPhase, view.time);
    return;
  }

  // THE SPLICE. The field under it is the field — the hull, the cannon and the
  // shield are all drawn by the ordinary passes — so this adds a row of mouths
  // and, on one screen of the two, the whole tangle over them
  // (`splice-draw.ts`).
  if (boss.kind === "splice") {
    drawSplice(ctx, l, world.cfg, boss, world.cannonCol, world.beat, view.beatPhase);
    return;
  }

  if (boss.kind === "maze") {
    drawMaze(ctx, l, world.cfg, boss, view.role, world.beat, view.beatPhase, view.time);
    // The navigator's thumb landing on the heart or leaving it, thrown off
    // it over everything the drum drew (`maze-grip-fx.ts`).
    effects.boss.maze.draw(ctx, l, world.cfg, boss);
    return;
  }

  // THE FLEET, in the order the eye reads it: the water and its lattice, the
  // hulls the seat is allowed to see, the record both seats share, the sights
  // over that, and last the salvoes — the shells still in the air, then
  // whatever the ones that have arrived are doing to the square.
  //
  // Almost none of it is held between frames: the marks come off `struck`, the
  // sinking off `sunkBeat`, and a restart draws a clear chart. The exception
  // is the flight itself, which outlives its frame by a second and a quarter
  // and is cleared with everything else in `Effects.reset` (`fleet-fx.ts`).
  if (boss.kind === "fleet") {
    const fleet = effects.boss.fleet;
    drawFleetChart(ctx, l, world, boss, view.beatPhase, view.time);
    drawFleetHulls(ctx, l, world, boss, view.beatPhase, view.time, fleet);
    drawFleetMarks(ctx, l, world, boss, fleet);
    drawFleetSights(ctx, l, world, boss, view.beatPhase);
    // The wound the flood and the wreck are worked on, over the record and
    // under the salvoes — a shell in the air still lands on top of it
    // (`fleet-grip-draw.ts`).
    drawFleetGrip(ctx, l, world, boss, view.beatPhase, view.time);
    const chart = chartOf(l, world);
    // The five moments of the wound, over the picture of it and under the
    // salvoes: each is one seat doing something the other cannot see, so the
    // ring stands on both screens (`fleet-grip-fx.ts`).
    effects.boss.fleetGrip.draw(ctx, chart);
    fleet.drawFlight(ctx, l, chart, world.cannonCol);
    fleet.drawBursts(ctx, chart);
    return;
  }

  // The mirror is a whole ship, so it is drawn here rather than among the
  // effects — and its ghost shots under it, the way the player's shots are
  // drawn under the player's own hull.
  if (boss.kind !== "mirror") return;
  const fx = effects.boss.mirror;
  drawMirror(ctx, l, world.cfg, boss, world.shieldCol, view.time, {
    armed: fx.armed,
    intake: fx.intake,
    chew: 0,
    charge: 0,
  });
  fx.drawGhosts(ctx, l, world.cfg);
  // Its lobes as a control, over its rim: the rings the world says, the
  // thrown ring of a pin landing or leaving, and this device's own hand on
  // one of them, upside down (`mirror-grip.ts`).
  drawMirrorGrip(ctx, l, world.cfg, boss, world.shieldCol, world.beat, view.beatPhase, view.time);
  fx.grip.draw(ctx, l, world.cfg, boss, world.shieldCol);
  const hand = view.hand?.mirror ? view.hand : undefined;
  drawShipHand(
    ctx,
    l,
    boss.cannonCol,
    world.shieldCol,
    hand,
    view.time,
    mirrorHandPlace(world.cfg, boss),
  );
}
