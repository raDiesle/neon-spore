import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * **The siren is a light bar** — the strip on an emergency vehicle's roof: a
 * row of cells, lit in turn. It is the answer the owner took out of VERSUS on
 * 17 October 2026 (`siren:look` / `lightbar`, over a roof beacon and a sonar
 * ping), and asked in the same breath to be less tall and to have three states
 * rather than two:
 *
 * - **idle** — nothing to talk about. The housing is there and nearly nothing
 *   is lit, so the top of the screen is quiet and the eye learns where the
 *   instrument lives without being asked to look at it.
 * - **call** — a split body is on the field and somebody has to talk. One cool
 *   light runs end to end and back, like a scanner.
 * - **torch** — the fastest thing in the game is on its way. The two halves
 *   strobe red and white against each other, and each flash throws a band of
 *   light across that half of the screen.
 *
 * And a fourth that is not a state of the siren but of the player: **off**,
 * the player tapped it away (`ViewState.sirenOff`). Only the housing's outline
 * is left, faint, so a finger can find it again.
 *
 * Every phase is read off `time`, the host's clock and not the world's: two
 * phones a frame apart may show the scanner in two places, but whether it is
 * lit at all comes from `commsCall`, off the world (`siren.ts`).
 */

export type SirenState = "off" | "idle" | "call" | "torch";

/** Cells in the bar. */
const CELLS = 7;
/** Half the bar across and half of it up and down — the numbers `siren.ts`
 * hangs the chips and the word off. 8 pixels tall where the first bar was 18:
 * the owner, 17 October 2026, *make it less tall*. */
export const BAR_HALF_W = 24;
export const BAR_HALF_H = 4;
/** The housing, as the dial before it: hardware over the field, not a body. */
const CASE = "#0D1117";
const CASE_RIM = "#2A2547";
/** An unlit cell, the dial's old tick colour: the bar's own, and no grey the
 * field also uses for something. */
const UNLIT = "#5B5486";
/** The housing's lip round the cells. */
const LIP = 2;
/** How far up and down a torch's flash reaches. */
const BAND = 30;

export function drawLightbar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  state: SirenState,
): void {
  const w = BAR_HALF_W * 2;
  const h = BAR_HALF_H * 2;
  const left = cx - BAR_HALF_W;
  const cell = w / CELLS;
  ctx.save();

  if (state === "off") {
    // A dotted outline and nothing else: the place to tap it back.
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = CASE_RIM;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.roundRect(left - LIP, cy - BAR_HALF_H - LIP, w + LIP * 2, h + LIP * 2, BAR_HALF_H + LIP);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Torch: the halves trade 2.5 times a second, and the lit half flashes
  // twice in its turn — between full and half, never dark, so any frame of it
  // has one half burning.
  const torch = state === "torch";
  const strobe = (time * 2.5) % 1;
  const leftLit = torch && strobe < 0.5;
  const rightLit = torch && !leftLit;
  const flash = strobe % 0.25 < 0.13 ? 1 : 0.55;
  // Call: one light running end to end and back.
  const run = (0.5 - 0.5 * Math.cos(time * Math.PI * 1.2)) * (CELLS - 1);

  if (torch) {
    const band = ctx.createLinearGradient(0, cy - BAND, 0, cy + BAND);
    const hue = leftLit ? PALETTE.red : PALETTE.text;
    band.addColorStop(0, `${hue}00`);
    band.addColorStop(0.5, flash === 1 ? `${hue}55` : `${hue}2A`);
    band.addColorStop(1, `${hue}00`);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = band;
    ctx.fillRect(leftLit ? 0 : cx, cy - BAND, cx * (leftLit ? 1 : 2), BAND * 2);
    ctx.globalCompositeOperation = "source-over";
  }

  // Idle is the housing at half strength: there, and asking for nothing.
  const idle = state === "idle";
  ctx.globalAlpha = idle ? 0.3 : 0.92;
  ctx.fillStyle = CASE;
  ctx.beginPath();
  ctx.roundRect(left - LIP, cy - BAR_HALF_H - LIP, w + LIP * 2, h + LIP * 2, BAR_HALF_H + LIP);
  ctx.fill();
  ctx.strokeStyle = torch ? PALETTE.red : CASE_RIM;
  ctx.globalAlpha = idle ? 0.3 : torch ? 0.4 + 0.5 * flash : 1;
  ctx.lineWidth = 1;
  ctx.stroke();

  if (idle) {
    // Every cell dark, so one path: the bar at rest is on every frame of
    // every wave, and costs what one shape costs.
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = UNLIT;
    ctx.beginPath();
    for (let i = 0; i < CELLS; i++)
      ctx.roundRect(left + i * cell + 0.75, cy - BAR_HALF_H, cell - 1.5, h, 1.5);
    ctx.fill();
    ctx.restore();
    return;
  }

  for (let i = 0; i < CELLS; i++) {
    const x = left + i * cell;
    let lit: number;
    let hue: string;
    if (torch) {
      const onLeft = i < CELLS / 2;
      lit = (onLeft ? leftLit : rightLit) ? flash : 0.18;
      hue = onLeft ? PALETTE.red : PALETTE.text;
    } else {
      lit = Math.max(0.12, 1 - Math.abs(i - run) * 0.7);
      hue = PALETTE.cyan;
    }
    ctx.globalAlpha = lit;
    ctx.fillStyle = hue;
    ctx.beginPath();
    ctx.roundRect(x + 0.75, cy - BAR_HALF_H, cell - 1.5, h, 1.5);
    ctx.fill();
    if (lit > 0.5) halo(ctx, x + cell / 2, cy, cell * (torch ? 3.4 : 2.2), hue, 0.5 * lit);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
