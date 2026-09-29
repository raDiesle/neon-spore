import type { Point } from "@neon-spore/content";
import { eggBeats } from "./egg-curve.js";
import { drawEggSkin, NO_FLARE } from "./egg-skin.js";
import type { Dial } from "./gauge.js";
import { angleOf, rimPoint } from "./gauge-alien.js";
import { type Loaded, loadedLook } from "./gauge-load.js";
import { halo, strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE GAUGE's cannon: the ship's own, standing on the crown where it always
 * stands and **turning** through the half-round the needle swept — the owner,
 * 25 September 2026: *replace this needle claw with the regular cannon, cyan
 * or red, but the movement is same as before*. It was THE CLAW's hand.
 *
 * **Not one number of the round moved.** The barrel points at `angleOf` of
 * the needle's thousandths about the pivot `gaugeDial` has always put on the
 * crown, and a shot goes out along that line to the alien's rim
 * (`gauge-alien.ts`), so every reading is still `sim/gauge.ts`'s.
 *
 * Since 29 September 2026 it is the standard set's cannon, the field's egg in
 * its violet jelly and white rim (`cannon-maw.ts`) — the owner: *please make
 * the cannon look like cannon from "standard set"* — its vent glows the colour
 * it is loaded with (`gauge-load.ts`), and a dotted line runs from the vent to
 * the rim with a ring where it meets it: where the shot will land, on both
 * screens — he turns it, she has to see it to call it.
 */

/**
 * The egg, as shares of the radius: how far its vent stands out from the
 * pivot, how far its fat end sits back behind it, and its half-width there.
 * The vent is short of the mouth by more than half the radius — the owner,
 * 29 September 2026: *increase distance of cannon to mouth a little bit*.
 */
const REACH = 0.36;
const BACK = 0.12;
const WIDE = 0.13;
const BORE = 0.055;
/** How much narrower the egg is at the vent than at its fat end. */
const TAPER = 0.4;
/** Points round the egg. */
const STEPS = 30;
const REST = eggBeats(0, 0);

/**
 * Which way the cannon points and how far its barrel has kicked back. At rest
 * that is the needle and nothing; a shot kicks it (`gauge-shot.ts`).
 */
export interface CannonPose {
  aimMilli: number;
  /** How far the barrel is pulled back into the lobe, 0..1. */
  recoil: number;
}

/** The unit direction a value on the dial points in. Left is 0, right is full. */
export function along(milli: number): Point {
  const a = angleOf(milli);
  return { x: Math.cos(a), y: Math.sin(a) };
}

/** The canvas turned so that "up" is the way `milli` points, about the pivot. */
export function aimAt(ctx: CanvasRenderingContext2D, dial: Dial, milli: number): void {
  ctx.translate(dial.cx, dial.cy);
  ctx.rotate(angleOf(milli) + Math.PI / 2);
}

/** From the pivot to the barrel's mouth, in pixels, with nothing kicking it. */
export function muzzleReach(dial: Dial): number {
  return dial.r * REACH;
}

/**
 * The egg pointing up, its vent `tip` pixels out and its fat end `back`
 * pixels behind the pivot: the field's cloaca drawn long, so it still says
 * which way it faces.
 */
function eggAlong(tip: number, back: number, wide: number, t: number): Path2D {
  const mid = (tip - back) / 2;
  const half = (tip + back) / 2;
  const pts: Point[] = [];
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * Math.PI * 2;
    const up = Math.cos(a);
    const w = wide * (1 - TAPER * (0.5 + 0.5 * up)) * (1 + 0.03 * Math.sin(a * 3 + t * 1.1));
    pts.push({ x: Math.sin(a) * w, y: -(mid + up * half) });
  }
  return splinePath(pts, true);
}

export function drawGaugeCannon(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  pose: CannonPose,
  load: Loaded,
  time: number,
): void {
  const look = loadedLook(load);
  const bore = dial.r * BORE;
  const wide = dial.r * WIDE;
  const back = dial.r * BACK;
  const tip = muzzleReach(dial) - dial.r * (REACH - BACK) * 0.3 * pose.recoil;
  const mid = (tip - back) / 2;
  ctx.save();
  aimAt(ctx, dial, pose.aimMilli);
  // The standard set's cannon — the field's cloaca (`cannon-maw.ts`), violet
  // jelly under a white neon rim — drawn long so it points.
  const path = eggAlong(tip, back, wide, time);
  drawEggSkin(ctx, path, 0, -mid, wide * 1.15, time, REST, NO_FLARE);
  strokeGlow(ctx, path, PALETTE.hullRim, 1.3 + 0.9 * pose.recoil, 0.45 + 0.4 * pose.recoil);
  // The vent at its tip, in the loaded colour: the one part of the gun that
  // says what is in it.
  halo(ctx, 0, -tip, bore * 3, look.hex, 0.55);
  ctx.beginPath();
  ctx.ellipse(0, -tip, bore * 0.8, bore * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = look.hex;
  ctx.fill();
  ctx.strokeStyle = look.rim;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

/**
 * Where the shot will land: dots from the vent to the rim, and a ring on the
 * rim. `hot` lights the ring — the navigator's screen, while the aim is in
 * the wound; the pilot is never told that by his own screen.
 */
export function drawGaugeAim(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  milli: number,
  load: Loaded,
  alpha: number,
  hot: boolean,
): void {
  if (alpha <= 0) return;
  const look = loadedLook(load);
  const from = muzzleReach(dial) + 8;
  const end = rimPoint(dial, milli, -dial.r * 0.02);
  const to = Math.hypot(end.x - dial.cx, end.y - dial.cy) - 7;
  ctx.save();
  aimAt(ctx, dial, milli);
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgba(look.rim, 0.75 * alpha);
  ctx.setLineDash([0.1, 9]);
  ctx.beginPath();
  ctx.moveTo(0, -from);
  ctx.lineTo(0, -to);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.save();
  if (hot) halo(ctx, end.x, end.y, 22, look.hex, 0.7 * alpha);
  ctx.strokeStyle = rgba(hot ? PALETTE.hullRim : look.rim, (hot ? 1 : 0.7) * alpha);
  ctx.lineWidth = hot ? 2.6 : 1.8;
  ctx.beginPath();
  ctx.arc(end.x, end.y, hot ? 8 : 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
