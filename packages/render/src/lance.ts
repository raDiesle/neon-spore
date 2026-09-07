import { lanceReady, primeChargeMilli, primeColor, priming, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { signedHash } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE LANCE, drawn: the beam gathering in the column while a thumb rests on a
 * colour.
 *
 * It is the same number twice — `primeChargeMilli` from the simulation, never
 * a second clock kept here. A charge counted in render/ would run on the frame
 * rate, so one device would think the lobe was full a frame before the other,
 * and this mark is the one row of the information split that both players read
 * (docs/spec/systems.md 5.2).
 *
 * **It used to be two brackets climbing the column and a white thread at the
 * top**, and the owner replaced it in one sentence: *improve the bar indicator
 * to show a small beam like in independence day, which grows bigger and
 * bigger, in white mixed with colour of cannon*. So it is a beam now — a
 * shaft standing in the cannon's column that starts as a thread and ends as a
 * column of light wide enough to read from the other side of the room, white
 * at the core and the ammunition's colour at its edges.
 *
 * **The colour is not a leak.** Player 1 has no fire buttons and is not
 * supposed to be told which ammunition is loaded before it leaves — that is
 * the whole of the wind-up's discipline (`cannon-maw.ts`). This is the
 * exception the owner asked for, and it is a fair one: three beats of holding
 * is not a shot being slipped past anybody, it is an announcement, and the two
 * of them are talking about the column for all three of those beats.
 *
 * Nothing in this file outlives a frame, so there is nothing for
 * `Effects.reset()` to clear.
 */

/** 0..1 of the way to a lance. */
function charge(world: World): number {
  return primeChargeMilli(world) / 1000;
}

/**
 * How full the lobe under this colour is, 0..1 — the fill drawn round the
 * button itself (`band-control.ts`).
 *
 * Nought for the other colour, and that is the whole reason it takes one:
 * player 2 has two lobes and only one of them is being held, so a fill that
 * did not ask which would close round both.
 */
export function lanceFillFor(world: World, color: "red" | "cyan"): number {
  return primeColor(world) === color ? charge(world) : 0;
}

/**
 * The beam in the column: a shaft of light that grows out of the muzzle as the
 * lobe fills and stands the whole height of the field when it is full.
 *
 * Drawn under the creatures, because it is on the column rather than on
 * anything standing in it. The cannon fires up a column and marking was
 * re-grounded onto exactly that (docs/spec/couplings.md 2) — a mark that sat
 * on a body would promise the lance follows it, and it does not; it goes
 * straight up, through whatever is standing there when it arrives.
 */
export function drawLanceMark(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  if (!priming(world)) return;
  const color = primeColor(world);
  if (color === null) return;
  const t = charge(world);
  const full = lanceReady(world);
  const hex = color === "red" ? PALETTE.red : PALETTE.cyan;
  const x = tileCX(l, world.cannonCol);
  const foot = l.hullY;
  // It climbs as it fills, and reaches the top of the field on the tick the
  // lobe comes full — so the fill is legible as *distance* and not only as
  // brightness, which is what the two brackets were for and the one thing
  // worth keeping from them.
  const head = foot - (foot - l.gridTop) * Math.min(1, t * 1.06);
  // And it widens, which is the half the owner asked for: a thread at the
  // press, most of a column at the top. Cubed, so almost all of the growth
  // happens in the last beat and the beam reads as something being forced
  // rather than as something sliding open.
  const w = l.tile * (0.035 + 0.34 * t * t * t);

  const prev = ctx.globalCompositeOperation;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // The outer sheath, in the ammunition's own colour and softest at the head.
  const sheath = ctx.createLinearGradient(0, foot, 0, head);
  sheath.addColorStop(0, rgba(hex, 0.16 + 0.5 * t));
  sheath.addColorStop(1, rgba(hex, 0));
  ctx.fillStyle = sheath;
  ctx.fillRect(x - w * 2.1, head, w * 4.2, foot - head);

  // The body of it, and then the white core inside that: white mixed with the
  // colour, more white the fuller it gets, which is what light this bright
  // actually does to a camera.
  ctx.fillStyle = rgba(hex, 0.4 + 0.45 * t);
  ctx.fillRect(x - w, head, w * 2, foot - head);
  const core = mixHex(hex, "#FFFFFF", 0.45 + 0.55 * t);
  ctx.fillStyle = rgba(core, 0.5 + 0.5 * t);
  ctx.fillRect(x - w * 0.34, head, w * 0.68, foot - head);

  // A crackle down one edge, so the shaft is not a rectangle. Seeded on the
  // tick, so it shivers at the simulation's rate on both devices at once and
  // no clock of the renderer's own is involved.
  ctx.strokeStyle = rgba(core, 0.35 + 0.4 * t);
  ctx.lineWidth = Math.max(1, w * 0.5);
  ctx.beginPath();
  ctx.moveTo(x, foot);
  const steps = 7;
  for (let i = 1; i <= steps; i++) {
    const f = i / steps;
    const wander = signedHash(world.tick * 0.31 + i * 5.9) * w * 1.5 * Math.sin(f * Math.PI);
    ctx.lineTo(x + wander, foot + (head - foot) * f);
  }
  ctx.stroke();

  // Light gathering at the muzzle, and at the head of the beam once it has
  // somewhere to gather.
  halo(ctx, x, foot, l.tile * (0.3 + 1.5 * t), hex, 0.25 + 0.45 * t);
  if (t > 0.15) halo(ctx, x, head, l.tile * (0.2 + 0.9 * t), core, 0.3 + 0.4 * t);
  if (full) {
    // The tick before it goes: the whole column white.
    ctx.fillStyle = rgba("#FFFFFF", 0.5);
    ctx.fillRect(x - w * 1.3, l.gridTop, w * 2.6, foot - l.gridTop);
    halo(ctx, x, tileCY(l, l.rows / 2), l.tile * 3, "#FFFFFF", 0.4);
  }

  ctx.restore();
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}
