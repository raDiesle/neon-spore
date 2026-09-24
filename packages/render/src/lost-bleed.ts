import { signedHash, sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import { curve, type Pt, ribbon, smooth, stream } from "./lost-ribbon.js";
import type { Wound } from "./lost-wound.js";
import { PALETTE } from "./palette.js";

/**
 * What bleeds out of the wound: the pool standing inside its lower rim, and
 * the runs that come over the torn edge and down the plate.
 *
 * Its own file for the reason the violet rivulets had one before it: what the
 * hole *is* — a torn circle with a reticle round it — and what comes out of it
 * are two arguments, and `lost-wound.ts` holds as much of one as a file is
 * allowed to hold.
 *
 * **The owner, 24 September 2026, by name:** the blood should look natural and
 * fluid, come out *from inside to outside*, drop from the corners, and — as
 * blood does — come first as one thick full sheet and then split slowly into
 * two or three smaller flows. So a run is not a tube any more. It starts inside
 * the hole, comes over one of the rim's teeth — the corners the tear left
 * pointing outward, which is where a liquid gathers before it lets go — hangs
 * there as a wide sheet, and only then sends two or three thinner streams down
 * from its foot, each with a heavier bead at its head that slows as it runs.
 *
 * **Every run is one fill.** The sheet, its bead and its streams are subpaths
 * of one `Path2D`, all wound the same way, so where they overlap they fill
 * once and join like one liquid rather than stacking into darker seams — the
 * seams were half of what made the tubes read as plastic.
 *
 * **It is a function of `age` and nothing else.** No state, no `Effects` entry,
 * nothing that outlives a frame (`restart.test.ts`'s rule): the corners come
 * from the rim, every length from an index and the clock, so the screen can be
 * drawn twice on one tick and look the same both times, and two phones bleed
 * the same way.
 */

/** Seconds one run takes from welling to gone, before its variation. */
const LIFE = 17;
/** Share of a run's life spent as one sheet before it splits. */
const SPLIT = 0.24;
/** How far the sheet hangs below its corner, in hole radii. */
const SHEET = 0.95;
/** The sheet's half-width, as a share of the hole's radius. */
const WIDE = 0.27;
/** How far a stream runs past the sheet at full length, in hole radii. */
const REACH = 2.3;
/**
 * The arc the blood hangs off, as a share of a turn clockwise from the right —
 * which on a canvas, where y grows downward, is the **lower** half of the
 * circle. Just short of the two sides, so nothing wells out horizontally.
 */
const HANGS_FROM = 0.04;
const HANGS_TO = 0.46;

/** How many corners bleed at once. */
const RUNS = 3;

/** A tooth of the rim, and how straight down it points, 0 to 1. */
interface Corner {
  readonly at: Pt;
  readonly i: number;
  readonly down: number;
}

/**
 * The pool standing inside the lower rim, its surface breathing.
 *
 * **It is what keeps it bleeding.** A run thins and goes, and a hole with only
 * runs on it empties between them; blood standing in the bottom of the hole
 * the whole time, its surface rising and falling on a slow breath, is the
 * screen saying that more is coming up behind.
 *
 * **It comes up with the wound** (`w.arrive`), like everything the hole wears.
 */
export function pool(ctx: CanvasRenderingContext2D, w: Wound, age: number): void {
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  const steps = 16;
  const depth = 0.3 + 0.06 * Math.sin(age * 0.5);
  for (let s = 0; s <= steps; s++) {
    const turn = HANGS_FROM + ((HANGS_TO - HANGS_FROM) * s) / steps;
    const a = turn * Math.PI * 2;
    const k = rimAt(w, turn) * 1.02;
    outer.push({ x: w.cx + Math.cos(a) * k, y: w.cy + Math.sin(a) * k });
    // Deepest at the bottom and nothing at the two ends, with a slow ripple
    // travelling across it so the surface is a liquid and not a cut.
    const lift = Math.sin((Math.PI * s) / steps) ** 1.3;
    const ripple = 0.025 * Math.sin(s * 1.7 - age * 0.8);
    const rr = w.r * (1 - (depth + ripple) * lift);
    inner.push({ x: w.cx + Math.cos(a) * rr, y: w.cy + Math.sin(a) * rr });
  }
  const p = new Path2D();
  smooth(p, outer, true);
  smooth(p, inner.reverse(), false);
  p.closePath();
  ctx.fillStyle = rgba(PALETTE.red, 0.55 * w.arrive);
  ctx.fill(p);

  const surface = new Path2D();
  smooth(surface, inner, true);
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.3 * w.arrive);
  ctx.lineWidth = Math.max(1, w.r * 0.035);
  ctx.stroke(surface);
}

/**
 * One run off each of the lowest corners of the rim, at `age` — the lowest
 * first and heaviest, because that is where the most of it gathers.
 */
export function runs(ctx: CanvasRenderingContext2D, w: Wound, age: number): void {
  const lowest = corners(w).sort((a, b) => b.down - a.down);
  for (const [j, c] of lowest.slice(0, RUNS).entries()) run(ctx, w, c, j, age);
}

/**
 * The teeth of the lower rim: the points the tear left sticking out further
 * than both neighbours. A liquid coming over a ragged edge gathers at those
 * and lets go from them, and nowhere else.
 */
function corners(w: Wound): Corner[] {
  const n = w.rim.length;
  const out = (i: number) => {
    const q = w.rim[(i + n) % n] as Pt;
    return Math.hypot(q.x - w.cx, q.y - w.cy);
  };
  const found = [];
  for (let i = 0; i < n; i++) {
    const turn = i / n;
    if (turn < HANGS_FROM || turn > HANGS_TO) continue;
    const at = w.rim[i] as Pt;
    const down = (at.y - w.cy) / out(i);
    if (out(i) > out(i - 1) && out(i) > out(i + 1)) found.push({ at, i, down });
  }
  return found;
}

/** The rim's distance from the centre at any share of a turn, between teeth. */
function rimAt(w: Wound, turn: number): number {
  const n = w.rim.length;
  const f = turn * n;
  const a = w.rim[Math.floor(f) % n] as Pt;
  const b = w.rim[(Math.floor(f) + 1) % n] as Pt;
  const t = f - Math.floor(f);
  return (1 - t) * Math.hypot(a.x - w.cx, a.y - w.cy) + t * Math.hypot(b.x - w.cx, b.y - w.cy);
}

/** Fast at first and slowing to a crawl: blood that leaves some of itself
 * behind with every hand's width it runs. */
function slowing(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - (1 - c) ** 2.2;
}

/**
 * One run, at `age`: the sheet over its corner, then the streams off its foot.
 *
 * **The first one starts fresh.** A run's clock begins a moment after the
 * screen does rather than somewhere in the middle of its life, so what the
 * pair see first is the welling — a sheet gathering over each tooth — and the
 * split happens in front of them.
 */
function run(ctx: CanvasRenderingContext2D, w: Wound, c: Corner, j: number, age: number): void {
  const life = LIFE * (1 + sinHash(c.i, 21) * 0.5);
  const since = age - (0.15 + j * 1.6 + sinHash(c.i, 22) * 0.8);
  if (since <= 0) return;
  const t = (since % life) / life;
  const fade = Math.min(1, t / 0.04) * (1 - Math.max(0, (t - 0.8) / 0.2)) * w.arrive;
  if (fade <= 0) return;
  // A corner that points straight down carries more than one off to the side.
  const heavy = 0.55 + 0.45 * c.down;

  const dx = c.at.x - w.cx;
  const dy = c.at.y - w.cy;
  const d = Math.hypot(dx, dy);
  const from = { x: w.cx + (dx / d) * w.r * 0.8, y: w.cy + (dy / d) * w.r * 0.8 };
  const bend = { x: c.at.x + dx * 0.12, y: c.at.y + w.r * 0.12 };
  const hang = w.r * SHEET * heavy * (0.8 + sinHash(c.i, 24) * 0.4) * slowing(t / SPLIT);
  const foot = { x: c.at.x + dx * 0.18 + signedHash(c.i, 25) * w.r * 0.06, y: c.at.y + hang };
  const half = w.r * WIDE * heavy * (0.85 + sinHash(c.i, 26) * 0.3);

  const body = new Path2D();
  const heads = new Path2D();
  const shine: { pts: Pt[]; off: number }[] = [];
  const sheet = curve(from, bend, foot);
  // Wide where it comes over the rim, the way a liquid hugs an edge before it
  // falls, and narrowing to the foot the streams leave from.
  ribbon(body, sheet, (u) => half * (1 + 0.7 * (1 - u) ** 3) * (1 - 0.3 * u));
  shine.push({ pts: sheet.slice(3, 9), off: half * 0.45 });

  // The bead at the sheet's foot: all of it while it is still one sheet, and
  // less of it as the streams carry it away.
  const split = Math.max(0, Math.min(1, (t - SPLIT) / 0.25));
  const bead = half * (1 - 0.28 * split);
  body.moveTo(foot.x + bead, foot.y);
  body.arc(foot.x, foot.y, bead, 0, Math.PI * 2);

  // One stream leads and the others follow later and shorter, so the sheet
  // is seen to *split* rather than to have been drawn with legs.
  const many = sinHash(c.i, 23) > 0.5 ? 3 : 2;
  const lead = Math.floor(sinHash(c.i, 27) * many);
  for (let b = 0; b < many; b++) {
    const late = b === lead ? 0 : 0.06 + 0.08 * sinHash(c.i, 28 + b);
    const grow = slowing((t - SPLIT - late) / (0.8 - SPLIT));
    if (grow <= 0) continue;
    const side = many === 2 ? (b === 0 ? -1 : 1) : b - 1;
    const far = b === lead ? 1 : 0.35 + sinHash(c.i, 30 + b) * 0.35;
    const len = w.r * REACH * heavy * grow * far;
    const wb = half * (b === lead ? 0.5 : 0.36 + sinHash(c.i, 40 + b) * 0.1);
    const pts = stream(foot, side, half, len, w.r, c.i * 7 + b);
    // Out of the sheet's foot as a point rather than a square end, so no
    // edge shows where it leaves, and swelling again into its drop.
    ribbon(body, pts, (u) => wb * Math.min(1, 0.3 + u * 5) * (1.2 - 0.35 * u));
    const head = pts[pts.length - 1] as Pt;
    heads.moveTo(head.x + wb, head.y + wb * 0.15);
    heads.ellipse(head.x, head.y + wb * 0.15, wb, wb * 1.2, 0, 0, Math.PI * 2);
    shine.push({ pts: pts.slice(3, -1), off: wb * 0.45 });
  }

  ctx.fillStyle = rgba(PALETTE.red, 0.72 * fade);
  ctx.fill(body);
  // The head is where a run carries its weight, so it is the densest red on it.
  ctx.fillStyle = rgba(PALETTE.red, 0.85 * fade);
  ctx.fill(heads);
  // One wet line down the left of each part, where the light catches it.
  const gloss = new Path2D();
  for (const { pts, off } of shine) {
    for (const [k, q] of pts.entries()) {
      const x = q.x - off;
      if (k === 0) gloss.moveTo(x, q.y);
      else gloss.lineTo(x, q.y);
    }
  }
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.28 * fade);
  ctx.lineWidth = Math.max(1, half * 0.16);
  ctx.lineCap = "round";
  ctx.stroke(gloss);
}
