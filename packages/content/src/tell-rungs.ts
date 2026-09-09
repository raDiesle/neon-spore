import type { TellRung } from "@neon-spore/sim";

/**
 * THE TELL's ladder: five rungs, and what makes each of them a different
 * question.
 *
 * Authored here rather than tuned in `config-tell.ts` for the reason SNAKE's
 * arenas and PINBALL's boards are authored: a difficulty that is a number
 * beside the code is a difficulty nobody can read. What is deliberately *not*
 * here is which throw the boss makes — that is drawn at the rung, or on an
 * answering rung not drawn at all (`packages/sim/src/tell-rules.ts`). A rung
 * with its answer written under it would be a rung with no round in it.
 *
 * **The shape of the ladder is the whole design**, so it is worth reading down
 * the list rather than the fields:
 *
 * 1. **Four beats, and it answers nothing.** The pair's first exchange is
 *    against a boss drawing at random, with the longest window in the round,
 *    and it is where they find out that the tell is split — he can see the
 *    lobe and she can see the colour and neither of them can act on their own
 *    half. Nothing else is being asked yet.
 * 2. **Four beats, and it answers their last throw.** The same window, and the
 *    boss is now a machine: it throws whatever would have beaten what they
 *    threw on rung one. A pair that notices can steer it from here to the top
 *    of the ladder, which is the round's actual skill.
 * 3. **Three beats, still answering.** The window shortens before anything
 *    else does, so the thing that gets harder first is the *sentence* — which
 *    is what a pair improves at, and the only pressure this game ever applies.
 * 4. **Three beats, feinting.** The first rung the boss lies on: the lobe it
 *    is filling moves on the last beat. It shivers before it does, so a pair
 *    that has learnt the tell is not being punished for reading — they are
 *    being asked to hold their call one beat longer than is comfortable.
 * 5. **Two beats, three throws, and no guess in it at all.** The ladder does
 *    not end on a lie, it ends on a sentence: three exchanges back to back,
 *    every one shown outright, no feint, and a two-beat window on each — about
 *    four seconds for the three of them at the shipped tempo. Nothing about it
 *    is a reading test. It is the pair finding out whether it can say three
 *    words without talking over itself, and it is there because a ladder that
 *    ends on a coin toss ends on somebody else's decision
 *    (`docs/spec/bosses.md` 11.9). There is no rung six: five is where a
 *    ladder stops being a climb and starts being a grind, and a lost rung
 *    already sends them back to rung one.
 *
 * **A lost rung does not re-draw this list**, which is the reason a restart is
 * bearable: rungs one to three are the same windows in the same order, so a
 * pair that died on four comes back through what it already knows
 * (`docs/spec/bosses.md` 11.9).
 */
export const TELL_RUNGS: TellRung[] = [
  { beats: 4 },
  { beats: 4, answers: true },
  { beats: 3, answers: true },
  { beats: 3, feint: true },
  { beats: 2, throws: 3 },
];

/**
 * Beats the whole ladder is allowed, which is about seventy-five seconds at
 * the shipped tempo.
 *
 * Five rungs cost about thirty-five beats climbed clean, so this is room for
 * two lost ladders and a stand-off or two on top — a pair that has not got up
 * it by then is not going to, and the round says so rather than standing there.
 * Running it out costs `damageTell`; each lost rung along the way has already
 * cost `damageTellRepeat`.
 */
export const TELL_BEATS = 120;
