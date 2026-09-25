import type { BossSequenceStep } from "@neon-spore/sim";

/**
 * THE INSTAR's script: three poses, and what the pair does to each.
 *
 * This is the owner's choreography of 25 September 2026 — a living ship with
 * a dragon's head — written as the beat list the simulation reads by index
 * (`sim/instar.ts`). It replaced the five poses of 17 September, whose first
 * asked the pair to *open* a mouth; his words: *its not logical to me why we
 * need to open mouth to succeed. more sense makes that the enemy already has
 * open mouth to spit out fire like a dragon … and we have to close the
 * mouth.* Every step is a pose the body morphs into, how it flies there, the
 * marks it shows there, and its three clocks; nothing else about the scene is
 * authored anywhere. The rule for reading a mark: `xMilli`/`yMilli` are
 * thousandths of the field's width and height, `need` is in the gesture's own
 * unit, and **the seat is the mark's own** — the wrong thumb is refused with a
 * sound, and the mark's place on the body is what says whose it is before
 * anyone finds that out: left is player 1's, right is player 2's.
 *
 * **What each step is, in the picture.**
 *
 * 1. *Breath* — it comes in from far off, small, and flies at the ship until
 *    it fills the field, jaws already open on a fire turning in its mouth.
 *    Player 2 pushes the upper jaw down and player 1 the lower jaw up, two
 *    tiles each, so the jaws meet; both must be at depth at once, and a jaw
 *    let go of opens again. Left open, it breathes the fire over the field.
 * 2. *Brood* — it flies off, crosses the frame twice, and comes in to stay
 *    side on, with a brood of eggs on its back, one nest over each half.
 *    Player 1 taps the left nest's eggs until every one is squashed; player 2
 *    swipes the right nest's eggs off, downward, one a swipe. Both are counts,
 *    so the last of each must land inside `instarTogetherBeats` of the other.
 *    Left alone, the eggs hatch and the brood eats the ship.
 * 3. *Lash* — it goes out one side and comes in from the other, and its
 *    forked tail comes at the ship. Each seat taps its own blade of the fork
 *    back, player 1 the left and player 2 the right, and again the two counts
 *    must finish together. Left alone, the tail hits the hull.
 *
 * **The clocks.** A morph is the flight: eight beats for the entrance, which
 * the owner asked to be slow — *so it starts small in the background, then it
 * looks like it more and more flies towards the users screen* — twelve for
 * the two passes, seven for the crossing. A window is eight beats; a landing
 * three, four for the last. The reasoning for each figure being the step's
 * and not tuning: `sim/config-instar.ts`.
 *
 * **The windows were doubled and every need raised on 22 September 2026**,
 * on the owner's ask, and it is the rule for a choreographed scene rather
 * than THE INSTAR's own number: a pair talking its way through a beat it has
 * never seen spends most of a window finding out whose mark is whose, and a
 * window that closes while they are still saying it is a window nobody ever
 * reached the end of. Doubling it buys the saying, and raising the need is
 * what keeps the beat from being over the moment they stop talking — a
 * longer window with the old count is a step that lands itself.
 *
 * **And cut to a third on 24 September 2026**, the owner: *the time players
 * have is huge, it's too much.* The doubling was measured in beats, and a
 * window is played wholly inside THE SLOW, which went from a third to a
 * quarter rate the same day — so twenty-four beats had become a minute of
 * wall clock. Eight is twenty seconds in the hand, which still holds the
 * saying; the needs stay where the doubling put them.
 */
export const INSTAR_SCRIPT: readonly BossSequenceStep[] = [
  {
    pose: "breath",
    arrive: "approach",
    morphBeats: 8,
    windowBeats: 8,
    landBeats: 3,
    marks: [
      { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: 2000 },
      { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: 2000 },
    ],
  },
  {
    pose: "brood",
    arrive: "passes",
    morphBeats: 12,
    windowBeats: 8,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "eggs", gesture: "tap", xMilli: 320, yMilli: 380, need: 8 },
      { seat: "p2", part: "eggs", gesture: "swipeDown", xMilli: 660, yMilli: 360, need: 5 },
    ],
  },
  {
    pose: "lash",
    arrive: "cross",
    morphBeats: 7,
    windowBeats: 8,
    landBeats: 4,
    marks: [
      { seat: "p1", part: "tail", gesture: "tap", xMilli: 380, yMilli: 560, need: 10 },
      { seat: "p2", part: "tail", gesture: "tap", xMilli: 620, yMilli: 560, need: 10 },
    ],
  },
];
