import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { hazed, nearness } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawRaisinAt } from "./strand-bead.js";
import { drawFuseBlast, drawFuseFront, drawFusePop } from "./strand-fuse-draw.js";

/**
 * THE STRAND's thread going, drawn as a fuse.
 *
 * The owner, 11 September 2026: *when all bulb and slick are destroyed there
 * must be a nice animation how the string is destroyed — like a fuse in the
 * air, a bigger effect.* Until then the thread parting was twenty-four grey
 * particles at its middle, the same puff a wheel's hub gets — and a wheel's
 * hub is one tile, where a thread is the width of an arrival the pair counted
 * along for six beats. The end of it is owed the whole line.
 *
 * So: the line is rebuilt from the beads the event carries, on the tiles they
 * stood on when it went (`events-strand.ts`), with the same sags `strand.ts`
 * hung it with. It is **lit at both ends** and burns inward, a white-hot point
 * at each front throwing sparks, the violet line still hanging between the
 * two fronts, each raisin still on it until a front reaches it and pops it
 * off. The fronts meet at the middle — the tile the old burst stood on — and
 * that is where the big one goes: a ring, a fan of streaks, a light. Two
 * fronts rather than one, because a fuse lit at one end ends at the far bead,
 * and the middle is where the pair's eye already is: it is the tile the event
 * names and the tile everything that broke here has always burst on.
 *
 * All of it is pure render, off one event; the bodies are gone from the world
 * on the tick it fires, which is why the event carries them.
 */

/** The same sag the living thread hangs with (`strand.ts`), in tiles. */
const SAG = 0.62;
/** Points sampled along each sag — enough for the fronts to move smoothly
 * along a curve the eye reads as one line. */
const STEPS = 12;
/** How long the two fronts take to meet: a floor plus a share per gap, so a
 * long thread burns visibly longer than a short one without the short one
 * being over before it was seen. In seconds; a beat is 0.625 s. */
const BURN_BASE = 0.55;
const BURN_PER_GAP = 0.12;
/** The meeting blast's own life, after the fronts touch. */
const BLAST = 0.5;
/** A raisin's pop as a front reaches it. */
const POP = 0.3;
/** How far past a raisin a front is, in tiles, when the raisin goes. */
const LAG = 0.25;

const LINE = PALETTE.wisp;

export interface FusePoint {
  x: number;
  y: number;
  /** Arc length from the first bead, in pixels. */
  s: number;
}

interface Fuse {
  pts: FusePoint[];
  /** Total arc length. */
  total: number;
  /** Each raisin: its id for the contour clock, and where it sits on the line. */
  beads: { id: number; x: number; y: number; s: number }[];
  /** Seconds the fronts take to meet. */
  burn: number;
  /** Seconds since it was lit. */
  age: number;
  /** The wall clock at the light, so the raisins' wobble carries on from the
   * frame before rather than jumping. */
  time0: number;
  near: number;
  tile: number;
  cfg: SimConfig;
}

/**
 * The thread's line through the beads' tile centres, sampled along the same
 * quadratic sags `strand.ts` draws, with the running arc length on each point.
 * Exported for the test: where the fronts are is a claim about this.
 */
export function sampleThread(centres: { x: number; y: number }[], tile: number): FusePoint[] {
  const first = centres[0];
  if (!first) return [];
  const pts: FusePoint[] = [{ x: first.x, y: first.y, s: 0 }];
  for (let i = 1; i < centres.length; i++) {
    const a = centres[i - 1]!;
    const b = centres[i]!;
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2 + tile * SAG;
    for (let k = 1; k <= STEPS; k++) {
      const t = k / STEPS;
      const x = (1 - t) ** 2 * a.x + 2 * (1 - t) * t * cx + t * t * b.x;
      const y = (1 - t) ** 2 * a.y + 2 * (1 - t) * t * cy + t * t * b.y;
      const prev = pts[pts.length - 1]!;
      pts.push({ x, y, s: prev.s + Math.hypot(x - prev.x, y - prev.y) });
    }
  }
  return pts;
}

/** Where the two fronts stand at `u` of the burn (0 lit, 1 met): arc lengths
 * from the first bead, the left one rising and the right one falling. */
export function fuseFronts(total: number, u: number): [number, number] {
  const half = total / 2;
  return [half * u, total - half * u];
}

/** The point `s` along the line, interpolated between samples. */
function pointAt(pts: FusePoint[], s: number): { x: number; y: number } {
  let i = 1;
  while (i < pts.length - 1 && pts[i]!.s < s) i++;
  const a = pts[i - 1]!;
  const b = pts[i] ?? a;
  const span = b.s - a.s;
  const t = span > 0 ? Math.min(1, Math.max(0, (s - a.s) / span)) : 0;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export class StrandFuseFx {
  private fuses: Fuse[] = [];

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, time: number): void {
    for (const e of events) {
      if (e.type !== "strandBroke" || e.beads.length === 0) continue;
      const centres = e.beads.map((b) => ({ x: tileCX(l, b.col), y: tileCY(l, b.row) }));
      const pts = sampleThread(centres, l.tile);
      const total = pts[pts.length - 1]!.s;
      const beads = e.beads.map((b, i) => {
        const at = pts[i * STEPS]!;
        return { id: b.id, x: at.x, y: at.y, s: at.s };
      });
      this.fuses.push({
        pts,
        total,
        beads,
        burn: BURN_BASE + BURN_PER_GAP * (e.beads.length - 1),
        age: 0,
        time0: time,
        // Hazed by the middle's row: the event fires on the beat, before the
        // fall, so the tiles it names are where the beads were last drawn.
        near: nearness(l, e.row),
        tile: l.tile,
        cfg,
      });
    }
  }

  update(dt: number): void {
    for (const f of this.fuses) f.age += dt;
    this.fuses = this.fuses.filter((f) => f.age < f.burn + BLAST);
  }

  clear(): void {
    this.fuses = [];
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const f of this.fuses) this.drawFuse(ctx, l, f);
  }

  private drawFuse(ctx: CanvasRenderingContext2D, l: Layout, f: Fuse): void {
    const haze = (h: string): string => hazed(f.cfg, h, f.near);
    const u = Math.min(1, f.age / f.burn);
    const [sa, sb] = fuseFronts(f.total, u);
    const mid = pointAt(f.pts, f.total / 2);

    if (u < 1) {
      // What is left of the line, between the two fronts.
      const line = new Path2D();
      const from = pointAt(f.pts, sa);
      line.moveTo(from.x, from.y);
      for (const p of f.pts) if (p.s > sa && p.s < sb) line.lineTo(p.x, p.y);
      const to = pointAt(f.pts, sb);
      line.lineTo(to.x, to.y);
      strokeGlow(ctx, line, haze(LINE), STROKE.outline);
    }

    // The raisins: on the line until a front has got a little past one, then a
    // pop where it hung. The moment is the same rule the fronts move by, so
    // the pop starts on the frame the raisin stops being drawn; the little
    // past is so the end beads, which the fronts are lit *on*, are seen to
    // catch before they go rather than vanishing on the frame of the light.
    for (const b of f.beads) {
      const past = Math.min(b.s, f.total - b.s) + f.tile * LAG;
      const reach = (past / Math.max(1, f.total / 2)) * f.burn;
      if (f.age < reach) drawRaisinAt(ctx, l, f.cfg, b.id, b.x, b.y, f.time0 + f.age, f.near);
      else if (f.age - reach < POP) drawFusePop(ctx, b.x, b.y, f.tile, (f.age - reach) / POP, haze);
    }

    if (u < 1) {
      const a = pointAt(f.pts, sa);
      const b = pointAt(f.pts, sb);
      drawFuseFront(ctx, a.x, a.y, f.tile, f.age, 0, haze);
      drawFuseFront(ctx, b.x, b.y, f.tile, f.age, 1, haze);
      // The two lights closing on each other lift the whole line a little.
      halo(ctx, mid.x, mid.y, f.tile * 1.2, haze(PALETTE.ember), 0.05 + 0.15 * u);
    } else {
      drawFuseBlast(ctx, mid.x, mid.y, f.tile, (f.age - f.burn) / BLAST, haze);
    }
  }
}
