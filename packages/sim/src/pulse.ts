/**
 * THE PULSE: the same song on two screens, and neither of you can read all of
 * it.
 *
 * Arrows fall down four lanes towards a line of empty ones at the bottom, and
 * both seats press the same four buttons against the same chart at the same
 * moment. That much is the oldest arcade game there is and it is deliberately
 * unmodified: a pair who have played one already know what to do with it, so
 * the round costs no teaching and every beat of it can be spent on the part
 * that is ours.
 *
 * **The part that is ours is the veil.** Every so often an arrival lands on
 * one seat's screen with its body taken off it — it falls between the lanes,
 * cycling through all four, and it cannot be read. On the *other* seat's
 * screen the same one falls in its true lane wearing a call mark.
 * Both of them still have to hit it. So the round is not two people playing
 * the same game beside each other: it is two people each holding a fifth of
 * the other's chart, saying "LEFT — now" into a fixed grid that will not wait.
 * The veils alternate between the seats, so neither is ever only the reader or
 * only the read.
 *
 * That is what makes it a round and not a mini-game bolted on. A round's third
 * condition is that neither player can play it alone
 * (`docs/spec/interludes.md`), and every rhythm game ever written fails it —
 * this one fails it too, until the veil, and passes it afterwards without
 * changing a single button.
 *
 * **Nothing here is the field.** No hull is drawn, no column is named, and the
 * arrows travel, which the field forbids and a round does not
 * (`docs/decisions.md` #21). What is still at stake is the same hull as ever:
 * `pulse-round.ts` breaks it when a seat's meter runs out.
 *
 * This file is the state and what a stage is. Opening one is `pulse-open.ts`,
 * judging a press is `pulse-chart.ts`, the four verbs are
 * `pulse-controls.ts`, and the clock the whole thing hangs off is
 * `pulse-round.ts`.
 */

/**
 * The four lanes, in the order they are drawn and in the order the panel puts
 * them under a thumb. The index is what goes on the wire and into the
 * fingerprint, so the order is fixed once and never sorted.
 *
 * **They are the game's own bodies and not the arcade's four arrows**, and
 * that is the owner's decision on 7 September 2026. The round shipped as Dance
 * Dance Revolution unmodified, with LEFT DOWN UP RIGHT, on the argument that a
 * pair who have played one need no teaching; he replaced the arrows with a
 * slick, a bulb, a meteor and a pod, and the names had to follow the pictures
 * all the way down here. A lane called `left` under a slick would be a
 * direction nothing on the screen points in, and every file in the round would
 * go on repeating it.
 *
 * What it buys is bigger than tidiness. The veil is the round — one seat
 * cannot read an arrival and the other has to say what it is — and the word
 * they say is now a word the pair have been using since wave one. "BULB — now"
 * is the game's vocabulary; "LEFT — now" was a second one learnt for ninety
 * seconds.
 */
export const PULSE_LANES = ["slick", "bulb", "meteor", "pod"] as const;
export type PulseLane = (typeof PULSE_LANES)[number];

/** How a press or an expiry was judged. The index is what the fingerprint holds. */
export const PULSE_JUDGES = ["none", "perfect", "good", "miss", "stray"] as const;
export type PulseJudge = (typeof PULSE_JUDGES)[number];

/**
 * One arrow in a stage.
 *
 * Authored on the grid rather than in ticks: a chart written in ticks is a
 * chart nobody can read, and a step is the unit a person actually counts in
 * (`config-pulse.ts` says why a step is 25 ticks and not half a beat).
 */
export interface PulseNote {
  /** Steps from the start of the stage. */
  step: number;
  /** Which lane it falls down. */
  lane: PulseLane;
  /**
   * The seat this note is hidden from, or absent when both can read it.
   *
   * It is *which seat cannot see it* rather than *which seat calls it*,
   * because the seat that cannot see it is the one the rule is about: they
   * have to press it anyway. The caller is simply the other one, and deriving
   * that is one line rather than a second field two devices could disagree on.
   */
  veil?: 1 | 2;
}

/** One stage: a song, and the arrows that go with it. */
export interface PulseStage {
  /** What it is called on the screen. */
  name: string;
  /** Steps in the whole stage. The song is over when the grid runs out. */
  steps: number;
  /** The chart, ascending by step. `pulseFault` says whether it is one. */
  notes: PulseNote[];
}

/**
 * The parts of the round. `count` is the beats before the first step, and it
 * is a phase rather than a delay because it is the only chance the pair get to
 * look at a screen that has just stopped being the field — SNAKE's argument,
 * and the beat counts are constants in `pulse-round.ts` for the same reason
 * PINBALL's are.
 *
 * `spent` is the last and draws nothing new: the stage is over and only being
 * looked at, and the round stays installed so the picture holds until the next
 * wave replaces it (`wave-end.ts`).
 */
export const PULSE_PHASES = ["count", "play", "verdict", "spent"] as const;
export type PulsePhase = (typeof PULSE_PHASES)[number];

/**
 * Beats between a stage opening and its first arrow landing. Four, which is
 * the count-in every arcade cabinet gives and one bar of the click the pair
 * are already hearing.
 *
 * **The arrows fall through it**, which is what makes it a count rather than a
 * pause: step 0 is due this far after the stage opens, so the first one enters
 * the top of its lane `pulseLeadTicks` before that and the pair watch it come.
 * It lives here rather than beside the phases in `pulse-round.ts` because
 * `pulse-open.ts` needs it to say when the song starts.
 */
export const PULSE_COUNT_BEATS = 4;

/**
 * Everything the round remembers between ticks. A `BossState` like the rest.
 *
 * The two seats are two parallel sets of fields rather than an array of two,
 * for the reason every other split in this game is written out: `player` is
 * `1 | 2` everywhere and an index would be a third spelling of it. They are
 * kept in the same order in `pulseHashParts`, so a field added to one and not
 * the other shows up in the diff.
 */
export interface PulseState {
  kind: "pulse";
  phase: PulsePhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on. */
  openBeat: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
  /** The authored stages, copied in, so content is never written to. */
  stages: PulseStage[];
  /** Which of them is being played. */
  stage: number;
  /** This stage's chart, copied out of `stages` and never written either. */
  notes: PulseNote[];
  /** `world.tick` that step 0 of the stage lands on — the song's own zero. */
  startTick: number;
  /**
   * How each seat has resolved each note, one entry per note in chart order:
   * an index into `PULSE_JUDGES`, `0` while it is still coming.
   *
   * Per note rather than a running tally, because a note is resolved once and
   * the picture has to know which arrows are spent — an arrow already hit
   * stops being drawn on the seat that hit it and goes on falling on the seat
   * that has not.
   */
  judged1: number[];
  judged2: number[];
  /**
   * The first note in chart order this seat has not finished with: every index
   * below it is resolved, so a press and the expiry sweep both start here
   * instead of at nought. It only ever moves forward.
   */
  from1: number;
  from2: number;
  /**
   * **The meter, in thousandths, and there is one of it.**
   *
   * Both seats feed the same bar and both drain it, which is the owner's call
   * and it is what makes the round a shared object rather than two scores side
   * by side: a bar that is falling is falling because of *the pair*, and
   * neither of them can look at it and know it is somebody else's problem. The
   * cost of that is real and was accepted — one of you can carry the other for
   * a while — and it is bought back by the fact that every arrow has to be hit
   * twice, once by each of them, so a seat that stops pressing halves the fill
   * and doubles the drain within a bar.
   *
   * Nought is the stage lost.
   */
  meter: number;
  /** Notes hit in a row without a miss. The picture's only reward. */
  combo1: number;
  combo2: number;
  /** The last thing this seat did, as a `PULSE_JUDGES` index. */
  last1: number;
  last2: number;
  /** The tick it happened on, so both screens can flash it and let it fade. */
  lastTick1: number;
  lastTick2: number;
  /** The lane it was in, so a screen can flash the right receptor. -1 for none. */
  lastLane1: number;
  lastLane2: number;
}
