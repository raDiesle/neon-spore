import {
  type BossCue,
  bossCues,
  type Field,
  type Hold,
  instarCues,
  type Layout,
  touchDown,
  touchMove,
  touchUp,
  type ViewRole,
} from "@neon-spore/render";
import { briefingHolds, type Command, lostAsks, type World } from "@neon-spore/sim";
import { instarGesture } from "./stage-cue-gesture.js";
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
 * the field is not marking would be the rig lying about the game. The press
 * goes through `touchDown` exactly as the mouse's does, so what the world is
 * told is what a thumb on that spot would have told it.
 *
 * **What it cannot do, and says so rather than guessing.** A `CARRY` or a
 * `TURN` on the *field* gets the thumb down on the mark and no further: #34
 * keeps the destination out of a cue on purpose, so where to carry it is not
 * a thing this file may read. THE INSTAR's marks are the exception and the
 * only one: a mark there carries its own `need` in its own unit, so the depth
 * of a pull and the amount of a turn are written down and the desk performs
 * them — `stage-cue-gesture.ts` says where the finger goes, once a tick,
 * through the same `touchMove` and `touchUp` the mouse goes through. `STILL` is skipped — the ask is for no thumb at all
 * (THE STARE). And the bosses that build their cues where they draw them —
 * THE SINEW's, THE SURGE's and THE ANTIPHON's handles (`boss-cue-text.ts`) —
 * are not in the reading, so this key is silent on them; the mouse and the
 * seat keys are still the way through those.
 *
 * **THE INSTAR is the exception it was silent on**, and the owner said so on
 * 20 September 2026: *I focus the game on THE INSTAR and press 3, and nothing
 * happens.* Its marks are an authored beat list rather than a reading, so
 * `bossCues` has no case for them and may not grow one — the ring already
 * draws its own frame and its own verb. `render/boss-cue-instar.ts` reads the
 * ring's own source as cues for this key alone, and the two lists are simply
 * added together here.
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

/** What the binding hands back: the tick the held thumbs move on, for the
 * stage's own loop to call before it steps the world — a move drained into
 * the same tick as the press it followed (`stage.ts`'s `advance`). */
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

export function bindCueKey({ layout, field, world, role, send }: CueKey): CueKeyHand {
  /** What each seat's thumb took hold of, until the key lifts — a held `3` is
   * a held thumb, which is the only way a `HOLD` cue can be answered at all. */
  const holding = new Map<1 | 2, { hold: Hold; x: number; y: number; ticks: number }>();

  window.addEventListener("keydown", (e) => {
    if (!CODES.has(e.code) || isTyping(e.target)) return;
    // The key repeats while it is down and a thumb does not.
    if (holding.size > 0) return;
    // A card is up: the press belongs to the wave's opening and not to any
    // mark, the same order the phone plays by (`stage-touch.ts`).
    if (briefingHolds(world()) || lostAsks(world())) return;
    const l = layout();
    // `l.hullY` for the skin, as the round pass does (`round-draw.ts`): the
    // one boss it is not exact for is THE UNDERTOW, whose marks ride lobes
    // coming up through the plating, and the frame is tiles wide.
    const cues = [
      ...bossCues(l, world(), field().beatPhase, () => l.hullY),
      ...instarCues(l, world()),
    ];
    for (const { seat, cue } of cueAnswers(cues, cueSeats(role()))) {
      const t = touchDown(l, cue.x, cue.y, { ...field(), seat });
      if (t === null) continue;
      e.preventDefault();
      if (t.hold) holding.set(seat, { hold: t.hold, x: cue.x, y: cue.y, ticks: 0 });
      if (t.command) send(t.player, t.command);
    }
  });

  /**
   * Every thumb up, from where it went down. `where` is false for a window
   * losing focus, which is the one lift with no point to report: player 2's
   * muzzle swipe and player 1's tap on the cannon are decided by where the
   * hand ended, and a shot nobody finished is worse than none (`touch.ts`).
   */
  const lift = (where: boolean): void => {
    if (holding.size === 0) return;
    const l = layout();
    for (const [seat, held] of holding) {
      const at = where ? { x: held.x, y: held.y } : undefined;
      const t = touchUp(l, held.hold, { ...field(), seat }, at);
      if (t?.command) send(t.player, t.command);
    }
    holding.clear();
  };

  window.addEventListener("keyup", (e) => {
    if (CODES.has(e.code)) lift(true);
  });
  // A key released over another window would otherwise stay held here for
  // good, which is a thumb nobody can lift (`render/desk-seat.ts`).
  window.addEventListener("blur", () => lift(false));

  /**
   * One tick of every thumb that is down. Nothing to do on any boss but THE
   * INSTAR, whose marks are motion rather than a press — `instarGesture` is
   * where the finger goes and this is only the hand that takes it there.
   */
  const tick = (): void => {
    if (holding.size === 0) return;
    const l = layout();
    for (const [seat, held] of [...holding]) {
      held.ticks++;
      const hold = held.hold;
      const at = hold.kind === "drag" ? { x: hold.originX, y: hold.originY } : held;
      const id = hold.kind === "drag" ? hold.id : undefined;
      const go = instarGesture(l, world(), { id, x: at.x, y: at.y }, held.ticks);
      if (go === null) continue;
      const seated = { ...field(), seat };
      if (go.do === "lift") {
        holding.delete(seat);
        const t = touchUp(l, hold, seated, { x: held.x, y: held.y });
        if (t?.command) send(t.player, t.command);
        continue;
      }
      if (go.do === "again") {
        // Off and straight back on, which is what a slap is: the count is of
        // grabs, and a thumb left down is one of them (`sim/instar-hand.ts`).
        const up = touchUp(l, hold, seated, { x: held.x, y: held.y });
        if (up?.command) send(up.player, up.command);
        const down = touchDown(l, held.x, held.y, seated);
        if (down?.hold) held.hold = down.hold;
        if (down?.command) send(down.player, down.command);
        continue;
      }
      const t = touchMove(l, hold, go.x, go.y);
      if (t?.command) send(t.player, t.command);
    }
  };

  return { tick };
}
