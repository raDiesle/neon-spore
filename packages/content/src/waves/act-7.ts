import type { Wave } from "../wave-types.js";

/**
 * Act seven, and it opens on the first body in this game the **shield** must
 * not be pointed at.
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
 * 1. **THE BARB** teaches the body while both seats still have every control
 *    they are used to. The mistake is available and it is nobody's fault but
 *    theirs: the trigger is under player 1's thumb, and pressing it in the
 *    wrong column is a thing they chose.
 * 2. **THE JAM** takes a control away from the pair and hands it to the wave,
 *    on the creature the game has already taught them not to shoot. Nothing
 *    new is on the field — every body here is one they know — and the only new
 *    thing is that firing is no longer something either of them decides.
 * 3. **THE TWITCH** puts the two together, and it is the only wave here that
 *    could not have been written before either.
 */

/**
 * **THE BARB, in four figures**, and the habit that has to break is the oldest
 * one the game has: *a thing is coming, so put the plate under it*. Every rock
 * since THE ROCK has rewarded that, and this is the first body where it is the
 * losing move.
 *
 * 1. Beat 0, one alone, dead centre, with nothing else on the field for
 *    fourteen beats. The pair has the whole fall to find out that a shot ends
 *    it and a ward does not, and the wave costs them nothing if they simply
 *    leave the trigger alone while they look.
 * 2. Beats 14–16, a rock and a barb one column apart. This is the wave: the
 *    plate has to be *in* one column and *out of* the next, and there are eight
 *    beats to say which is which.
 * 3. Beats 28–30, the same shape mirrored, so the answer cannot become a habit
 *    about which way to slide.
 * 4. Beats 42–44, a fast rock at one wall and a barb four columns away. The
 *    trigger is not the answer here and the cannon is already busy, which is
 *    the sentence stated as arithmetic. A slick at 52 is what the cannon is
 *    still for.
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
 * **THE TWITCH**, and the only wave in this act that could not have been
 * written before the other two. The trigger has stuck down: the dome comes up
 * over player 2's column on every beat, with nobody asking and nobody able to
 * stop it.
 *
 * That makes the fault a gift and a bill at once, which is the reason these
 * two mechanics were built for each other. A rock the plate is standing under
 * is warded for free — player 2's job stops being timing and becomes pure
 * position. A barb in that same column tears the ship and takes the ward away
 * for three beats, so the next rock lands as well. Every column on the field is
 * now one of those two things, and the seat that can move the plate is the
 * seat that cannot stop it coming up.
 *
 * 1. Beat 0, a rock alone, so the first thing the pair meets is the fault
 *    being *useful*.
 * 2. Beat 12, one barb, well away from anything, so the plate has somewhere to
 *    be while they work out what it has become.
 * 3. Beats 24–26, a rock and a barb two columns apart: the plate has to be
 *    under one and past the other, which is a crossing worth asking for.
 * 4. Beats 40–44, a rock at the wall with two barbs between it and the plate.
 *    There is no route that does not go through one, so HOLD DOME is the only
 *    way the rock gets warded — and the wave ends on a rock at the far wall to
 *    say whether they spent it too early.
 */
export const WAVES_ACT_7: Wave[] = [
  {
    id: "theBarb",
    name: "THE BARB",
    sentence: "The one where reaching for the trigger is what breaks the ship.",
    guide: {
      both: "Hooks swept back around a body in its own colour. Only the matching cannon ends one. The shield must never come up in a barb's column — the dome catches on the hooks, tears, and then wards nothing at all for three beats, so the rock behind it lands too. Rocks are still rocks: they still need the plate.",
      p1: "Two things in the same column now, and only one of them wants GUARD. Before you press, say which column the plate is in and hear the answer — a barb standing over it costs you the ship and the next ward as well.",
      p2: "You can see the hooks, so you are the one who has to say them: name the barb's column before it is anywhere near the ship, and keep the plate out of it. When you are clear, say so — that is when the trigger is safe.",
    },
    entries: [
      { beat: 0, col: 3, kind: "barb", color: "red" },
      { beat: 14, col: 1, kind: "meteor", color: null },
      { beat: 16, col: 2, kind: "barb", color: "cyan" },
      { beat: 28, col: 5, kind: "barb", color: "red" },
      { beat: 30, col: 6, kind: "meteor", color: null },
      { beat: 42, col: 0, kind: "meteorMedium", color: null },
      { beat: 44, col: 4, kind: "barb", color: "cyan" },
      { beat: 52, col: 2, color: "red" },
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
    sentence:
      "The one where the shield keeps coming up and every column is either a rock or a barb.",
    guide: {
      both: "The trigger has stuck down. The dome comes up by itself over player 2's column on every beat — nobody has to ask for it and nobody can stop it. A rock the plate is under is warded for free. A barb the plate is under tears the ship and takes the ward away for three beats. SHIELD is dead on player 1's panel; HOLD DOME is in its place, two beats of quiet and then a rest.",
      p1: "Your trigger is gone and your cannon is not. Shoot the barbs — that is the only thing that ends one — and keep a thumb on HOLD DOME for when they have to cross a column with a barb standing in it.",
      p2: "The plate is doing your old job by itself, so your job now is where it is *not*. Name every barb column out loud and stay out of it; when you have to pass through one, say so first and wait for the quiet.",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 12, col: 1, kind: "barb", color: "red" },
      { beat: 24, col: 5, kind: "meteor", color: null },
      { beat: 26, col: 3, kind: "barb", color: "cyan" },
      { beat: 40, col: 0, kind: "meteorMedium", color: null },
      { beat: 42, col: 2, kind: "barb", color: "red" },
      { beat: 44, col: 4, kind: "barb", color: "cyan" },
      { beat: 56, col: 6, kind: "meteor", color: null },
    ],
    malfunction: { kind: "shield" },
  },
];
