import type { Point } from "../../../../../packages/content/src/index.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import {
  PULL_TRACK_W,
  type PullTrack,
  type PullTrackDraw,
  paintPullTrack,
  pullTrackPoint,
} from "../../../../../packages/render/src/pull-track.js";
import { popAt, refusedAt, socket } from "./ends.js";
import { blob, countedFor, dot, dropAt, FULL, GHOST_RUN, goals, rimArc, share } from "./goo.js";

/**
 * OOZE's channel: everything round the drop that says where it goes and how
 * far it has come. The drop itself is `knob.ts`; the two ends — the place it
 * is going and the pop when it gets there — are `ends.ts`.
 */

/** Runway drops per knob radius of track. */
const DROP_EVERY = 1.0;

function lengthOf(t: PullTrack): number {
  let len = 0;
  for (let i = 1; i < t.pts.length; i++) {
    const a = t.pts[i - 1] as Point;
    const b = t.pts[i] as Point;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}

export function oozeTrack(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void {
  if (t.closed) {
    paintPullTrack(ctx, t, o);
    return;
  }
  const r = t.w / PULL_TRACK_W;
  const ends = goals(o.origin, o.at);
  let p = 0;
  for (const g of ends) p = Math.max(p, share(o.origin, o.at, g));
  const counted = countedFor(o.after, o.held);
  const refused = o.after?.verdict === "refused" ? o.after.since : null;
  const waiting = !o.held && o.after?.verdict == null && p < 0.01;
  // The ghost's run: where along the way it is, 0..1, and the runway lights behind it.
  const run = (o.time / GHOST_RUN) % 1;
  ctx.save();
  puddle(ctx, pullTrackPoint(t, o.origin), r, o, refused);
  // The neck under the way it has come, so the green of it is never covered.
  if ((o.held && counted === null) || refused !== null) neck(ctx, t, o, r, p, refused);
  trail(ctx, t, o, r, counted, refused);
  const n = Math.max(4, Math.round(lengthOf(t) / (r * DROP_EVERY)));
  for (const g of ends) {
    for (let i = 1; i < n; i++) {
      const k = o.origin + ((g - o.origin) * i) / n;
      runwayDrop(ctx, pullTrackPoint(t, k), r, i / n, share(o.origin, o.at, g), run, waiting, o);
    }
    socket(ctx, pullTrackPoint(t, g), r, share(o.origin, o.at, g), waiting ? run : null, o);
  }
  if (waiting) for (const g of ends) ghost(ctx, t, r, o, g, run);
  if (o.held && counted === null && p > 0.01) ring(ctx, dropAt(t, o), r, o.time, p);
  if (counted !== null) for (const g of ends) popAt(ctx, pullTrackPoint(t, g), r, counted, o.time);
  if (refused !== null) refusedAt(ctx, dropAt(t, o), r, refused);
  ctx.restore();
}

/** One drop of the runway, `along` of the way to its end. */
function runwayDrop(
  ctx: CanvasRenderingContext2D,
  q: Point,
  r: number,
  along: number,
  came: number,
  run: number,
  waiting: boolean,
  o: PullTrackDraw,
): void {
  const passed = !waiting && along <= came + 1e-6 && came > 0.01;
  if (passed && o.after?.verdict !== "refused") {
    // Passed: popped green, with a halo, like a light that has come on.
    ctx.fillStyle = PALETTE.good;
    ctx.globalAlpha = 0.3;
    dot(ctx, q, r * 0.42);
    ctx.globalAlpha = 1;
    dot(ctx, q, r * 0.2);
    return;
  }
  let lit = 0;
  if (waiting) {
    // One after another as the ghost passes, fading behind it.
    const ghostAt = smoothstep(run);
    if (along <= ghostAt) lit = Math.max(0, 1 - (ghostAt - along) * 3.2);
  } else if (o.held && along > came) {
    // The next drop ahead blinks: that is where the hand goes next.
    const next = Math.abs(along - came) < 1 / 6;
    lit = next ? 0.5 + 0.5 * Math.sin(o.time * 12) : 0;
  }
  ctx.fillStyle = lit > 0.05 ? o.rim : o.hex;
  ctx.globalAlpha = 0.3 + 0.7 * lit;
  if (lit > 0.3) {
    ctx.globalAlpha = 0.25 * lit;
    dot(ctx, q, r * 0.48);
    ctx.globalAlpha = 0.3 + 0.7 * lit;
  }
  blob(ctx, q, r * (0.14 + 0.1 * lit), o.time + along * 7);
  ctx.fill();
}

/** The way the drop has come, laid in green goo behind it; drained red on a refusal. */
function trail(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  o: PullTrackDraw,
  r: number,
  counted: number | null,
  refused: number | null,
): void {
  if (Math.abs(o.at - o.origin) < 0.01 || (!o.held && counted === null && refused === null)) return;
  const fade =
    counted !== null
      ? Math.max(0, Math.min(1, 1.6 - counted))
      : refused !== null
        ? Math.max(0, 1 - refused / 0.6)
        : 1;
  if (fade <= 0) return;
  ctx.strokeStyle = refused !== null ? PALETTE.red : PALETTE.good;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const q = pullTrackPoint(t, o.origin + ((o.at - o.origin) * i) / 24);
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  }
  ctx.globalAlpha = 0.22 * fade;
  ctx.lineWidth = r * 0.9;
  ctx.stroke();
  ctx.globalAlpha = 0.85 * fade;
  ctx.lineWidth = r * 0.28;
  ctx.stroke();
}

/** The puddle the drop came out of, where the hand takes it. */
function puddle(
  ctx: CanvasRenderingContext2D,
  q: Point,
  r: number,
  o: PullTrackDraw,
  refused: number | null,
): void {
  ctx.fillStyle = o.hex;
  ctx.globalAlpha = refused !== null ? 0.55 : 0.4;
  blob(ctx, q, r * 0.85, o.time * 0.7);
  ctx.fill();
}

/** A see-through drop running the whole pull, from the puddle to the place it goes. */
function ghost(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  r: number,
  o: PullTrackDraw,
  g: 0 | 1,
  run: number,
): void {
  const q = pullTrackPoint(t, o.origin + (g - o.origin) * smoothstep(run));
  const a = 0.55 * Math.sin(run * Math.PI);
  ctx.globalAlpha = 0.35 * a;
  ctx.fillStyle = o.hex;
  blob(ctx, q, r * 0.92, o.time);
  ctx.fill();
  ctx.globalAlpha = a;
  ctx.strokeStyle = o.rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
}

/**
 * The sticky neck from the puddle to the drop, pinched in the middle and
 * bent to the drop where the hand has it off the path. On a refusal it is
 * red, and fat again: the puddle hauling the drop home.
 */
function neck(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  o: PullTrackDraw,
  r: number,
  p: number,
  refused: number | null,
): void {
  if (Math.abs(o.at - o.origin) < 0.005 && !o.after?.off) return;
  const off = o.after?.off ?? { x: 0, y: 0 };
  const n = 24;
  const left: Point[] = [];
  const right: Point[] = [];
  const thin = refused !== null ? 0.35 : 0.55 + 0.4 * p;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const q = pullTrackPoint(t, o.origin + (o.at - o.origin) * u);
    const x = q.x + off.x * u * u;
    const y = q.y + off.y * u * u;
    const half = r * 0.7 * (1 - Math.sin(u * Math.PI) * thin) * (1 - 0.35 * p);
    left.push({ x: x - q.dy * half, y: y + q.dx * half });
    right.push({ x: x + q.dy * half, y: y - q.dx * half });
  }
  ctx.beginPath();
  for (const [i, q] of left.entries()) {
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  }
  for (let i = right.length - 1; i >= 0; i--) {
    const q = right[i] as Point;
    ctx.lineTo(q.x, q.y);
  }
  ctx.closePath();
  ctx.fillStyle = o.hex;
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = o.rim;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
}

/** How far the pull has come, as a green ring hugging the drop's own wobbling rim. */
function ring(ctx: CanvasRenderingContext2D, at: Point, r: number, time: number, p: number): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.background;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = STROKE.outline * 3;
  rimArc(ctx, at, r * 1.36, time, 1);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.good;
  ctx.globalAlpha = 1;
  ctx.lineWidth = STROKE.outline * 1.8;
  rimArc(ctx, at, r * 1.36, time, Math.min(1, p / FULL));
  ctx.stroke();
}
