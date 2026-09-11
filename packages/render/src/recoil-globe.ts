import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { CageDraw } from "./recoil-look.js";

/**
 * GLOBE — THE RECOIL's cage as the game draws it since 11 September 2026,
 * when the owner decided `creature:recoil` with "apply to game
 * CREATURE:RECOIL · GLOBE". Written as a VERSUS candidate against `springs`
 * (`recoil-look.ts`, kept for the LIBRARY) and moved here whole;
 * `RECOIL_LOOK` points at it.
 *
 * GLOBE — the cage is a wire ball round the body, and it turns.
 *
 * Each rib is a meridian of a sphere the hoop's size — the whole great circle
 * through both poles, pinned at its own longitude and at the one opposite,
 * and projected by `facet` — so it is a full ellipse: its near half over the
 * body, thick and lit, its far half thin and dim behind it. The hoop is the equator, tilted so its front dips below the
 * middle. The whole ball turns slowly about the vertical, and that turn is
 * the picture: a meridian at the limb is a line, swings out into a curve as
 * it comes round the front, and closes to a line again on the other side —
 * the reveal no pose can produce. A spent rib is a broken meridian, two
 * scorched stubs off the poles with nothing between, and it goes round with
 * the rest so the pair can watch the hole in the cage turn past.
 *
 * The count is unchanged: whole meridians are bounces left, broken ones are
 * bounces spent, and they are read from the top going round as they always
 * were — the turn moves where a rib is, never which rib it is.
 */

/** One turn of the ball. Slow enough that a cage on a body dropping a lane a
 * beat still reads as a frame and not as a wheel. */
const TURN_SECONDS = 9;
/** How far the equator's plane is tilted toward the viewer, as the share of
 * the radius its front dips below the middle. */
const TILT = 0.32;
/** Points along one meridian from pole to pole; a whole circle is twice
 * that, down one longitude and back up the opposite one. */
const STEPS = 18;
/** How far the equator's ring stands off the poles' ball — the hoop is a
 * hair outside the meridians so it reads as the band holding them. */
const RING = 1.04;
/** What far wire keeps of its colour, and how thick it is against the near. */
const FAR_FLOOR = 0.3;
const FAR_WIDTH = 0.5;
/** A broken meridian's stub, as a share of the way from a pole to the
 * equator. */
const STUB = 0.35;
const SHADOW = "#0B1024";

/**
 * A meridian's pins, pole to pole, laid once per rib count and kept: `pin`
 * is constant for a rib, and a cage of three ribs asks for it every frame.
 */
const meridians = new Map<number, Pin[][]>();
function meridianPins(struts: number): Pin[][] {
  const have = meridians.get(struts);
  if (have) return have;
  const out: Pin[][] = [];
  for (let i = 0; i < struts; i++) {
    const lon = (i / struts) * Math.PI;
    const pins: Pin[] = [];
    // Down the front longitude, then back up the opposite one: one closed
    // loop, poles at the start, the middle and the end.
    for (let k = 0; k <= STEPS; k++) {
      const lat = -Math.PI / 2 + (k / STEPS) * Math.PI;
      pins.push(pin(lon, lat, 1));
    }
    for (let k = STEPS - 1; k > 0; k--) {
      const lat = -Math.PI / 2 + (k / STEPS) * Math.PI;
      pins.push(pin(lon + Math.PI, lat, 1));
    }
    out.push(pins);
  }
  meridians.set(struts, out);
  return out;
}

/** One run of a meridian's points as a path, in field pixels. */
function run(x: number, y: number, r: number, pts: { x: number; y: number }[]): Path2D {
  const p = new Path2D();
  pts.forEach((q, i) => {
    if (i === 0) p.moveTo(x + q.x * r, y + q.y * r);
    else p.lineTo(x + q.x * r, y + q.y * r);
  });
  return p;
}

/**
 * One half of one meridian — the near or the far — drawn as the runs of
 * points on that side: one run for a whole rib, two stubs for a broken one.
 */
function meridian(
  d: CageDraw,
  pins: Pin[],
  theta: number,
  spent: boolean,
  hex: string,
  glow: number,
  near: boolean,
): void {
  const { ctx, x, y, hoop: r } = d;
  const width = Math.max(0.8, r * (spent ? 0.06 : 0.09));
  const runs: { x: number; y: number }[][] = [[]];
  let litSum = 0;
  let litN = 0;
  pins.forEach((p, k) => {
    const f = facet(p, theta);
    // A stub keeps only what stands near a pole; the rest is the gap.
    const u = k / (2 * STEPS);
    const toPole = Math.min(u, Math.abs(u - 0.5), 1 - u);
    const kept = !spent || toPole < STUB / 4;
    if (f.near === near && kept) {
      runs[runs.length - 1]!.push({ x: f.x, y: f.y });
      litSum += f.lit;
      litN++;
    } else if (runs[runs.length - 1]!.length > 0) runs.push([]);
  });
  const lit = litN > 0 ? litSum / litN : 0;
  const shade = surfaceDim(near ? 0.55 : FAR_FLOOR, lit);
  const colour = mixHex(mixHex(SHADOW, d.dark, 0.6), hex, shade);
  ctx.globalAlpha = spent ? 0.7 : 1;
  for (const pts of runs) {
    if (pts.length < 2) continue;
    const path = run(x, y, r, pts);
    if (near) strokeGlow(ctx, path, colour, width, glow * (0.5 + 0.5 * lit));
    else {
      ctx.strokeStyle = colour;
      ctx.lineWidth = width * FAR_WIDTH;
      ctx.stroke(path);
    }
  }
  ctx.globalAlpha = 1;
}

/** The equator, tilted, is drawn whole because the hoop is the band and not
 * the count: its back half thin behind the near meridians... */
function equatorBack(d: CageDraw, hex: string): void {
  const { ctx, x, y, hoop: r } = d;
  const back = new Path2D();
  back.ellipse(x, y, r * RING, r * RING * TILT, 0, Math.PI, Math.PI * 2);
  ctx.strokeStyle = mixHex(mixHex(SHADOW, d.dark, 0.6), hex, FAR_FLOOR);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.stroke(back);
}

/** ...and its front half lit over them. */
function equatorFront(d: CageDraw, hex: string, glow: number): void {
  const { ctx, x, y, hoop: r } = d;
  const front = new Path2D();
  front.ellipse(x, y, r * RING, r * RING * TILT, 0, 0, Math.PI);
  strokeGlow(ctx, front, hex, Math.max(1, r * 0.1), glow);
}

/** The two poles, where every meridian meets: a bolt each. */
function poles(d: CageDraw, hex: string): void {
  const { ctx, x, y, hoop: r } = d;
  const br = Math.max(1.2, r * 0.1);
  for (const s of [-1, 1]) {
    ctx.fillStyle = d.dark;
    ctx.strokeStyle = hex;
    ctx.lineWidth = Math.max(0.6, br * 0.4);
    ctx.beginPath();
    ctx.arc(x, y + s * r, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

/** The ball, back to front: every far half, the equator's back, every near
 * half, the equator's front, and the poles. */
export function globe(d: CageDraw): void {
  const { ctx, struts, left, metal, burnt, glow, time, phase } = d;
  const theta = (time * Math.PI * 2) / TURN_SECONDS + phase;
  const pins = meridianPins(struts);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const near of [false, true]) {
    for (let i = 0; i < struts; i++) {
      const spent = i >= left;
      const hex = spent ? burnt : metal;
      meridian(d, pins[i]!, theta, spent, hex, spent ? glow * 0.25 : glow, near);
    }
    if (!near) equatorBack(d, metal);
  }
  equatorFront(d, metal, glow);
  poles(d, metal);
  ctx.restore();
}
