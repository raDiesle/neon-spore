import { type SimConfig, type SinewState, sinewSwinging, type World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawSinewBand } from "./sinew-band.js";
import { drawSinewFibres } from "./sinew-fibres.js";
import type { SinewFx } from "./sinew-fx.js";
import { drawSinewHandles } from "./sinew-handles.js";
import {
  sinewAnchor,
  sinewCrushed,
  sinewLanded,
  sinewMassCentre,
  sinewMassPath,
  sinewMassRx,
  sinewSum01,
} from "./sinew-shape.js";

/**
 * **THE SINEW**: a tendon from the top edge down to a mass, a handle on each
 * side of the mass — one per seat — and the strain band on the way down,
 * read by seat (§11.26).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the fibres, the collar over them, the mass over the ends of the fibres,
 * and the handles last, over everything, because they are what a thumb
 * lands on. The mass is drawn *after* the fibres so their ends go into it
 * rather than over it, and the handles' cords leave from its flank.
 *
 * Its health is its silhouette: a fibre parted is a fibre drawn as two
 * stubs, the mass hangs a row lower for each, and when the last goes the
 * mass falls with both hands still on it — and the picture goes on to the
 * landing either way, at the wall as a mass fading out over
 * `sinewOutBeats`, on the ship as a mass on the plating (the breach is the
 * ship's own). What outlives a frame — the whip, the flash, the shock down
 * the hull — is `effects.sinew` (`sinew-fx.ts`).
 */
export function drawSinew(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SinewState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: SinewFx,
): void {
  const cfg = world.cfg;
  const swinging = sinewSwinging(s, world);
  const swing = swinging ? fx.swingTiles : 0;
  const root = sinewAnchor(l, cfg);
  const mass = sinewMassCentre(l, cfg, s, beat, beatPhase, swing);
  fx.note(mass.x, mass.y);
  const rx = sinewMassRx(l, cfg);
  const landed = sinewLanded(s);
  // Once landed the mass fades over the beats the boss stands before it
  // goes — unless it landed on the ship, where it stays until the wave does.
  const outBeats = Math.max(1, cfg.sinewOutBeats);
  const fade =
    landed && !sinewCrushed(s, cfg)
      ? Math.max(0, 1 - (beat - s.outBeat + beatPhase) / outBeats)
      : 1;
  if (fade <= 0) return;

  ctx.save();
  ctx.globalAlpha = fade;
  if (!landed) {
    drawSinewFibres(ctx, l, cfg, s, root, mass, rx, time);
    drawSinewBand(ctx, l, cfg, s, root, mass, beat, beatPhase, time);
  }
  drawMass(ctx, l, cfg, mass, rx, time, sinewSum01(s, cfg), sinewCrushed(s, cfg));
  if (!landed) drawSinewHandles(ctx, l, cfg, s, mass, beat, beatPhase, time, swing, swinging);
  ctx.restore();
}

/**
 * The mass: the hull's violet, warmed toward its rim as the strain comes on
 * — the pull is seen arriving in the thing being pulled — and rimmed in
 * ember where it lies on the ship. A dark seam across its top is where the
 * fibres go in.
 */
function drawMass(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: { x: number; y: number },
  rx: number,
  time: number,
  strain: number,
  crushed: boolean,
): void {
  const path = sinewMassPath(l, cfg, c, time);
  const hex = crushed ? PALETTE.ember : mixHex(PALETTE.hull, PALETTE.hullRim, strain * 0.35);
  const rim = crushed ? PALETTE.emberRim : PALETTE.hullRim;
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(path);
  ctx.fillStyle = rgba(hex, 0.55);
  ctx.fill(path);
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  ctx.lineJoin = "round";
  ctx.stroke(path);
  ctx.restore();
  strokeGlow(ctx, path, rim, STROKE.inner, 0.6 + 0.6 * strain);
  // The seam the fibres go into.
  const seam = new Path2D();
  seam.moveTo(c.x - rx * 0.5, c.y - l.tile * 0.25);
  seam.quadraticCurveTo(c.x, c.y - l.tile * 0.05, c.x + rx * 0.5, c.y - l.tile * 0.25);
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.background, 0.7);
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  ctx.stroke(seam);
  ctx.restore();
}
