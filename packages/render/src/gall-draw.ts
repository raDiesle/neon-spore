import { LIGHT_HALF } from "@neon-spore/content";
import { type GallState, gallLitStep, type World } from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import { coreHurt } from "./core-hurt.js";
import type { GallFx } from "./gall-fx.js";
import { drawGallPoints } from "./gall-points.js";
import {
  gallArrived,
  gallBearing,
  gallCharge,
  gallFlat,
  gallFlight,
  gallLobes,
  gallRippling,
  gallSpent,
  gallSwell,
} from "./gall-pose.js";
import { drawGallFlash, drawGallPuff } from "./gall-receipts.js";
import { drawGallScar } from "./gall-scars.js";
import {
  GALL_STANDS,
  gallArcAt,
  gallNodulePath,
  gallPointAt,
  gallPoints,
  gallRipple,
  gallSeamPath,
  gallSize,
} from "./gall-shape.js";
import { gallStopper } from "./gall-stop.js";
import { drawGallMarkFeedback } from "./gall-verdicts.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { lightCore } from "./lit-core.js";
import { PALETTE, STROKE } from "./palette.js";

// How much bigger a landing swells it, at the swell's height.
const BULGE = 0.22;

/**
 * **THE GALL**: a small creature on a raised seam the width of the field,
 * tapped and thrown by the seat whose half it sits on, leaping over the
 * middle to a point on the other half (§11.55, `bosses-choreographed.md` §38,
 * the owner's rework of 8 October 2026).
 *
 * **Both screens are drawn the same body**, because where it landed is the
 * fight. **Nothing round it counts down** — the fuse does that, under it
 * (`slow-fuse.ts`) — so the body says everything else: wound tall and narrow
 * by each tap, shivering when charged, flying its arc through a leap, and lit
 * from inside in the step's colour when it is to be shot.
 *
 * **Its health is read off the body** — no bar: a lobe fewer and a sixth
 * smaller for every shot. What outlives a frame — a tap's flare, a refused
 * hand's shudder, a landing's bulge, the ghost a leap leaves, a hit's flash —
 * is `fx` (`gall-fx.ts`).
 */
export function drawGall(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GallState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: GallFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const shake = fx.hurt.shakeX(time, l.tile);
  const arrived = gallArrived(s, cfg, beat, beatPhase);
  const flat = gallFlat(s, cfg, beat, beatPhase);
  const ripple = gallRippling(s, cfg, beat, beatPhase, world);
  stops?.aim(gallStopper(l, world, s, time, ripple, shake));

  ctx.save();
  ctx.globalAlpha = 1 - flat;
  drawSeam(ctx, l, time, ripple);
  const flight = gallFlight(s, cfg, beat, beatPhase);
  const here = gallPointAt(l, cfg, s.point);
  for (const p of gallPoints(l, cfg)) {
    if (p.x === here.x && flight === null) continue;
    drawGallScar(ctx, l, p.x, p.y + gallRipple(l, p.x, time, ripple));
  }
  drawGallPoints(ctx, l, cfg, time, ripple);
  drawGallPuff(ctx, l, cfg, fx.puff, time, ripple);

  const at = flight === null ? here : gallArcAt(l, cfg, s.from, s.point, flight);
  const seamY = flight === null ? gallRipple(l, here.x, time, ripple) : 0;
  // It drops onto the seam from a tile above as it arrives.
  const drop = (1 - arrived) * -1.5 * l.tile;
  ctx.save();
  ctx.translate(at.x + shake + fx.shudderX(time, l.tile), at.y + seamY + drop);
  ctx.globalAlpha = (1 - flat) * Math.min(1, arrived * 2);
  drawBody(ctx, l, s, time, beatPhase, flat, flight, fx);
  ctx.restore();
  drawGallMarkFeedback(ctx, l, cfg, s, time, 1 - flat, fx.verdicts.verdicts);
  ctx.restore();
}

/** The seam, lifted by its ripple. */
function drawSeam(ctx: CanvasRenderingContext2D, l: Layout, time: number, ripple: number): void {
  const seam = gallSeamPath(l, time, ripple);
  ctx.fillStyle = PALETTE.gallSeam;
  ctx.fill(seam);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.gallSeamDark, 0.95);
  ctx.stroke(seam);
}

/**
 * NOTCH 2's heeled mass where it is, heeled toward its own seat's end, wound
 * by its taps, stretched along its flight, lit off the key light, and lit
 * from inside on a fire step.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: GallState,
  time: number,
  beatPhase: number,
  flat: number,
  flight: number | null,
  fx: GallFx,
): void {
  const charge = gallCharge(s);
  const size = gallSpent(s) * gallSwell(s, beatPhase, time) * (1 + BULGE * fx.bulge);
  const { rx, ry } = gallSize(l);
  const lift = flight === null ? -ry * GALL_STANDS * size : 0;
  // In the air it is stretched along its climb and squashed as it falls.
  const stretch = flight === null ? 0 : 0.6 * Math.sin(flight * Math.PI);
  ctx.save();
  ctx.translate(0, lift);
  const body = gallNodulePath(l, {
    lobes: gallLobes(s),
    time,
    bearing: gallBearing(s, l.flip),
    heel: flight === null ? 1 : 0,
    size,
    press: Math.max(charge, stretch),
    sunk: flat,
  });
  ctx.fillStyle = PALETTE.gallFlesh;
  ctx.fill(body);
  ctx.save();
  ctx.clip(body);
  litRound(ctx, -rx * 0.3, -ry * 0.45, rx * 1.1, LIGHT_HALF.creature);
  ctx.restore();
  const step = gallLitStep(s);
  if (step?.ask === "fire") {
    const hurt = coreHurt(s.hits);
    fx.tell(lightCore(ctx, body, step.color, beatPhase, { x: 0, y: 0, r: rx }, hurt.bright));
  }
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.gallFleshDark, 0.95);
  ctx.stroke(body);
  // A tap lights its rim; once charged, the rim stays lit for the pull.
  const rim = Math.max(fx.flare, charge >= 1 ? 0.6 + 0.4 * Math.sin(time * 12) : 0);
  if (rim > 0) strokeGlow(ctx, body, PALETTE.hullRim, STROKE.outline, rim);
  drawHurt(ctx, body, fx.hurt.value);
  drawGallFlash(ctx, rx * size, fx.flash, 0);
  ctx.restore();
}
