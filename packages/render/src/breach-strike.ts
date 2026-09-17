import { isWardable, type SimEvent } from "@neon-spore/sim";
import { breachHue } from "./breach-hue.js";
import { BREACH_STRIKE_LOOK, type BreachStrikeLook } from "./breach-look.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **The hit that loses the wave, seen happening.**
 *
 * One `breach` event, held from the frame the body visibly arrives until the
 * look says the strike is over. What it draws is `BREACH_STRIKE_LOOK`'s, and
 * the shipped record draws nothing at all — this class is the seam a VERSUS
 * candidate reaches through, on `Debris`'s terms and for `breach-look.ts`'s
 * reasons.
 *
 * **It waits for the rock, and that is the only rule in the file.** The
 * simulation resolves the hit on the beat; a rock is still visibly in the air
 * for a fraction of a second after that while `rock-impact.ts` replays the
 * last step of its fall. A strike that fired on the event would be the ship
 * breaking before anything reached it — the defect `arrivals.ts` was written
 * for, and the reason a scar's crack is gated the same way (`scars.ts`). A
 * living creature has no replay to wait for and strikes at once.
 *
 * **Held by `RenderState` rather than by `Effects`**, on `fence-strike.ts`'s
 * terms: it is drawn over the lit rim `drawHull` has just put down, and
 * everything `Effects` owns goes under it.
 */

/**
 * The longest a strike is kept, seconds, whatever the look asks for.
 *
 * A ceiling rather than the look's own `seconds`, and the difference is the
 * monkeypatch. A candidate's record is in place for the length of one
 * `draw()` and not for the `update()` before it, so a list pruned against the
 * *shipped* `seconds` — zero — would throw every strike away before the frame
 * that was going to draw it. So the clock is kept here and read there: `draw`
 * asks the look how far through the strike is, and this only stops a wave of
 * them growing without end.
 */
const KEPT_SECONDS = 6;

/**
 * The number two hits in one wave differ by, and two devices do not.
 *
 * The column and the beat as one number, which is `sparks.ts`'s own trick and
 * is what `breach-either.ts` tosses to pick a tear or a blow. It is a function
 * rather than an expression in this file because the lost screen replays the
 * hit that ended the wave and has to toss the same coin — a second copy of
 * `col * 97 + beat` would be two pictures of one hit (`lost-screen.ts`).
 */
export function strikeSeed(col: number, beat: number): number {
  return col * 97 + beat;
}

interface Strike {
  readonly col: number;
  readonly beat: number;
  readonly span: number;
  readonly hex: string;
  readonly seed: number;
  /** Seconds since it visibly landed. */
  age: number;
}

/** One waiting for its rock to come down. */
interface Pending extends Strike {
  readonly wardable: boolean;
}

export class BreachStrike {
  private waiting: Pending[] = [];
  private live: Strike[] = [];

  /** One frame's events. The same `breach` the bursts ride in on next door. */
  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type !== "breach") continue;
      this.waiting.push({
        col: e.col,
        beat: e.beat,
        span: e.span,
        hex: breachHue(e.kind, e.color),
        seed: strikeSeed(e.col, e.beat),
        age: 0,
        wardable: isWardable(e.kind),
      });
    }
  }

  /**
   * One frame. `arrived` is `Effects.arrivals.has` — whether the rock that
   * caused this has been drawn reaching the hull yet.
   */
  update(dt: number, arrived: (col: number, beat: number) => boolean): void {
    // The clock first and the promotions after it, so a strike that goes live
    // on this frame is drawn at `t` of 0 rather than one frame in. The picture
    // is the moment of the hit, and a picture that starts a frame late has
    // already missed its own brightest frame.
    for (let i = this.live.length - 1; i >= 0; i--) {
      const s = this.live[i] as Strike;
      s.age += dt;
      if (s.age >= KEPT_SECONDS) this.live.splice(i, 1);
    }
    for (let i = this.waiting.length - 1; i >= 0; i--) {
      const p = this.waiting[i] as Pending;
      if (p.wardable && !arrived(p.col, p.beat)) continue;
      this.waiting.splice(i, 1);
      this.live.push({ col: p.col, beat: p.beat, span: p.span, hex: p.hex, seed: p.seed, age: 0 });
    }
  }

  /** Whatever the look draws, once per hit still inside its own clock. */
  draw(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY): void {
    const look: BreachStrikeLook = BREACH_STRIKE_LOOK;
    if (look.seconds <= 0) return;
    for (const s of this.live) {
      const t = s.age / look.seconds;
      if (t >= 1) continue;
      const x = tileCX(l, s.col);
      look.paint(ctx, {
        x,
        y: surfaceY(x),
        tile: l.tile,
        span: s.span,
        t,
        hex: s.hex,
        surfaceY,
        l,
        seed: s.seed,
      });
    }
  }

  clear(): void {
    this.waiting.length = 0;
    this.live.length = 0;
  }
}
