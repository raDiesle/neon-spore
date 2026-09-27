import { type WardenState, wardenHatchMilli, wardenLidsMilli, wardenTether } from "@neon-spore/sim";
import type { Effects } from "./effects.js";
import type { Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";
import { drawTether } from "./tether.js";
import { drawWarden, wardenRopeAnchor } from "./warden.js";
import { wardenPose, wardenPosed, withWardenPose } from "./warden-drift.js";
import { drawWardenGrip, wardenGripCircle } from "./warden-grip.js";

/**
 * **THE WARDEN, with its rope and its grip**, as `drawBoss` draws it — its own
 * file since the ring began to rock (`warden-drift.ts`) and the branch in
 * `boss-draw.ts` would have taken that file past its ceiling.
 *
 * The ring, the grip on its eye and the rings a thumb leaves there are drawn
 * in the pose. The rope and its snap-back are not: they run from the eye to
 * the hull, and the hull does not rock, so they take the eye's posed point
 * and draw from there.
 */
export function drawWardenFrame(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  effects: Effects,
  boss: WardenState,
): void {
  const { world, role, beatPhase, time } = view;
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
  const pose = wardenPose(l, world.cfg, body, world.beat, beatPhase);
  // A plate off shakes the whole of it, rope and rings with the body
  // (`boss-hurt.ts`); the rope is gone the tick a plate comes off.
  const fx = effects.boss.warden;
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  withWardenPose(ctx, pose, () =>
    drawWarden(
      ctx,
      l,
      world.cfg,
      body,
      boss,
      world.waveBeat,
      world.beat,
      beatPhase,
      time,
      openness,
      lids,
      fx.hurt.value,
    ),
  );
  // The rope is drawn after the ring it comes out of, and before the snap-back
  // a cut one leaves behind — which `effects` draws with everything else that
  // is transient. Both leave from the eye, and the eye walks and rocks.
  const anchor = wardenPosed(pose, wardenRopeAnchor(l, body, boss, openness));
  if (wardenTether(world)) drawTether(ctx, l, world, boss, anchor, time);
  // A rope that snapped back no longer exists in the world, so its leaving is
  // the one part of this boss the picture has to remember for itself.
  fx.draw(ctx, l, world.cfg, anchor);
  // The eye as a handle, under NARROW and GLARE, over the rope and the
  // snap-back (`warden-grip.ts`); and the rings the thumb, the throw and
  // the slam leave behind them, which the picture remembers for itself.
  withWardenPose(ctx, pose, () => {
    drawWardenGrip(ctx, l, world.cfg, world, body, boss, role, beatPhase, time);
    fx.grip.draw(ctx, wardenGripCircle(l, body, boss));
  });
  ctx.restore();
}
