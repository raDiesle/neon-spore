import { drawBolt } from "../../../../../packages/render/src/bolt.js";
import type { ChargeDraw, StudDraw } from "../../../../../packages/render/src/coil-look.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { signedHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * PRONGS — the dome has terminals, and the charge sprays off them.
 *
 * **The studs.** Three prongs standing off the rim rather than three discs
 * sitting on it: each a short tapered spike from the shell outward with a
 * bead on its tip, drawn with a lit edge on its key side and a dark one on
 * the other so it is a thing with two faces rather than a line. Those are
 * what a charge leaves by and lands on, and while a charge is on its way the
 * tips flare and a crackle runs from prong to prong round the rim — the
 * dome is *holding* something, and the something is about to get out. That
 * is the readout the pilot has three beats to call, said by the dome itself
 * rather than only by the bolt approaching it.
 *
 * **The charge.** The shipped bolts, with a spray at the head: three short
 * sparks fanning off the tip, redrawn a few times a second, so the leading
 * end reads as a discharge searching for something to land on rather than a
 * glow on the end of a line.
 *
 * **How it can lose.** *Three spikes on a bubble are a mine.* If at 26 px the
 * prongs read as a spiked ball — a thing that hurts to touch — the dome has
 * stopped saying *a rock inside a shell* and started saying a different
 * creature. Judge it uncharged first, on a dome nobody is doing anything to.
 */

const PRONGS = 3;
/** How far the prong reaches past the rim, and how wide its base is, both as
 * shares of a tile. */
const REACH = 0.24;
const BASE = 0.12;
/** The bead on the tip, as a share of a tile, before the charge swells it. */
const TIP = 0.05;
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";
/** How much of a prong's away face the shadow takes. */
const SHADE = 0.55;
/** Sparks off a charged tip: how many, how far they reach in tiles, and how
 * many times a second they are redrawn. */
const CRACKLE = 2;
const CRACKLE_REACH = 0.3;
const CRACKLE_HZ = 10;
/** Sparks off the bolt's head, and how far each reaches, in tiles. */
const SPRAY = 3;
const SPRAY_REACH = 0.45;

export function prongs(d: StudDraw): void {
  const { ctx, x, y, r, tile, spin, charge, time, rim, hot } = d;
  const paint = charge > 0 ? hot : rim;
  const reach = tile * REACH;
  const base = tile * BASE;
  const tips: { x: number; y: number }[] = [];
  ctx.save();
  for (let k = 0; k < PRONGS; k++) {
    const a = spin + (k * Math.PI * 2) / PRONGS;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const rx = x + ca * r;
    const ry = y + sa * r;
    const tx = x + ca * (r + reach);
    const ty = y + sa * (r + reach);
    tips.push({ x: tx, y: ty });
    // Across the prong: the two base corners either side of its axis.
    const px = -sa * base;
    const py = ca * base;
    // The whole prong in the rim's own colour, then its away face shaded
    // over: the face whose outward normal `(-sa, ca)` leans toward the key at
    // `(-1, -1)` is the lit one, and the other takes the shadow.
    ctx.globalAlpha = 0.8 + 0.2 * charge;
    ctx.fillStyle = paint;
    ctx.beginPath();
    ctx.moveTo(rx + px, ry + py);
    ctx.lineTo(tx, ty);
    ctx.lineTo(rx - px, ry - py);
    ctx.closePath();
    ctx.fill();
    const sign = sa - ca > 0 ? -1 : 1;
    ctx.fillStyle = rgba(SHADOW, SHADE);
    ctx.beginPath();
    ctx.moveTo(rx + sign * px, ry + sign * py);
    ctx.lineTo(tx, ty);
    ctx.lineTo(rx, ry);
    ctx.closePath();
    ctx.fill();
    // The bead on the tip.
    ctx.fillStyle = paint;
    ctx.beginPath();
    ctx.arc(tx, ty, tile * (TIP + 0.04 * charge), 0, Math.PI * 2);
    ctx.fill();
    if (charge > 0) halo(ctx, tx, ty, tile * TIP * 4, hot, 0.45 * charge);
  }
  ctx.restore();

  // The crackle: while a charge is on its way, short sparks leap off every
  // tip, redrawn a few times a second — the dome saying *about to fail*.
  if (charge <= 0) return;
  const frame = Math.floor(time * CRACKLE_HZ);
  for (let k = 0; k < PRONGS; k++) {
    const tip = tips[k]!;
    for (let s = 0; s < CRACKLE; s++) {
      const seed = frame * 17 + k * 101 + s * 31;
      const a = signedHash(seed) * Math.PI;
      const len = tile * CRACKLE_REACH * (0.4 + 0.6 * Math.abs(signedHash(seed + 1)));
      drawBolt(
        ctx,
        tip.x,
        tip.y,
        tip.x + Math.cos(a) * len,
        tip.y + Math.sin(a) * len,
        tile * 0.4,
        seed,
        0.9 * charge,
        1,
      );
    }
  }
}
export function spray(d: ChargeDraw): void {
  const { ctx, from, to, t, age, tile, id } = d;
  const x1 = from.x + (to.x - from.x) * t;
  const y1 = from.y + (to.y - from.y) * t;
  const frame = Math.floor(age * 60) * 23 + id;
  for (let k = 0; k < 2; k++) {
    const seed = k * 211 + frame;
    drawBolt(ctx, from.x, from.y, x1, y1, tile, seed, k === 0 ? 0.9 : 0.55, 1.4);
  }
  // The spray: short sparks fanning off the head, forward of it.
  const ahead = Math.atan2(to.y - from.y, to.x - from.x);
  for (let k = 0; k < SPRAY; k++) {
    const seed = frame * 7 + k * 53;
    const a = ahead + signedHash(seed) * 1.1;
    const len = tile * SPRAY_REACH * (0.5 + 0.5 * Math.abs(signedHash(seed + 1)));
    drawBolt(ctx, x1, y1, x1 + Math.cos(a) * len, y1 + Math.sin(a) * len, tile * 0.4, seed, 0.7, 1);
  }
  halo(ctx, x1, y1, tile * (0.5 + 0.9 * t), PALETTE.shieldRim, 0.3 + 0.45 * t);
}
