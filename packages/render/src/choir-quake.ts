import { signedHash } from "./hash.js";

/**
 * **The whole screen shaking**, and the only thing in this renderer that moves
 * the picture rather than something in it.
 *
 * The owner asked for it by name and in those words: the first arrow carried
 * outward starts the field shaking "like an earthquake, the full screen,
 * everything", and the second one shakes it harder before the dots draw
 * together. So the offset is applied where the stage itself is placed
 * (`canvas2d.ts`), above the clip — the field, the ship, the band, the HUD and
 * the sirens all move together, and nothing slides out from under the phone's
 * own rectangle.
 *
 * **Two magnitudes and one clock.** A quake is a single decaying number, and
 * the two events set it to different heights: `arm` to the smaller and `merge`
 * to the larger. That is deliberately not two clocks — two would let the
 * second arrow *reduce* the shake if the first one's was still tall, which is
 * the one thing a picture of escalation must never do. `Math.max` on the way
 * in is the whole rule.
 *
 * **It runs on the wall clock**, which render is free to use and the
 * simulation is not, so two phones shaking a pixel out of step is not a desync
 * and never reaches `hashWorld` — `target-lock.ts`'s flicker makes the same
 * argument. It is `Effects`' and cleared in `Effects.reset`, because it
 * outlives its frame: a run abandoned mid-quake would otherwise hand the next
 * one a screen that is already moving (`restart.test.ts` fails without it).
 */

/** Seconds a quake takes to die away. Short — an earthquake that outlasts the
 * gesture that caused it reads as the game being broken rather than as the
 * field being struck. */
const LIFE = 0.9;

/** Pixels of travel at full strength, for each of the two heights. The first
 * arrow is plainly *something*, and the merge is plainly more; a phone screen
 * is about 400 points across, so twelve is a shove and five is a tremor. */
const ARM_AMPLITUDE = 5;
const MERGE_AMPLITUDE = 12;

/** How fast the ground moves, in hash steps a second. High enough that the eye
 * reads it as vibration rather than as the picture sliding about. */
const RATE = 47;

export class ChoirQuake {
  private left = 0;
  private amplitude = 0;

  /** The first arrow went outward: the window is open and the field starts to
   * move. `Math.max` rather than assignment, so a second `arm` inside a quake
   * that is already taller cannot make it smaller. */
  arm(): void {
    this.strike(ARM_AMPLITUDE);
  }

  /** Both arrows are in, or the phone was shaken, and the two draw together.
   * The larger of the two heights, which is the escalation the owner asked
   * for: it shakes, and then it shakes more. */
  merge(): void {
    this.strike(MERGE_AMPLITUDE);
  }

  private strike(amplitude: number): void {
    this.amplitude = Math.max(this.amplitude, amplitude);
    this.left = LIFE;
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
    if (this.left === 0) this.amplitude = 0;
  }

  /** How far the stage is displaced this frame, in CSS pixels.
   *
   * The two axes are read off the same stream at different offsets, so the
   * screen travels on a path rather than along one diagonal — a shake that
   * moved x and y together is a picture of the phone being rocked, and this is
   * meant to be the ground under the ship. The strength falls off with the
   * square of what is left, which is what makes the last third of a quake
   * settle instead of stopping. */
  offset(time: number): { x: number; y: number } {
    if (this.left === 0) return { x: 0, y: 0 };
    const k = (this.left / LIFE) ** 2 * this.amplitude;
    const t = Math.round(time * RATE);
    return { x: signedHash(t, 1) * k, y: signedHash(t, 2) * k * 0.7 };
  }

  clear(): void {
    this.left = 0;
    this.amplitude = 0;
  }
}
