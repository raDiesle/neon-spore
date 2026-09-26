import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE THROAT's mouth is made of**, and the inside it turns out through
 * it at the end: the other half of `throat-flesh.ts`, split off it when the
 * pair passed the file ceiling. The lip is the one colour on the boss, THE
 * GUM's venom (`throat-mouth.ts` argues why), and here it is a ring of wet
 * flesh round a dark hole rather than a glowing line round a filled one.
 */

/**
 * A lip: a ring of wet flesh round a dark hole, shaded towards the hole and
 * lit on its upper left. `hex` is its colour and `rim` its lit crest; `a` how
 * strongly it shows.
 */
export function paintLip(
  ctx: CanvasRenderingContext2D,
  lip: Path2D,
  x: number,
  y: number,
  r: number,
  tile: number,
  hex: string,
  rim: string,
  a: number,
): void {
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(lip);
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.13;
  ctx.strokeStyle = hex;
  ctx.globalAlpha = a;
  ctx.stroke(lip);
  // The inside of the lip turning down into the hole.
  ctx.save();
  ctx.clip(lip);
  ctx.lineWidth = tile * 0.16;
  ctx.strokeStyle = PALETTE.background;
  ctx.globalAlpha = 0.55;
  ctx.stroke(lip);
  ctx.restore();
  // The crest, where the light from above catches it.
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.4 + 0.5 * a;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.02, r * 0.55, 0, Math.PI * 1.1, Math.PI * 1.55);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.8);
  ctx.beginPath();
  ctx.arc(x - r * 0.62, y - r * 0.32, Math.max(0.8, tile * 0.025), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** How far the "wet" gradient's own centre drifts, and how fast — distinct
 * from the turned ring's own `time*2.1` wobble (`throat-evert.ts`'s
 * `insidePoints`) so the sheen never settles into step with the ring it lights
 * (`docs/style-guide.md`'s "Depth on a body that already ships"). */
const WET_LIT_WOBBLE = 0.06;
const WET_LIT_WOBBLE_RATE = 0.8;

/**
 * A ring of the inside, turned out through the mouth: the inside's own dark
 * flesh, wet, with the venom lit round its inner wall.
 */
export function paintTurned(
  ctx: CanvasRenderingContext2D,
  hoop: Path2D,
  x: number,
  y: number,
  rx: number,
  tile: number,
  out: number,
  time: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.9 * out;
  ctx.fillStyle = PALETTE.venomDeep;
  ctx.fill(hoop);
  ctx.clip(hoop);
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.16;
  ctx.strokeStyle = PALETTE.venom;
  ctx.globalAlpha = 0.35 + 0.45 * out;
  ctx.stroke(hoop);
  ctx.globalAlpha = 1;
  const wobble = WET_LIT_WOBBLE * Math.sin(time * WET_LIT_WOBBLE_RATE);
  const wx = x - rx * (0.4 + wobble);
  const wy = y - rx * (0.2 + wobble * 0.8);
  const wet = ctx.createRadialGradient(wx, wy, 0, wx, wy, rx);
  wet.addColorStop(0, rgba(PALETTE.venomRim, 0.3 * out));
  wet.addColorStop(1, rgba(PALETTE.venomRim, 0));
  ctx.fillStyle = wet;
  ctx.fill(hoop);
  // The ring's own hole, with its far lip lit: without it a turned ring was
  // drawn first as a green blob.
  ctx.fillStyle = rgba(PALETTE.background, 0.8 * out);
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.42, rx * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.strokeStyle = PALETTE.venomRim;
  ctx.globalAlpha = 0.6 * out;
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.42, rx * 0.2, 0, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.restore();
}
