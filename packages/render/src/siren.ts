import type { World } from "@neon-spore/sim";
import { commsCall } from "./comms.js";
import { halo } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawSeat, PILL_W, SIREN_PAD } from "./siren-seats.js";
import { dutyWord } from "./strand-duty.js";

/**
 * The warning siren, top right of the field beside the strip, and the two
 * seats' jobs under it.
 *
 * **It replaces five private markings with one.** Every creature with a split
 * secret used to announce itself over its own body — a shut eye above a cloud
 * being the one this was built out of — so the pair had to learn where to look
 * per creature, and had to look *into the field* to find out that they were
 * supposed to be talking at all. Both are now one place: the strip says
 * *which* blip (`drawEyeGlyph` over it), and this says *that a call is on and
 * whose turn it is to open their mouth*. `comms.ts` owns the roster; this file
 * owns the picture and knows nothing about creatures.
 *
 * **Deliberately unlike everything else on this screen, which is the check it
 * owes.** `torch-alarm.ts` is a grey band across the strip; `lure-alarm.ts` is
 * a white ring in the field; `veil-marks.ts` is an off-white ring above a
 * body. This is a lit instrument in a corner nothing else uses, in the two
 * ammunition colours, and it never moves. Nothing about where it is depends on
 * where the creature is, because the answer it gives — *talk* — is the same
 * wherever the body happens to be standing.
 *
 * **Both seats are shown and the local one is lit.** The alternative was to
 * draw only your own job, which is less to look at and costs the thing the
 * whole instrument is for: knowing that your partner has been told to listen
 * is what makes a person start talking. The two phones therefore draw the same
 * two chips in the same order, and only the brightness differs.
 */

/** The instrument's own housing colour, and the ticks around it — dark enough
 * to read as hardware bolted over the field rather than as another creature. */
const CASE = "#0D1117";
const CASE_RIM = "#2A2547";
const TICK = "#5B5486";

/** Outer radius of the dial. Fixed pixels like the rest of the HUD (`hud.ts`
 * places the hull bar at 14 and the beat dots at 34), because it is furniture
 * on the screen rather than anything sized to a tile. */
const R = 15;
/** Clear of the hull bar, which ends at y = 20. */
const TOP = 24;
/** Between a chip and the dial. */
const GAP = 3;

/** How far under the dial the duty word sits, and how it is drawn. Clear of
 * the two seat chips, which are level with the dial's own middle. */
const DUTY_DROP = 12;
const DUTY_FONT = '700 8px "Courier New",monospace';

export function drawCommsSiren(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const call = commsCall(world);
  if (!call) return;
  // P1 on the left of the dial and P2 on its right, which is the order the
  // band already reads in — the cannon strip above the shield strip, player 1
  // before player 2 everywhere else on the screen. Stacking both chips under
  // the dial put them in a column, and a column has no left and no right, so
  // there was nothing to line either of them up with.
  const cx = l.width - SIREN_PAD - PILL_W - GAP - R;
  const cy = TOP + R;
  const reach = R + GAP + PILL_W / 2;

  ctx.save();
  drawDial(ctx, cx, cy, time);
  drawSeat(ctx, l, "p1", call.p1, cx - reach, cy, time);
  drawSeat(ctx, l, "p2", call.p2, cx + reach, cy, time);
  // And, under it, the one word this seat owes the other while a thread is on
  // the field. Nothing else in the game writes a word here (`strand-duty.ts`).
  drawDuty(ctx, l, world, cx, cy + R + DUTY_DROP);
  ctx.restore();
}

/** The word this seat owes, centred under the dial, or nothing. */
function drawDuty(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  cx: number,
  y: number,
): void {
  const word = dutyWord(l.role, world);
  if (word === null) return;
  ctx.font = DUTY_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = TICK;
  ctx.fillText(word, cx, y);
}

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
function drawDial(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number): void {
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
  ctx.arc(0, 0, R, 0, Math.PI * 2);
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
    ctx.moveTo(Math.cos(a) * R * 0.99, Math.sin(a) * R * 0.99);
    ctx.lineTo(Math.cos(a) * R * 0.82, Math.sin(a) * R * 0.82);
    ctx.stroke();
  }

  const ringHex = mixHex(PALETTE.cyan, PALETTE.red, pulse);
  ctx.strokeStyle = ringHex;
  ctx.globalAlpha = 0.3 + 0.7 * pulse;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 2.5, 1.2, 2.5]);
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.73 * (0.85 + 0.3 * pulse), 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // The two bars, one per side, alternating. Red on the left and cyan on the
  // right in both seats — they are the ammunition colours and nothing else, so
  // the instrument is drawn in the game's own two words.
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = PALETTE.red;
  ctx.globalAlpha = 0.15 + 0.85 * node;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.86, Math.PI * 0.72, Math.PI * 1.28);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.cyan;
  ctx.globalAlpha = 0.15 + 0.85 * (1 - node);
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.86, Math.PI * 1.72, Math.PI * 0.28);
  ctx.stroke();

  // The core, turning. A hexagon rather than a disc so the rotation is visible
  // at all — a spinning circle is a still circle.
  const coreHex = mixHex(PALETTE.cyan, PALETTE.red, 0.5 - 0.5 * Math.cos(spin));
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = coreHex;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = spin + (i * Math.PI) / 3;
    const px = Math.cos(a) * R * 0.44;
    const py = Math.sin(a) * R * 0.44;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = CASE;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.restore();

  // The glow last and outside the housing, so the corner of the screen lifts
  // with the pulse. `halo` rather than `shadowBlur`, for `glow.ts`'s reason.
  halo(ctx, cx, cy, R * 2.4, ringHex, 0.16 + 0.2 * pulse);
}
