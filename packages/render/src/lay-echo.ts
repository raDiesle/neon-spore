import type { Color } from "@neon-spore/sim";
import { type EggFlare, NO_FLARE } from "./egg-skin.js";
import { PALETTE } from "./palette.js";

/**
 * The part of the cannon's mouth that outlives a frame — the follow-through
 * after a shot has gone, and the colour it burns off in.
 *
 * Its own file rather than the bottom of `cannon-maw.ts` on line count, and
 * the seam is the honest one: next door is a draw call, and there is not a
 * canvas anywhere in here. It is two countdowns and the arithmetic that turns
 * them into something drawable, which is exactly the kind of thing that can
 * be asserted without a stub canvas (`test/mouth-look.test.ts`).
 */

/**
 * How long the colour burns, in beats, against the six tenths of one the body
 * takes to go slack. Longer on purpose: the owner asked for a glow that is
 * *visible*, and one ending with the follow-through is a frame and a half at
 * 96 bpm.
 */
const FLARE_BEATS = 1.6;
/** The share of that life spent at full before it begins to fade. */
const FLARE_HOLD = 0.35;

/**
 * The far half of the phase, as the only thing in this file that outlives a
 * frame — so it lives in `Effects` and is cleared by `Effects.reset()`, which
 * is not bookkeeping: a restart builds a fresh `World` and a mouth still
 * relaxing from the abandoned run would be relaxing on the new one's first
 * frame, from a shot nobody fired.
 *
 * A class rather than two fields on `Effects` for the reason `SwallowFx` is
 * one: it is a clock with a life as well as a countdown, and the arithmetic
 * that turns those two into a phase belongs beside the phase's definition.
 */
export class LayEcho {
  private left = 0;
  private life = 0;
  private flareLeft = 0;
  private flareLife = 0;
  private hue: string = PALETTE.hull;

  /** 1 the moment the shot goes, easing to 2, then 0. See `LayState`. */
  get phase(): number {
    if (this.left <= 0 || this.life <= 0) return 0;
    return 2 - this.left / this.life;
  }

  /**
   * The release burn, 1 the moment the shot goes and 0 once it is spent.
   *
   * It holds at full for the first third of its life and only then eases out.
   * A pure decay from the first frame spends most of its brightness before
   * anybody has looked up; the plateau is what makes the thing readable rather
   * than merely present.
   */
  get flare(): EggFlare {
    if (this.flareLeft <= 0 || this.flareLife <= 0) return NO_FLARE;
    const u = this.flareLeft / this.flareLife;
    return { amount: u > FLARE_HOLD ? 1 : (u / FLARE_HOLD) ** 1.5, color: this.hue };
  }

  /**
   * A shot has left, in this colour. The relaxation is longer than the
   * half-beat wind-up in front of it on purpose — a release quicker than the
   * strain reads as a flash, and one that outlasts it reads as effort — and it
   * is measured in beats because everything else the ship does is.
   */
  start(beatSeconds: number, color: Color): void {
    this.life = beatSeconds * 0.6;
    this.left = this.life;
    this.flareLife = beatSeconds * FLARE_BEATS;
    this.flareLeft = this.flareLife;
    this.hue = color === "red" ? PALETTE.red : PALETTE.cyan;
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
    this.flareLeft = Math.max(0, this.flareLeft - dt);
  }

  clear(): void {
    this.left = 0;
    this.life = 0;
    this.flareLeft = 0;
    this.flareLife = 0;
    // The colour too, and not only the clocks: `restart.test.ts` compares a
    // reset `Effects` against a fresh one field by field, and a hue left over
    // from the abandoned run is a difference whether or not it is ever drawn.
    this.hue = PALETTE.hull;
  }
}
