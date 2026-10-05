import type { SimConfig, TrivetState } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { phaseInto } from "./phase-into.js";
import { type Point, trivetPlateHalf } from "./trivet-shape.js";

/**
 * **THE TRIVET's ring, drawn** (§30 row 11, the fifth pose): the last shot is
 * in, and the planted feet ring under the spent hub, every pad let go
 * (`sim/trivet-ring.ts`). Each outer foot shivers on the field and throws
 * rings of sound out across it from under its plate, both dying out across
 * the phase. A jolt is a beat more on it, so the ringing is seen coming back.
 *
 * **No lit colour at all** (§30, *Colour*): the rings are the stand's own pale
 * metal, and the sockets stand dull, as they do once no step asks for them.
 *
 * **A jolted foot springs loose and settles again**: a pad put down kicks it
 * up off the field and it drops back over a beat (`TrivetFx.jolt`), and a pad
 * held down keeps it up, which is what the simulation charges it, beat by
 * beat.
 */

/** How far a planted foot shivers across at the ring's opening, in tiles, and how fast, in radians a second. */
const SHIVER = 0.05;
const SHIVER_RATE = 31;
/** How far out of step the two feet ring. */
const APART = 2.1;
/** How far a jolt kicks a foot up, as a share of the way lifted. */
const JOLT = 0.35;
/** Rings of sound a foot throws out at once, how many a second, and how far the widest reaches, in plate half-widths. */
const RINGS = 3;
const RING_RATE = 1.6;
const RING_REACH = 2.2;

/** How far the ring has died out: null outside it, 0 as it opens, 1 settled. */
export function trivetRung(
  s: TrivetState,
  cfg: Pick<SimConfig, "trivetRingBeats">,
  beat: number,
  beatPhase: number,
): number | null {
  if (s.phase !== "ring") return null;
  const beats = Math.max(1, cfg.trivetRingBeats + s.jolts);
  return Math.min(1, phaseInto(s, beat, beatPhase) / beats);
}

/** How far foot `side` is jolted up off the field: held up by a pad down, else the jolt `jolt` settling. */
export function trivetRingLift(s: TrivetState, side: 0 | 1, jolt: number): number {
  return s.padsDown[side] !== 0 ? JOLT : JOLT * jolt;
}

/** A planted foot shivering across as it rings, by less as the ring dies out. */
export function trivetRingFoot<T extends Point>(
  l: Layout,
  foot: T,
  side: 0 | 1,
  rung: number,
  time: number,
): T {
  const dx = SHIVER * l.tile * (1 - rung) * Math.sin(time * SHIVER_RATE + side * APART);
  return { ...foot, x: foot.x + dx };
}

/** The rings of sound spreading out across the field from under a foot's plate, fainter as the ring dies out. */
export function drawTrivetRing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  foot: Point,
  rung: number,
  time: number,
): void {
  const left = 1 - rung;
  if (left <= 0) return;
  const { hx, hy } = trivetPlateHalf(l);
  ctx.save();
  ctx.lineWidth = STROKE.inner;
  for (let k = 0; k < RINGS; k++) {
    const u = (time * RING_RATE + k / RINGS) % 1;
    const reach = 1 + (RING_REACH - 1) * u;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.55 * left * (1 - u));
    ctx.beginPath();
    ctx.ellipse(foot.x, foot.y + hy, hx * reach, hy * reach, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
