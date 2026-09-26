import { type SimConfig, type SinewState, sinewSwinging, type World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawSinewBand } from "./sinew-band.js";
import { drawSinewFibres } from "./sinew-fibres.js";
import { paintMass } from "./sinew-flesh.js";
import type { SinewFx } from "./sinew-fx.js";
import { drawSinewHandles } from "./sinew-handles.js";
import {
  sinewAnchor,
  sinewCrushed,
  sinewLanded,
  sinewMassCentre,
  sinewMassPath,
  sinewMassRx,
  sinewMassRy,
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
  // A fibre parted shakes the mass and not the root: the fibres and the
  // handles' cords follow it, the way they follow the swing (`boss-hurt.ts`).
  const hung = sinewMassCentre(l, cfg, s, beat, beatPhase, swing);
  const mass = { x: hung.x + fx.hurt.shakeX(time, l.tile), y: hung.y };
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
  drawMass(ctx, l, cfg, mass, rx, time, sinewSum01(s, cfg), sinewCrushed(s, cfg), fx.hurt.value);
  if (!landed) drawSinewHandles(ctx, l, cfg, s, mass, beat, beatPhase, time, swing, swinging);
  ctx.restore();
}

/**
 * The mass: the hull's violet, warmed toward its rim as the strain comes on
 * — the pull is seen arriving in the thing being pulled — and ember where it
 * lies on the ship. Its muscle, its lit wall and the pucker the fibres go in
 * at are `sinew-flesh.ts`'.
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
  hurt: number,
): void {
  const path = sinewMassPath(l, cfg, c, time);
  const hex = crushed ? PALETTE.ember : mixHex(PALETTE.hull, PALETTE.hullRim, strain * 0.35);
  const rim = crushed ? PALETTE.emberRim : PALETTE.hullRim;
  const m = { x: c.x, y: c.y, rx, ry: sinewMassRy(l), tile: l.tile };
  paintMass(ctx, path, m, hex, rim, strain, time);
  drawHurt(ctx, path, hurt);
}
