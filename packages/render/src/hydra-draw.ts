import { type HydraState, hydraNext, type World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { drawHydraBody } from "./hydra-body.js";
import { drawCoils } from "./hydra-coil.js";
import { drawEyeHeads } from "./hydra-eyes.js";
import type { HydraFx } from "./hydra-fx.js";
import { drawBites, drawMaws, type HeadsFrame } from "./hydra-heads.js";
import { hydraPose } from "./hydra-pose.js";
import { drawHydraReceipts } from "./hydra-receipts.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsHydraFire, showsHydraMaw } from "./view-role-clocks-c.js";

/**
 * **THE HYDRA** (§11.64): a slime with many heads hung over the field, and
 * every head coming for the ship — drawn from the necks up: the level's
 * heads run out of the body's lower rim, and the body over their roots with
 * its crown of a bud, a socket or a stump for every level.
 *
 * **Every level is its own kind of head and its own picture** — biting
 * necks swinging down at the hull, coils wound flat on the field, great
 * bulbs of eyes waking one at a time, and maws hung over their columns
 * (`hydra-heads.ts`, `hydra-coil.ts`, `hydra-eyes.ts`).
 *
 * **Both screens draw the one hydra** but for the maws, crossed: the
 * navigator is shown which maw is open (`showsHydraMaw`) and the pilot the
 * fire's colour in its throat (`showsHydraFire`).
 *
 * **Progress is read off the body, never a bar**: the cut going in across
 * the neck, a ring of a coil fewer for every lap turned off, an eye put out
 * and stitched, a maw a smoking stump — and the crown a stump more for every
 * level, the body a little smaller and turned half round as it rears.
 *
 * Everything is read off `world` each frame but its receipts — the heads
 * falling, the coils dropping, the steam, the lunge, the shudder and the
 * blow (`hydra-fx.ts`, drawn by `hydra-receipts.ts`).
 */
export function drawHydra(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: HydraState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: HydraFx,
): void {
  const p = hydraPose(l, world.cfg, s, beat, beatPhase, time);
  const step = s.steps[s.cursor];
  const c = p.c;
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  const k = p.near < 1 ? 0.15 + 0.85 * p.near : 1 - 0.4 * p.die;
  if (k < 1) {
    // Out of the dark, small and dim, swelling to its full size; and beaten,
    // shrinking away up into it.
    ctx.translate(c.x, c.y);
    ctx.scale(k, k);
    ctx.translate(-c.x, -c.y);
  }
  ctx.globalAlpha = (0.3 + 0.7 * p.near) * (1 - p.die);
  const fire = showsHydraFire(l.role) ? fireOf(s) : null;
  if (step !== undefined && s.phase !== "spent") {
    const f: HeadsFrame = {
      ctx,
      l,
      cfg: world.cfg,
      s,
      step,
      p,
      time,
      now: beat + beatPhase,
      showMaw: showsHydraMaw(l.role),
      fire,
      note: (i, at, angle) => fx.note(i, at, angle),
    };
    if (step.head === "bite") drawBites(f);
    else if (step.head === "coil") drawCoils(f);
    else if (step.head === "eye") drawEyeHeads(f);
    else drawMaws(f);
  }
  const body = drawHydraBody(ctx, p, s, l.tile, fire, time);
  drawHurt(ctx, body, fx.hurt.value);
  ctx.restore();
  drawHydraReceipts(ctx, l, fx, time);
}

/** The fire in the open maw's colour, while a maw is open. */
function fireOf(s: HydraState): string | null {
  const step = s.steps[s.cursor];
  if (s.phase !== "heads" || step?.head !== "maw") return null;
  const color = step.colors?.[hydraNext(s)];
  if (color === undefined) return null;
  return color === "cyan" ? PALETTE.cyan : PALETTE.red;
}
