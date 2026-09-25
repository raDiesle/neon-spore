import type { Point } from "@neon-spore/content";
import type { Color } from "@neon-spore/sim";
import { cannonRoute } from "./gland-cord.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { NerveDraw } from "./ship-nerves.js";

/**
 * A SHOT, RUNNING FROM THE THUMB TO THE CANNON.
 *
 * The owner, 25 September 2026: *some flash from the button in the moment when
 * pressed and then a fast pulse across the vein connecting to the cannon in the
 * colour of the shot, which then releases top of cannon.* Three beats, one
 * after the other, in the ammunition's own colour:
 *
 * 1. **the flash** — the button that was pressed goes white-hot and throws a
 *    ring off its rim;
 * 2. **the pulse** — a bright head with a lit tail runs the cord from that
 *    button, through the cannon's knob on a screen that draws the strip, to
 *    the organ, quickening as it goes (`gland-cord.ts`'s `cannonRoute`);
 * 3. **the release** — where it arrives, at the top of the cannon, a burst and
 *    a spurt upwards, on top of the burn `lay-echo.ts` already gives the body.
 *
 * **It is hung on `fire`, the tick the shot leaves**, not on the press. With
 * `shotChargeBeats` at 0 — every shipped wave — those are the same tick; on a
 * wave with a wind-up the colour is player 2's to say until the shot has gone
 * (`cannon-maw.ts`), and player 1's knob-to-organ cord carries this pulse too.
 *
 * Seconds rather than beats, unlike `LayEcho`: the owner asked for it *fast*,
 * and a pulse that slowed with a slow wave would stop reading as the press
 * causing the shot. Render-only and outliving a frame, so it lives in
 * `Effects` and is cleared in `Effects.reset()`.
 */

/** How long the button burns, from the press. */
const FLASH = 0.28;
/** The pulse leaves a moment into the flash, and takes this long to arrive. */
const SET_OFF = 0.03;
const TRAVEL = 0.13;
/** How long the release at the top of the cannon lasts, once it has. */
const RELEASE = 0.32;
/** Everything is over by then. */
const LIFE = SET_OFF + TRAVEL + RELEASE;
/** The lit share of the route behind the head. */
const TAIL = 0.35;

/** One shot on its way, as the draw pass reads it. */
export interface FireShot {
  readonly color: Color;
  /** Seconds since it left. */
  readonly age: number;
}

/** Every shot still showing, oldest first. Two can overlap at the fastest rate of fire. */
export class FireVein {
  private live: { color: Color; age: number }[] = [];

  get shots(): readonly FireShot[] {
    return this.live;
  }

  start(color: Color): void {
    this.live.push({ color, age: 0 });
  }

  update(dt: number): void {
    for (const s of this.live) s.age += dt;
    this.live = this.live.filter((s) => s.age < LIFE);
  }

  clear(): void {
    this.live = [];
  }
}

function hue(c: Color): string {
  return c === "red" ? PALETTE.red : PALETTE.cyan;
}

function rim(c: Color): string {
  return c === "red" ? PALETTE.redRim : PALETTE.cyanRim;
}

function buttonOf(c: Color): string {
  return c === "red" ? "fireRed" : "fireCyan";
}

/** A point a share `u` of the way along a polyline, by length. */
function along(pts: readonly Point[], u: number): Point {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1] as Point, pts[i] as Point);
  let want = Math.max(0, Math.min(1, u)) * total;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1] as Point;
    const b = pts[i] as Point;
    const d = dist(a, b);
    if (want <= d && d > 0)
      return { x: a.x + ((b.x - a.x) * want) / d, y: a.y + ((b.y - a.y) * want) / d };
    want -= d;
  }
  return pts[pts.length - 1] as Point;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** The route with the top of the cannon on the end, where the shot leaves. */
function routeFor(d: NerveDraw, c: Color): Point[] {
  const pts = cannonRoute(d, buttonOf(c));
  if (pts.length > 0 && d.surfaceY) pts.push({ x: d.cannonX, y: d.surfaceY(d.cannonX) });
  return pts;
}

/**
 * The pulse on the cord. Drawn with the cords, before the buttons, so the head
 * comes out from under the button that sent it.
 */
export function drawFireVein(d: NerveDraw, shots: readonly FireShot[]): void {
  const { ctx, l } = d;
  for (const s of shots) {
    const t = (s.age - SET_OFF) / TRAVEL;
    if (t <= 0 || t >= 1 + TAIL) continue;
    const pts = routeFor(d, s.color);
    if (pts.length < 2) continue;
    // Quickening: slow off the button, fast into the cannon.
    const head = Math.min(1, t) ** 1.6;
    const tail = Math.max(0, head - TAIL * (t > 1 ? 1 - (t - 1) / TAIL : 1));
    const fade = t > 1 ? 1 - (t - 1) / TAIL : 1;
    // One path from the end of the tail to the head, stroked twice under one
    // gradient — a glow and a hot core. Short segments each with their own
    // alpha read as a string of beads, which is the cords' own look and not
    // a pulse.
    const path = new Path2D();
    const steps = 12;
    for (let k = 0; k <= steps; k++) {
      const p = along(pts, tail + ((head - tail) * k) / steps);
      if (k === 0) path.moveTo(p.x, p.y);
      else path.lineTo(p.x, p.y);
    }
    const a = along(pts, tail);
    const b = along(pts, head);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const [color, width, alpha] of [
      [hue(s.color), 0.28, 0.45],
      [rim(s.color), 0.08, 0.95],
    ] as const) {
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, rgba(color, 0));
      grad.addColorStop(1, rgba(color, alpha * fade));
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1.2, l.tile * width);
      ctx.stroke(path);
    }
    if (t < 1) {
      const at = along(pts, head);
      halo(ctx, at.x, at.y, Math.round(l.tile * 0.45), hue(s.color), 0.9);
      ctx.fillStyle = rim(s.color);
      ctx.beginPath();
      ctx.arc(at.x, at.y, l.tile * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * The flash on the button and the release at the top of the cannon. Drawn
 * after the buttons, over the one that was pressed.
 */
export function drawFireFlash(d: NerveDraw, shots: readonly FireShot[]): void {
  for (const s of shots) {
    const lobe = d.lobes.find((b) => b.control.id === buttonOf(s.color));
    if (lobe && s.age < FLASH) buttonFlash(d, lobe.circle, s.color, s.age / FLASH);
    const r = (s.age - SET_OFF - TRAVEL) / RELEASE;
    if (r >= 0 && r < 1 && d.surfaceY && routeFor(d, s.color).length > 0) {
      release(d, { x: d.cannonX, y: d.surfaceY(d.cannonX) }, s.color, r);
    }
  }
}

function buttonFlash(
  d: NerveDraw,
  c: { x: number; y: number; r: number },
  color: Color,
  u: number,
): void {
  const { ctx } = d;
  const fall = (1 - u) ** 2;
  halo(ctx, c.x, c.y, Math.round(c.r * (1.6 + 0.6 * u)), hue(color), 0.85 * fall);
  ctx.fillStyle = rgba(rim(color), 0.55 * fall);
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r * 0.92, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(hue(color), 0.9 * (1 - u));
  ctx.lineWidth = Math.max(1.5, c.r * 0.14 * (1 - u));
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r * (1 + 0.7 * Math.sqrt(u)), 0, Math.PI * 2);
  ctx.stroke();
}

function release(d: NerveDraw, tip: Point, color: Color, u: number): void {
  const { ctx, l } = d;
  const fall = (1 - u) ** 1.5;
  halo(ctx, tip.x, tip.y, Math.round(l.tile * (0.9 + 0.8 * u)), hue(color), 0.95 * fall);
  ctx.strokeStyle = rgba(rim(color), 0.9 * fall);
  ctx.lineWidth = Math.max(1.2, l.tile * 0.08 * (1 - u));
  ctx.beginPath();
  ctx.ellipse(
    tip.x,
    tip.y,
    l.tile * (0.25 + 0.75 * u),
    l.tile * (0.1 + 0.3 * u),
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  // The spurt: a short streak up out of the top, thinning as it goes.
  const len = l.tile * (0.6 + 1.8 * Math.sqrt(u));
  const grad = ctx.createLinearGradient(tip.x, tip.y, tip.x, tip.y - len);
  grad.addColorStop(0, rgba(rim(color), 0.95 * fall));
  grad.addColorStop(1, rgba(hue(color), 0));
  ctx.strokeStyle = grad;
  ctx.lineWidth = Math.max(1.2, l.tile * 0.18 * (1 - u));
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(tip.x, tip.y - len);
  ctx.stroke();
}
