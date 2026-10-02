import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **Was that right?** — answered on the thing the thumb touched, the moment
 * the simulation has judged it.
 *
 * The owner, 24 September 2026: *there should be always in general some
 * visual if player did correct or not, immediately, e.g. green or red colour
 * of the circle he touched with animation* (`.claude/skills/new-boss/generic.md`).
 * So a touch that moved the part throws a `good` wash and ring off the mark,
 * and a touch that was refused or let the part slip throws a `red` one, both
 * widening and fading over `VERDICT_SECONDS`. Green is `good`'s own reserved
 * meaning — the one thing in the game that goes right — which is exactly what
 * a landed touch is (`palette.ts`).
 *
 * **One verdict per mark**, not a list: a second answer inside the fade
 * replaces the first, so a mark is never shown two opinions at once. The key
 * is the mark rather than a point, because a mark rides its boss's body and
 * only the drawer knows where it is this frame.
 *
 * Written for any boss with a mark to hold one of; THE INSTAR is the worked
 * example the owner asked for before the rest (`instar-fx.ts`), and the
 * roll-out is `docs/queue.md`'s.
 */

/** How long a verdict takes to widen out and fade, in seconds. */
export const VERDICT_SECONDS = 0.6;

export interface GripVerdict {
  good: boolean;
  /** Seconds since the verdict was given. */
  age: number;
}

export class GripVerdicts {
  private readonly marks = new Map<number, GripVerdict>();

  /** The simulation has judged a touch on mark `key`. */
  mark(key: number, good: boolean): void {
    this.marks.set(key, { good, age: 0 });
  }

  /** Mark `key`'s verdict still on screen, or nothing. */
  at(key: number): GripVerdict | null {
    return this.marks.get(key) ?? null;
  }

  update(dt: number): void {
    for (const [key, v] of this.marks) {
      v.age += dt;
      if (v.age >= VERDICT_SECONDS) this.marks.delete(key);
    }
  }

  clear(): void {
    this.marks.clear();
  }
}

/**
 * The verdict round a mark of radius `r` at `x, y`: the mark itself washed in
 * the colour for the first third, so it reads as the circle turning green or
 * red and not merely circled, and a ring opening from its edge to twice it as
 * it fades. `alpha` scales all of it, for a mark on a body that fades itself
 * (THE FLUE spent): the ring's glow does not read the caller's alpha, and the
 * rim is drawn at `alpha`.
 */
export function drawVerdictRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  v: GripVerdict,
  alpha = 1,
): void {
  noteVerdict(ctx, x, y, r, v);
  const t = Math.min(1, Math.max(0, v.age / VERDICT_SECONDS));
  const fade = 1 - t;
  const colour = v.good ? PALETTE.good : PALETTE.red;
  const rim = v.good ? PALETTE.goodRim : PALETTE.redRim;
  if (t < 0.35) {
    const wash = new Path2D();
    wash.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(colour, 0.6 * (1 - t / 0.35) * alpha);
    ctx.fill(wash);
  }
  const ring = new Path2D();
  ring.arc(x, y, r * (1 + t), 0, Math.PI * 2);
  strokeGlow(ctx, ring, colour, STROKE.outline * (1.5 - 0.5 * t), 1.4 * fade, fade * alpha);
  ctx.globalAlpha = alpha;
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(rim, fade);
  ctx.stroke(ring);
}

/**
 * **Where a verdict landed this frame, on the screen**, for the one reader
 * that has to find it again away from the boss that drew it: the glow round
 * this device's own thumb (`thumb-aura.ts`). A thumb covers the mark it is
 * on, so the green or red thrown off the mark is under it; the aura is drawn
 * wider than the thumb and borrows the mark's answer.
 *
 * Every boss draws its verdicts through `drawVerdictRing`, in whatever frame
 * its drawer stood in — translated to a drum, turned by a list — so the spot
 * is kept in the canvas's own pixels, and the reader turns it back. A canvas
 * nobody is watching keeps nothing: `watchVerdicts` starts the list and
 * `verdictsDrawn` takes it.
 */
export interface VerdictSpot {
  /** Centre and radius in the canvas's own pixels. */
  x: number;
  y: number;
  r: number;
  /** The verdict itself — the same object for as long as it is on screen. */
  v: GripVerdict;
}

const watched = new WeakMap<CanvasRenderingContext2D, VerdictSpot[]>();

/** Begin keeping this frame's verdict spots on `ctx`. */
export function watchVerdicts(ctx: CanvasRenderingContext2D): void {
  watched.set(ctx, []);
}

/** The spots kept since `watchVerdicts`, and the watch over. */
export function verdictsDrawn(ctx: CanvasRenderingContext2D): readonly VerdictSpot[] {
  const spots = watched.get(ctx) ?? [];
  watched.delete(ctx);
  return spots;
}

function noteVerdict(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  v: GripVerdict,
): void {
  const spots = watched.get(ctx);
  if (spots === undefined) return;
  const m = ctx.getTransform();
  const scale = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
  spots.push({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f, r: r * scale, v });
}
