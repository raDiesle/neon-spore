import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A boss the pair got the better of shows it took the blow.**
 *
 * The owner, 24 September 2026, generic for every boss: *when player
 * succeeded a sequence, it should have some visual that enemy took damage
 * e.g. its shaking for a moment and body glows red for a moment.* So a
 * boss's fx class holds one `BossHurt`, calls `hit()` on the event that
 * means *a sequence landed*, and its drawer does two things with it: shifts
 * the whole body by `shakeX` and lays `drawHurt` over each of its plates.
 *
 * The decay is linear rather than eased, so the blow is over in a known time
 * and a test can wait it out. It is a transient, held in `Effects` and
 * cleared in `Effects.reset()` (`restart.test.ts`). THE INSTAR is the first
 * to wear it (`instar-fx.ts`); the roll-out is `docs/queue.md`'s.
 */

/** How long the blow shows, in seconds. */
const HURT_SECONDS = 0.5;
/** How far the body is shaken either way at the blow, in tiles. */
const SHAKE_TILES = 0.18;
/** How fast it shakes, in radians a second: quicker than a flinch's shiver. */
const SHAKE_RATE = 55;

export class BossHurt {
  private now = 0;

  /** A sequence landed: the body takes the blow, at `strength` 0..1. */
  hit(strength = 1): void {
    this.now = Math.max(this.now, Math.min(1, strength));
  }

  /** How hard the blow still shows, 0..1. */
  get value(): number {
    return this.now;
  }

  /** The body's sideways shake this frame, in pixels. */
  shakeX(time: number, tile: number): number {
    return hurtShake(this.now, time, tile);
  }

  update(dt: number): void {
    this.now = Math.max(0, this.now - dt / HURT_SECONDS);
  }

  clear(): void {
    this.now = 0;
  }
}

/**
 * The sideways shake of a blow at `value` 0..1, in pixels — for a drawer
 * whose blow is timed by its own picture rather than by an event
 * (`filament-strike.ts`).
 */
export function hurtShake(value: number, time: number, tile: number): number {
  return value * tile * SHAKE_TILES * Math.sin(time * SHAKE_RATE);
}

/** The red over one plate of a body that took the blow: a wash and a hot rim. */
export function drawHurt(ctx: CanvasRenderingContext2D, p: Path2D, hurt: number): void {
  if (hurt <= 0) return;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.red, 0.35 * hurt);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, PALETTE.redRim, STROKE.inner, 1.6 * hurt);
}
