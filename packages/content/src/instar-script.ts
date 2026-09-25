import type { BossSequenceStep } from "@neon-spore/sim";

/**
 * THE INSTAR's script: ten steps over five poses, and what the pair does to each.
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
 *    Player 2 pushes the upper jaw down and player 1 the lower jaw up, four
 *    tiles each, so the jaws meet; both must be at depth at once, and a jaw
 *    let go of opens again. Left open, it breathes the fire over the field.
 *    **Three times** (the owner, 25 September 2026: *you repeat 3 times so
 *    dragon tries to keep mouth open and it tries to push back*): the jaws
 *    meet, it forces them open again where it is (`stay`), and the second
 *    bite pushes back against both thumbs every beat, the third twice as
 *    hard (`pushMilli`) — a jaw shut early and held there waiting for the
 *    other opens again under the thumb, so the pull has to be *stronger*,
 *    further, and the two jaws have to meet at once.
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
 * 4. *Lunge* — it comes in face on and drives its head down at the ship to
 *    butt it. One mark, on the brow, for **both** thumbs: both seats hold it
 *    off together for three beats, and either thumb lifting lets it come on
 *    again. Left alone, the head hits the hull.
 * 5. *Breath, turned round* — the fire again, **the hands swapped**: player 1
 *    pushes the upper jaw down and player 2 the lower up. The pair that
 *    learned whose jaw was whose has to say it again.
 * 6. *Coil* — it passes twice and comes in low, side on, its tail wound up
 *    high over its back to spring. Each seat **winds** its blade of the fork
 *    back, two turns each, clockwise. Left alone, it springs at the hull.
 * 7. *Lunge, split* — the head down at the ship again, and this time one
 *    thumb holds it: player 1 holds the brow off, left of the seam, for
 *    three beats, while player 2 strikes the right eye, twelve taps, and it
 *    flinches shut a little with each. Two gestures on one head, and the hold
 *    has to last until the eye is done — a lift is the brow let go.
 * 8. *Lash, mixed* — the tail at the ship once more, and each blade asks a
 *    different thing: player 1 taps the left back, player 2 winds the right.
 *    Two counts in two gestures, finishing together.
 *
 * (Steps 2–8 below are the script's steps 4–10: the breath's three bites are
 * one item because they are one scene.)
 *
 * **The clocks.** A morph is the flight: eight beats for the entrance, which
 * the owner asked to be slow — *so it starts small in the background, then it
 * looks like it more and more flies towards the users screen* — twelve for
 * the two passes, seven for the crossing, three for a bite it stays for,
 * and less for a pose the body reaches from close by. A window is four
 * beats, five for the hold, whose need is itself beats; a landing three,
 * two between the bites, four for the last. The reasoning for
 * each figure being the step's and not tuning: `sim/config-instar.ts`.
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
 * wall clock.
 *
 * **Then every need doubled and every window halved on 25 September 2026**,
 * and four steps added: the owner, *the actions for each scene to finish are
 * to fast finished, so i suggest to double the required actions for every
 * scene. also we can reduce the available time for a scene by around the
 * half* — and *more choreographed states and actions required by players in
 * different variations and combinations*. So a jaw is four tiles, a nest
 * sixteen eggs and ten, a blade twenty taps, in four beats; and the new steps
 * are the variations: a mark both seats share, the seats swapped on a pose
 * they already know, a gesture the script had never asked for, and two
 * gestures on one part. The eighth, the split lunge, came the same day, the
 * first of the queue's next steps: one seat holding while the other strikes.
 */
export const INSTAR_SCRIPT: readonly BossSequenceStep[] = [
  {
    pose: "breath",
    arrive: "approach",
    morphBeats: 8,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: 4000 },
      { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: 4000 },
    ],
  },
  {
    pose: "breath",
    arrive: "stay",
    morphBeats: 3,
    windowBeats: 4,
    landBeats: 2,
    pushMilli: 250,
    marks: [
      { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: 4000 },
      { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: 4000 },
    ],
  },
  {
    pose: "breath",
    arrive: "stay",
    morphBeats: 3,
    windowBeats: 4,
    landBeats: 3,
    pushMilli: 500,
    marks: [
      { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: 4000 },
      { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: 4000 },
    ],
  },
  {
    pose: "brood",
    arrive: "passes",
    morphBeats: 12,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "eggs", gesture: "tap", xMilli: 320, yMilli: 380, need: 16 },
      { seat: "p2", part: "eggs", gesture: "swipeDown", xMilli: 660, yMilli: 360, need: 10 },
    ],
  },
  {
    pose: "lash",
    arrive: "cross",
    morphBeats: 7,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "tail", gesture: "tap", xMilli: 380, yMilli: 560, need: 20 },
      { seat: "p2", part: "tail", gesture: "tap", xMilli: 620, yMilli: 560, need: 20 },
    ],
  },
  {
    pose: "lunge",
    arrive: "approach",
    morphBeats: 6,
    windowBeats: 5,
    landBeats: 3,
    marks: [{ seat: "both", part: "head", gesture: "hold", xMilli: 500, yMilli: 300, need: 3 }],
  },
  {
    pose: "breath",
    arrive: "cross",
    morphBeats: 6,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "jaw", gesture: "pullDown", xMilli: 440, yMilli: 220, need: 4000 },
      { seat: "p2", part: "jaw", gesture: "pullUp", xMilli: 560, yMilli: 500, need: 4000 },
    ],
  },
  {
    pose: "coil",
    arrive: "passes",
    morphBeats: 10,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "tail", gesture: "turn", xMilli: 380, yMilli: 330, need: 2000 },
      { seat: "p2", part: "tail", gesture: "turn", xMilli: 620, yMilli: 330, need: 2000 },
    ],
  },
  {
    pose: "lunge",
    arrive: "cross",
    morphBeats: 7,
    windowBeats: 5,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "head", gesture: "hold", xMilli: 440, yMilli: 300, need: 3 },
      { seat: "p2", part: "eye", gesture: "tap", xMilli: 632, yMilli: 280, need: 12 },
    ],
  },
  {
    pose: "lash",
    arrive: "cross",
    morphBeats: 7,
    windowBeats: 4,
    landBeats: 4,
    marks: [
      { seat: "p1", part: "tail", gesture: "tap", xMilli: 380, yMilli: 560, need: 20 },
      { seat: "p2", part: "tail", gesture: "turn", xMilli: 620, yMilli: 560, need: 2000 },
    ],
  },
];
