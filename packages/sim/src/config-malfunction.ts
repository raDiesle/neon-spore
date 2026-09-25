/**
 * THE MALFUNCTION's numbers: how often a broken control acts by itself, how
 * long THE CODEX holds a key, and when THE HANDOVER trades the two panels.
 *
 * Its own file, the way every mechanic with numbers of its own has one. The
 * seam is the same one `config-fence.ts` and `config-recoil.ts` were cut
 * along: `config.ts` holds what the *ship* is — the hull, the grid, the beat —
 * and a rule that only exists while one particular thing is on the panel holds
 * its own figures beside it.
 *
 * Every one of them is in **beats** rather than milliseconds, and that is the
 * decision this file is really making. A window nobody counts is measured in
 * time (`guardWindowMs`, `intakeWindowMs`); a window the pair has to *plan a
 * crossing inside of* is measured in the thing they are already counting out
 * loud. "Two beats" is a sentence one of them can say to the other. "Twelve
 * hundred milliseconds" is not.
 */
export interface MalfunctionConfig {
  /**
   * Beats between two automatic actions of a broken control.
   *
   * One, and the whole feel of the mechanic is in that number: the fault does
   * exactly what the metronome does, so the pair already knows when the next
   * one is coming. A fault that fired on some other clock would be a thing to
   * watch rather than a thing to count, and watching is what this game spends
   * its attention on elsewhere.
   */
  malfunctionEveryBeats: number;
  /**
   * Beats THE CODEX holds one key before turning it over.
   *
   * Four, which is a bar: long enough that the pair can take a shot inside it
   * and short enough that nobody plans a whole wave around one reading. It is
   * the number that decides whether the fault is a sentence said once — *they
   * are swapped* — or a thing one of them keeps saying, and the second is the
   * mechanic. A hold of one would be unplayable across a voice delay: the call
   * would land after the key had already turned (`docs/spec/latency.md`).
   *
   * In beats for this file's own reason. "Every bar" is a thing one of them can
   * say to the other; 2500 ms is not.
   */
  codexHoldBeats: number;
  /**
   * The beat of the wave THE HANDOVER trades the two panels on.
   *
   * Nine, which is two bars played with your own hands and then the downbeat of
   * the third. Both halves of that matter. A fault that traded on the first beat
   * would be a wave played entirely in the other seat, which is not a handover,
   * it is a seat swap with extra steps — the pair has to have something to lose
   * before it is taken. And it lands on a beat they are already saying out loud,
   * which is the same argument every number in this file makes.
   */
  handoverAtBeat: number;
  /*
   * **Neither this nor the hold below is read by the simulation any more.**
   * They were the fallback for a handover that named no rows, and every fault
   * is placed on rows now — `at` and `beats` come off the pencil, and a wave
   * that leaves them out means *from the first beat, to the end*
   * (`fault-placed.ts`, 15 September 2026). What they are is the number the
   * director fills a fresh handover in with, which is the job that made them
   * good numbers in the first place, and what the two paragraphs round them
   * argue is still why those are the numbers.
   */
  /**
   * Beats the panels stay traded before they come back.
   *
   * Eight — two bars, and the number that decides whether the fault is a
   * stumble or a passage. Shorter and the honest answer is to take both hands
   * off the glass and wait it out, which is a fault nobody has to talk through;
   * at two bars something is arriving while they are in the wrong seat and the
   * only way through it is the other person's voice.
   */
  handoverHoldBeats: number;
  /**
   * Beats of warning before the trade, counted down on both screens.
   *
   * Two, which is one sentence — *you take the dome* — and that is the whole
   * size of it: long enough to arrange two pairs of hands, too short to plan the
   * wave around. It is on both screens deliberately. A warning only one of them
   * could see would make the trade a thing that happens *to* the other one, and
   * there is nothing to say about a surprise (`docs/spec/latency.md` is the
   * other reason: a call has to have left a mouth before the beat it is about).
   */
  handoverWarnBeats: number;
  /**
   * Beats a square of THE DARK's field stays lit after a finger lands on it
   * (`dark.ts`). Two, which the owner named on 25 September 2026: long enough
   * to see what is there and say it, too short to light the field once and
   * keep it.
   */
  darkLitBeats: number;
  /**
   * How far round a lit square the dark is lifted, in thousandths of a tile.
   * A thumb is wider than a square, and a light the size of one would leave
   * half of a body it landed on still in the dark.
   */
  darkLitRadiusMilli: number;
}

export const MALFUNCTION_DEFAULTS: MalfunctionConfig = {
  malfunctionEveryBeats: 1,
  codexHoldBeats: 4,
  handoverAtBeat: 9,
  handoverHoldBeats: 8,
  handoverWarnBeats: 2,
  darkLitBeats: 2,
  darkLitRadiusMilli: 1400,
};
