import { halo } from "../../../../packages/render/src/glow.js";
import type { Layout } from "../../../../packages/render/src/layout.js";
import { PALETTE } from "../../../../packages/render/src/palette.js";
import { POD_TILES } from "../../../../packages/render/src/pods.js";
import { drawSkin, drawSpike, ringOn, type SkinKind, type SpikeKind } from "./seed-parts.js";

/**
 * **The tumbling seed every `pod:real` candidate is** — SMART's body, kept in
 * one place so its family cannot drift from it.
 *
 * The owner chose SMART as the basis on 16 October 2026 and asked for
 * variants a player would always know as SMART, with a pickup's tell on top.
 * So each candidate is this sphere — THE SMART's seven studs on a round body,
 * tumbling about a tilted axis, a seam round its middle — and only what it
 * adds differs: a flash, a glint, a hop, an orbit. `smart/` draws it bare.
 *
 * `seedAt` is the shape at a moment and `drawSeed` paints it; a candidate
 * that needs to draw between the back studs and the body, or over the front
 * ones, takes the two halves (`drawBack`, `drawFront`) instead.
 */

/** Beats left at which the seed wakes. */
const WAKES_AT = 6;
/** THE SMART's stud count. */
const STUDS = 7;
export type V = { x: number; y: number; z: number };

/** Seven directions spread evenly over a sphere — the golden spiral. */
const DIRS: V[] = Array.from({ length: STUDS }, (_, i) => {
  const yy = 1 - ((i + 0.5) / STUDS) * 2;
  const rr = Math.sqrt(1 - yy * yy);
  const a = i * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(a) * rr, y: yy, z: Math.sin(a) * rr };
});
/** The axis it tumbles about, leaning off the upright. */
const AXIS: V = (() => {
  const v = { x: 0.55, y: 0.75, z: 0.35 };
  const n = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / n, y: v.y / n, z: v.z / n };
})();

/** Rodrigues: `v` turned by `a` about `AXIS`. */
export function turn(v: V, a: number): V {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const d = (v.x * AXIS.x + v.y * AXIS.y + v.z * AXIS.z) * (1 - c);
  return {
    x: v.x * c + (AXIS.y * v.z - AXIS.z * v.y) * s + AXIS.x * d,
    y: v.y * c + (AXIS.z * v.x - AXIS.x * v.z) * s + AXIS.y * d,
    z: v.z * c + (AXIS.x * v.y - AXIS.y * v.x) * s + AXIS.z * d,
  };
}

/** The seed at one moment: where it is, how big, how turned, how awake. */
export interface Seed {
  x: number;
  y: number;
  /** The pod's drawn radius, `POD_TILES` of a tile. */
  r: number;
  /** The sphere's own radius. */
  R: number;
  roll: number;
  /** How far out a stud tip stands, in sphere radii. */
  reach: number;
  studs: V[];
  /** 0 with time to spare, 1 at the deadline. */
  awake: number;
  /** Where in its beat the clock is, 1 at the top falling to 0. */
  beat: number;
  /** The slow breath every candidate shares, 0..1. */
  pulse: number;
}

export function seedAt(l: Layout, x: number, y: number, t: number, beatsLeft: number): Seed {
  const r = l.tile * POD_TILES;
  const awake = Math.max(0, Math.min(1, 1 - beatsLeft / WAKES_AT));
  const roll = t * (0.8 + 2.4 * awake);
  const beat = Number.isFinite(beatsLeft) ? beatsLeft % 1 : 0;
  return {
    x,
    y: y + Math.sin(t * 1.1) * l.tile * 0.05,
    r,
    R: r * 0.74,
    roll,
    // On the beat, a throw of the studs that decays through it.
    reach: 1.42 + 0.22 * awake * beat * beat,
    studs: DIRS.map((d) => turn(d, roll)),
    awake,
    beat,
    pulse: 0.5 + 0.5 * Math.sin(t * 2.4),
  };
}

/** How the body is lit: `flash` 0..1 takes the whole sphere toward white. */
export interface SeedLight {
  flash?: number;
  /** SMART's own `stud` and `smooth` when not named (`seed-parts.ts`). */
  spike?: SpikeKind;
  skin?: SkinKind;
}

/** The halo and the studs round the back. Opens a `save` that `drawFront` closes. */
export function drawBack(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  const f = light.flash ?? 0;
  halo(
    ctx,
    s.x,
    s.y,
    s.r * (2.1 + 0.3 * s.pulse + 0.8 * f),
    PALETTE.pod,
    0.12 + 0.08 * s.pulse + 0.3 * f,
  );
  ctx.save();
  ctx.lineCap = "round";
  for (const d of s.studs) if (d.z < 0) drawSpike(ctx, s, d, f, light.spike ?? "stud");
}

/** The sphere, its seam and the near studs. */
export function drawFront(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  const f = light.flash ?? 0;
  const { x, y, R } = s;
  // The sphere, lit from up and to the left.
  const g = ctx.createRadialGradient(x - R * 0.4, y - R * 0.45, R * 0.08, x, y, R);
  g.addColorStop(0, f > 0.5 ? "#FFFFFF" : PALETTE.pod);
  g.addColorStop(0.45, f > 0.5 ? PALETTE.podRim : f > 0 ? PALETTE.pod : "#7A4C0C");
  g.addColorStop(1, f > 0 ? "#7A4C0C" : PALETTE.podDark);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = f > 0 ? PALETTE.podRim : PALETTE.pod;
  ctx.lineWidth = Math.max(1.5, s.r * 0.1);
  ctx.globalAlpha = 0.85;
  ctx.stroke();

  drawSkin(ctx, s, light.skin ?? "smooth");
  // The seam round the middle, on every one of them.
  ctx.strokeStyle = PALETTE.podRim;
  ringOn(ctx, s, (a) => ({ x: Math.cos(a), y: 0, z: Math.sin(a) }), R * 0.07);
  for (const d of s.studs) if (d.z >= 0) drawSpike(ctx, s, d, f, light.spike ?? "stud");
  ctx.restore();
}

export function drawSeed(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  drawBack(ctx, s, light);
  drawFront(ctx, s, light);
}

/** Where a stud's tip is on the screen. */
export function tipOf(s: Seed, d: V): { x: number; y: number } {
  return { x: s.x + d.x * s.R * s.reach, y: s.y + d.y * s.R * s.reach };
}

/** Only a pod is drawn here; the type the record's field wants. */
export type Moored = (
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
  beatsLeft: number,
) => void;

/**
 * A pickup's blink, 0..1, hard-edged the way a bonus in a game blinks: once a
 * beat with time to spare, twice a beat from half the waking, four times in
 * the last beat. A pod that owes nothing blinks on the seconds.
 */
export function blinkAt(t: number, beatsLeft: number): number {
  if (!Number.isFinite(beatsLeft)) return (t * 1.6) % 1 < 0.22 ? 1 : 0;
  const per = beatsLeft < 1 ? 4 : beatsLeft < WAKES_AT / 2 ? 2 : 1;
  const ph = (beatsLeft * per) % 1;
  // The flash is the top of each count, a fifth of it, and falls off fast.
  return ph > 0.78 ? Math.min(1, (ph - 0.78) / 0.06) : 0;
}
