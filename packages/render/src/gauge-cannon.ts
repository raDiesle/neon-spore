import type { Point } from "@neon-spore/content";
import type { Dial } from "./gauge.js";
import { angleOf, rimPoint } from "./gauge-alien.js";
import { type Loaded, loadedLook } from "./gauge-load.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { OWN_SKIN } from "./hull-skin.js";
import { PALETTE } from "./palette.js";

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
 * The cannon lobe is the hull's own skin, the barrel's vent glows the colour
 * it is loaded with (`gauge-load.ts`), and a dotted line runs from the vent to
 * the rim with a ring where it meets it: where the shot will land, on both
 * screens — he turns it, she has to see it to call it.
 */

/** The lobe it turns in, and the barrel out of it, as shares of the radius. */
const LOBE = 0.12;
const BARREL = 0.27;
const BORE = 0.055;

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
  return dial.r * (LOBE + BARREL);
}

export function drawGaugeCannon(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  pose: CannonPose,
  load: Loaded,
): void {
  const look = loadedLook(load);
  const lobe = dial.r * LOBE;
  const bore = dial.r * BORE;
  const tip = muzzleReach(dial) - dial.r * BARREL * 0.35 * pose.recoil;
  ctx.save();
  aimAt(ctx, dial, pose.aimMilli);
  // The barrel: a fat tapering snout of the hull's own membrane, rounded at
  // the mouth — a lobe of the ship grown long, not a pipe bolted onto it.
  ctx.beginPath();
  ctx.moveTo(-bore * 1.5, -lobe * 0.3);
  ctx.quadraticCurveTo(-bore * 1.25, -tip * 0.7, -bore, -tip);
  ctx.quadraticCurveTo(0, -tip - bore * 0.7, bore, -tip);
  ctx.quadraticCurveTo(bore * 1.25, -tip * 0.7, bore * 1.5, -lobe * 0.3);
  ctx.closePath();
  ctx.fillStyle = OWN_SKIN.body[1];
  ctx.fill();
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  // The vent at its mouth, in the loaded colour: the one part of the gun that
  // says what is in it.
  halo(ctx, 0, -tip, bore * 3, look.hex, 0.55);
  ctx.beginPath();
  ctx.ellipse(0, -tip, bore * 0.8, bore * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = look.hex;
  ctx.fill();
  ctx.strokeStyle = look.rim;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // The lobe it turns in, over the barrel's root.
  ctx.beginPath();
  ctx.arc(0, 0, lobe, 0, Math.PI * 2);
  ctx.fillStyle = OWN_SKIN.body[1];
  ctx.fill();
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.hullRim;
  ctx.beginPath();
  ctx.arc(0, 0, lobe * 0.28, 0, Math.PI * 2);
  ctx.fill();
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
