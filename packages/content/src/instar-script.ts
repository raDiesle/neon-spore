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
 *    eggs off, three times, downward, before they hatch. The two are counts,
 *    so the last of each must land inside `instarTogetherBeats` of the
 *    other — the pair says *now* out loud or one of them slips back.
 * 3. *Moulted* — the morph: the body sheds and takes up a second weapon in
 *    the other hand, and its tongue is out. The seats swap sides: player 2
 *    slaps this hand, player 1 winds the tongue back in, a turn and a half
 *    clockwise on the mark. Undone, the tongue spits.
 * 4. *Turned* — the body turns its back and the tail comes over the hull.
 *    One mark, player 2's, pulled up two tiles; player 1 has nothing to do
 *    but watch and say so. Undone, the tail comes down.
 * 5. *Lunge* — the head comes at the ship. Both thumbs on the one mark, held
 *    together for four beats; either coming off is the hold broken.
 *
 * **The clocks.** A morph is four beats, the moult six — the pair is meant
 * to watch it. A window is twelve beats for two marks and eight for one; a
 * landing is three beats of the part giving. The reasoning for each figure
 * being the step's and not tuning: `sim/config-instar.ts`.
 */
export const INSTAR_SCRIPT: readonly BossSequenceStep[] = [
  {
    pose: "gape",
    morphBeats: 4,
    windowBeats: 12,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "jaw", gesture: "pullDown", xMilli: 500, yMilli: 440, need: 1500 },
      { seat: "p2", part: "jaw", gesture: "pullUp", xMilli: 500, yMilli: 240, need: 1500 },
    ],
  },
  {
    pose: "armed",
    morphBeats: 4,
    windowBeats: 12,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "hand", gesture: "tap", xMilli: 280, yMilli: 400, need: 6 },
      { seat: "p2", part: "eggs", gesture: "swipeDown", xMilli: 720, yMilli: 460, need: 3 },
    ],
  },
  {
    pose: "moulted",
    morphBeats: 6,
    windowBeats: 12,
    landBeats: 3,
    marks: [
      { seat: "p2", part: "hand", gesture: "tap", xMilli: 720, yMilli: 380, need: 8 },
      { seat: "p1", part: "tongue", gesture: "turn", xMilli: 380, yMilli: 320, need: 1500 },
    ],
  },
  {
    pose: "turned",
    morphBeats: 4,
    windowBeats: 8,
    landBeats: 3,
    marks: [{ seat: "p2", part: "tail", gesture: "pullUp", xMilli: 500, yMilli: 500, need: 2000 }],
  },
  {
    pose: "lunge",
    morphBeats: 4,
    windowBeats: 10,
    landBeats: 4,
    marks: [{ seat: "both", part: "head", gesture: "hold", xMilli: 500, yMilli: 320, need: 4 }],
  },
];
