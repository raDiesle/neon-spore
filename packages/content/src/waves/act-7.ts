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
 * The five of them are one argument taken in five steps, and the order is
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
 * 3. **THE COIL** is the only wave here that carries a body nobody has met,
 *    and it is played on the panel the pair already knows. A rock in a dome
 *    crosses the field, nothing touches it while the dome is on, and the plate
 *    standing under it with the trigger open takes the dome off — which is a
 *    *price* and not a move, because the rock that comes out runs for the wall
 *    furthest from the plate. So what the wave teaches is the trigger held
 *    back, and that is a thing a pair can only learn while they still have it.
 *
 * The two after those are in `act-7b.ts`, and the seam is a real one rather
 * than a page break: everything here is played on a panel the pair knows, and
 * the last two are not. **THE TWITCH** is THE COIL again with the trigger
 * stuck down, and **THE CLAW** is a whole panel of its own. That file's header
 * carries both arguments.
 *
 * The prose about a wave lives **here, above the array**, and not beside the
 * entry it is about: `tools/director/src/serialize.ts` regenerates everything
 * from `export const WAVES_ACT_7` down every time somebody saves a wave in the
 * editor, and a comment inside the array is gone the first time they do.
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
 *    this is the beat the pair has to talk their way across, with nothing to
 *    spend on it.
 * 4. Beat 36, a red body and a cyan one two columns apart, arriving together.
 *    Standing between them is worth nothing; they have to be taken on
 *    alternate beats, which is the pair counting the fault's own clock.
 * 5. Beats 48–50, a last lure at one wall and a slick at the other.
 */
/**
 * **THE COIL, and the first wave in this game about a trigger nobody presses.**
 * A rock inside a dome of its own comes in at the right wall and crosses to
 * the left instead of falling, sinking at each wall it turns at. Nothing
 * touches it while the dome is on, and the plate standing under it with the
 * window open takes that dome off wherever it happens to be.
 *
 * **Opening one is a price, and that is the whole creature.** The rock left
 * behind does not fall out of the dome where the dome stood: it runs for the
 * wall furthest from the plate and comes down there, which is by construction
 * as far as the plate could possibly have to travel. And the charge that was
 * holding the dome shut jumps to another one still standing and opens that
 * too, until the field is bare. So a pair that wards a rock with a dome
 * overhead does not lose the rock — they lose the next four beats.
 *
 * What is left for them to do is therefore the one thing they have never had
 * to do with the shield: **not use it yet**. The rock still has to be turned,
 * the plate still has to be in its column, and the trigger has to find the
 * beat when nothing else is over that column. That sentence needs two people
 * because neither of them can see both halves of it: the domes are on player
 * 2's screen and the charge jumping between them is on player 1's.
 *
 * **Every rock here is authored under a coil that is already on the field**,
 * which is the standing rule for this creature (`.claude/skills/new-wave`). A
 * coil enters at the top and sinks a wall at a time; a rock falls a lane a
 * beat. Author the rock first and it is on the ship before a dome is anywhere
 * near its lane, and the wave is two creatures taking turns instead of one
 * decision.
 *
 * 1. Beat 0, one rock alone, dead centre, with nothing else on the field. The
 *    pair does the thing they have done since THE ROCK, one last time, on a
 *    clear field.
 * 2. Beat 10, one coil, on its own. There is nothing to ward and nothing to be
 *    lost, so this is where they find out that nothing touches it, that it
 *    crosses rather than falls, and that it is sinking all the same.
 * 3. Beat 14, a rock two lanes off the coil's own wall, with the coil above
 *    it. The first beat the trigger is a decision: the plate has to be under
 *    the rock, and the beat it is pressed on has to be one no dome is over.
 * 4. Beats 28–34, two coils and a faster rock between them. Now there is a
 *    chain to lose — the first dome to open lights a second — so the cost of
 *    getting the beat wrong stops being one body.
 * 5. Beats 46–52, a last coil and two rocks two lanes apart. There is no beat
 *    that is clear for both of them, and choosing which one to eat is the wave.
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
      both: "The cannon has jammed on. It fires by itself, on every beat, up whichever column player 1 is standing in — and it alternates: red, cyan, red, cyan. RED and CYAN are dead, and nothing stops the gun.",
      p1: "You are not shooting any more, you are aiming. Slide onto a body on the beat its colour comes up, and be off a lure's column before the next shot lands.",
      p2: "You have no trigger this wave. Count the colours out loud so they know which beat is theirs, and call the lures — where the gun is pointed is the only thing either of you can still decide.",
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
    id: "theCoil",
    name: "THE COIL",
    sentence: "The one where the trigger waits for the lane above it to clear.",
    guide: {
      both: "A rock inside a dome of its own. It comes in at the right wall and crosses the field to the left instead of falling, sinking at every wall it turns at, and nothing touches it while the dome is on. The plate takes a dome off the instant the two are in one column with the trigger open — and what comes out runs for the wall furthest from the plate and lands there, too far off to turn. Opening one throws its charge at another dome still standing, and that one opens too.",
      p1: "The trigger is the only thing here you can get wrong. Before you press, ask what is over her column: a dome she stands under opens with the rock, and what it leaves is at the far wall. The charge is yours to call.",
      p2: "The plate is yours and the domes are on your screen. Say your column and say what is crossing it — how many beats until it is clear. They cannot press while a dome is on you, so the count is the whole sentence.",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 10, col: 6, kind: "coil", color: null },
      { beat: 14, col: 2, kind: "meteor", color: null },
      { beat: 28, col: 6, kind: "coil", color: null },
      { beat: 30, col: 6, kind: "coil", color: null },
      { beat: 34, col: 4, kind: "meteorMedium", color: null },
      { beat: 46, col: 6, kind: "coil", color: null },
      { beat: 50, col: 1, kind: "meteor", color: null },
      { beat: 52, col: 5, kind: "meteor", color: null },
    ],
  },
];
