import type { Wave } from "../wave-types.js";

/**
 * Act seven, and it opens on the first body in this game that cannot be
 * answered from the column it is standing in.
 *
 * The acts are not a design unit — `waves.ts` says so at length: they exist
 * because a list that grows a dozen lines a wave has to be cut somewhere, and
 * a chapter of the game is the least arbitrary place to cut it. `act-6.ts` had
 * no room left for three waves carrying guides, exactly as `act-5.ts` had none
 * for THE VEER, so this is where new waves land now.
 *
 * The three of them are one argument taken in three steps, and the order is
 * the whole of it.
 *
 * 1. **THE MAGNET** takes the oldest habit in the game away — put the muzzle
 *    under it and fire — while both seats still have every control they are
 *    used to. Nothing is hidden and nothing has broken; the pair simply has to
 *    stand somewhere else and say so.
 * 2. **THE JAM** takes a control away from the pair and hands it to the wave,
 *    on the creature the game has already taught them not to shoot. Nothing
 *    new is on the field — every body here is one they know — and the only new
 *    thing is that firing is no longer something either of them decides.
 * 3. **THE TWITCH** is the other fault, and the only wave here that could not
 *    have been written before the other two.
 */

/**
 * **THE MAGNET, in four figures**, and the habit that has to break is the
 * oldest one the game has: *a thing is standing in a column, so put the muzzle
 * in that column*. Every arrival since THE SLICK has rewarded that, and this
 * is the first body where it is the losing move.
 *
 * 1. Beat 0, one alone, dead centre, with nothing else on the field for
 *    fourteen beats. The pair has the whole fall to find out that a shot
 *    straight up its column bounces off the plate, and that a thumb on the
 *    body with the muzzle a lane over does not.
 * 2. Beats 14–16, a magnet at one wall and an ordinary body away from it. The
 *    cannon wants to be where the slick is, and that is also a side the magnet
 *    can be taken from — so the first time the pair gets this right it is
 *    because standing in the *other* body's column happened to be an answer,
 *    which is the sentence stated as geography.
 * 3. Beats 28–30, a magnet and a rock two columns apart. The plate has to be
 *    under one, the muzzle has to be beside the other, and neither of them can
 *    be where it wants to be — this is the wave.
 * 4. Beats 44–46, two magnets at opposite walls, authored the opposite way
 *    round. Crossing from one to the other flips the side and the colour at
 *    once, which no habit about either can answer.
 */
/**
 * **THE JAM, and the first wave where firing is not a decision either of them
 * makes.** The cannon has stuck on: it fires up player 1's column on every
 * beat, and the colour alternates red, cyan, red, cyan.
 *
 * Both halves of the wave earn their place, and the pairing is the design. The
 * lures make *any* shot the mistake, so the pair has to steer the muzzle off a
 * column entirely — the thing THE LURE taught them not to do is now the thing
 * the ship does by itself. The ordinary bodies beside them make the **colour**
 * matter, so the beat the gun happens to be loaded right on is a beat somebody
 * has to call out. A fault fixed to one colour would have made half this wave
 * unanswerable and the other half a matter of standing still.
 *
 * 1. Beat 0, one lure alone. Nothing can be done about the firing, so the
 *    whole lesson of the first six beats is that the cannon has to *leave*.
 * 2. Beat 6, a bulb two columns away, so the crossing has a reason and the
 *    colour has a consequence.
 * 3. Beats 18–22, two lures with one target between them. The muzzle can only
 *    rest in one place and getting to it crosses a column it must not fire up:
 *    this is the beat HOLD FIRE exists for.
 * 4. Beat 36, a red body and a cyan one two columns apart, arriving together.
 *    Standing between them is worth nothing; they have to be taken on
 *    alternate beats, which is the pair counting the fault's own clock.
 * 5. Beats 48–50, a last lure at one wall and a slick at the other.
 */
/**
 * **THE TWITCH**, and the fault that gives with one hand and bills with the
 * other. The trigger has stuck down: the dome comes up over player 2's column
 * on every beat, with nobody asking and nobody able to stop it.
 *
 * That is why the wave is written on clasps. A rock the plate is standing
 * under is warded for free — player 2's job stops being timing and becomes
 * pure position. A clasp the plate passes is *opened* for free as well, on a
 * beat nobody chose, and what comes out of one is a body the cannon has to
 * answer straight away. So the navigator's route across the field is also a
 * schedule of work for the pilot, and the only thing that can hold it back is
 * player 1's own hand.
 *
 * 1. Beat 0, a rock alone, so the first thing the pair meets is the fault
 *    being *useful*.
 * 2. Beat 12, one clasp, well away from anything, so they can watch it come
 *    open by itself and see what that costs.
 * 3. Beats 24–26, a rock and a clasp two columns apart: the plate has to be
 *    under one and past the other, which is a crossing worth asking for.
 * 4. Beats 40–44, a rock at the wall with two clasps between it and the plate.
 *    There is no route to the rock that does not open both, so HOLD DOME is
 *    the only way to take them one at a time — and the wave ends on a rock at
 *    the far wall to say whether they spent it too early.
 */
export const WAVES_ACT_7: Wave[] = [
  {
    id: "theMagnet",
    name: "THE MAGNET",
    sentence: "The one where standing under it is how you miss.",
    guide: {
      both: "A horseshoe on two poles, one red and one cyan, with an armoured plate slung underneath. A shot straight up its column hits the plate and bounces off it. Player 1 holds a thumb on the body from another column instead: the shot climbs, turns level with it and comes in sideways. Whichever side it arrives from is the pole it meets, and that pole's colour is the only one that kills it.",
      p1: "Never stand under it. Take the cannon two or three columns to one side, hold your thumb on the body, and say which side you are coming in from. That is your whole half; the colour is not yours to pick.",
      p2: "You cannot put a hand on this one, so wait to be told the side and read the pole on it. Load that colour and fire. A bolt that bounces off the underside means they were still in its column.",
    },
    entries: [
      { beat: 0, col: 3, kind: "magnet", color: "red" },
      { beat: 14, col: 1, kind: "magnet", color: "cyan" },
      { beat: 16, col: 5, color: "red" },
      { beat: 28, col: 4, kind: "magnet", color: "red" },
      { beat: 30, col: 2, kind: "meteor", color: null },
      { beat: 44, col: 0, kind: "magnet", color: "cyan" },
      { beat: 46, col: 6, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theJam",
    name: "THE JAM",
    sentence:
      "The one where the gun will not stop, and the only thing left to decide is what it is pointed at.",
    guide: {
      both: "The cannon has jammed on. It fires by itself, on every beat, up whichever column player 1 is standing in — and it alternates: red, cyan, red, cyan. RED and CYAN are dead. In their place player 2 has HOLD FIRE, which stops the gun for two beats and then needs six before it will answer again.",
      p1: "You are not shooting any more, you are aiming. Slide onto a body on the beat its colour comes up, and get off a lure's column before the next shot — say which column you are crossing and ask for the quiet.",
      p2: "You have one button and it is a brake, not a trigger. Count the colours out loud so they know which beat is theirs, and press HOLD FIRE the moment they say they are crossing. You cannot spend it twice.",
    },
    entries: [
      { beat: 0, col: 3, kind: "lure", color: "red" },
      { beat: 6, col: 5, color: "cyan" },
      { beat: 18, col: 1, kind: "lure", color: "cyan" },
      { beat: 20, col: 3, color: "red" },
      { beat: 22, col: 5, kind: "lure", color: "red" },
      { beat: 36, col: 2, color: "red" },
      { beat: 36, col: 4, color: "cyan" },
      { beat: 48, col: 0, kind: "lure", color: "cyan" },
      { beat: 50, col: 6, color: "red" },
    ],
    malfunction: { kind: "cannon", color: "alternating" },
  },
  {
    id: "theTwitch",
    name: "THE TWITCH",
    sentence: "The one where the plate opens every clasp it walks past, ready or not.",
    guide: {
      both: "The trigger has stuck down. The dome comes up by itself over player 2's column on every beat — nobody has to ask for it and nobody can stop it. A rock the plate is under is warded for free. A clasp the plate passes is cracked open for free as well, and what falls out of one is a body the cannon has to answer. SHIELD is dead on player 1's panel; HOLD DOME is in its place, two beats of quiet and then a rest.",
      p1: "Your trigger is gone and your cannon is not, and everything the plate opens lands on you. Say when you are behind — HOLD DOME is the only way they can cross a clasp column without cracking it, and it is yours to spend.",
      p2: "The plate is doing your old job by itself, so what matters is where it goes rather than when. Name the clasp columns before you reach them: every one you pass comes open, and that is a body to shoot.",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 12, col: 1, kind: "clasp", color: "red" },
      { beat: 24, col: 5, kind: "meteor", color: null },
      { beat: 26, col: 3, kind: "clasp", color: "cyan" },
      { beat: 40, col: 0, kind: "meteorMedium", color: null },
      { beat: 42, col: 2, kind: "clasp", color: "red" },
      { beat: 44, col: 4, kind: "clasp", color: "cyan" },
      { beat: 56, col: 6, kind: "meteor", color: null },
    ],
    malfunction: { kind: "shield" },
  },
];
