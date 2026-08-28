import { WARDEN_OPEN_BEATS, wardenTether } from "@neon-spore/sim";
import type { Effects } from "./effects.js";
import type { Layout } from "./layout.js";
import { drawMirror } from "./mirror.js";
import { drawQueen } from "./queen.js";
import type { ViewState } from "./renderer.js";
import { drawTether } from "./tether.js";
import { drawVane } from "./vane-draw.js";
import { drawWarden, pupilOpenness } from "./warden.js";

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
      pupilOpenness(boss, world.beat, view.beatPhase, WARDEN_OPEN_BEATS),
    );
    // The line is drawn after the ring it comes out of, and before the whip a
    // torn one leaves behind — which `effects` draws with everything else that
    // is transient.
    const tether = wardenTether(world);
    if (tether) drawTether(ctx, l, world, boss, tether, view.beatPhase, view.time);
    // A line that was torn no longer exists in the world, so its fall is the
    // one part of this boss the picture has to remember for itself.
    effects.warden.draw(ctx, l, world.cfg.wardenRow);
    return;
  }

  if (boss.kind === "vane") {
    // No body among the creatures: the arm hangs off the top edge, so there is
    // nothing of it on the grid to find.
    drawVane(ctx, l, world.cfg, boss, world.waveBeat, world.beat, view.beatPhase, view.time);
    return;
  }

  // The mirror is a whole ship, so it is drawn here rather than among the
  // effects — and its ghost shots under it, the way the player's shots are
  // drawn under the player's own hull.
  // THE MAZE has no picture yet — a lane behind this one draws the tangle —
  // and a boss that is not the mirror must not be handed to `drawMirror`.
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
