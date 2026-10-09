import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { ledgerCordAt } from "./ledger-cord-shape.js";
import type { LedgerNerveDraw } from "./ledger-nerves.js";
import type { Point } from "./ledger-shape.js";
import { PALETTE } from "./palette.js";

/**
 * **LIT** — the ship's nerves under the socket, lit by her shield standing
 * under it. The owner took it from VERSUS on 9 October 2026 and said what it
 * is for: the light *follows the line of the nerve to the boss when the
 * shield is roughly below it*. So a nerve runs from her shield block on its
 * strip up through the ship into the socket, the tree under the socket lights
 * from it, and with the shield in the socket's own column the light goes on
 * up the cord to the body — a pulse climbing from her thumb to the boss.
 *
 * Lit by **her own column and nothing else**. The first LIT was lit by the
 * return coming down the cord, which is the pilot's clock and not hers to see
 * (`ledger-frame.test.ts`); where her shield stands and where the socket is
 * are both on her screen already, so this hands her nothing new — it says
 * *the ward is set* in the picture as well as in the white lock.
 */

/** One nerve: offsets from the socket in tiles, `dx` across and `dy` down
 * under the plating, from where it leaves the socket to where it ends. */
type Nerve = readonly (readonly [dx: number, dy: number])[];

/** Out under the skin, the way the plating runs. */
const RUN: Nerve = [
  [0, 0.05],
  [0.7, 0.3],
  [1.5, 0.42],
  [2.4, 0.48],
  [3.3, 0.5],
];
/** Down off the run, toward the plating's underside. */
const DIVE: Nerve = [
  [0.7, 0.3],
  [1.15, 0.7],
  [1.7, 1.05],
];
const TWIG: Nerve = [
  [2.4, 0.48],
  [2.7, 0.8],
  [2.6, 1.05],
];
const TREE: readonly (readonly [Nerve, -1 | 1])[] = [
  [RUN, -1],
  [RUN, 1],
  [DIVE, -1],
  [DIVE, 1],
  [TWIG, -1],
  [TWIG, 1],
];

/** How lit the nerves are with her shield this many columns off the socket:
 * the whole of it in the column, a flicker one off, nothing further. */
const UNDER = [1, 0.4] as const;
/** The pulses climbing from her shield to the body: how many at once, and
 * how many times a second each one sets off. */
const PULSES = 3;
const CLIMB_HZ = 0.7;
/** A streak's length, as a share of the whole climb. */
const STREAK = 0.1;
/** Points along the cord the climbing light is drawn through. */
const CORD_STEPS = 14;

export function paintLitNerves(d: LedgerNerveDraw): void {
  const { ctx, l, at, time } = d;
  const lit = UNDER[d.off] ?? 0;
  if (lit <= 0 || l.tile <= 0) return;
  // The flicker the owner liked: a fast tremble on top of the light.
  const throb = 0.8 + 0.2 * Math.sin(time * 23) * Math.sin(time * 9);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const drop = at.y - d.surfaceY(at.x);
  for (const [nerve, side] of TREE) {
    const pts = nerve.map(([dx, dy]) => {
      const x = at.x + side * dx * l.tile;
      // Under the plating where it actually is, so a run follows the skin's bow.
      return { x, y: d.surfaceY(x) + dy * l.tile + drop };
    });
    nerveLine(ctx, l, pts, lit * throb);
    knot(ctx, l, pts[pts.length - 1] as Point, lit * throb);
  }
  // The trunk: from her shield block up through the ship into the socket.
  const trunk = trunkPoints(at, d.shield);
  nerveLine(ctx, l, trunk, lit * throb);
  knot(ctx, l, d.shield, lit * throb);
  if (d.off === 0) climb(ctx, l, d, trunk, throb);
  ctx.restore();
}

/** Her shield to the socket, kinked twice the way a nerve runs. */
function trunkPoints(at: Point, shield: Point): Point[] {
  const span = shield.y - at.y;
  const lean = shield.x - at.x;
  return [
    shield,
    { x: shield.x - lean * 0.3 + span * 0.05, y: shield.y - span * 0.35 },
    { x: at.x + lean * 0.25 - span * 0.04, y: shield.y - span * 0.7 },
    at,
  ];
}

/** The halo, the nerve and its hot core. */
function nerveLine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pts: readonly Point[],
  k: number,
): void {
  const p = new Path2D();
  const first = pts[0] as Point;
  p.moveTo(first.x, first.y);
  for (let i = 1; i < pts.length; i++) p.lineTo((pts[i] as Point).x, (pts[i] as Point).y);
  ctx.strokeStyle = rgba(PALETTE.hull, 0.45 * k);
  ctx.lineWidth = l.tile * 0.4;
  ctx.stroke(p);
  ctx.strokeStyle = rgba(PALETTE.hull, 0.95 * k);
  ctx.lineWidth = l.tile * 0.13;
  ctx.stroke(p);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9 * k);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.035);
  ctx.stroke(p);
}

/** A knot where a nerve ends. */
function knot(ctx: CanvasRenderingContext2D, l: Layout, p: Point, k: number): void {
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85 * k);
  ctx.beginPath();
  ctx.arc(p.x, p.y, l.tile * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The pulses climbing from her shield to the body: up the trunk, then up the
 * cord from the socket to where it leaves the body — `ledgerCordAt`, so the
 * light rides the line the cord is drawn on rather than one of its own.
 */
function climb(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: LedgerNerveDraw,
  trunk: readonly Point[],
  throb: number,
): void {
  const cord = (u: number): Point => ledgerCordAt(l, d.root, d.socket, d.taut, d.time, 1 - u);
  // The cord lit faintly the whole way up while the ward is set.
  const line = new Path2D();
  const start = cord(0);
  line.moveTo(start.x, start.y);
  for (let i = 1; i <= CORD_STEPS; i++) {
    const p = cord(i / CORD_STEPS);
    line.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.3 * throb);
  ctx.lineWidth = l.tile * 0.16;
  ctx.stroke(line);
  // Each pulse spends the first fifth of its climb on the trunk, the rest on
  // the cord, and is a streak rather than a ball: a ball on the cord is what
  // a return looks like.
  const at = (s: number): Point => (s < 0.2 ? along(trunk, s / 0.2) : cord((s - 0.2) / 0.8));
  for (let i = 0; i < PULSES; i++) {
    const head = (d.time * CLIMB_HZ + i / PULSES) % 1;
    const fade = Math.min(1, (1 - head) * 4);
    const streak = new Path2D();
    const tail = at(Math.max(0, head - STREAK));
    streak.moveTo(tail.x, tail.y);
    for (let k = 1; k <= 4; k++) {
      const p = at(Math.max(0, head - STREAK * (1 - k / 4)));
      streak.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = rgba(PALETTE.hull, 0.6 * fade * throb);
    ctx.lineWidth = l.tile * 0.34;
    ctx.stroke(streak);
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.95 * fade);
    ctx.lineWidth = l.tile * 0.1;
    ctx.stroke(streak);
  }
}

/** A point `u` of the way along a polyline, by segment count. */
function along(pts: readonly Point[], u: number): Point {
  const f = u * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(f));
  const a = pts[i] as Point;
  const b = pts[i + 1] as Point;
  const k = f - i;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}
