import { rgba } from "./hex.js";
import { SHADOW } from "./solid-tube-light.js";

/**
 * **A part that glances** (`.claude/skills/depth`, "A part that glances"): a
 * head, a claw, a turret or a machine's whole shell turns a little to one side
 * and the other, so the eye sees it from a new side. THE INSTAR's head was the
 * first (`instar-turn.ts`); every boss after it turns its part through here.
 *
 * The part is drawn as two planes meeting down its middle, each squeezed or
 * opened by its own affine about the middle's swing, and the two affines are
 * fitted so the points `hold` part radii either side of the centre stay where
 * they are — the two eyes, the two shoulders a crane hangs from, the two marks
 * a thumb is on. **A `hold` of 0 holds the centre instead**: nothing swings,
 * the near half opens and the far half closes about a middle that stays put —
 * a machine's mount turning on the hub a shot is aimed at (`vane-glance.ts`).
 * The side it turns toward opens; the far side closes and goes
 * into the cool dark toward its edge, as dark as the swing is wide. A roll
 * about the centre goes on top. A thumb meets the part where it is drawn by
 * asking `glancedPoint` the same question.
 */

/** Where a part is looking, `time` seconds in on the picture's clock. */
export interface Glance {
  /** How far the part's middle swings, in part radii: + toward the screen's right. */
  swing: (time: number) => number;
  /** How far the part rolls about its centre, radians: + clockwise. */
  roll: (time: number) => number;
}

/** A part that does not glance — what every record ships as until the owner takes one. */
export const STILL_GLANCE: Glance = { swing: () => 0, roll: () => 0 };

/** One frame of a glance, in pixels. */
export interface GlanceFrame {
  /** The part's centre. */
  x: number;
  y: number;
  /** The part's radius: the unit `swing` and `hold` are counted in. */
  r: number;
  /** How far either side of the centre the held points sit, in part radii; 0 holds the centre. */
  hold: number;
  /** How far the middle has swung, pixels. */
  swing: number;
  /** How far the part has rolled, radians. */
  roll: number;
}

/** A glance's frame at `time`, with `base` part radii of swing a part carries anyway. */
export function glanceFrame(
  glance: Glance,
  time: number,
  at: { x: number; y: number; r: number; hold: number },
  base = 0,
): GlanceFrame {
  return { ...at, swing: (glance.swing(time) + base) * at.r, roll: glance.roll(time) };
}

/** Whether a frame draws the part exactly as an unturned one. */
export const glanceStill = (f: GlanceFrame): boolean => f.swing === 0 && f.roll === 0;

/** How half `s` of the part is squeezed (under 1) or opened (over 1), the held point on it staying put. */
export function glanceSqueeze(f: GlanceFrame, s: -1 | 1): number {
  return 1 - (s * f.swing) / ((f.hold || 1) * f.r);
}

/** How far the middle is drawn off the centre: the swing, or nothing where the centre is held. */
export const middleShift = (f: GlanceFrame): number => (f.hold === 0 ? 0 : f.swing);

/** Where `drawGlanced` draws a point `p` of the part — a bolt or a thumb meets it there. */
export function glancedPoint(
  f: GlanceFrame,
  p: { x: number; y: number },
): { x: number; y: number } {
  const k = glanceSqueeze(f, p.x < f.x ? -1 : 1);
  const x = middleShift(f) + k * (p.x - f.x);
  const y = p.y - f.y;
  // The roll about the centre, added on so no roll is the point exactly.
  const c = Math.cos(f.roll) - 1;
  const sn = Math.sin(f.roll);
  return { x: f.x + x + (x * c - y * sn), y: p.y + (x * sn + y * c) };
}

/**
 * The part `draw` draws, turned: once for each half, clipped at the middle
 * and squeezed or opened about it, so each held point stays where it was. The
 * far half — the one the middle has swung toward — darkens toward its edge
 * over the paths `draw` answers with, `dark` at its deepest, reached once the
 * swing is `full` part radii, over `span` part radii out from the middle.
 * `reach` is how far, in part radii, a half's clip runs out from the middle,
 * and has to take in the whole of the part.
 */
export function drawGlanced(
  ctx: CanvasRenderingContext2D,
  f: GlanceFrame,
  shade: { dark: number; full: number; span?: number; reach?: number },
  draw: (half: -1 | 1) => readonly Path2D[],
): void {
  const { x, y, r, swing } = f;
  const reach = (shade.reach ?? 4) * r;
  const far = swing > 0 ? 1 : -1;
  const dark = shade.dark * Math.min(1, Math.abs(swing) / (shade.full * r));
  for (const s of [-1, 1] as const) {
    const k = glanceSqueeze(f, s);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(f.roll);
    ctx.translate(-x, -y);
    ctx.transform(k, 0, 0, 1, x + middleShift(f) - k * x, 0);
    ctx.beginPath();
    ctx.rect(s < 0 ? x - reach : x, y - reach, reach, 2 * reach);
    ctx.clip();
    const paths = draw(s);
    if (s === far && dark > 0) {
      const g = ctx.createLinearGradient(x, 0, x + s * (shade.span ?? 1) * r, 0);
      g.addColorStop(0, rgba(SHADOW, 0));
      g.addColorStop(1, rgba(SHADOW, dark));
      ctx.fillStyle = g;
      for (const p of paths) ctx.fill(p);
    }
    ctx.restore();
  }
}
