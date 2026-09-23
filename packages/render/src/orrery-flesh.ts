import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE ORRERY is made of**: organs like wet beads strung on their
 * orbits, round a core of membrane with the ammunition's colour showing
 * through it — not a grey fill with a glowing line drawn round each, which is
 * the one picture the brief rules out by name (`new-boss-more` §6.3).
 *
 * Split off `orrery-draw.ts`, which decides *what* each organ says — whether
 * this seat can count its ring, whether it is behind the core — so that file
 * stays about the lie on each screen and this one about the material.
 *
 * **The colour was the line round an organ, and now it is the organ.** An
 * organ this seat can count is violet flesh; one it cannot is rock. Far ones
 * are the same bead at half strength and shaded deeper, which is what the
 * depth is made of. The colours go in plain and the strength in the alpha, so
 * the tests find the violet on the op log (`orrery-frame.test.ts`).
 */

/**
 * One organ: `hex` its flesh, `near` whether it is in front of the core, and
 * `seen` whether this seat can count its ring. A grey one is quieter than a
 * violet one — at full strength the grey came out as bright pearls, louder
 * than the ring the seat *can* count.
 */
export function paintOrgan(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  r: number,
  hex: string,
  near: boolean,
  seen: boolean,
): void {
  ctx.save();
  ctx.globalAlpha = (near ? 1 : 0.55) * (seen ? 1 : 0.6);
  ctx.fillStyle = hex;
  ctx.fill(body);
  ctx.clip(body);
  // Round: lit on the upper left, gone to the deep on the far side — deeper
  // on a far one, which the core's shadow is also falling across.
  const shade = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x, y, r * 1.15);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, near ? 0.45 : 0.2));
  shade.addColorStop(0.4, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, near ? 0.7 : 0.85));
  ctx.fillStyle = shade;
  ctx.fill(body);
  ctx.restore();
  if (!near) return;
  // The wet point on a near one.
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.85);
  ctx.beginPath();
  ctx.arc(x - r * 0.38, y - r * 0.4, Math.max(0.8, r * 0.18), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The core: membrane over the ammunition's colour, the colour pooled in the
 * middle and lit inside the wall. `strength` is how much of it shows, and
 * `pulse` the naked core's beat, lit in `rim`.
 */
export function paintCore(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  r: number,
  tile: number,
  hex: string,
  rim: string,
  strength: number,
  pulse: number,
): void {
  ctx.save();
  const skin = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.15);
  skin.addColorStop(0, PALETTE.rock);
  skin.addColorStop(0.45, PALETTE.rockDark);
  skin.addColorStop(1, PALETTE.sheenDeep);
  ctx.fillStyle = skin;
  ctx.fill(body);
  ctx.clip(body);
  const blood = ctx.createRadialGradient(x, y + r * 0.1, 0, x, y + r * 0.1, r * 0.95);
  blood.addColorStop(0, rgba(hex, 0.9 * strength));
  blood.addColorStop(0.6, rgba(hex, 0.45 * strength));
  blood.addColorStop(1, rgba(hex, 0.1 * strength));
  ctx.fillStyle = blood;
  ctx.fill(body);
  ctx.lineJoin = "round";
  // The wall, lit from inside on its lower half only — lit all round, it was
  // drawn first and read as the outline it replaced.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - r * 2, y, r * 4, r * 2);
  ctx.clip();
  ctx.lineWidth = tile * 0.14;
  ctx.strokeStyle = hex;
  ctx.globalAlpha = 0.2 + 0.4 * strength;
  ctx.stroke(body);
  ctx.restore();
  if (pulse > 0) {
    ctx.lineWidth = tile * 0.08;
    ctx.strokeStyle = rim;
    ctx.globalAlpha = pulse * strength;
    ctx.stroke(body);
  }
  ctx.restore();
  if (strength <= 0) return;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.3 * strength);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.34, y - r * 0.42, r * 0.3, r * 0.11, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.85 * strength);
  ctx.beginPath();
  ctx.arc(x - r * 0.42, y - r * 0.47, Math.max(0.8, r * 0.06), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
