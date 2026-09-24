import type { Point } from "@neon-spore/content";
import type { Scar } from "@neon-spore/sim";
import { LID } from "./crater-geom.js";
import { strokeGlow } from "./glow.js";
import { stream } from "./hash.js";
import type { HullSkin } from "./hull-skin.js";
import { type Layout, tileCX } from "./layout.js";
import { STROKE } from "./palette.js";
import { tileSeed } from "./tile-seed.js";

/**
 * A plate of the hull that is **gone**, drawn as a hole in the outline.
 *
 * One maker: a tall lobe of THE UNDERTOW withdrawing untaken takes its own
 * column's plating and the neighbour's with it (`sim/undertow-step.ts`, the
 * design's step 9), and the scar it leaves says so (`Scar.plate`). A crack is
 * the wrong picture for that — a crack is plating that tore and stayed — so
 * `scars.ts` draws none for it, and the rim `drawHull` strokes is cut out
 * over the gap the way it is cut out over a crater's mouth
 * (`clipOutMouths`): a hull two columns shorter has to *be* shorter, in the
 * one line the eye reads the ship's silhouette from. What is drawn in the
 * gap is the dark of the ship's own depth, walled and floored in the rim's
 * colour, so the outline visibly goes down, along and up — the design's step
 * 10, *the pair can see the shape of their own losses*.
 *
 * Two adjacent plates gone on the same beat are one gap, not two notches: it
 * was one lobe. The floor's jitter comes off the column and the beat, so the
 * same loss looks the same on both screens without the simulation storing
 * it. Everything is clipped to the ship's own filled contour by the caller,
 * for the crater's reason: inside the membrane is the only place a hole in
 * the membrane can be.
 */

/** How deep the gap goes below the skin, in tiles: the plate's own thickness. */
const DEPTH = 0.42;
/** How far in from the columns' edges the walls stand, in tiles, so two
 * separate losses side by side stay two. */
const INSET = 0.05;
/** How far a torn wall leans inward at its foot, in tiles. */
const LEAN = 0.08;
/** The floor's unevenness, in tiles either way. */
const ROUGH = 0.07;
/** Points along the floor, per column gone. */
const PER_COL = 3;

export interface PlateGap {
  /** Which columns' plating is gone, ascending. */
  cols: readonly number[];
  /** Where the hole cuts the skin, left and right, in stage pixels. */
  left: number;
  right: number;
  /** The skin's height at each edge — what the rim's gap is measured around. */
  topLeft: number;
  topRight: number;
  /** Seeds the floor's jitter: the first column and the beat it went. */
  seed: number;
}

/** Every plate gone, as gaps: neighbouring plate scars of one beat joined into one. */
export function plateGaps(
  l: Layout,
  scars: readonly Scar[],
  skinAt: (x: number) => Point,
): PlateGap[] {
  const plates = scars.filter((s) => s.plate === true).sort((a, b) => a.col - b.col);
  const out: PlateGap[] = [];
  let run: Scar[] = [];
  const flush = () => {
    const first = run[0];
    const last = run[run.length - 1];
    if (first === undefined || last === undefined) return;
    const left = tileCX(l, first.col) - l.tile * (0.5 - INSET);
    const right = tileCX(l, last.col) + l.tile * (0.5 - INSET);
    out.push({
      cols: run.map((s) => s.col),
      left,
      right,
      topLeft: skinAt(left).y,
      topRight: skinAt(right).y,
      seed: tileSeed(first.col, first.beat),
    });
    run = [];
  };
  for (const s of plates) {
    const prev = run[run.length - 1];
    if (prev !== undefined && (s.col !== prev.col + 1 || s.beat !== prev.beat)) flush();
    run.push(s);
  }
  flush();
  return out;
}

/**
 * Cut the gaps out of whatever is stroked next — the hull's rim. Even-odd
 * against the whole screen, the way `clipOutMouths` does it, and composable
 * with it: a second clip intersects the first.
 */
export function clipOutPlates(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  gaps: readonly PlateGap[],
): void {
  if (gaps.length === 0) return;
  const p = new Path2D();
  p.rect(0, 0, l.width, l.height);
  const pad = l.tile * 0.3;
  for (const g of gaps) {
    const top = Math.min(g.topLeft, g.topRight) - LID - pad;
    const bottom = Math.max(g.topLeft, g.topRight) + pad;
    p.rect(g.left, top, g.right - g.left, bottom - top);
  }
  ctx.clip(p, "evenodd");
}

/** The walls and the floor, as one open run left to right, from a hair above the skin. */
function edge(l: Layout, g: PlateGap, skinAt: (x: number) => Point): Point[] {
  const rnd = stream(g.seed);
  const depth = l.tile * DEPTH;
  const lean = l.tile * LEAN;
  const pts: Point[] = [{ x: g.left, y: g.topLeft - LID }];
  const n = PER_COL * g.cols.length;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const x = g.left + lean + (g.right - g.left - lean * 2) * f;
    pts.push({ x, y: skinAt(x).y + depth + (rnd() - 0.5) * l.tile * ROUGH * 2 });
  }
  pts.push({ x: g.right, y: g.topRight - LID });
  return pts;
}

/**
 * The gaps themselves: the dark of what is gone, and the rim carried down
 * round it. Drawn after the cracks and the craters and, like them, inside
 * the caller's clip to the ship's fill.
 */
export function drawPlateGaps(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  gaps: readonly PlateGap[],
  skin: HullSkin,
  skinAt: (x: number) => Point,
): void {
  for (const g of gaps) {
    const run = edge(l, g, skinAt);
    const open = new Path2D();
    const hole = new Path2D();
    for (let i = 0; i < run.length; i++) {
      const p = run[i]!;
      if (i === 0) {
        open.moveTo(p.x, p.y);
        hole.moveTo(p.x, p.y);
      } else {
        open.lineTo(p.x, p.y);
        hole.lineTo(p.x, p.y);
      }
    }
    hole.closePath();
    ctx.save();
    ctx.fillStyle = skin.body[3];
    ctx.fill(hole);
    ctx.lineJoin = "round";
    strokeGlow(ctx, open, skin.rim, STROKE.outline, 0.7 * (skin.rimGlow ?? 1));
    ctx.restore();
  }
}
