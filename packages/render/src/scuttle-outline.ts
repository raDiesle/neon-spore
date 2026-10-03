import type { SimConfig } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { type Point, SOCKET_HALF_H, SOCKET_HALF_W, scuttleBox } from "./scuttle-shape.js";

/**
 * **THE SCUTTLE's two outlines** — the slab and a plate — each laid once as
 * a run of straight and curved pieces, and handed out both as the path the
 * drawers fill (`scuttle-draw.ts`, `scuttle-metal.ts`, `scuttle-fx.ts`) and
 * as the points along it a bolt meets (`scuttle-stop.ts`), so the two can
 * never be two shapes.
 */

/** A closed outline from `start`: each piece a line to `to`, or a quadratic through `ctrl`. */
export interface ScuttleOutline {
  start: Point;
  pieces: { to: Point; ctrl?: Point }[];
}

/** The outline as a closed path. */
export function outlinePath(o: ScuttleOutline): Path2D {
  const p = new Path2D();
  p.moveTo(o.start.x, o.start.y);
  for (const { to, ctrl } of o.pieces) {
    if (ctrl === undefined) p.lineTo(to.x, to.y);
    else p.quadraticCurveTo(ctrl.x, ctrl.y, to.x, to.y);
  }
  p.closePath();
  return p;
}

/** Points along the outline: every corner, and each curve in `steps` straight pieces, closer than a pixel to it. */
export function outlinePoints(o: ScuttleOutline, steps = 8): Point[] {
  const out: Point[] = [o.start];
  let from = o.start;
  for (const { to, ctrl } of o.pieces) {
    if (ctrl !== undefined)
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        out.push({
          x: u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x,
          y: u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y,
        });
      }
    out.push(to);
    from = to;
  }
  return out;
}

/**
 * The slab as a closed contour: an arched top, flanks that bulge out a
 * little and breathe, and an underside scalloped once a column — a jaw of
 * lobes over the sockets rather than a box round them, since a box over
 * the field is a panel and a lobed mass is a body (`CLAUDE.md`). `open`
 * closes it in on the middle column, for the frame on its way out.
 */
export function scuttleSlab(
  l: Layout,
  cfg: SimConfig,
  rise: number,
  open: number,
  time: number,
): ScuttleOutline {
  const box = scuttleBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * open;
  const top = box.top - rise;
  const bottom = box.bottom - rise;
  const flank = l.tile * (0.08 + 0.02 * Math.sin(time * 1.3));
  const arch = l.tile * 0.12;
  const lobe = l.tile * 0.1;
  const pieces: ScuttleOutline["pieces"] = [
    { ctrl: { x: mid, y: top - arch }, to: { x: mid + hw, y: top + arch } },
    {
      ctrl: { x: mid + hw + flank, y: (top + bottom) * 0.5 },
      to: { x: mid + hw, y: bottom - lobe },
    },
  ];
  const n = Math.max(1, cfg.scuttleCols);
  for (let i = n - 1; i >= 0; i--) {
    const x0 = mid + hw - ((n - i) * hw * 2) / n;
    const x1 = x0 + (hw * 2) / n;
    pieces.push({
      ctrl: { x: (x0 + x1) * 0.5, y: bottom + lobe },
      to: { x: x0, y: bottom - lobe },
    });
  }
  pieces.push({
    ctrl: { x: mid - hw - flank, y: (top + bottom) * 0.5 },
    to: { x: mid - hw, y: top + arch },
  });
  return { start: { x: mid - hw, y: top + arch }, pieces };
}

/** The slab's path (`scuttleSlab`). */
export function scuttleSlabPath(
  l: Layout,
  cfg: SimConfig,
  rise: number,
  open: number,
  time: number,
): Path2D {
  return outlinePath(scuttleSlab(l, cfg, rise, open, time));
}

/**
 * A socket's plate as a closed shape: a flat-topped lobe, wider than it is
 * tall, with its lower corners rounded off — a rock's outline squashed into
 * a slot, so that a row of them reads as plating and one hanging alone reads
 * as a thing that was plating a moment ago. `open` closes it inward, for the
 * frame on its way out; `half` is a hanging plate's slimmer half height.
 */
export function scuttlePlate(l: Layout, c: Point, open = 1, half = SOCKET_HALF_H): ScuttleOutline {
  const hw = l.tile * SOCKET_HALF_W * open;
  const hh = l.tile * half;
  return {
    start: { x: c.x - hw, y: c.y - hh },
    pieces: [
      { to: { x: c.x + hw, y: c.y - hh } },
      { to: { x: c.x + hw, y: c.y + hh * 0.2 } },
      { ctrl: { x: c.x + hw, y: c.y + hh }, to: { x: c.x + hw * 0.6, y: c.y + hh } },
      { to: { x: c.x - hw * 0.6, y: c.y + hh } },
      { ctrl: { x: c.x - hw, y: c.y + hh }, to: { x: c.x - hw, y: c.y + hh * 0.2 } },
    ],
  };
}

/** The plate's path (`scuttlePlate`). */
export function scuttlePlatePath(l: Layout, c: Point, open = 1, half = SOCKET_HALF_H): Path2D {
  return outlinePath(scuttlePlate(l, c, open, half));
}
