import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { plumbBeamEnd, plumbCoreAt } from "./plumb-shape.js";

type Point = { x: number; y: number };

/** How much of the way the running light covers, as a share of it. */
const TAIL = 0.3;
/** Where on the way the light is into the stone, and its rim starts to take it. */
const INTO_STONE = 0.8;

/**
 * **THE PLUMB's spent light running out to a stone** (§31 row 11, its sixth
 * pose): out of the core, up the neck to the beam, along it to side `side`'s
 * end, down the chain and into the stone at `ball`, its head `bled` of the way
 * there. White as it leaves the core and the bob's own bronze by the time it
 * is in the stone — no cannon colour, since nothing is being asked for — and
 * the stone's rim takes the last of it. The whole way rather than the chain
 * alone, so the run is long enough to be seen running on a phone. Drawn in
 * the hook's frame, after the bob; called only while it bleeds.
 */
export function drawPlumbBleed(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  skew: number,
  side: 0 | 1,
  ball: Point & { r: number },
  bled: number,
): void {
  const ends = [plumbBeamEnd(l, 0, skew), plumbBeamEnd(l, 1, skew)] as const;
  const way = [
    plumbCoreAt(l, { x: 0, y: 0 }, skew),
    { x: (ends[0].x + ends[1].x) / 2, y: (ends[0].y + ends[1].y) / 2 },
    ends[side],
    ball,
  ];
  const colour = mixHex(PALETTE.plumbBleed, PALETTE.plumbBronze, bled);
  const strength = 1 - 0.7 * bled;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const run = along(way, Math.max(0, bled - TAIL), bled);
  ctx.lineWidth = STROKE.outline * 3;
  ctx.strokeStyle = rgba(colour, 0.2 * strength);
  ctx.stroke(run.path);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(colour, 0.9 * strength);
  ctx.stroke(run.path);

  const halo = new Path2D();
  halo.arc(run.head.x, run.head.y, 0.32 * l.tile, 0, Math.PI * 2);
  ctx.fillStyle = rgba(colour, 0.22 * strength);
  ctx.fill(halo);
  const bead = new Path2D();
  bead.arc(run.head.x, run.head.y, 0.14 * l.tile, 0, Math.PI * 2);
  ctx.fillStyle = rgba(colour, strength);
  ctx.fill(bead);

  const taken = (bled - INTO_STONE) / (1 - INTO_STONE);
  if (taken > 0) {
    const rim = new Path2D();
    rim.arc(ball.x, ball.y, ball.r * 1.05, 0, Math.PI * 2);
    ctx.lineWidth = STROKE.outline * 2;
    ctx.strokeStyle = rgba(colour, 0.6 * Math.sin(Math.PI * Math.min(1, taken)));
    ctx.stroke(rim);
  }
  ctx.restore();
}

/** The stretch of polyline `way` from share `from` to share `to` of its length, and the point at `to`. */
function along(way: readonly Point[], from: number, to: number): { path: Path2D; head: Point } {
  const legs = way
    .slice(1)
    .map((p, i) => Math.hypot(p.x - (way[i]?.x ?? 0), p.y - (way[i]?.y ?? 0)));
  const total = Math.max(
    1e-6,
    legs.reduce((a, b) => a + b, 0),
  );
  const at = (share: number): Point => {
    let left = share * total;
    for (let i = 0; i < legs.length; i++) {
      const len = legs[i] ?? 0;
      const a = way[i] as Point;
      const b = way[i + 1] as Point;
      if (left <= len || i === legs.length - 1) {
        const f = len > 0 ? Math.min(1, left / len) : 0;
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      }
      left -= len;
    }
    return way[way.length - 1] as Point;
  };
  const path = new Path2D();
  const start = at(from);
  path.moveTo(start.x, start.y);
  let run = 0;
  for (let i = 0; i < legs.length; i++) {
    run += legs[i] ?? 0;
    const share = run / total;
    if (share > from && share < to) {
      const p = way[i + 1] as Point;
      path.lineTo(p.x, p.y);
    }
  }
  const head = at(to);
  path.lineTo(head.x, head.y);
  return { path, head };
}
