import { strokeGlow } from "./glow.js";
import { drawGlint } from "./instar-hide.js";
import { instarAt, type Point } from "./instar-place.js";
import { drawPlate, faded, type Look, toward } from "./instar-plate.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR's tail**: plated, spined, and forked at the end into two
 * blades. At rest it trails up behind the rear; in the lash it curls up over
 * the back and down at the ship, the two blades over the hull where the two
 * seats' marks are — the owner, 25 September 2026: *he tries with tail to hit
 * us, and during the movement of tail, both players have to tap tap so the
 * tail is pushed back*.
 *
 * So the fork stands at `tail` of the way from its rest to the hull, and
 * every tap takes its share of that back (`instar-shape.ts`, `deformed`).
 * Where the script sweeps the blades' marks along the hull (`sweepMilli`) the
 * fork goes with them (`instar-poses.ts`, `placed`), so a blade is always
 * under the ring a thumb is chasing.
 * While the window runs the blades shiver, harder as it closes, and glow red
 * with what they are about to do (`instarThreat`).
 */

/** The blades' tips either side of the fork, and the fork above them, in
 * thousandths of the field. */
const BLADE_SPREAD = 120;
const FORK_RISE = 110;

/** Samples along the tail. */
const N = 18;

/**
 * The tail's own idle wobble on `Form.angle`, same reasoning as the body's
 * roll (`instar-profile-life.ts`) and the skull's `CROWN_WOBBLE`
 * (`instar-side-head.ts`, `docs/style-guide.md`'s "Depth on a body that
 * already ships"): `fork` only actually moves once the tail is raised or
 * lashing (`threat`, `f.tail` above), so at rest — trailing behind the
 * rear, which is most frames — the shading angle from `rear` to `fork` was
 * another still life. Its own period so the three lit shoulders do not
 * slide in step ("phase offset is the cheapest detail available").
 */
const TAIL_WOBBLE = 0.06;
const TAIL_WOBBLE_PERIOD = 6.4;

export function drawTail(ctx: CanvasRenderingContext2D, l: Layout, look: Look, rear: Point): void {
  const { f, r, fade, hurt, time, threat } = look;
  const rest = { x: rear.x + r * 0.9, y: rear.y - r * 1.3 };
  const aimed = instarAt(l, f.tailX, f.tailY - FORK_RISE);
  const shiver = r * 0.05 * threat;
  const fork = toward(rest, aimed, f.tail);
  fork.x += Math.sin(time * 23) * shiver + Math.sin(time * 1.9) * r * 0.06 * f.tail;
  fork.y += Math.cos(time * 19) * shiver;
  const c1 = { x: rear.x + r * (0.4 + 0.9 * f.tail), y: rear.y - r * 1.5 };
  const c2 = { x: fork.x + r * (0.4 + 1.2 * f.tail), y: fork.y - r * (0.3 + 0.9 * f.tail) };
  const at = (u: number): Point => {
    const v = 1 - u;
    return {
      x: v * v * v * rear.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * fork.x,
      y: v * v * v * rear.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * fork.y,
    };
  };
  const mid = Array.from({ length: N + 1 }, (_, i) => at(i / N));
  const left: Point[] = [];
  const right: Point[] = [];
  const spikes: [Point, Point][] = [];
  mid.forEach((p, i) => {
    const q = mid[Math.min(N, i + 1)] ?? p;
    const o = mid[Math.max(0, i - 1)] ?? p;
    const len = Math.hypot(q.x - o.x, q.y - o.y) || 1;
    const nx = (q.y - o.y) / len;
    const ny = -(q.x - o.x) / len;
    const w = r * (0.3 - 0.2 * (i / N));
    left.push({ x: p.x + nx * w, y: p.y + ny * w });
    right.push({ x: p.x - nx * w, y: p.y - ny * w });
    if (i % 3 === 1)
      spikes.push([
        { x: p.x + nx * w, y: p.y + ny * w },
        { x: nx, y: ny },
      ]);
  });
  const hide = splinePath([...left, ...right.reverse()], true);
  right.reverse();
  const m = mid[Math.round(N / 2)] as Point;
  const chord = Math.hypot(fork.x - rear.x, fork.y - rear.y);
  const wobble = TAIL_WOBBLE * Math.sin((time * (Math.PI * 2)) / TAIL_WOBBLE_PERIOD);
  drawPlate(ctx, hide, fade, 0.5, hurt, {
    x: m.x,
    y: m.y,
    r: Math.max(r * 0.3, chord / 2),
    ry: r * 0.3,
    angle: Math.atan2(fork.y - rear.y, fork.x - rear.x) + wobble,
  });
  drawRings(ctx, left, right, r, fade);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.rock, fade, 0.9);
  for (const [p, n] of spikes) {
    const tx = -n.y;
    const ty = n.x;
    ctx.beginPath();
    ctx.moveTo(p.x + tx * r * 0.06, p.y + ty * r * 0.06);
    ctx.lineTo(p.x - tx * r * 0.06, p.y - ty * r * 0.06);
    ctx.lineTo(p.x + n.x * r * 0.16, p.y + n.y * r * 0.16);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  for (const s of [-1, 1]) {
    const tip = instarAt(l, f.tailX + s * BLADE_SPREAD, f.tailY);
    const reach = { x: tip.x - aimed.x, y: tip.y - aimed.y };
    const k = 0.35 + 0.65 * f.tail;
    drawBlade(ctx, fork, { x: fork.x + reach.x * k, y: fork.y + reach.y * k }, s, look);
  }
}

/** The tail's rings: a dark groove across it every other sample, lit just
 * behind on the side toward the key. */
function drawRings(
  ctx: CanvasRenderingContext2D,
  left: readonly Point[],
  right: readonly Point[],
  r: number,
  fade: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, r * 0.028);
  for (let i = 2; i < N; i += 2) {
    const a = left[i] as Point;
    const b = right[i] as Point;
    const bow = {
      x: (a.x + b.x) / 2 + (b.y - a.y) * 0.15,
      y: (a.y + b.y) / 2 - (b.x - a.x) * 0.15,
    };
    ctx.strokeStyle = faded(PALETTE.background, fade, 0.6);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(bow.x, bow.y, b.x, b.y);
    ctx.stroke();
    ctx.strokeStyle = faded(PALETTE.hullRim, fade, 0.2);
    ctx.beginPath();
    ctx.moveTo(a.x - r * 0.025, a.y - r * 0.025);
    ctx.quadraticCurveTo(bow.x - r * 0.025, bow.y - r * 0.025, b.x - r * 0.025, b.y - r * 0.025);
    ctx.stroke();
  }
  ctx.restore();
}

/** One blade of the fork: a hooked crescent from the fork to its tip. */
function drawBlade(ctx: CanvasRenderingContext2D, from: Point, tip: Point, s: number, look: Look) {
  const { r, fade, threat } = look;
  const mx = (from.x + tip.x) / 2;
  const my = (from.y + tip.y) / 2;
  const len = Math.hypot(tip.x - from.x, tip.y - from.y) || 1;
  // Out, away from the other blade, is the blade's back.
  const sx = (s * (tip.y - from.y)) / len;
  const sy = (-s * (tip.x - from.x)) / len;
  const p = new Path2D();
  p.moveTo(from.x - s * r * 0.1, from.y);
  p.quadraticCurveTo(mx + sx * len * 0.4, my + sy * len * 0.4, tip.x, tip.y);
  p.quadraticCurveTo(
    mx + sx * len * 0.1,
    my + sy * len * 0.1,
    from.x + s * r * 0.1,
    from.y + r * 0.05,
  );
  p.closePath();
  ctx.save();
  ctx.fillStyle = faded(PALETTE.rockDark, fade);
  ctx.fill(p);
  // Bone, ground to an edge: pale along the back, dark down the cutting side.
  const back = { x: mx + sx * len * 0.3, y: my + sy * len * 0.3 };
  const g = ctx.createLinearGradient(back.x, back.y, mx, my);
  g.addColorStop(0, faded(PALETTE.rock, fade, 0.6));
  g.addColorStop(1, faded(PALETTE.rock, fade, 0));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.rock, fade), STROKE.inner, 0.4 * fade);
  drawGlint(ctx, toward(from, tip, 0.8), r * 0.025, fade, 0.6);
  if (threat > 0) strokeGlow(ctx, p, faded(PALETTE.red, fade), STROKE.outline, threat * fade);
}
