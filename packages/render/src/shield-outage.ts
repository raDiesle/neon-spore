import type { SimEvent } from "@neon-spore/sim";
import { signedHash } from "./hash.js";
import type { LobePositions, SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { rimSpan } from "./shield.js";

/**
 * **The shield's line, put out in places.**
 *
 * THE FENCE is the one arrival that does not strike the ship. It is a live
 * wire the width of the field, and a wall that finds the dome in its way
 * earths through it: the current goes to ground through the one part of the
 * ship built to stand in front of things. The owner asked for the damage to
 * look like what it is — *no cracks on the ship, but outage cracks in some
 * places around the shield line* — and this is that: a handful of dead notches
 * bitten out of the lit rim, each with the wall's own blue still fizzing at its
 * edges, going out over a couple of seconds.
 *
 * **The hull keeps no scar for it, and that is the sim's half of the same
 * decision.** `resolveFence` calls `breachUnscarred`, so the points are still
 * paid and the `breach` event still fires, and there is simply nothing for
 * `scars.ts` to tear the plating open with (`sim/hull-damage.ts`). What is
 * lost is written on the shield instead of in the skin.
 *
 * **It rides the line rather than a column.** The notches are placed along
 * `rimSpan`, so sliding the dome afterwards takes the outage with it: what was
 * put out is the shield, and the shield is a thing that travels. That is also
 * why it fades rather than staying — a scar in the hull is a hole in
 * something that does not move, and a burnt-out stretch of a lobe that crawls
 * along the ship has no fixed place to stay in.
 *
 * **It is held by `RenderState` rather than by `Effects`**, on the same terms
 * as the lure's blast beside it: everything `Effects` owns is drawn inside the
 * field pass and painted over by the hull, and this one is drawn on top of the
 * ship it is about. It is transient state that outlives its frame either way,
 * so `RenderState.forget` clears it when a wave starts over.
 */

/** Seconds a blown line takes to come back. Long enough to be read after the
 * banner that shares the moment with it, short enough that two fences in a
 * wave are two separate outages rather than one that never ends. */
const LIFE = 2.2;

/** How many notches. Enough to read as a line failing along its length rather
 * than as one hole in it, few enough to count at a glance. */
const COUNT = 5;

/** How far along the span the first and last notch sit, so none of them lands
 * on the very tip of the rim where there is no line left to break. */
const INSET = 0.12;

/** How long a dead stretch of the line is, as a share of a tile — the
 * shortest and the longest, so five of them are not five of one thing. An
 * outage in a line is a **piece of it missing**, which is why this runs along
 * the rim rather than across it: the first version cut at the line and read as
 * five little marks laid over an unbroken one. */
const DEAD_MIN = 0.1;
const DEAD_MAX = 0.24;

/** How far the broken ends jag above and below the line, as a share of a tile.
 * Short: what says *crack* is that the two ends do not meet, not the size of
 * the tear. */
const JAG = 0.13;

/** Times a second the fizz at a notch's edges is struck again. */
const FIZZ_HZ = 17;

/** The dark the line is bitten out with — the ship's own deepest body colour,
 * so a notch reads as a hole through the rim to the hull under it rather than
 * as something painted on top. */
const DEAD = "#150632";

export class ShieldOutage {
  /** Seconds left of the outage; 0 when the line is whole. */
  private life = 0;
  /** The column the wall earthed in, and the whole of what the notches are
   * shaped from — so one fence's outage is not a copy of the last one's. */
  private seed = 0;

  /**
   * One frame's events. A wall that found the dome in its way is a `breach`
   * carrying the fence's own kind, and there is no other way to make one — a
   * fence that passes over the ship breaks nothing and leaves the line whole.
   */
  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "breach" && e.kind === "fence") this.hit(e.col);
    }
  }

  /** A wall has earthed through the dome, in that column. */
  hit(col: number): void {
    this.life = LIFE;
    this.seed = col + 1;
  }

  update(dt: number): void {
    this.life = Math.max(0, this.life - dt);
  }

  clear(): void {
    this.life = 0;
    this.seed = 0;
  }

  /** The notches, on the line as it is drawn this frame. */
  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    at: LobePositions,
    surfaceY: SurfaceY,
    time: number,
  ): void {
    if (this.life <= 0) return;
    const span = rimSpan(l, at);
    if (!span) return;
    // Full while the current is still in it, then out. The knee rather than a
    // straight fade: a line that dimmed from the first frame reads as one
    // going out slowly, and what happened here was sudden.
    const left = this.life / LIFE;
    const alpha = Math.min(1, left / 0.55);
    const strike = Math.floor(time * FIZZ_HZ);

    ctx.save();
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    for (let i = 0; i < COUNT; i++) {
      const u = INSET + ((1 - 2 * INSET) * i) / (COUNT - 1);
      const wander = signedHash(this.seed, i) * (1 - 2 * INSET) * 0.08;
      const x = span.from + (span.to - span.from) * Math.min(1, Math.max(0, u + wander));
      const half =
        (l.tile * (DEAD_MIN + (DEAD_MAX - DEAD_MIN) * Math.abs(signedHash(this.seed, i + 5)))) / 2;

      // The dead stretch: a piece of the line itself, painted out in the ship's
      // own deepest body colour and following the membrane so it lies exactly
      // where the rim was. Wide enough to take the rim's glow with it — a
      // hairline would leave the light and remove only the core.
      const dead = new Path2D();
      for (let k = 0; k <= 4; k++) {
        const px = x - half + (2 * half * k) / 4;
        if (k === 0) dead.moveTo(px, surfaceY(px));
        else dead.lineTo(px, surfaceY(px));
      }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = DEAD;
      ctx.lineWidth = Math.max(4, l.tile * 0.15);
      ctx.stroke(dead);

      // And the two ends it broke at, jagged: a short tear up on one side of
      // the line and down on the other, so the gap reads as something that
      // came apart rather than as a piece somebody rubbed out.
      const ends = new Path2D();
      for (const side of [-1, 1]) {
        const px = x + side * half;
        const py = surfaceY(px);
        const lean = signedHash(this.seed, i + 11 + side);
        ends.moveTo(px + lean * half * 0.4, py - l.tile * JAG * 0.6);
        ends.lineTo(px, py);
        ends.lineTo(px - lean * half * 0.5, py + l.tile * JAG * 0.5);
      }
      ctx.lineWidth = Math.max(2, l.tile * 0.05);
      ctx.stroke(ends);

      // The wall's current still in it, at the two raw ends. The fence's blue
      // and not the shield's cyan: what is fizzing there is the thing that did
      // this, and the line it did it to is the part that has gone out.
      ctx.globalAlpha = alpha * (0.3 + 0.45 * Math.abs(signedHash(strike, i)));
      ctx.fillStyle = PALETTE.arc;
      for (const side of [-1, 1]) {
        const px = x + side * half;
        ctx.beginPath();
        ctx.arc(px, surfaceY(px), Math.max(1, l.tile * 0.03), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
