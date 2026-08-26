import type { Effects } from "./effects.js";
import type { Layout } from "./layout.js";
import { drawMirror } from "./mirror.js";
import { drawQueen } from "./queen.js";
import type { ViewState } from "./renderer.js";

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

  // The mirror is a whole ship, so it is drawn here rather than among the
  // effects — and its ghost shots under it, the way the player's shots are
  // drawn under the player's own hull.
  const fx = effects.mirror;
  drawMirror(ctx, l, world.cfg, boss, world.shieldCol, view.time, {
    armed: fx.armed,
    intake: fx.intake,
    chew: 0,
    charge: 0,
  });
  fx.drawGhosts(ctx, l, world.cfg);
}
