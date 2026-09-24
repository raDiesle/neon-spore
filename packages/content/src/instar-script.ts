import type { BossSequenceStep } from "@neon-spore/sim";

/**
 * THE INSTAR's script: five poses, and what the pair does to each.
 *
 * This is the owner's sequence of 17 September 2026, written as the beat
 * list the simulation reads by index (`sim/instar.ts`). Every step is a
 * pose the body morphs into, the marks it shows there, and its three
 * clocks; nothing else about the scene is authored anywhere. The rule for
 * reading a mark: `xMilli`/`yMilli` are thousandths of the field's width
 * and height, `need` is in the gesture's own unit, and **the seat is the
 * mark's own** — the wrong thumb is refused with a sound, and the mark's
 * place on the body is what says whose it is before anyone finds that out.
 *
 * **What each step is, in the picture.**
 *
 * 1. *Gape* — the jaws. Player 1 pulls the lower jaw down and player 2 pulls
 *    the upper jaw up, and both must be at their depth at once; a jaw let go
 *    of closes. Left shut, the jaws close on the hull.
 * 2. *Armed* — the body has a weapon in one hand and a clutch of eggs on its
 *    flank. Player 1 slaps the hand until it lets go; player 2 swipes the
 *    eggs off, five times, downward, before they hatch. The two are counts,
 *    so the last of each must land inside `instarTogetherBeats` of the
 *    other — the pair says *now* out loud or one of them slips back.
 * 3. *Moulted* — the morph: the body sheds and takes up a second weapon in
 *    the other hand, and its tongue is out. The seats swap sides: player 2
 *    slaps this hand, player 1 winds the tongue back in, two turns and a half
 *    clockwise on the mark. Undone, the tongue spits.
 * 4. *Turned* — the body turns its back and the tail comes over the hull.
 *    One mark, player 2's, pulled up three tiles; player 1 has nothing to do
 *    but watch and say so. Undone, the tail comes down.
 * 5. *Lunge* — the head comes at the ship. Both thumbs on the one mark, held
 *    together for six beats; either coming off is the hold broken.
 *
 * **The clocks.** A morph is four beats, the moult six — the pair is meant
 * to watch it. A window is eight beats for two marks, six for one and nine
 * for the lunge, whose hold is six of them; a landing is three beats of the
 * part giving. The reasoning for each
 * figure being the step's and not tuning: `sim/config-instar.ts`.
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
    pose: "gape",
    morphBeats: 4,
    windowBeats: 8,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "jaw", gesture: "pullDown", xMilli: 500, yMilli: 440, need: 2500 },
      { seat: "p2", part: "jaw", gesture: "pullUp", xMilli: 500, yMilli: 240, need: 2500 },
    ],
  },
  {
    pose: "armed",
    morphBeats: 4,
    windowBeats: 8,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "hand", gesture: "tap", xMilli: 280, yMilli: 400, need: 9 },
      { seat: "p2", part: "eggs", gesture: "swipeDown", xMilli: 720, yMilli: 460, need: 5 },
    ],
  },
  {
    pose: "moulted",
    morphBeats: 6,
    windowBeats: 8,
    landBeats: 3,
    marks: [
      { seat: "p2", part: "hand", gesture: "tap", xMilli: 720, yMilli: 380, need: 12 },
      { seat: "p1", part: "tongue", gesture: "turn", xMilli: 380, yMilli: 320, need: 2500 },
    ],
  },
  {
    pose: "turned",
    morphBeats: 4,
    windowBeats: 6,
    landBeats: 3,
    marks: [{ seat: "p2", part: "tail", gesture: "pullUp", xMilli: 500, yMilli: 500, need: 3000 }],
  },
  {
    pose: "lunge",
    morphBeats: 4,
    windowBeats: 9,
    landBeats: 4,
    marks: [{ seat: "both", part: "head", gesture: "hold", xMilli: 500, yMilli: 320, need: 6 }],
  },
];
