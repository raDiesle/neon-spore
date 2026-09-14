import { halo } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * The siren's dial, on its own beside `siren-seats.ts`: the housing, the
 * ticks, the ring that breathes, the two bars and the core that turns over.
 * `siren.ts` places it and hangs the chips and the duty word off its radius,
 * which is why the radius and the tick colour are exported and nothing else
 * is.
 */

/** The instrument's own housing colour, and the ticks around it — dark enough
 * to read as hardware bolted over the field rather than as another creature. */
const CASE = "#0D1117";
const CASE_RIM = "#2A2547";
export const TICK = "#5B5486";

/** Outer radius of the dial. Fixed pixels like the rest of the HUD (`hud.ts`
 * writes the run's line at 11), because it is furniture on the screen rather
 * than anything sized to a tile. */
export const DIAL_R = 15;

/**
 * The dial: a dark disc, four ticks, a dashed ring that breathes, two side
 * bars flashing against each other, and a hexagonal core turning over from one
 * ammunition colour to the other.
 *
 * Every phase is read off `time`, the host's own clock and not the world's.
 * That is right here and would be wrong for anything in the field: a siren is
 * furniture on one person's screen, so two devices a frame apart showing the
 * ring at slightly different sizes costs nothing — while two devices
 * disagreeing about *whether it is lit* would be a real split, and that part
 * comes from `commsCall`, off the world.
 */
export function drawDial(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
): void {
  // 2.4 s there and back, so the ring breathes at about walking pace — slower
  // than the beat, so it is never mistaken for the count.
  const pulse = 0.5 - 0.5 * Math.cos((time * Math.PI) / 1.2);
  // 0.8 s, and the two bars are half a cycle apart: they trade rather than
  // blink together, which is what makes it read as an instrument running
  // rather than as a light that is merely on.
  const node = 0.5 - 0.5 * Math.cos((time * Math.PI) / 0.4);
  const spin = time * Math.PI;

  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = CASE;
  ctx.globalAlpha = 0.88;
  ctx.beginPath();
  ctx.arc(0, 0, DIAL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = CASE_RIM;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // The four ticks of the housing, at the compass points.
  ctx.strokeStyle = TICK;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * DIAL_R * 0.99, Math.sin(a) * DIAL_R * 0.99);
    ctx.lineTo(Math.cos(a) * DIAL_R * 0.82, Math.sin(a) * DIAL_R * 0.82);
    ctx.stroke();
  }

  const ringHex = mixHex(PALETTE.cyan, PALETTE.red, pulse);
  ctx.strokeStyle = ringHex;
  ctx.globalAlpha = 0.3 + 0.7 * pulse;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 2.5, 1.2, 2.5]);
  ctx.beginPath();
  ctx.arc(0, 0, DIAL_R * 0.73 * (0.85 + 0.3 * pulse), 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // The two bars, one per side, alternating. Red on the left and cyan on the
  // right in both seats — they are the ammunition colours and nothing else, so
  // the instrument is drawn in the game's own two words.
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = PALETTE.red;
  ctx.globalAlpha = 0.15 + 0.85 * node;
  ctx.beginPath();
  ctx.arc(0, 0, DIAL_R * 0.86, Math.PI * 0.72, Math.PI * 1.28);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.cyan;
  ctx.globalAlpha = 0.15 + 0.85 * (1 - node);
  ctx.beginPath();
  ctx.arc(0, 0, DIAL_R * 0.86, Math.PI * 1.72, Math.PI * 0.28);
  ctx.stroke();

  // The core, turning. A hexagon rather than a disc so the rotation is visible
  // at all — a spinning circle is a still circle.
  const coreHex = mixHex(PALETTE.cyan, PALETTE.red, 0.5 - 0.5 * Math.cos(spin));
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = coreHex;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = spin + (i * Math.PI) / 3;
    const px = Math.cos(a) * DIAL_R * 0.44;
    const py = Math.sin(a) * DIAL_R * 0.44;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = CASE;
  ctx.beginPath();
  ctx.arc(0, 0, DIAL_R * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.restore();

  // The glow last and outside the housing, so the corner of the screen lifts
  // with the pulse. `halo` rather than `shadowBlur`, for `glow.ts`'s reason.
  halo(ctx, cx, cy, DIAL_R * 2.4, ringHex, 0.16 + 0.2 * pulse);
}
