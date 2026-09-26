import {
  type KeelState,
  keelEndSeg,
  keelFlipping,
  keelMarrowLit,
  type SimConfig,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { keelRingCircle } from "./keel-marks.js";
import { keelSegEnd, type Seg } from "./keel-shape.js";
import { keelChord } from "./keel-story-pose.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE KEEL's story between, drawn** (§24 rows 9, 10 and 15): the marks on
 * the three states. The rules are `sim/keel-story.ts` and the numbers the
 * spine is posed off `keel-story-pose.ts`; this page only lays them on.
 *
 * - **The flip** turns the arch inside out: from the rigid hold's rise it
 *   swings down through flat to a bow the wrong way, shuddering, deeper as
 *   its window runs out — and the chord pulls it back toward flat as it
 *   counts. A ring stands round each end joint, the thumb's pad inside it
 *   lit while that thumb is down, and the chord's count is an arc round both.
 * - **The marrow** is a lens of light where the middle two meet, one half
 *   of each colour, each filling when its bolt is in, with a beam down the
 *   middle column to the hull where the bolt comes from.
 * - **The cooldown** banks the spine from white to iron one segment after
 *   another, left to right; a flare lengthens the bank, so what had cooled
 *   lights again.
 */

/** The ring round the end joint `seat` holds in the flip, where it stands this frame. */
export function keelEndCircle(segs: Seg[], l: Layout, s: KeelState, seat: 1 | 2): Circle | null {
  const g = segs[keelEndSeg(s, seat)];
  return g === undefined ? null : keelRingCircle(l, g.centre);
}

/** The two end rings, each with its thumb's pad lit while held and the chord's count round it. */
export function drawKeelEnds(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: KeelState,
  cfg: SimConfig,
  segs: Seg[],
  beatPhase: number,
): void {
  if (!keelFlipping(s)) return;
  const chord = keelChord(s, cfg);
  for (const seat of [1, 2] as const) {
    const c = keelEndCircle(segs, l, s, seat);
    if (c === null) continue;
    const down = s.held[seat - 1] === true;
    const breathe = down ? 0 : 0.06 * Math.cos(beatPhase * Math.PI * 2);
    const ring = new Path2D();
    ring.arc(c.x, c.y, c.r * (1 + breathe), 0, Math.PI * 2);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.hullRim, down ? 0.7 : 0.4);
    ctx.stroke(ring);
    const pad = new Path2D();
    pad.arc(c.x, c.y, c.r * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, down ? 0.55 : 0.12);
    ctx.fill(pad);
    if (down) strokeGlow(ctx, pad, PALETTE.hullRim, STROKE.inner, 1.2);
    if (chord <= 0) continue;
    const arc = new Path2D();
    arc.arc(c.x, c.y, c.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * chord);
    strokeGlow(ctx, arc, PALETTE.hullRim, STROKE.outline, 1.4);
  }
}

/** The marrow's lens where the middle two meet, a half of each colour, and the beam down to the hull. */
export function drawKeelMarrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: KeelState,
  segs: Seg[],
  beatPhase: number,
): void {
  if (!keelMarrowLit(s)) return;
  const half = s.locked.length / 2;
  const a = segs[half - 1];
  const b = segs[half];
  if (a === undefined || b === undefined) return;
  const p = keelSegEnd(l, a.centre, a.slope, a.pose, 1);
  const q = keelSegEnd(l, b.centre, b.slope, b.pose, -1);
  const x = (p.x + q.x) / 2;
  const y = (p.y + q.y) / 2;
  const pulse = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const beam = new Path2D();
  beam.moveTo(x, y);
  beam.lineTo(x, l.hullY);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.12 + 0.18 * pulse);
  ctx.stroke(beam);
  const r = l.tile * 0.3;
  const sides = [
    [PALETTE.red, s.marrow[0], Math.PI / 2],
    [PALETTE.cyan, s.marrow[1], -Math.PI / 2],
  ] as const;
  for (const [colour, sealed, from] of sides) {
    const lens = new Path2D();
    lens.ellipse(x, y, r * 0.55, r, 0, from, from + Math.PI);
    lens.closePath();
    ctx.fillStyle = rgba(colour, sealed ? 0.9 : 0.2 + 0.2 * pulse);
    ctx.fill(lens);
    strokeGlow(ctx, lens, colour, STROKE.inner, sealed ? 1.6 : 0.5 + 0.6 * pulse);
  }
}
