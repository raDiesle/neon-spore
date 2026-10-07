import {
  KEY,
  onRing,
  type Ring,
  ringNormal,
  type Seen,
  see,
  seeTube,
  tubeFrames,
  turn,
  type View,
} from "@neon-spore/content";
import { halo, strokeGlow, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";
import type { MarkPart } from "./solid-rig.js";
import { tubePath } from "./solid-tube-draw.js";

/**
 * **What is on the heart's muscle**, placed rather than posed (the `depth`
 * skill's one rule): the fibres and the vessels sit at an angle round each
 * ventricle's own rings, so the idle turn carries the near ones away and the
 * far ones into view, and a line is drawn only where its surface faces the
 * seats.
 *
 * - **The fibres** wind round each ventricle in a helix, as a heart's muscle
 *   does, dark and thin: the grain that says this is meat and not a balloon.
 * - **The vessels** are its health, as the flat heart's were: one lit vessel
 *   down the front for each vein still to be traced, forked part-way, so the
 *   heart loses one with every vein pulled.
 * - **The hurt**: the house's red glow round each ventricle as it is struck
 *   (`boss-hurt.ts`'s, without its fill — the skins flush instead).
 * - **The pulse**: on every beat a bead of light runs up each vessel from the
 *   apex, where the veins the pair traces go in, toward the base.
 *
 * Each ventricle's surface is one `MarkPart`, sorted a hair in front of its
 * own tube, so the right ventricle's muscle covers the left's vessels where
 * it laps over them.
 */

/** A vessel: which ventricle, how far round from the front (radians), and where it forks. */
export interface VesselSlot {
  readonly side: "left" | "right";
  readonly round: number;
  readonly fork: number;
}

/** The seven, in the order they go out: the last listed is the first lost. */
export const VESSEL_SLOTS: readonly VesselSlot[] = [
  { side: "left", round: -0.75, fork: 0.35 },
  { side: "right", round: 0.1, fork: -0.4 },
  { side: "left", round: 0.05, fork: 0.4 },
  { side: "right", round: -0.75, fork: 0.35 },
  { side: "left", round: 0.75, fork: -0.35 },
  { side: "right", round: 0.75, fork: -0.4 },
  { side: "left", round: 1.3, fork: -0.3 },
];

/** Fibres to a ventricle, and how far one winds from base to apex, in radians. */
const FIBRES = 6;
const TWIST = 1.6;
/** How far off the surface a line is lifted, in ring radii, so the tube's fill never crosses it. */
const LIFT = 0.02;
/** How square to the seats a surface must face before a line on it is drawn. */
const FACING = 0.08;
/** The light inside a chamber: at rest, what a squeeze adds, and how far it reaches in `rx`. */
const GLOW_REST = 0.25;
const GLOW_BEAT = 0.6;
const GLOW_REACH = 0.75;

/** The glow within, built once along a unit radius and laid by a transform (`docs/style-guide.md`). */
let glow: { ctx: CanvasRenderingContext2D; g: CanvasGradient } | null = null;
function glowWithin(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (glow?.ctx === ctx) return glow.g;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, rgba(PALETTE.sheenWarm, 0.7));
  g.addColorStop(0.45, rgba(PALETTE.sheenMid, 0.25));
  g.addColorStop(1, rgba(PALETTE.sheenMid, 0));
  glow = { ctx, g };
  return g;
}

/** A vessel's cord: deep violet — what the frame tests count as the heart standing, and its width in `rx`. */
export const CORD = "#1A0B2A";
const CORD_W = 0.035;
/** The cord's strength, faded by the body's own fade. */
export const CORD_ALPHA = 0.85;
/** How much of a beat a pulse takes to run the vessel's length. */
const PULSE_RUN = 0.55;

/** What a ventricle's surface is drawn with this frame. */
export interface SurfaceLook {
  /** How hard this chamber is squeezing, 0..1: how bright it is lit from inside. */
  readonly squeeze: number;
  /** How hard the heart is struck, 0..1: the hurt's red glow round the muscle (`boss-hurt.ts`). */
  readonly hurt: number;
  /** The vessels on this ventricle, each with how much of it is still there (the last vein fades). */
  readonly vessels: readonly { slot: VesselSlot; left: number }[];
  readonly beatPhase: number;
  readonly time: number;
}

/** The angle round ring `k` that faces the seats in model space: where a vessel's `round` is from. */
function front(frame: { n: { z: number }; b: { z: number } }): number {
  return Math.atan2(frame.b.z, frame.n.z);
}

/**
 * A ventricle's surface as a mark on the rig, sorted just in front of the
 * tube whose `rings` it lies on, `rx` pixels to a unit.
 */
export function heartSurface(
  rings: readonly Ring[],
  w: View,
  rx: number,
  look: SurfaceLook,
): MarkPart {
  const frames = tubeFrames(rings);
  const n = rings.length;
  const mid = rings.reduce(
    (s, r) => ({ x: s.x + r.c.x / n, y: s.y + r.c.y / n, z: s.z + r.c.z / n }),
    { x: 0, y: 0, z: 0 },
  );
  // A point at ring `k`, `a` round from its front: where it is seen, or null when it faces away.
  const at = (k: number, a: number): Seen | null => {
    const frame = frames[k];
    const ring = rings[k];
    if (frame === undefined || ring === undefined) return null;
    const angle = front(frame) + a;
    if (turn(ringNormal(frame, angle), w).z < FACING) return null;
    return see(onRing(ring, frame, angle, LIFT), w);
  };
  // A line over the surface from ring `k0` to `k1`, its angle round from the front at each ring.
  const line = (p: Path2D, k0: number, k1: number, angle: (k: number) => number): void => {
    let pen = false;
    for (let k = k0; k <= k1; k++) {
      const s = at(k, angle(k));
      if (s === null) pen = false;
      else if (pen) p.lineTo(s.x, s.y);
      else {
        p.moveTo(s.x, s.y);
        pen = true;
      }
    }
  };
  const draw = (ctx: CanvasRenderingContext2D, seen: Seen, alpha: number): void => {
    drawGlowWithin(ctx, seen, alpha);
    const fibres = new Path2D();
    for (let i = 0; i < FIBRES; i++) {
      const base = (i / FIBRES) * Math.PI * 2;
      line(fibres, 0, n - 1, (k) => base + (TWIST * k) / (n - 1));
    }
    ctx.save();
    ctx.strokeStyle = rgba("#0B1024", 0.32 * alpha);
    ctx.lineWidth = Math.max(0.75, rx * 0.014);
    ctx.stroke(fibres);
    ctx.restore();
    for (const { slot, left } of look.vessels) drawVessel(ctx, slot, left * alpha);
  };
  // The chamber lit from inside, through its own wall: clipped to the tube, so nothing glows past the muscle.
  const drawGlowWithin = (ctx: CanvasRenderingContext2D, seen: Seen, alpha: number): void => {
    const lit = (GLOW_REST + GLOW_BEAT * look.squeeze) * alpha;
    if (lit <= 0) return;
    const r = rx * GLOW_REACH;
    const outline = tubePath(seeTube(rings, frames, w));
    if (look.hurt > 0) strokeGlowFaded(ctx, outline, PALETTE.redRim, STROKE.inner, 1.6 * look.hurt);
    ctx.save();
    ctx.clip(outline);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = lit;
    ctx.translate(seen.x, seen.y + rx * 0.15);
    ctx.scale(r, r);
    ctx.fillStyle = glowWithin(ctx);
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  };
  const meander = (slot: VesselSlot, k: number): number =>
    slot.round + 0.1 * Math.sin(k * 1.4 + slot.round * 5);
  const drawVessel = (ctx: CanvasRenderingContext2D, slot: VesselSlot, alpha: number): void => {
    if (alpha <= 0) return;
    const p = new Path2D();
    line(p, 1, n - 2, (k) => meander(slot, k));
    const forkAt = Math.round(n * 0.35);
    line(
      p,
      forkAt,
      n - 3,
      (k) => meander(slot, forkAt) + slot.fork * ((k - forkAt) / (n - forkAt)),
    );
    // Raised on the muscle: a dark cord with the light along its top edge, and its own faint glow.
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = rgba(CORD, CORD_ALPHA * alpha);
    ctx.lineWidth = Math.max(1.5, rx * CORD_W);
    ctx.stroke(p);
    ctx.translate(KEY.x * rx * 0.012, KEY.y * rx * 0.012);
    ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.3 * alpha);
    ctx.lineWidth = Math.max(0.75, rx * CORD_W * 0.3);
    ctx.stroke(p);
    ctx.restore();
    strokeGlow(ctx, p, PALETTE.wisp, STROKE.inner * 0.5, 0.5, 0.35 * alpha);
    // The pulse: a lit stretch running from the apex up toward the base over the first part of the beat.
    const run = look.beatPhase / PULSE_RUN;
    if (run >= 1) return;
    const k = Math.round(n - 2 - run * (n - 3));
    const lit = new Path2D();
    line(lit, Math.max(1, k - 1), Math.min(n - 2, k + 2), (j) => meander(slot, j));
    strokeGlow(ctx, lit, PALETTE.sheenRim, STROKE.inner, 1.4, alpha * (1 - run * 0.6));
    const s = at(k, meander(slot, k));
    if (s !== null)
      halo(ctx, s.x, s.y, Math.round(rx * 0.06), PALETTE.sheenRim, 0.6 * alpha * (1 - run));
  };
  const lifted = { x: mid.x, y: mid.y, z: mid.z + rx * 0.01 };
  return { kind: "mark", c: lifted, draw };
}
