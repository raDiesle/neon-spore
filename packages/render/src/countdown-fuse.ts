import { countdownIsOpen, countdownMarks } from "@neon-spore/sim";
import { hash01 } from "./backdrop.js";
import { countDisc } from "./countdown.js";
import type { Body } from "./creature-body-in.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";

/**
 * FUSE — a kept look for THE COUNT, drawn only on the SHAPES page's
 * LIBRARY.
 *
 * It stood in `creature:countdown` on VERSUS, decided 12 September 2026:
 * IRIS went into the game (`countdown-iris.ts`) and the owner asked for the
 * other candidates to go to the SHAPES page, for other timing enemies. It
 * sits in this package, beside the record it once patched, because it is
 * written against this package's internals; nothing on the field imports
 * it, and the game's bundle drops it.
 *
 * FUSE — a cord coiled once round the body just outside its rim, lit at the
 * far end and burning back toward a cap at twelve; what is left of the cord
 * is the count. On zero the cord is gone and the body is lit.
 *
 * The shipped count is cut into the body. This hangs it *on* the body, where
 * it can move: the burning end crawls round the rim through every beat with
 * a spark on it, embers come off it, and the length left is the count — a
 * quarter turn a beat. It is the one picture everybody already knows for
 * "you have this long", and it says *hurry* by itself.
 *
 * `fuseOver` is on both screens and never moves: the cap the cord runs into.
 * The navigator sees a disc with a nub at twelve.
 */

/** The cord's radius as a share of the body's, and the cap's. */
const LOOP = 1.3;
const CAP = 0.17;
const TAU = Math.PI * 2;
const TOP = -Math.PI / 2;
const SPARK = "#fff0b8";
const ASH = "#8d8497";

export function fuseOver(b: Body): void {
  const { ctx, world, near } = b;
  const { cx, cy, r, trio } = countDisc(b);
  const y = cy - r * 1.04;
  ctx.fillStyle = rgba(trio.dark, 0.98);
  ctx.strokeStyle = hazed(world.cfg, trio.rim, near);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.beginPath();
  ctx.arc(cx, y, r * CAP, 0, TAU);
  ctx.fill();
  ctx.stroke();
}

export function fuseCount(b: Body): void {
  const { ctx, world, c, near, beatPhase, time } = b;
  const cfg = world.cfg;
  const { cx, cy, r, trio } = countDisc(b);
  if (countdownIsOpen(cfg, world.beat, c)) {
    // Zero: no cord left, and the body lit the shipped way — the cap too.
    halo(ctx, cx, cy, Math.round(r * 2.6), trio.hex, 0.55);
    ctx.strokeStyle = hazed(cfg, trio.rim, near);
    ctx.lineWidth = Math.max(1.5, r * 0.1);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.04, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = rgba(trio.rim, 0.9);
    ctx.beginPath();
    ctx.arc(cx, cy - r * 1.04, r * CAP, 0, TAU);
    ctx.fill();
    return;
  }
  const slots = Math.max(1, cfg.countdownBeats);
  const marks = countdownMarks(cfg, world.beat, c);
  const loop = r * LOOP;
  // The cord ran a full turn clockwise from the cap; the far end is what was
  // lit, so what is left is the arc from the cap to the burning end, and the
  // end comes round toward the cap through every beat.
  const left = Math.max(0, marks - beatPhase) / slots;
  const end = TOP + left * TAU;
  ctx.lineCap = "round";
  // The ash where the cord was: a ghost of the loop, so the whole turn reads.
  ctx.strokeStyle = rgba(ASH, 0.22);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.beginPath();
  ctx.arc(cx, cy, loop, end, TOP + TAU);
  ctx.stroke();
  // The cord: a dark braid with a lighter core down it.
  ctx.strokeStyle = rgba(trio.dark, 0.95);
  ctx.lineWidth = Math.max(1.6, r * 0.15);
  ctx.beginPath();
  ctx.arc(cx, cy, loop, TOP, end);
  ctx.stroke();
  ctx.strokeStyle = rgba(trio.hex, 0.85);
  ctx.lineWidth = Math.max(0.7, r * 0.06);
  ctx.beginPath();
  ctx.arc(cx, cy, loop, TOP, end);
  ctx.stroke();
  // The spark on the burning end, jittering, and three embers off it.
  const ex = cx + Math.cos(end) * loop;
  const ey = cy + Math.sin(end) * loop;
  const frame = Math.floor(time * 24);
  halo(ctx, ex, ey, Math.round(r * 0.9), SPARK, 0.8);
  ctx.fillStyle = SPARK;
  ctx.beginPath();
  ctx.arc(ex, ey, Math.max(1.2, r * 0.13) * (0.8 + 0.4 * hash01(frame)), 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(SPARK, 0.7);
  ctx.beginPath();
  for (let k = 0; k < 3; k++) {
    const a = hash01(frame * 3 + k) * TAU;
    const d = r * (0.2 + 0.5 * hash01(frame * 7 + k + 11));
    const px = ex + Math.cos(a) * d;
    const py = ey + Math.sin(a) * d;
    ctx.moveTo(px, py);
    ctx.arc(px, py, Math.max(0.6, r * 0.045), 0, TAU);
  }
  ctx.fill();
}
