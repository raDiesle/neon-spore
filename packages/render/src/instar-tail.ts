import { type Ring, type SeenRing, seeTube, tubeFrames } from "@neon-spore/content";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { INSTAR_BODY } from "./instar-body-look.js";
import { INSTAR_TAIL_REST } from "./instar-glance.js";
import { instarAt, type Point } from "./instar-place.js";
import { faded, type Look, toward } from "./instar-plate.js";
import { drawBlade } from "./instar-tail-blade.js";
import { fitTail, type TailShape } from "./instar-tail-fit.js";
import { apex, lensView } from "./instar-tail-lens.js";
import { drawWeak } from "./instar-weak.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawContact } from "./solid-haze.js";
import { breath, chainAt } from "./solid-motion.js";
import { drawTube, rimTube } from "./solid-tube-draw.js";

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
 *
 * **The tail is a tube of the rig** (`solid-tube.ts`, `drawTube`), one ring
 * per sample of the curve, lit across its width, with a rim along its edge
 * and a contact shadow where it goes into the rear — and it swings on its
 * own, a wave running down it to the fork (`SWING_*` below).
 */

/** The blades' tips either side of the fork, and the fork above them, in
 * thousandths of the field. */
const BLADE_SPREAD = 120;
const FORK_RISE = 110;

/** Rings along the tail — dense, for the curl is tight — and how many of them
 * one groove and one spike span. */
const N = 36;
const GROOVE = 4;
const SPIKE = 6;

/**
 * The swing, the tail's own life: a breath (`solid-motion.ts`) at the root
 * that each ring does a little later and a little more (`chainAt`), so a
 * wave runs down it to the fork like a whip rather than the whole tail
 * rocking as one. It swings two ways at once, on two phases of one clock —
 * across the picture, pinned at both ends so the root stays in the rear and
 * the blades stay over their marks, and in depth, toward the player and
 * away, which moves nothing on the screen and everything in the light: the
 * rings turn their flanks to the key and back, and the lens swells the near
 * end and shrinks the far one (`SWING_*`, `LENS`).
 */
const SWING_ACROSS = 0.18;
const SWING_DEPTH = 0.55;
const SWING_PERIOD = 3.6;
/** Seconds the fork is behind the root, and how much wider it swings: over the
 * whole tail, dealt out per ring. */
const SWING_LAG = 1.1 / N;
const SWING_GROW = 1.5 ** (1 / N);
/** How far off the eye is, in head radii: near enough that a tip swung at the player grows. */
const LENS = 7;

/** How far along the spine's heading a tail that flows carries its root, in head radii. */
const FLOW_REACH = 1.6;

const SKIN = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.hull, 0.25),
  lift: PALETTE.hull,
  sheen: PALETTE.sheenRim,
};

export function drawTail(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  look: Look,
  rear: Point,
  heading: Point = { x: 1, y: 0 },
): void {
  const { r, fade, hurt } = look;
  const { seen, fork, blades } = tailShape(l, look, rear, heading);
  const left: Point[] = [];
  const right: Point[] = [];
  const spikes: [Point, Point, number, number][] = [];
  seen.forEach((ring, i) => {
    const q = (seen[Math.min(N, i + 1)] as SeenRing).c;
    const o = (seen[Math.max(0, i - 1)] as SeenRing).c;
    const len = Math.hypot(q.x - o.x, q.y - o.y) || 1;
    const nx = (q.y - o.y) / len;
    const ny = -(q.x - o.x) / len;
    const { c, r: w } = ring;
    left.push({ x: c.x + nx * w, y: c.y + ny * w });
    right.push({ x: c.x - nx * w, y: c.y - ny * w });
    if (i % SPIKE === 2)
      spikes.push([{ x: c.x + nx * w, y: c.y + ny * w }, { x: nx, y: ny }, c.s, i]);
  });
  // Curled over the back, the tail doubles on itself at the top of the curl,
  // tighter than it is thick: one tube there folds its outline through
  // itself. So it is two, split at the top — the root going up, then the lash
  // coming down over it.
  const top = apex(seen);
  ctx.save();
  ctx.translate(rear.x, rear.y);
  const pieces: [number, number][] =
    top > 0
      ? [
          [0, top],
          [top, N],
        ]
      : [[0, N]];
  for (const [from, to] of pieces) {
    const hide = drawTube(ctx, seen.slice(from, to + 1), SKIN, fade);
    strokeGlow(ctx, hide, faded(PALETTE.hull, fade), STROKE.inner, 0.5 * fade);
    drawHurt(ctx, hide, hurt * fade);
    drawWeak(ctx, hide, (look.weak?.tail ?? 0) * fade, "tail");
    drawRings(ctx, left, right, r, fade, from, to);
    // Where the tail goes into the rear.
    if (from === 0) drawContact(ctx, hide, 0, 0, r * 0.4, 0.8 * fade * (1 - INSTAR_BODY.flow));
    rimTube(ctx, hide, PALETTE.sheenRim, r * 0.05, fade);
    ctx.fillStyle = faded(PALETTE.rock, fade, 0.9);
    for (const [p, n, k, i] of spikes) {
      if (i < from || i >= to) continue;
      const tx = -n.y * r * 0.06 * k;
      const ty = n.x * r * 0.06 * k;
      ctx.beginPath();
      ctx.moveTo(p.x + tx, p.y + ty);
      ctx.lineTo(p.x - tx, p.y - ty);
      ctx.lineTo(p.x + n.x * r * 0.16 * k, p.y + n.y * r * 0.16 * k);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
  for (const b of blades) drawBlade(ctx, fork, b.tip, b.s, look);
}

/**
 * The tail as `drawTail` lays it this frame: its tube's rings seen, about
 * `rear`, and the fork with the tip of each blade off it — what it paints, and
 * what a bolt meets (`instar-limb-stop.ts`).
 */
export function tailShape(
  l: Layout,
  look: Look,
  rear: Point,
  heading: Point = { x: 1, y: 0 },
): TailShape {
  // A resting tail is kept on the screen; a lash goes where its marks are (`instar-tail-fit.ts`).
  return fitTail(l, look.r, rear, look.f.tail, (shift) => laidTail(l, look, rear, heading, shift));
}

/** The tail laid with its resting fork and the rise toward it moved by `shift`, as far as it rests. */
function laidTail(l: Layout, look: Look, rear: Point, heading: Point, shift: Point): TailShape {
  const { f, r, time, threat } = look;
  // Which way it leans at rest, taken over by the lash (`instar-glance.ts`).
  const lean = INSTAR_TAIL_REST.lean(time);
  const leans = lean + (1 - lean) * f.tail;
  // What the rest stands off: the rear, moved by the fit as far as the tail rests.
  const base = { x: rear.x + shift.x * (1 - f.tail), y: rear.y + shift.y * (1 - f.tail) };
  const rest = { x: base.x + r * 0.9 * leans, y: base.y - r * 1.3 };
  const aimed = instarAt(l, f.tailX, f.tailY - FORK_RISE);
  const shiver = r * 0.05 * threat;
  const fork = toward(rest, aimed, f.tail);
  fork.x += Math.sin(time * 23) * shiver + Math.sin(time * 1.9) * r * 0.06 * f.tail;
  fork.y += Math.cos(time * 19) * shiver;
  const rise = { x: base.x + r * (0.4 * leans + 0.9 * f.tail), y: base.y - r * 1.5 };
  // Carried on along the spine, the root is the body going on rather than a
  // tube stood up off its end (`INSTAR_BODY.flow`).
  const on = { x: rear.x + heading.x * r * FLOW_REACH, y: rear.y + heading.y * r * FLOW_REACH };
  const c1 = toward(rise, on, INSTAR_BODY.flow);
  const c2 = { x: fork.x + r * (0.4 * leans + 1.2 * f.tail), y: fork.y - r * (0.3 + 0.9 * f.tail) };
  const at = (u: number): Point => {
    const v = 1 - u;
    return {
      x: v * v * v * rear.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * fork.x,
      y: v * v * v * rear.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * fork.y,
    };
  };
  const chord = Math.hypot(fork.x - rear.x, fork.y - rear.y) || 1;
  const across = { x: -(fork.y - rear.y) / chord, y: (fork.x - rear.x) / chord };
  const sway = (t: number) => breath(t, SWING_PERIOD, 0.35, 11);
  const lens = r * LENS;
  const rings: Ring[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = at(u);
    const side = chainAt(sway, time, i, SWING_LAG, SWING_GROW) * SWING_ACROSS * r * 4 * u * (1 - u);
    const z =
      chainAt(sway, time - SWING_PERIOD / 4, i, SWING_LAG, SWING_GROW) * SWING_DEPTH * r * u;
    // The lens divided back out of the centre, so the ring lands where the
    // curve put it and only its girth and its light know how near it is.
    const s = lens / (lens - z);
    const x = (p.x - rear.x + across.x * side) / s;
    const y = (p.y - rear.y + across.y * side) / s;
    rings.push({ c: { x, y, z }, r: r * INSTAR_BODY.tail(u) });
  }
  const seen = seeTube(rings, tubeFrames(rings), lensView(lens));
  const blades = ([-1, 1] as const).map((s) => {
    const tip = instarAt(l, f.tailX + s * BLADE_SPREAD, f.tailY);
    const reach = { x: tip.x - aimed.x, y: tip.y - aimed.y };
    const k = 0.35 + 0.65 * f.tail;
    return { tip: { x: fork.x + reach.x * k, y: fork.y + reach.y * k }, s };
  });
  return { seen, fork, blades };
}

/** The tail's rings from `from` to before `to`: a dark groove across it every
 * `GROOVE` rings, lit just behind on the side toward the key. */
function drawRings(
  ctx: CanvasRenderingContext2D,
  left: readonly Point[],
  right: readonly Point[],
  r: number,
  fade: number,
  from: number,
  to: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, r * 0.028);
  for (let i = GROOVE; i < N; i += GROOVE) {
    if (i < from || i >= to) continue;
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
