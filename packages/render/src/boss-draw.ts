import { wardenPullMilli, wardenTether } from "@neon-spore/sim";
import type { Effects } from "./effects.js";
import { drawFleetChart } from "./fleet-chart.js";
import { drawFleetHulls } from "./fleet-hulls.js";
import { drawFleetMarks, drawFleetSights } from "./fleet-marks.js";
import type { Layout } from "./layout.js";
import { drawMaze } from "./maze-draw.js";
import { drawMirror } from "./mirror.js";
import { drawQueen } from "./queen.js";
import type { ViewState } from "./renderer.js";
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

  if (boss.kind === "vane") {
    // No body among the creatures: the arm hangs off the top edge, so there is
    // nothing of it on the grid to find.
    drawVane(ctx, l, world.cfg, boss, world.waveBeat, world.beat, view.beatPhase, view.time);
    return;
  }

  if (boss.kind === "maze") {
    drawMaze(ctx, l, world.cfg, boss, view.role, world.beat, view.beatPhase);
    return;
  }

  // THE FLEET, in the order the eye reads it: the water and its lattice, the
  // hulls the seat is allowed to see, the record both seats share, and the
  // sights on top of all of it. Nothing here is held between frames — the
  // marks come off `struck` and the sinking off `sunkBeat`, so a restart draws
  // a clear chart with no help from `Effects` (`fleet-hulls.ts`).
  if (boss.kind === "fleet") {
    drawFleetChart(ctx, l, world, boss, view.beatPhase);
    drawFleetHulls(ctx, l, world, boss, view.beatPhase);
    drawFleetMarks(ctx, l, world, boss);
    drawFleetSights(ctx, l, world, boss, view.beatPhase);
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
