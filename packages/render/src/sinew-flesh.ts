import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE SINEW is made of**: a tendon of wet cords, each lit along one
 * side, in a sheath of membrane, pulling on a mass of muscle — round, lit on
 * top and gone to the deep beneath, its lower wall lit from inside, a pucker
 * where the tendon goes in and a film of gloss. It is no longer a violet fill
 * with a glowing line drawn round the mass, which is the one picture the
 * brief rules out by name (`new-boss-more` §6.3).
 *
 * Split off `sinew-draw.ts` and `sinew-fibres.ts`, which decide *what* the
 * tendon says — how many fibres are left, how hard it is pulled, whether it
 * is slackening, where it landed — so they stay about the fight and this one
 * about the material. The strain colour still comes in from outside: the mass
 * warms toward the hull's rim as it is pulled, and the one it landed on the
 * ship in is ember. Colours go in plain and the strength in the alpha, so
 * `sinew-frame.test.ts` finds the hull, its rim and the ember on the op log.
 *
 * **Every width is off the tile**, never off the mass's radius, which the
 * config sets per wave.
 */

/** Where the mass hangs, and its half-sizes. */
export interface Muscle {
  x: number;
  y: number;
  rx: number;
  ry: number;
  tile: number;
}

/**
 * The mass: `hex` its flesh, `rim` its inside light, `strain` 0..1 how hard
 * the pair has it — the wall glows brighter with it, from inside.
 */
export function paintMass(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  m: Muscle,
  hex: string,
  rim: string,
  strain: number,
): void {
  const { x, y, rx, ry, tile } = m;
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(body);
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = hex;
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  const shade = ctx.createRadialGradient(
    x - rx * 0.3,
    y - ry * 0.5,
    0,
    x,
    y,
    Math.max(rx, ry) * 1.1,
  );
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.28));
  shade.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.6));
  ctx.fillStyle = shade;
  ctx.fill(body);
  // Striation: the grain of the muscle, running the way the pull runs.
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.globalAlpha = 0.16;
  for (let k = -2; k <= 2; k++) {
    const gx = x + (k / 2.5) * rx;
    ctx.beginPath();
    ctx.moveTo(x + (k / 5) * rx, y - ry);
    ctx.quadraticCurveTo(gx, y, gx + (k / 6) * rx, y + ry);
    ctx.stroke();
  }
  // Its lower wall, lit from inside, brighter the harder it is pulled.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - rx * 2, y, rx * 4, ry * 2);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.14;
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.3 + 0.4 * strain;
  ctx.stroke(body);
  ctx.restore();
  // The pucker the tendon goes in at: dark, with a wet lip under it.
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.beginPath();
  ctx.ellipse(x, y - ry * 0.55, rx * 0.32, tile * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = PALETTE.sheenRim;
  ctx.lineWidth = Math.max(1, tile * 0.025);
  ctx.beginPath();
  ctx.ellipse(x, y - ry * 0.52, rx * 0.3, tile * 0.08, 0, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // The film, high on the left.
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.25);
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.5, y - ry * 0.35, rx * 0.16, ry * 0.1, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.8);
  ctx.beginPath();
  ctx.arc(x - rx * 0.58, y - ry * 0.4, Math.max(0.8, tile * 0.035), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The sheath: membrane round the cords, lit down its left side and deep down
 * its right, so the tendon is round rather than a flat band. `tint` is the
 * strain's colour and `a` how much of it shows.
 */
export function paintSheath(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  left: number,
  right: number,
  tint: string,
  a: number,
): void {
  ctx.save();
  ctx.fillStyle = rgba(tint, a);
  ctx.fill(body);
  ctx.clip(body);
  const round = ctx.createLinearGradient(left, 0, right, 0);
  round.addColorStop(0, rgba(PALETTE.sheenRim, 0.12));
  round.addColorStop(0.3, rgba(PALETTE.sheenRim, 0));
  round.addColorStop(0.65, rgba(PALETTE.sheenDeep, 0));
  round.addColorStop(1, rgba(PALETTE.sheenDeep, 0.35));
  ctx.fillStyle = round;
  ctx.fill(body);
  ctx.restore();
}

/**
 * One cord: its flesh stroked at `width`, then a thin wet line down its lit
 * side, the width of a highlight and not of the cord.
 */
export function paintCord(
  ctx: CanvasRenderingContext2D,
  cord: Path2D,
  hex: string,
  width: number,
  tile: number,
): void {
  ctx.save();
  ctx.globalAlpha *= 0.8;
  ctx.strokeStyle = hex;
  ctx.lineWidth = width;
  ctx.stroke(cord);
  ctx.restore();
  ctx.save();
  ctx.translate(-width * 0.25, 0);
  ctx.strokeStyle = PALETTE.sheenRim;
  ctx.globalAlpha *= 0.5;
  ctx.lineWidth = Math.max(0.8, tile * 0.015);
  ctx.stroke(cord);
  ctx.restore();
}
