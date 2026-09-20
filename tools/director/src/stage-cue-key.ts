import {
  type BossCue,
  bossCues,
  type Field,
  instarCues,
  type Layout,
  type ViewRole,
} from "@neon-spore/render";
import {
  briefingHolds,
  type Command,
  instarActing,
  instarBoss,
  lostAsks,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { cueHand } from "./stage-cue-hand.js";
import { isTyping } from "./typing.js";

/**
 * **`3` does what the field is asking**, for both seats at once.
 *
 * The owner's ask, 20 September 2026: *when I am in TEST and press 3, it
 * should automatically do the required action on screen by either player 1 or
 * player 2 or both according to current state. The pressing of 1 and 2 is not
 * good enough, I can't test the actions at the same time when two actions are
 * required by both players at the same time.*
 *
 * The seat keys (`render/desk-seat.ts`) made the one mouse either hand, one at
 * a time, which is exactly the half a desk cannot test: THE BATON wants a
 * `HOLD` on the pilot's bead *while* the navigator merges, and a person with
 * one pointer can only ever be the second of those. This key is both thumbs on
 * the same frame.
 *
 * **It presses the marks and nothing else.** The mark is `BossCue` — the same
 * reading the field draws its word over (`render/boss-cue.ts`) — so there is
 * no second list here of what a boss wants, and a key that pressed somewhere
 * the field is not marking would be the rig lying about the game. The thumbs
 * themselves are `stage-cue-hand.ts`; this file is which seat is given which
 * mark, and when.
 *
 * **What it cannot do, and says so rather than guessing.** A `CARRY` or a
 * `TURN` on the *field* gets the thumb down on the mark and no further: #34
 * keeps the destination out of a cue on purpose, so where to carry it is not
 * a thing this file may read. THE INSTAR's marks are the exception and the
 * only one: a mark there carries its own `need` in its own unit, so the depth
 * of a pull and the amount of a turn are written down and the desk performs
 * them (`stage-cue-gesture.ts`). `STILL` is skipped — the ask is for no thumb
 * at all (THE STARE). And the bosses that build their cues where they draw
 * them — THE SINEW's, THE SURGE's and THE ANTIPHON's handles
 * (`boss-cue-text.ts`) — are not in the reading, so this key is silent on
 * them; the mouse and the seat keys are still the way through those.
 *
 * **THE INSTAR is the exception `bossCues` is silent on**, and the owner said
 * so on 20 September 2026: *I focus the game on THE INSTAR and press 3, and
 * nothing happens.* Its marks are an authored beat list rather than a reading,
 * so `bossCues` has no case for them and may not grow one — the ring already
 * draws its own frame and its own verb. `render/boss-cue-instar.ts` reads the
 * ring's own source as cues for this key alone.
 *
 * **Two things the same day, once he had watched it.** *I would like to see
 * some brief pause between the simulated actions, so I can see the order and
 * where it pulls each*, and *when the first sequence was done, the next one
 * does not work with 3.* Both are this file's, and one answer covers them:
 * the key is **held**, not pressed. While it is down the desk keeps looking
 * for a mark with nobody on it and hands it to a free seat — through the
 * landing, the morph and into the next pose, for as long as the scene runs —
 * and a seat's first thumb of a step waits half a beat behind the one
 * before it, so the two marks of a pose are answered in a visible order rather than
 * on the same frame.
 */

/** The number row and the pad, like the two seat keys beside it. */
const CODES = new Set(["Digit3", "Numpad3"]);

export interface CueKey {
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  /** The same field the mouse is tested against, with this seat written in. */
  field: () => Field;
  world: () => World;
  role: () => ViewRole;
  /** The stage's own sender, so a press by key is a press by mouse — THE
   * BALLOON's second hand and all (`stage-touch.ts`). */
  send: (player: 1 | 2, command: Command) => void;
}

/** What the binding hands back: the tick the held thumbs move and the next
 * mark is taken on, for the stage's own loop to call before it steps the
 * world — drained into the same tick as the press it followed (`stage.ts`). */
export interface CueKeyHand {
  tick: () => void;
}

/**
 * Which seats the key speaks for: the role's own on a seated screen, and both
 * on the one that shows both. A press on `p1` that answered the navigator
 * would be the desk doing something the phone in that seat cannot.
 */
export function cueSeats(role: ViewRole): readonly (1 | 2)[] {
  if (role === "p1") return [1];
  if (role === "p2") return [2];
  return [1, 2];
}

/**
 * One cue per seat: the most urgent mark that seat may answer, **and no mark
 * answered twice**. A cue with no seat is either player's (`grip-push.ts`) —
 * two thumbs on it would be two grips on one body, so the first seat takes it
 * and the second goes on to whatever is next for it, which is usually nothing.
 * A mark that genuinely wants both says so by being two cues, one per seat
 * (`boss-cue-instar.ts`).
 */
export function cueAnswers(
  cues: readonly BossCue[],
  seats: readonly (1 | 2)[],
): readonly { seat: 1 | 2; cue: BossCue }[] {
  const out: { seat: 1 | 2; cue: BossCue }[] = [];
  const taken = new Set<BossCue>();
  for (const seat of seats) {
    const cue = cues.find(
      (c) => (c.seat === seat || c.seat === null) && c.kind !== "STILL" && !taken.has(c),
    );
    if (cue === undefined) continue;
    taken.add(cue);
    out.push({ seat, cue });
  }
  return out;
}

/**
 * How long a seat's first thumb of a step waits behind the seat before it.
 * Half a beat: long enough to read which mark went first and which way it is
 * being pulled, and far inside `instarTogetherBeats`, which is how long a
 * mark answered alone waits for its partner before it slips (`instar-step.ts`).
 * Only a seat's *first* thumb of a step pays it — the second and third egg of
 * a swipe follow their own lift at once, or three of them would not fit the
 * window they have to land in.
 */
function pace(world: World): number {
  return Math.max(1, Math.round(ticksPerBeat(world.cfg) / 2));
}

export function bindCueKey({ layout, field, world, role, send }: CueKey): CueKeyHand {
  const hand = cueHand(field, send);
  /** Whether `3` itself is down. A held key is a held thumb, which is the
   * only way a `HOLD` cue can be answered at all. */
  let key = false;
  /** Ticks before the next seat's first thumb of this step may land. */
  let wait = 0;
  /** Seats that have already taken a mark in the step now running. */
  const paced = new Set<1 | 2>();

  const acting = (): boolean => {
    const s = instarBoss(world());
    return s !== null && instarActing(s);
  };

  /** Hand out whatever marks are unanswered to whichever seats are free. */
  const arm = (): void => {
    const l = layout();
    const free = hand.free(cueSeats(role()));
    if (free.length === 0) return;
    const marks = instarCues(l, world());
    if (marks.length === 0) {
      // Every other boss: both thumbs on the same frame, which is the ask
      // this key was written for.
      for (const a of cueAnswers(
        bossCues(l, world(), field().beatPhase, () => l.hullY),
        free,
      ))
        hand.press(l, a.seat, a.cue);
      return;
    }
    const next = cueAnswers(marks, free)[0];
    if (next === undefined) return;
    hand.press(l, next.seat, next.cue);
    if (paced.has(next.seat)) return;
    paced.add(next.seat);
    wait = pace(world());
  };

  window.addEventListener("keydown", (e) => {
    if (!CODES.has(e.code) || isTyping(e.target)) return;
    // A card is up: the press belongs to the wave's opening and not to any
    // mark, the same order the phone plays by (`stage-touch.ts`).
    if (briefingHolds(world()) || lostAsks(world())) return;
    e.preventDefault();
    // The key repeats while it is down and a thumb does not.
    if (key) return;
    key = true;
    wait = 0;
    paced.clear();
    arm();
  });

  const release = (where: boolean): void => {
    key = false;
    wait = 0;
    paced.clear();
    hand.lift(layout(), where);
  };

  window.addEventListener("keyup", (e) => {
    if (CODES.has(e.code)) release(true);
  });
  // A key released over another window would otherwise stay held here for
  // good, which is a thumb nobody can lift (`render/desk-seat.ts`).
  window.addEventListener("blur", () => release(false));

  const tick = (): void => {
    if (!key && hand.count() === 0) return;
    const l = layout();
    const w = world();
    // The step is over: every thumb up, and the next pose starts its pacing
    // from nothing.
    hand.drop(l, w);
    if (!acting()) paced.clear();
    if (wait > 0) wait--;
    else if (key) arm();
    hand.move(l, w);
  };

  return { tick };
}
