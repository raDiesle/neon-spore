import {
  beatSeconds,
  type SimConfig,
  type SinewState,
  sinewSwinging,
  slowing,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { BAND_LOOK, sinewCollarBox } from "./sinew-band.js";
import { drawSinewCrown, sinewCrownRoot } from "./sinew-crown.js";
import { drawSinewFibres, FIBRE_LOOK } from "./sinew-fibres.js";
import { paintMass } from "./sinew-flesh.js";
import type { SinewFx } from "./sinew-fx.js";
import { drawSinewHandles } from "./sinew-handles.js";
import {
  sinewCrushed,
  sinewLanded,
  sinewMassCentre,
  sinewMassPath,
  sinewMassRx,
  sinewMassRy,
  sinewRoot,
  sinewSum01,
} from "./sinew-shape.js";
import { drawSinewTear } from "./sinew-tear.js";

/**
 * **THE SINEW**: a tendon hung from a body flying over the field — the crown —
 * down to a mass, a handle on each side of the mass — one per seat — and the
 * strain band in the middle of the tendon, read by seat (§11.26).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the crown, the fibres, the band they run into and out of, the mass over
 * the ends of the fibres, a tear if one has just happened, and the handles
 * last, over everything, because they are what a thumb lands on. The mass is drawn *after* the fibres so their ends go into it
 * rather than over it, and the handles' cords leave from its flank.
 *
 * Its health is its silhouette: a fibre parted is a fibre drawn as two
 * stubs, the mass hangs a row lower for each, and when the last goes the
 * mass falls with both hands still on it — and the picture goes on to the
 * landing either way, at the wall as a mass fading out over
 * `sinewOutBeats`, on the ship as a mass on the plating (the breach is the
 * ship's own). What outlives a frame — the whip, the flash, the shock down
 * the hull, the mass's lag — is `effects.sinew` (`sinew-fx.ts`).
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
  // The strings leave the crown where it is flying now; the band they run
  // into hangs off the resting root, and holds still (`sinewCollarBox`).
  const root = sinewCrownRoot(l, sinewRoot(l, cfg, s, beat, beatPhase), time);
  // A fibre parted shakes the mass and not the root: the fibres and the
  // handles' cords follow it, the way they follow the swing (`boss-hurt.ts`).
  // The mass has weight: it trails where it hangs, and overshoots (`sinew-carry.ts`).
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  const hung = fx.carry.at(sinewMassCentre(l, cfg, s, beat, beatPhase, swing), seconds, l.tile);
  const mass = { x: hung.x + fx.hurt.shakeX(time, l.tile), y: hung.y };
  const box = sinewCollarBox(l, cfg, s, beat, beatPhase, swing);
  fx.note(mass.x, mass.y, box);
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
  const strain = sinewSum01(s, cfg);
  if (!landed) {
    drawSinewCrown(ctx, l, root, strain, time);
    const holds = Math.max(1, cfg.sinewHoldBeats);
    const hold = s.holdBeat >= 0 ? Math.min(1, (beat - s.holdBeat + beatPhase) / holds) : -1;
    FIBRE_LOOK.lay(ctx, slowing(world), (on) =>
      drawSinewFibres(on, l, cfg, s, root, box, mass, rx, hold, time),
    );
    BAND_LOOK.draw(ctx, l, cfg, s, box, beatPhase, hold);
  }
  drawMass(ctx, l, cfg, mass, rx, time, strain, sinewCrushed(s, cfg), fx.hurt.value);
  const tear = fx.tear;
  if (tear !== null)
    drawSinewTear(ctx, tear, Math.max(1, cfg.sinewFibres), root, box, mass, rx, l.tile);
  if (!landed)
    drawSinewHandles(ctx, l, cfg, s, mass, beat, beatPhase, time, swing, swinging, fx.verdicts);
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
