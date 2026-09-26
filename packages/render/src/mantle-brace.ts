import { type MantleState, mantleBracing, type World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { mantleKnobCircle } from "./mantle-grip.js";
import { mantleOpen } from "./mantle-pose.js";
import { mantleReach, type Point } from "./mantle-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE MANTLE's brace, drawn** (§23 rows 7 and 8): the shear before the last
 * pair makes the shell fight to shut, and the pair hold both handles still
 * until it settles.
 *
 * Three things say it, all read off the world each frame, so nothing here
 * outlives one:
 *
 * - **The seam cracks as the pairs go.** A hairline up from the tail after
 *   the first shear, longer with each, glowing faintly in the core's colour;
 *   under the brace it pulses bright, and brighter the longer the hold has
 *   lasted. The split takes it away.
 * - **The shell shudders** while bracing, side to side, less as the hold
 *   counts up and half again while both thumbs are down. A lift puts the
 *   count back to nought, which is the shudder coming back at full — the slip
 *   needs no transient of its own.
 * - **Each knob gets a breathing ring**: grey and breathing while that side
 *   is let go, lit and steady while it is held.
 */

/** How far the hold has counted, 0 at the glow to 1 at the steady. */
export function mantleBraceShare(s: MantleState, braceBeats: number): number {
  if (!mantleBracing(s)) return 0;
  return Math.min(1, s.braceBeats / Math.max(1, braceBeats));
}

/** The shell's side-to-side shudder while bracing, in pixels: none otherwise. */
export function mantleShudder(l: Layout, world: World, s: MantleState, time: number): number {
  if (!mantleBracing(s)) return 0;
  const share = mantleBraceShare(s, world.cfg.mantleBraceBeats);
  const both = s.held[0] && s.held[1];
  const amp = l.tile * 0.08 * (1 - share) * (both ? 0.5 : 1);
  return amp * Math.sin(time * 37) * (0.6 + 0.4 * Math.sin(time * 5.3));
}

/** How much of the seam is cracked, tail up: a share per pair sheared, and none once it splits. */
export function mantleCrack(s: MantleState, beat: number, beatPhase: number): number {
  if (s.cursor === 0 || mantleOpen(s, beat, beatPhase) > 0) return 0;
  const pairs = s.thresholds.length;
  if (pairs < 2) return 0;
  return Math.min(1, s.cursor / (pairs - 1));
}

/** Kinks in the crack, tail to nose. */
const KINKS = 9;

/** The seam's crack and its glow, up the middle from the tail. */
export function drawMantleSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MantleState,
  at: Point,
  beat: number,
  beatPhase: number,
): void {
  const crack = mantleCrack(s, beat, beatPhase);
  if (crack === 0) return;
  const { ry } = mantleReach(l);
  const tail = at.y + ry * 0.92;
  const top = tail - crack * ry * 1.7;
  const path = new Path2D();
  path.moveTo(at.x, tail);
  for (let k = 1; k <= KINKS; k++) {
    const y = tail + ((top - tail) * k) / KINKS;
    const kink = k === KINKS ? 0 : (k % 2 === 0 ? 1 : -1) * l.tile * 0.07 * (1 + (k % 3) * 0.4);
    path.lineTo(at.x + kink, y);
  }
  const share = mantleBraceShare(s, world.cfg.mantleBraceBeats);
  const pulse = mantleBracing(s) ? 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2) : 0;
  const glow = mantleBracing(s) ? 0.8 + 0.8 * pulse + 1.2 * share : 0.35;
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.red, 0.5 + 0.4 * Math.min(1, glow));
  ctx.stroke(path);
  strokeGlow(ctx, path, PALETTE.red, STROKE.inner, glow);
}

/** Both knobs' rings while bracing: grey and breathing let go, lit and steady held. */
export function drawMantleBraceRings(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MantleState,
  beatPhase: number,
): void {
  if (!mantleBracing(s)) return;
  for (const side of [-1, 1] as const) {
    const held = s.held[side === -1 ? 0 : 1];
    const knob = mantleKnobCircle(l, world.cfg, s, side, world.beat, beatPhase);
    const breathe = held ? 0 : 0.5 + 0.5 * Math.sin(beatPhase * Math.PI * 2);
    const ring = new Path2D();
    ring.arc(knob.x, knob.y, knob.r * (1.45 + 0.2 * breathe), 0, Math.PI * 2);
    ctx.lineWidth = STROKE.inner;
    if (held) {
      ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9);
      ctx.stroke(ring);
      strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.inner, 1);
    } else {
      ctx.strokeStyle = rgba(PALETTE.dim, 0.45 + 0.4 * breathe);
      ctx.stroke(ring);
    }
  }
}
