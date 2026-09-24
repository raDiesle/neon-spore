import { NO_BEARING } from "./bearing.js";
import type { SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE INSTAR: a body over the field that will not move on until the pair has
 * done what its own picture asks — and **the engine every scene of that kind
 * runs on**, built here because this is the first boss that is nothing else.
 *
 * The owner's ask, 17 September 2026, after the last bosses: *without reading
 * the tutorial it is impossible to understand what to do.* So this one has no
 * control set at all. What it has is **marks on its own body** — a ring on a
 * hand, on a clutch of eggs, on a tongue, on a tail — and the mark says what
 * to do with the part under it and whose thumb it wants: one seat's while the
 * other watches, both seats' at once in two places, or both thumbs on the one
 * spot. The panel is the boss.
 *
 * **A `BossSequenceStep` is the primitive** (`docs/spec/bosses-choreographed.md`,
 * filter 10): a beat list authored in `packages/content`, read here by index,
 * with the cursor in the hash. Every step is a **pose** the body morphs into
 * and holds, the marks it shows in that pose, and three clocks — how long the
 * morph takes before the marks appear, how long the window stays open, and
 * how long the body takes to land the beat before the next morph. A window
 * that closes with a mark still undone is the part doing what it was going
 * to do: the hand's weapon on the hull, the eggs hatching, the tongue's
 * poison, the tail's blow — one strike, and the owner's rule of 12 September
 * 2026 makes any hull damage the whole wave (`instar-step.ts`).
 *
 * **A mark is a `Command`** and nothing else (filter 9): every one is a `drag`
 * on the `instarMark` target with `id` naming the mark, and the six gestures
 * are read off the fields a drag already carries — `on` for a press and a
 * lift, `fromYMilli` for a pull and a swipe, `fromMilli` as a bearing for a
 * turn, the way the crank reads it (`instar-hand.ts`). No *script* is written
 * for the pair to read aloud — though since `docs/decisions.md` #34 the field
 * may say the **verb** beside the mark, which is render's own reading of this
 * state and nothing here (`render/src/boss-cue.ts`).
 *
 * **Together means together.** A step with a mark for each seat lands only
 * when both are done inside `instarTogetherBeats` of each other. One that
 * gets there alone and waits longer than that **slips** — back to nought,
 * with a sound — and the pair starts the beat again inside the same window.
 * That is the coupling: the sentence this boss exists to make them say is
 * *now*.
 */

/** Whose thumb a mark wants. Geometry, not colour, says which seat is which
 * (the choreographed page's rule); every mark is drawn the same red the owner
 * asked for by name. */
export const INSTAR_SEATS = ["p1", "p2", "both"] as const;
export type InstarSeat = (typeof INSTAR_SEATS)[number];

/** The parts of the body a mark can sit on — each one a threat if its mark
 * is left undone, which is what the strike is named after. */
export const INSTAR_PARTS = ["jaw", "hand", "eggs", "tongue", "tail", "head"] as const;
export type InstarPart = (typeof INSTAR_PARTS)[number];

/**
 * The six gestures, and what `need` counts for each:
 * `pullDown`/`pullUp` — thousandths of a tile the thumb must carry the part,
 * and hold there; `tap` — presses; `swipeDown` — carries past
 * `instarSwipeMilli` that end in a lift; `turn` — thousandths of a turn wound
 * clockwise; `hold` — beats both seats' thumbs stay on the one mark.
 */
export const INSTAR_GESTURES = ["pullDown", "pullUp", "tap", "swipeDown", "turn", "hold"] as const;
export type InstarGesture = (typeof INSTAR_GESTURES)[number];

/** The poses the body morphs between, one per step, named for the picture. */
export const INSTAR_POSES = ["gape", "armed", "moulted", "turned", "lunge"] as const;
export type InstarPose = (typeof INSTAR_POSES)[number];

/** Where the scene is: the body morphing with its marks hidden, the marks up
 * and the window open, the beat landed and the body settling, or beaten. */
export const INSTAR_PHASES = ["morph", "act", "land", "down"] as const;
export type InstarPhase = (typeof INSTAR_PHASES)[number];

export interface InstarMark {
  seat: InstarSeat;
  part: InstarPart;
  gesture: InstarGesture;
  /** Where on the field it sits, in thousandths of the field's width and height. */
  xMilli: number;
  yMilli: number;
  /** How much, in the gesture's own unit (`INSTAR_GESTURES`). Never nought. */
  need: number;
}

/** One beat of a choreographed scene: a pose, its marks and its three clocks. */
export interface BossSequenceStep {
  pose: InstarPose;
  /** Beats the body takes to morph into the pose, marks hidden. */
  morphBeats: number;
  /** Beats the marks stay up before the undone part strikes. */
  windowBeats: number;
  /** Beats the landed beat plays out before the next morph. */
  landBeats: number;
  marks: readonly InstarMark[];
}

/** What a wave authors: the script, and nothing else. */
export interface InstarEntry {
  kind: "instar";
  steps: readonly BossSequenceStep[];
}

export interface InstarState {
  kind: "instar";
  /** The script, copied in so content is never written to (`scout-hash.ts`). */
  steps: BossSequenceStep[];
  /** Which step the scene is on; `steps.length` once the last has landed. */
  cursor: number;
  phase: InstarPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** Per mark of the current step: how far along, in the mark's own unit. */
  progress: number[];
  /** Per mark: `world.beat` it reached its need, `-1` while it has not. */
  doneBeat: number[];
  /** Per mark: the hand's reference — the last bearing of a turn (`NO_BEARING`
   * between grabs), or the furthest a swipe's carry has gone this grab, in
   * thousandths of a tile, capped at `instarSwipeMilli` (`instarSwipeAlong`). */
  ref: number[];
  /** Per mark: which seats have a thumb on it, bit 1 for player 1 and bit 2 for player 2. */
  thumbs: number[];
}

export const NOT_DONE = -1;

export function instarBoss(world: World): InstarState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "instar" ? boss : null;
}

/** The step the scene is on, or null once every step has landed. */
export function instarStep(s: InstarState): BossSequenceStep | null {
  return s.steps[s.cursor] ?? null;
}

/** Whether the marks are up and a thumb on one counts. */
export function instarActing(s: InstarState): boolean {
  return s.phase === "act";
}

export function instarDown(s: InstarState): boolean {
  return s.phase === "down";
}

/** Whether mark `i` of the current step has reached its need. */
export function instarMarkDone(s: InstarState, i: number): boolean {
  return (s.doneBeat[i] ?? NOT_DONE) !== NOT_DONE;
}

/** Whether every mark of the current step is done. */
export function instarAllDone(s: InstarState): boolean {
  const step = instarStep(s);
  if (step === null) return false;
  for (let i = 0; i < step.marks.length; i++) if (!instarMarkDone(s, i)) return false;
  return true;
}

/**
 * Whether a gesture's *done* is a state the thumb keeps rather than a count
 * it reached: a pull stands at its depth and a hold is two thumbs still
 * there. Such a mark never slips for waiting on its partner — letting go is
 * what undoes it (`instar-hand.ts`); a count, once reached, is a moment, and
 * a moment too long before its partner's is not together (`instar-step.ts`).
 */
export function instarHeld(gesture: InstarGesture): boolean {
  return gesture === "pullDown" || gesture === "pullUp" || gesture === "hold";
}

/**
 * **How far the swipe under the thumb is to counting**, in thousandths — nought
 * with no thumb on it, a thousand once the lift would take an egg off.
 *
 * The owner, 24 September 2026, generic: a swipe begun the right way should
 * fill its ring *on its way*, not only when it lands. The simulation's own
 * word, so the arc on both phones is the carry the lift will be judged on
 * (`instar-hand.ts`), and nought for any mark that is not a swipe.
 */
export function instarSwipeAlong(s: InstarState, cfg: SimConfig, i: number): number {
  const mark = instarStep(s)?.marks[i];
  if (mark?.gesture !== "swipeDown") return 0;
  const carried = s.ref[i] ?? NO_BEARING;
  if (carried <= 0 || cfg.instarSwipeMilli <= 0) return 0;
  return Math.min(1000, Math.floor((carried * 1000) / cfg.instarSwipeMilli));
}

/** Whether a mark's seat lets `player`'s thumb count. */
export function instarSeatHears(seat: InstarSeat, player: 1 | 2): boolean {
  return seat === "both" || seat === (player === 1 ? "p1" : "p2");
}

/** The column a mark stands over, for the events and the sounds. */
export function instarMarkCol(cfg: SimConfig, mark: InstarMark): number {
  return Math.max(0, Math.min(cfg.cols - 1, Math.floor((mark.xMilli * cfg.cols) / 1000)));
}

/** The beat the open window closes on, or `-1` when none is open. */
export function instarStrikeBeat(s: InstarState): number {
  const step = instarStep(s);
  if (step === null || s.phase !== "act") return -1;
  return s.phaseBeat + step.windowBeats;
}
