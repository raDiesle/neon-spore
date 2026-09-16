import { repriseEchoing, repriseLeft, wardenPullMilli, wardenTether } from "@neon-spore/sim";
import { cairnBody, drawCairn } from "./cairn.js";
import { drawPileHand } from "./cairn-hand.js";
import { drawCairnSettle, showsCairnSettle } from "./cairn-settle.js";
import type { Effects } from "./effects.js";
import { chartOf, drawFleetChart } from "./fleet-chart.js";
import { drawFleetHulls } from "./fleet-hulls.js";
import { drawFleetMarks, drawFleetSights } from "./fleet-marks.js";
import type { Layout } from "./layout.js";
import { drawMaze } from "./maze-draw.js";
import { drawMirror } from "./mirror.js";
import { drawQueen } from "./queen.js";
import type { ViewState } from "./renderer.js";
import { drawReprise } from "./reprise-draw.js";
import { drawSplice } from "./splice-draw.js";
import { drawTether } from "./tether.js";
import { drawVane } from "./vane-draw.js";
import { drawWarden, wardenRopeAnchor } from "./warden.js";

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
    // The hatch and the eyelids are the rope's tension, with nothing eased in
    // between: how far they stand open is player 2's only readout of a hand
    // they cannot see (`sim/warden.ts`). The eye's own radius follows it, and
    // the rope is tied to the eye, so all three read this one number.
    const openness = wardenPullMilli(world, boss) / 1000;
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
    );
    // The rope is drawn after the ring it comes out of, and before the snap-back
    // a cut one leaves behind — which `effects` draws with everything else that
    // is transient. Both leave from the eye, and the eye walks.
    const anchor = wardenRopeAnchor(l, body, boss, openness);
    if (wardenTether(world)) drawTether(ctx, l, world, boss, body, openness, view.time);
    // A rope that snapped back no longer exists in the world, so its leaving is
    // the one part of this boss the picture has to remember for itself.
    effects.warden.draw(ctx, l, world.cfg, anchor);
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

  // THE REPRISE, and it is the whole of what either seat is given while an
  // echo is running: how many bodies are still owed, and a swallow as each one
  // goes. No body among the creatures for the vane's reason — the mechanism
  // hangs above row 0 and nothing of it is on the grid — and the count is read
  // off the world every frame while the swallow is the one thing the picture
  // has to remember for itself (`reprise-fx.ts`).
  if (boss.kind === "reprise") {
    const echo = effects.reprise;
    echo.note(boss.at < 0 ? -1 : boss.left);
    const seen = repriseEchoing(world);
    drawReprise(ctx, l, world.cfg, seen, repriseLeft(world), echo.swallow, view.time);
    return;
  }

  if (boss.kind === "vane") {
    // No body among the creatures: the arm hangs off the top edge, so there is
    // nothing of it on the grid to find.
    drawVane(ctx, l, world.cfg, boss, world.waveBeat, world.beat, view.beatPhase, view.time);
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
    drawMaze(ctx, l, world.cfg, boss, view.role, world.beat, view.beatPhase);
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
    const fleet = effects.fleet;
    drawFleetChart(ctx, l, world, boss, view.beatPhase, view.time, view.clearTop !== undefined);
    drawFleetHulls(ctx, l, world, boss, view.beatPhase, fleet);
    drawFleetMarks(ctx, l, world, boss, fleet);
    drawFleetSights(ctx, l, world, boss, view.beatPhase);
    const chart = chartOf(l, world);
    fleet.drawFlight(ctx, l, chart, world.cannonCol);
    fleet.drawBursts(ctx, chart);
    return;
  }

  // The mirror is a whole ship, so it is drawn here rather than among the
  // effects — and its ghost shots under it, the way the player's shots are
  // drawn under the player's own hull.
  if (boss.kind !== "mirror") return;
  const fx = effects.mirror;
  drawMirror(ctx, l, world.cfg, boss, world.shieldCol, view.time, {
    armed: fx.armed,
    intake: fx.intake,
    chew: 0,
    charge: 0,
  });
  fx.drawGhosts(ctx, l, world.cfg);
}
