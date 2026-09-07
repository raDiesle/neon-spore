import {
  beamTicks,
  type Color,
  type LanceBeam,
  lanceReady,
  primeChargeMilli,
  primeColor,
  priming,
  type World,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import { signedHash } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE LANCE, drawn: the beam gathering in the cannon's column while a thumb
 * rests on a colour, and the beam standing in it afterwards.
 *
 * The fill is the same number twice — `primeChargeMilli` from the simulation,
 * never a second clock kept here. A charge counted in render/ would run on the
 * frame rate, so one device would think the lobe was full a frame before the
 * other, and this is the one row of the information split that both players
 * read (docs/spec/systems.md 5.2). The beam afterwards follows the same rule
 * for the same reason: `world.beam` carries its own countdown.
 *
 * **This beam is the weapon.** It used to be a fill and nothing more — a
 * wind-up for a bolt that then travelled up the column — and the owner watched
 * it and said the beam itself is what destroys. So at the top of the fill the
 * column burns and the beam **stays where it is** for `lanceBeamBeats`, ending
 * at whatever stopped it. Nothing leaves the ship, which is the field's own
 * rule kept rather than bent: nothing the players control travels.
 *
 * **It used to be two brackets climbing the column and a white thread at the
 * top**, and the owner replaced that in one sentence: *improve the bar
 * indicator to show a small beam like in independence day, which grows bigger
 * and bigger, in white mixed with colour of cannon*.
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
export function lanceFillFor(world: World, color: Color): number {
  return primeColor(world) === color ? charge(world) : 0;
}

/**
 * The beam in the column, in whichever of its two states it is in.
 *
 * Drawn under the creatures, because it is on the column rather than on
 * anything standing in it. The cannon fires up a column and marking was
 * re-grounded onto exactly that (docs/spec/couplings.md 2) — a beam that bent
 * onto a body would promise the lance follows it, and it does not; it goes
 * straight up, through whatever is standing there when it lights.
 */
export function drawLanceMark(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  const beam = world.beam;
  if (beam !== null) {
    drawBurning(ctx, l, world, beam);
    return;
  }
  if (!priming(world)) return;
  const color = primeColor(world);
  if (color === null) return;
  drawFilling(ctx, l, world, color);
}

/**
 * Gathering: a shaft that grows out of the muzzle as the lobe fills and stands
 * the whole height of the field the tick it is full.
 */
function drawFilling(ctx: CanvasRenderingContext2D, l: Layout, world: World, color: Color): void {
  const t = charge(world);
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
  shaft(ctx, l, world, {
    color,
    x: tileCX(l, world.cannonCol),
    foot,
    head,
    width: l.tile * (0.035 + 0.34 * t * t * t),
    load: t,
    alpha: 1,
  });
  if (lanceReady(world))
    whiteOut(ctx, l, tileCX(l, world.cannonCol), l.gridTop, foot, l.tile * 0.4);
}

/**
 * Burning: the same shaft at its widest, standing where it reached, counting
 * itself out.
 *
 * It holds at full for the first half of its life and falls away over the
 * second, so the beat the owner asked for is a beat of *weapon* rather than a
 * beat of fade. The column it ends at is `beam.topMilli` — whatever stopped
 * it — so a beam a rock blocked visibly stops at that rock instead of
 * pretending to have gone through it.
 */
function drawBurning(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beam: LanceBeam,
): void {
  const span = beamTicks(world.cfg);
  const left = span <= 0 ? 0 : beam.left / span;
  const alpha = Math.min(1, left * 2);
  const x = tileCX(l, beam.col);
  const foot = l.hullY;
  const head = beam.topMilli <= 0 ? l.gridTop : tileCY(l, beam.topMilli / 1000);
  shaft(ctx, l, world, {
    color: beam.color,
    x,
    foot,
    head,
    width: l.tile * 0.42,
    load: 1,
    alpha,
  });
  // A white *core* rather than a white column: at the shaft's own width the
  // whole beam goes to paper and the ammunition colour — the one thing on it
  // that says which lobe was held — is left as a rim nobody reads.
  whiteOut(ctx, l, x, head, foot, l.tile * 0.13 * alpha);
}

interface Shaft {
  color: Color;
  x: number;
  /** Screen y at the muzzle, and at the far end. */
  foot: number;
  head: number;
  /** Half the width of the solid part. */
  width: number;
  /** 0..1 — how far along it is, which is what the light is keyed off. */
  load: number;
  alpha: number;
}

/**
 * One shaft of light, in the ammunition's colour with white at its core.
 *
 * Both states draw through it, so a beam that has just burnt a column is
 * visibly the same object as the fill that made it rather than a second
 * picture that happens to stand in the same place.
 */
function shaft(ctx: CanvasRenderingContext2D, l: Layout, world: World, s: Shaft): void {
  const { color, x, foot, head, width: w, load: t, alpha } = s;
  const hex = color === "red" ? PALETTE.red : PALETTE.cyan;
  const core = mixHex(hex, "#FFFFFF", 0.45 + 0.55 * t);

  const prev = ctx.globalCompositeOperation;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;

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
  halo(ctx, x, foot, l.tile * (0.3 + 1.5 * t), hex, (0.25 + 0.45 * t) * alpha);
  if (t > 0.15) halo(ctx, x, head, l.tile * (0.2 + 0.9 * t), core, (0.3 + 0.4 * t) * alpha);

  ctx.restore();
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}

/** The column gone to paper white: the tick it comes full, and the whole time
 * it is burning. Nothing on the field survives being inside this. */
function whiteOut(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  head: number,
  foot: number,
  w: number,
): void {
  if (w <= 0) return;
  const prev = ctx.globalCompositeOperation;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rgba("#FFFFFF", 0.5);
  ctx.fillRect(x - w, head, w * 2, foot - head);
  halo(ctx, x, (head + foot) / 2, l.tile * 3, "#FFFFFF", 0.4);
  ctx.restore();
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}
