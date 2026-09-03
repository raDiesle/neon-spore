import { circleSubpath, openSmoothPath } from "@neon-spore/content";
import {
  type SimConfig,
  type WardenState,
  type World,
  wardenColor,
  wardenCycle,
  wardenHandleMilli,
  wardenPullMilli,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import {
  drawHandleHint,
  drawHandleRest,
  drawHandleRing,
  fieldPoint,
  HINT_LOUD,
  handleRadius,
  handleSag,
} from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { wardenRimY } from "./warden.js";

/**
 * THE WARDEN's rope, and the handle on it: the one thing on this field either
 * player can put a hand on.
 *
 * It is the game's first **open** contour — a line with two ends rather than a
 * closed loop with lobes — and it is drawn by `openSmoothPath` for that reason.
 *
 * **Four things have to be legible here, in order, with nobody told anything**
 * (the owner asked for them by name, which is what exempts this file from *a
 * look is offered, never replaced*):
 *
 * 1. the handle reads as something to take hold of — a ring, not a blob, with a
 *    word under it while nobody has it;
 * 2. the moment it is held is visible — the ring fills and the word goes;
 * 3. pulling builds tension and more pulling builds more, **continuously**: the
 *    rope goes taut, thin and bright, and a gauge closes around the handle;
 * 4. the hatch opens in proportion, which is `warden.ts` next door and is the
 *    same number this file draws.
 *
 * Everything here is derived from the world every frame. Only the snap-back
 * after a hit outlives one, and that lives in `Effects` (`warden-fx.ts`).
 */

/**
 * Where the handle rests, with no hand on it.
 *
 * **The one place it is written down.** `touch.ts` answers a press exactly here
 * and this file draws exactly here — a button drawn in one place and answered in
 * another is a button that works until somebody moves one of them.
 *
 * It reads the layout, the config and the rope's own column, and nothing about
 * the pull: a press is tested against the resting circle whatever the rope is
 * doing. The handle swings while it is dragged and that costs nothing, because
 * by then the pointer is captured and nothing is hit-tested again.
 */
export function tetherHandleCircle(l: Layout, cfg: SimConfig, col: number): Circle {
  return {
    x: tileCX(l, col),
    y: tileCY(l, cfg.wardenRow + cfg.wardenHangRows),
    r: handleRadius(l, cfg),
  };
}

export function drawTether(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: WardenState,
  col: number,
  time: number,
): void {
  const cfg: SimConfig = world.cfg;
  const hex = wardenColor(wardenCycle(cfg, world.waveBeat)) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  const rest = tetherHandleCircle(l, cfg, col);
  const topY = wardenRimY(l, cfg.wardenRow);
  // One to one with the hand, in both axes: the handle stands exactly where the
  // finger carried it, so the distance on the screen *is* the distance being
  // asked for. The simulation has already kept it on the field, so nothing here
  // has to bound it a second time (`sim/handle-pull.ts`).
  // Where the handle is, straight from the rule: the anchor the hand took it
  // from plus how far the hand carried it, so it stays under the finger while
  // the pupil drifts out from under it (`sim/warden.ts`).
  const head = fieldPoint(l, wardenHandleMilli(world, b));
  const pull = wardenPullMilli(world, b) / 1000;
  const held = b.pulling;

  // Under tension the rope goes thin and bright from the rim down: the rope is
  // its own gauge, and there is no widget anywhere saying how far the pull has
  // got. Slack, it hangs with a slow wave travelling down it.
  const sag = handleSag({
    anchor: { x: rest.x, y: topY },
    head,
    held,
    pull,
    time,
    segments: 14,
    waveHeld: 1.2,
    waveSlack: 3.5,
  });
  const line = new Path2D(openSmoothPath(sag));
  strokeGlow(ctx, line, held ? rim : hex, STROKE.outline * (1 - pull * 0.35), 0.5 + pull * 1.5);

  drawAnchor(ctx, rest.x, topY, hex, rim, pull);
  // The column it hangs in, marked faintly, so the swing reads as a distance
  // from somewhere rather than as a handle that happens to be over there.
  if (held) drawHandleRest(ctx, rest, hex);
  drawHandleRing(ctx, { x: head.x, y: head.y, r: rest.r, hex, rim, held, pull, time });
  if (!held) drawHandleHint(ctx, l, l.role, head.x, head.y + l.tile * 0.7, HINT_LOUD);
}

/** Where it comes out of the rim, brightening as the tension takes. */
function drawAnchor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hex: string,
  rim: string,
  pull: number,
): void {
  const p = new Path2D(circleSubpath(x, y, 3 + pull * 4));
  ctx.save();
  ctx.fillStyle = pull > 0 ? rim : hex;
  ctx.globalAlpha = 0.5 + pull * 0.5;
  ctx.fill(p);
  ctx.restore();
}
