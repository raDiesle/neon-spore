import {
  CANVASES,
  type Cell,
  canvasOf,
  ctxOf,
  inCell,
  type Job,
  lay,
} from "./glance-batch-atlas.js";
import { farDark } from "./glance-layer-halves.js";

/**
 * **Every turned body of a pass laid down ahead of it, in three flushes.**
 *
 * A canvas costs when it is read after being drawn on — Chrome flushes its
 * recorded ops there — and a turned body read three in turn: its part into
 * its halves, the halves into their doubling, the doubling onto the screen
 * (`glance-layer.ts`). On GYRES AGAIN one more such read added 2 to 3 ms at
 * 4x, and one more `drawImage` of a canvas already read nothing
 * (`docs/performance.md`, 15 October 2026).
 *
 * So a pass is run twice. The first time onto a screen-sized canvas nobody
 * reads, and every turned part is drawn into its own cell of one atlas
 * instead of its own layer; then every cell's halves are put together on a
 * second, the whole of it doubled on a third, and the far sides darkened
 * there. The second time onto the screen, and each turned part is that third
 * atlas's cell, laid where the layer would have been. Three flushes a pass,
 * however many bodies turn in it — and the pass's own drawing paid twice.
 *
 * Each cell is clipped to itself at every stage: a half is squeezed and
 * rolled, and on one shared canvas what it drew past its box was added onto
 * the cell beside it. A call the first run did not take, or whose box the
 * second run does not match, is laid down on its own the ordinary way.
 */

/** Pixels left empty between cells, past what a squeeze's filter reads. */
const GAP = 4;
/** The atlases' first height, and the most they grow to. */
const FIRST_H = 512;
const MOST_H = 4096;

let mode: "off" | "collect" | "place" = "off";
let spare: CanvasRenderingContext2D | null = null;
let cells: (Cell | null)[] = [];
let next = 0;
let shelf = { x: 0, y: 0, h: 0 };
let width = 0;
let height = FIRST_H;

/**
 * `pass` run with every turned part it lays down drawn ahead of it: once on a
 * canvas nobody reads, to collect them, and once on `ctx`. A context with no
 * document to make canvases in runs it once, as it always did.
 */
export function layGlancesAhead(
  ctx: CanvasRenderingContext2D,
  pass: (c: CanvasRenderingContext2D) => void,
): void {
  if (typeof document === "undefined" || mode !== "off" || !ctx.canvas) {
    pass(ctx);
    return;
  }
  const { width: w, height: h } = ctx.canvas;
  const s = canvasOf("spare", w, h).getContext("2d");
  if (s === null) {
    pass(ctx);
    return;
  }
  const t = ctx.getTransform();
  s.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
  s.globalAlpha = ctx.globalAlpha;
  s.globalCompositeOperation = ctx.globalCompositeOperation;
  width = Math.max(w, 1);
  for (const a of ["part", "halves", "out"] as const) canvasOf(a, width, height);
  ctxOf("part").clearRect(0, 0, width, height);
  try {
    mode = "collect";
    spare = s;
    cells = [];
    shelf = { x: 0, y: 0, h: 0 };
    pass(s);
    lay(cells, width, Math.min(height, shelf.y + shelf.h + GAP));
    mode = "place";
    next = 0;
    pass(ctx);
  } finally {
    mode = "off";
    spare = null;
    cells = [];
    s.canvas.width = w;
  }
}

/** A cell for a box, on the next shelf with room, or null when the atlas is full. */
function room(box: Job["box"]): { cx: number; cy: number } | null {
  if (box.w > width) return null;
  if (shelf.x + box.w > width) shelf = { x: 0, y: shelf.y + shelf.h + GAP, h: 0 };
  if (shelf.y + box.h > height) {
    // Full: this part is laid down on its own, and the next frame has twice the room.
    height = Math.min(MOST_H, height * 2);
    return null;
  }
  const at = { cx: shelf.x, cy: shelf.y };
  shelf.x += box.w + GAP;
  shelf.h = Math.max(shelf.h, box.h);
  return at;
}

/**
 * Whether the batch took this part: drawn into a cell on the first run, or
 * its cell laid on `ctx` on the second. False, and the caller lays it down
 * on its own, outside a batch and for any call the batch cannot match.
 */
export function batched(
  ctx: CanvasRenderingContext2D,
  job: Job,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): boolean {
  if (mode === "collect") return collect(ctx, job, draw);
  if (mode === "place") return place(ctx, job);
  return false;
}

function collect(
  ctx: CanvasRenderingContext2D,
  job: Job,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): boolean {
  const at = ctx === spare ? room(job.box) : null;
  if (at === null) {
    cells.push(null);
    return false;
  }
  const cell: Cell = { ...job, ...at, paths: [], alpha: ctx.globalAlpha };
  const g = ctxOf("part");
  const { m, box } = job;
  inCell(g, cell);
  g.globalAlpha = ctx.globalAlpha;
  g.globalCompositeOperation = ctx.globalCompositeOperation;
  g.setTransform(m.a, m.b, m.c, m.d, m.e - box.ox + cell.cx, m.f - box.oy + cell.cy);
  cell.paths = draw(g);
  g.restore();
  cells.push(cell);
  return true;
}

function place(ctx: CanvasRenderingContext2D, job: Job): boolean {
  const cell = cells[next++];
  const { box } = job;
  const same =
    cell != null &&
    cell.box.ox === box.ox &&
    cell.box.oy === box.oy &&
    cell.box.w === box.w &&
    cell.box.h === box.h;
  if (!same) return false;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, box.ox, box.oy);
  ctx.globalAlpha = 1;
  ctx.drawImage(
    CANVASES.get("out") as HTMLCanvasElement,
    cell.cx,
    cell.cy,
    box.w,
    box.h,
    0,
    0,
    box.w,
    box.h,
  );
  ctx.restore();
  if (cell.dark <= 0 || cell.atop) return true;
  // The far half's dark, paint over it whatever the blend — as `glance-layer.ts` lays it.
  const over = (c: CanvasRenderingContext2D) => {
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = cell.alpha;
  };
  farDark(ctx, cell.f, cell.far, cell.reach, cell.ramp, over, (c) => {
    for (const p of cell.paths) c.fill(p);
  });
  return true;
}
