import { blobPoints } from "@neon-spore/content";
import {
  faultFiresThisBeat,
  type Malfunction,
  malfunctionColor,
  type World,
} from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **What is doing it.** The thing at the top of the field that has a control
 * of the ship's: THE MALFUNCTION's visible cause.
 *
 * A fault used to be a fact about the panel alone — a button torn open, a
 * bleed under it (`malfunction-look.ts`) — and the owner's rule of 12
 * September 2026 is that *whenever there is a malfunction there must be an
 * indication and a visible cause*. So a wave with a fault has this hanging
 * from the top edge of the field, in the middle, from the first frame: an
 * emitter, and a beam from it down to whatever the fault has taken on this
 * screen. It is not a creature — it stands in no column and cannot be shot,
 * because the owner took the brake off the fault on 6 September and a target
 * that ended it would be that brake put back — and it is drawn under the
 * bodies, so a body falling down the middle column crosses in front of it.
 *
 * **LANTERN, from the shapes page:** *two antennae + a vesicle*, *one lit
 * thing inside and two outside* (`tools/shape-sheet/src/grown-bodies.ts`).
 * The vesicle is the lit thing and the beam comes out of it; the antennae
 * reach up to the edge it hangs from. Painted in `PALETTE.arc` — the blue the
 * torn button bleeds, a current going where it should not.
 *
 * **The beam says which fault.** A shield that has stuck on is a *held*
 * thing, so its beam is steady: one wide band, breathing, holding the dome
 * up. A cannon that fires by itself is a *pulsed* thing, so its beam is a
 * thread between shots and a flash on each one, in the colour the shot was —
 * red, then cyan — read off `malfunctionColor`, the same function that loads
 * the gun. A steering that has been taken is held too, so THE CHOKE's beam
 * is the steady one. Where the beam lands is where this screen shows the
 * fault (`fault-beam-ends.ts`): the GUARD lobe on the pilot's panel and the
 * dome over the plate on the navigator's; the two colour lobes on the
 * navigator's panel and the muzzle on the pilot's; the cannon strip's node
 * and the muzzle on the pilot's and the muzzle alone on the navigator's,
 * since the cannon is on the hull on both. The test view, which is both,
 * gets both.
 */

/** The emitter's centre and size: hanging in from the top edge of the grid,
 * in the middle column, most of a tile across. */
export function emitterAt(l: Layout): { x: number; y: number; r: number } {
  return { x: l.gridLeft + l.gridWidth / 2, y: l.gridTop + l.tile * 0.3, r: l.tile * 0.5 };
}

/** The lit vesicle, low on the body — where the beam starts. */
function vesicleAt(l: Layout): { x: number; y: number; r: number } {
  const e = emitterAt(l);
  return { x: e.x, y: e.y + e.r * 0.72, r: e.r * 0.3 };
}

/** The body, under every creature (`frame-field.ts`). */
export function drawFaultEmitter(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const m = world.malfunction;
  if (m === null) return;
  const e = emitterAt(l);
  const v = vesicleAt(l);
  ctx.save();
  // The two antennae first, so the body's rim goes over their roots: each a
  // thin stalk curling up and out toward the edge, with a bead on its end
  // that pulses on the beat — the ANTENNA part as the sheet draws it.
  for (const side of [-1, 1]) {
    const rootX = e.x + side * e.r * 0.55;
    const rootY = e.y - e.r * 0.5;
    const sway = Math.sin(time * 1.4 + side) * 0.08;
    const tipX = rootX + side * e.r * (0.95 + sway);
    const tipY = rootY - e.r * (0.75 - sway * 2);
    const stalk = new Path2D();
    stalk.moveTo(rootX, rootY);
    stalk.quadraticCurveTo(rootX + side * e.r * 0.2, rootY - e.r * 0.85, tipX, tipY);
    strokeGlow(ctx, stalk, PALETTE.arc, Math.max(1, e.r * 0.08), 0.6);
    const pulse = 1 + 0.18 * Math.sin(time * 2.2 + side);
    ctx.fillStyle = PALETTE.arcRim;
    ctx.beginPath();
    ctx.arc(tipX, tipY, e.r * 0.11 * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
  // The body: LANTERN's base, two lobes, taller than wide, in a material no
  // creature wears — near-black with the current showing through it.
  const body = splinePath(blobPoints(e.x, e.y, e.r * 0.82, e.r, 2, 0.14, 0.05, time, 47, 32), true);
  ctx.fillStyle = "#0B0A1E";
  ctx.fill(body);
  ctx.fillStyle = rgba(PALETTE.arc, 0.16);
  ctx.fill(body);
  strokeGlow(ctx, body, PALETTE.arc, STROKE.outline, 0.8);
  // The vesicle: a sac low in the body with the lit core drifting inside it.
  const wander = 0.05 * Math.sin(time * 0.9);
  ctx.fillStyle = rgba(PALETTE.arc, 0.35);
  ctx.beginPath();
  ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
  ctx.fill();
  halo(ctx, v.x, v.y, Math.round(v.r * 3), PALETTE.arc, 0.5);
  ctx.fillStyle = beamColor(world, m);
  ctx.beginPath();
  ctx.arc(v.x + wander * v.r * 4, v.y + wander * v.r * 5, v.r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The colour the beam is carrying now: the shot's for a cannon fault, the
 * current's for a shield that is held. */
function beamColor(world: World, m: Malfunction): string {
  if (m.kind !== "cannon") return PALETTE.arc;
  return malfunctionColor(world, m) === "red" ? PALETTE.red : PALETTE.cyan;
}

/** Whether the runaway cannon fired on the current beat — `stepMalfunction`'s
 * own rule, asked rather than copied. */
function firedThisBeat(world: World): boolean {
  return faultFiresThisBeat(world);
}

/** Where a beam ends on this screen, and how wide the thing it hits is. */
export interface BeamEnd {
  x: number;
  y: number;
  r: number;
  /** The colour lobe the runaway gun is *not* loading this shot: it is still
   * hit, but dimly, so the pair can read which colour is coming. */
  dim?: boolean;
}

/**
 * The beam, from the vesicle to each end — over the band, because that is
 * where the button it damages is (`frame-ship.ts`, with the maze drips).
 * `ends` are the caller's: the lobe circles come off `bandLobes`, and the
 * dome and the muzzle off the world's columns and the hull row.
 */
export function drawFaultBeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  ends: readonly BeamEnd[],
  beatPhase: number,
  time: number,
): void {
  const m = world.malfunction;
  if (m === null || ends.length === 0) return;
  const v = vesicleAt(l);
  const color = beamColor(world, m);
  // Steady for a held shield or a held steering; a thread with a flash on
  // each shot for a gun that fires by itself. `flash` is one on the shot
  // and gone a third of a beat later, so between shots the thread is all
  // that is left.
  const held = m.kind !== "cannon";
  const flash = held ? 0 : firedThisBeat(world) ? Math.max(0, 1 - beatPhase * 3) : 0;
  const breath = 0.8 + 0.2 * Math.sin(time * 2.6);
  const wide = held ? l.tile * 0.34 * breath : l.tile * (0.08 + 0.42 * flash);
  const full = held ? 0.9 : 0.35 + 0.65 * flash;
  ctx.save();
  for (const end of ends) {
    // `strokeGlow` always lays a solid core at its width, so a dim end is a
    // thin one: a thread beside a beam.
    const strength = end.dim ? full * 0.3 : full;
    const w = end.dim ? Math.max(1, wide * 0.25) : wide;
    // Two bezier bows either side of the straight line, wandering on the wall
    // clock, so the band reads as light rather than as a ruled edge.
    const bow = l.tile * 0.35 * Math.sin(time * 3.1 + end.x);
    const path = new Path2D();
    path.moveTo(v.x, v.y);
    path.bezierCurveTo(v.x + bow, (v.y + end.y) / 2, end.x - bow, (v.y + end.y) / 2, end.x, end.y);
    // A wide soft band first, then the glow, then a bright core: a beam and
    // not a wire, read from across a table.
    ctx.globalAlpha = 0.18 * strength;
    ctx.strokeStyle = color;
    ctx.lineWidth = w * 2.4;
    ctx.lineCap = "round";
    ctx.stroke(path);
    ctx.globalAlpha = 1;
    strokeGlow(ctx, path, color, w, strength);
    ctx.globalAlpha = 0.55 * strength;
    ctx.strokeStyle = PALETTE.arcRim;
    ctx.lineWidth = Math.max(1, w * 0.25);
    ctx.stroke(path);
    ctx.globalAlpha = 1;
    drawImpact(ctx, end, color, strength, time);
  }
  ctx.restore();
}

/** How long one set of arcs stands at an impact before jumping — the tear's
 * own cadence (`malfunction-look.ts`), so the button and the thing hitting it
 * flicker together. */
const ARC_HOLD = 0.11;

/** Where the beam lands: a bloom on the thing hit, and three short arcs off
 * it, placed by `sinHash` off the wall clock — nothing here is world state. */
function drawImpact(
  ctx: CanvasRenderingContext2D,
  end: BeamEnd,
  color: string,
  strength: number,
  time: number,
): void {
  halo(ctx, end.x, end.y, Math.round(end.r * 2.4), color, 0.35 + 0.4 * strength);
  const step = Math.floor(time / ARC_HOLD);
  ctx.strokeStyle = PALETTE.arcRim;
  ctx.lineWidth = STROKE.outline;
  ctx.globalAlpha = 0.5 + 0.5 * strength;
  for (let k = 0; k < 3; k++) {
    const a = sinHash(step, k * 2.3) * Math.PI * 2;
    const len = end.r * (0.5 + sinHash(step, k * 5.1 + 1) * 0.7);
    const kink = (sinHash(step, k * 7.7 + 2) - 0.5) * end.r * 0.6;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x + Math.cos(a) * len * 0.5 + kink, end.y + Math.sin(a) * len * 0.5 - kink);
    ctx.lineTo(end.x + Math.cos(a) * len, end.y + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
