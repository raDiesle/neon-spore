import { strokeGlowFaded } from "./glow.js";
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
 * cleared in `Effects.reset()` (`restart.test.ts`). THE INSTAR was the
 * first to wear it (`instar-fx.ts`); `boss-hurt.test.ts` has a row for each
 * boss whose blow is an event, `boss-hurt-drawn.test.ts` a case for each
 * whose blow is watched or timed by the picture.
 *
 * **Every boss with a body the pair can hurt wears it** (25 September 2026).
 * The four with no fx class of their own keep theirs in `boss-blows.ts`;
 * THE FILAMENT and THE MAZE time theirs off their own picture through
 * `hurtShake`; THE MIRROR's lands with the first glyph thrown back into the
 * copy (`simon-verdict.ts`). The rest never wear it, and none of them is
 * missing it: THE STARE takes no damage by design (`sim/stare.ts`); THE
 * REPRISE is survived, not hurt; THE GAUGE, THE SNAKE, THE PINBALL, THE PULSE
 * and THE SCOUT are rounds with no boss body and no blow; THE WELL is a
 * projection with nothing to redden; THE SPLICE is a puzzle, and the thing
 * that eats it is a clock.
 *
 * **A single hit that counts shows too** (the owner, 27 September 2026:
 * *when correctly hit, there must be a clear visual every time*). The shake
 * and the red are held apart for it: a landed sequence is both at full, and
 * one counted hit inside it is the red at full and half the shake
 * (`JAB_SHAKE`), so the landing is still the bigger blow. THE INSTAR deals
 * it on every counted bolt (`instar-fx.ts`).
 */

/** How long the blow shows, in seconds. */
const HURT_SECONDS = 0.5;
/** How far the body is shaken either way at the blow, in tiles. */
const SHAKE_TILES = 0.18;
/** How fast it shakes, in radians a second: quicker than a flinch's shiver. */
const SHAKE_RATE = 55;
/** How much of the shake one counted hit carries, against a landing's. */
export const JAB_SHAKE = 0.5;

export class BossHurt {
  private now = 0;
  private shaken = 0;

  /** A sequence landed: the body takes the blow, at `strength` 0..1. */
  hit(strength = 1): void {
    const k = Math.min(1, strength);
    this.now = Math.max(this.now, k);
    this.shaken = Math.max(this.shaken, k);
  }

  /** One hit that counts, inside a sequence: the red at full, half the shake. */
  jab(): void {
    this.now = 1;
    this.shaken = Math.max(this.shaken, JAB_SHAKE);
  }

  /** How red the blow still shows, 0..1. */
  get value(): number {
    return this.now;
  }

  /** How hard the body still shakes with it, 0..1. */
  get shake(): number {
    return this.shaken;
  }

  /** The body's sideways shake this frame, in pixels. */
  shakeX(time: number, tile: number): number {
    return hurtShake(this.shaken, time, tile);
  }

  update(dt: number): void {
    this.now = Math.max(0, this.now - dt / HURT_SECONDS);
    this.shaken = Math.max(0, this.shaken - dt / HURT_SECONDS);
  }

  clear(): void {
    this.now = 0;
    this.shaken = 0;
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

/**
 * The red over one plate of a body that took the blow: a wash and a hot rim,
 * both under the alpha the body is drawn at — THE FLUE's and THE GOVERNOR's
 * spent fade — and leaving it there for the plate's outline after.
 */
export function drawHurt(ctx: CanvasRenderingContext2D, p: Path2D, hurt: number): void {
  if (hurt <= 0) return;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.red, 0.35 * hurt);
  ctx.fill(p);
  ctx.restore();
  strokeGlowFaded(ctx, p, PALETTE.redRim, STROKE.inner, 1.6 * hurt);
}
