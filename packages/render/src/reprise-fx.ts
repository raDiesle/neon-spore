/**
 * **What THE REPRISE's picture has to remember**: the moment the count
 * changed, and the moment the mechanism went from recording to playing or
 * back.
 *
 * Everything else about the mechanism is read off the world every frame — how
 * many bodies are recorded or owed, whether an echo is running — and a number
 * read fresh says nothing about the moment it changed. The owner's brief asks
 * for those moments twice over: *it moves each time a new echoed body enters
 * the field — a pulse, a twitch, a swallow* (16 September 2026), and *when the
 * recording of units is started and the playing of invisible sequence starts
 * also should be graphical and animation visible* (25 September 2026). So a
 * laid egg is a swallow, a recorded one is a take, and a phase change is a
 * flip — the shutter's blink when recording starts, the rewind when playback
 * does (`reprise-lens.ts`).
 *
 * It is driven from the draw pass rather than fed by a `SimEvent`, which is
 * `ghost-trail.ts`'s and `coord-grid.ts`'s arrangement and is here for their
 * reason: an unseen arrival deliberately says nothing — `sendDue` cuts the
 * events it would have pushed — and a transient fed off a count is the shape
 * left over when a fact has no event behind it.
 *
 * It lives in `Effects` because it outlives its frame, and it is cleared in
 * `Effects.reset()` because a restarted wave that inherited a half-spent
 * swallow would show the pair a body arriving that never did
 * (`packages/render/test/restart.test.ts` is what holds it to that).
 */

/** Recording, playing unseen, or neither — the script is spent. */
export type ReprisePhase = "rec" | "play" | null;

/**
 * Seconds a swallow takes to go out. A little over a quarter of a beat at the
 * shipped tempo: long enough to be caught out of the corner of an eye that is
 * on the field, short enough that two bodies a beat apart are two twitches.
 */
const SWALLOW = 0.42;

export class RepriseFx {
  /** The phase and count this pass last saw. `undefined` until the first
   * frame, so the first frame of a wave flips without laying anything. */
  private phase: ReprisePhase | undefined = undefined;
  private eggs = 0;
  private left = 0;
  private flipped = Number.NEGATIVE_INFINITY;
  private took = Number.NEGATIVE_INFINITY;

  /**
   * How far through a swallow the mechanism is, 1 on the frame a body went and
   * 0 once it is over. Eased on the way out rather than linear, so the clench
   * is sharp and the recovery is not.
   */
  get swallow(): number {
    return this.left <= 0 ? 0 : (this.left / SWALLOW) ** 0.7;
  }

  /** Seconds since the phase last changed, at `time`. */
  sinceFlip(time: number): number {
    return time - this.flipped;
  }

  /** Seconds since a body was last recorded, at `time`. */
  sinceTake(time: number): number {
    return time - this.took;
  }

  /**
   * What the mechanism holds as of this frame: `eggs` is the bodies recorded
   * so far while recording and the bodies still owed while playing. An echo
   * sends its first body on the beat it opens and its last on the beat it
   * shuts, so both edges of `play` are a body gone — which is why the lay is
   * read off the phase as well as the count.
   */
  note(phase: ReprisePhase, eggs: number, time: number): void {
    const was = this.phase;
    if (was !== phase) {
      if (was !== undefined) this.flipped = time;
      if (phase === "play" || was === "play") this.left = SWALLOW;
    } else if (phase === "play" && eggs < this.eggs) this.left = SWALLOW;
    else if (phase === "rec" && eggs > this.eggs) this.took = time;
    this.phase = phase;
    this.eggs = eggs;
  }

  update(dt: number): void {
    if (this.left > 0) this.left = Math.max(0, this.left - dt);
  }

  clear(): void {
    this.phase = undefined;
    this.eggs = 0;
    this.left = 0;
    this.flipped = Number.NEGATIVE_INFINITY;
    this.took = Number.NEGATIVE_INFINITY;
  }
}
