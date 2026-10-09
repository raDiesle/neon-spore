import type { LampreyState, SimConfig, SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-boss.js";
import type { LampreyPose } from "./lamprey-shape.js";
import { lampreyTowPoint } from "./lamprey-tow-grip.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE LAMPREY losing its temper in a tow** (`sim/lamprey-tow.ts`, the
 * owner, 9 October 2026: *the worm starts to be angry and some shaking and it
 * moves some more down to ship*). The simulation throws the head back to a
 * third of the curve in one tick; this is how it gets there on the screen.
 *
 * **The lunge**: from where the head was when it lost its temper, down the
 * curve at the hull and past where it lands, then back onto it — in the first
 * third of the fit. **The shaking**: the whole eel thrown from side to side,
 * its body whipping about the way it lies, dying away over the fit. And a
 * spray of red off the mouth as it goes.
 *
 * Read off the pose the drawer has just worked out (`apply`): the head sets
 * off from the point the simulation lost its temper at,
 * `lampreyTowAngerMilli` along the curve, and lands where it put it — never
 * from a frame painted before, which a dropped frame would not have. Cleared in
 * `Effects.reset()` with the rest of `lamprey-fx.ts` (`restart.test.ts`).
 */

/** How long the fit lasts, in seconds. */
const FIT_SECONDS = 1.1;
/** How much of the fit the lunge takes. */
const LUNGE = 0.25;
/** How far past where it lands the lunge carries the head at the hull, in tiles. */
const PAST_TILES = 1.1;
/** How far the eel is thrown from side to side at the fit's height, in tiles, and how often a second. */
const SHAKE_TILES = 0.32;
const SHAKE_HZ = 9;
/** How far the body whips about the way it lies, radians. */
const WHIP = 0.55;

export class LampreyAnger {
  private left = 0;

  /** How far into its fit the eel is: 1 the instant it lost its temper, 0 over. */
  get now(): number {
    return this.left / FIT_SECONDS;
  }

  ingest(events: readonly SimEvent[], pose: LampreyPose | null, burst: Burst): void {
    for (const e of events) {
      if (e.type !== "lampreyAnger") continue;
      this.left = FIT_SECONDS;
      if (pose !== null) burst(pose.x, pose.y, 14, PALETTE.red);
    }
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
  }

  /** The pose as the fit throws it about this frame; the pose itself once it is over, or out of a tow. */
  apply(p: LampreyPose, l: Layout, cfg: SimConfig, s: LampreyState, time: number): LampreyPose {
    if (this.left === 0 || s.phase !== "bite" || !s.angered) return p;
    const tile = l.tile;
    const from = lampreyTowPoint(l, cfg, s, cfg.lampreyTowAngerMilli);
    const k = 1 - this.left / FIT_SECONDS;
    const lunge = Math.min(1, k / LUNGE);
    const ease = 1 - (1 - lunge) ** 3;
    const dx = p.x - from.x;
    const dy = p.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    // Past where it lands and back, the overshoot at its deepest half way through the lunge.
    const past = Math.sin(Math.min(1, k / (LUNGE * 2)) * Math.PI) * PAST_TILES * tile;
    const fade = 1 - k;
    const swing = Math.sin(time * Math.PI * 2 * SHAKE_HZ);
    const shake = swing * SHAKE_TILES * tile * fade;
    return {
      ...p,
      x: from.x + dx * ease + (dx / len) * past + shake,
      y: from.y + dy * ease + (dy / len) * past,
      lean: p.lean + swing * WHIP * fade,
    };
  }

  clear(): void {
    this.left = 0;
  }
}
