import { PULSE_STAGES } from "../pulse-stages.js";
import { SCOUT_ARENAS } from "../scout-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * The third page of act seven, cut off `act-7b.ts` when THE STARE took that
 * file twenty-one lines over the 250-line ceiling.
 *
 * **THE UNDERTOW stood last on this page until 18 September 2026**, when one
 * line per boss wave — which kind of boss it is (`Wave.bossType`) — took three
 * act files over at once. It moved to the head of `act-7d.ts`, which is the
 * next page and therefore the next wave: an act file is a page and the order of
 * the waves is the order of the game, so a page that fills up hands its last
 * wave to the one after it rather than keeping it and growing.
 *
 * **`7c` and not `8`, because the order of the waves is the order of the
 * game** — the rule `act-3b.ts` states and `act-7b.ts` repeats, arrived at the
 * same way each time. An act file is a page rather than a chapter, and this
 * page is a different answer to *what may you touch*: the little ship one of
 * you flies and neither of you can see whole, the eye that stops one of you
 * touching anything at all, and the rock that crosses the field in front of
 * the cannon and leaves.
 *
 * **THE DIASTOLE closes it, and it is the one wave on this page authored
 * around a lane the pair has to keep empty.** Its two chambers hang over
 * authored columns 2 and 4 with the bridge between them at 3, which is
 * `midCol` of whatever field is actually played (`mapCol`), and the only shot
 * that ever takes both is the lance standing in that middle lane — so every
 * arrival is at 0, 1, 5 or 6 and the three columns in the middle are never
 * asked for. The entries are spread evenly rather than laid against the
 * chambers' counts on purpose: which beat the fight changes phase on depends
 * on when the pair lands its second hit, so a wave that tried to place a rock
 * inside a particular window would be placing it against a beat nobody can
 * know at authoring time.
 *
 * **THE STARE's arrivals are placed against the eye's own cycle**, which is
 * twenty-seven beats at the opening rhythm: twelve to play in, seven of
 * warning, six watched, two turning back. The rocks are deliberately *inside*
 * the looks — a rock is answered by the dome, which is player 1's, and a colour
 * by the trigger, which is player 2's — so a look that takes one seat is a look
 * the pair can still play through if the other control was parked before it
 * landed. The colours sit in the windows, where both seats are free. The looks
 * grow (`stareLookGrowBeats`), so the last window is the short one and the
 * last rock falls with the eye already open.
 *
 * **Windows 0-12, 27-39, 57-69; looks 19-25, 46-55, 76-88**, measured off the
 * eye rather than derived — and written up here because the director
 * round-trips `entries` and a comment inside that array does not survive a save.
 * Every beat below was re-authored on 17 September 2026, when the tell went
 * from 4 beats to 7 and the growth from 2 to 3: both moved every window and
 * every look, and the old rows would have left all six rocks outside theirs.
 * `stare-windows.test.ts` exists to catch exactly that, because until then the
 * placement was a sentence in this comment and nothing checked it. */
export const WAVES_ACT_7C: Wave[] = [
  {
    id: "theScout",
    name: "THE SCOUT",
    sentence:
      "The one where the ship puts something small out into the dark, and only one of you can see where it is going.",
    guide: {
      both: "Fly the little ship to every mote. Touch nothing that moves. Carrying more than three makes it heavy.",
      p1: "1. Hold ◀ or ▶ to swing the nose to the o'clock they give.\n2. BURN for as long as they say. It keeps drifting after.\n3. Ask what is crossing before every burn.\n4. Heavy ship: drag it to prime, or the burn does nothing.",
      p2: "1. Say an o'clock for the nearest mote, and how long to burn.\n2. Say what is moving across before they burn.\n3. Open the MAW when it is home.\n4. Four aboard: a thumb on it reels it home. Check the line first.",
      scene: "theScout",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_ARENAS },
    bossType: "special",
    controls: "scout",
  },
  {
    id: "theStare",
    name: "THE STARE",
    sentence:
      "The one where something is watching, and the one it is watching has to sit on their hands.",
    guide: {
      both: "An eye watches one of you at a time, and only the other screen is told who, seven beats early. The other keeps playing.",
      p1: "1. Every time it turns, listen for YOU or THEM. Your screen is not told.\n2. YOU: a touch breaks the hull. Say what is falling.\n3. THEM: play on, or pull the lid over the eye. Shut, they are free; open, it looks at you.",
      p2: "1. Say who it picks, each turn: YOU or THEM. They are not told.\n2. YOU: a touch breaks the hull. Your partner holds the plate.\n3. THEM: play on, or pull the lid over the eye. Shut, they are free; open, it looks at you.",
      scene: "theStare",
    },
    entries: [
      { beat: 3, col: 2, color: "red" },
      { beat: 6, col: 4, color: "cyan" },
      { beat: 9, col: 1, color: "cyan" },
      { beat: 20, col: 3, kind: "meteor", color: null },
      { beat: 23, col: 3, kind: "meteor", color: null },
      { beat: 29, col: 5, color: "red" },
      { beat: 32, col: 0, color: "red" },
      { beat: 35, col: 6, color: "cyan" },
      { beat: 47, col: 2, kind: "meteor", color: null },
      { beat: 51, col: 4, kind: "meteor", color: null },
      { beat: 59, col: 3, color: "red" },
      { beat: 62, col: 1, color: "cyan" },
      { beat: 65, col: 5, color: "red" },
      { beat: 80, col: 3, kind: "meteor", color: null },
      { beat: 85, col: 3, kind: "meteor", color: null },
    ],
    boss: { kind: "stare" },
    bossType: "normal",
  },
  {
    id: "theCrossing",
    name: "THE CROSSING",
    sentence:
      "The one where the lane you are aiming up keeps being taken by something you cannot shoot.",
    guide: {
      both: "A rock that comes over a side wall instead of the top. It holds one row, crosses two lanes a beat and leaves at the far side — it never reaches the ship and nothing turns it away. What it does is stand in front of the cannon on its way past.",
      p1: "The arrow at the edge is yours alone: the row it will hold, the side it comes over, the way it will fly. Say the row and count it across — the lane you are aiming up is only yours until it arrives.",
      p2: "You see it once it is on the field and never before, and the trigger is still yours. Fire on their word: a bolt that meets a rock dies there, and the body above it goes on falling.",
      scene: "theCrossing",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 3, color: "red" },
      { beat: 10, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 18, col: 5, color: "cyan" },
      { beat: 20, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 1, color: "red" },
      { beat: 31, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 34, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theChoir",
    name: "THE CHOIR",
    sentence: "The one where the half-made gesture is worse than none at all.",
    guide: {
      both: "Two grey balls, apart, in one lane. Nothing you can fire reaches either of them. What opens them is not on either panel, and it is two moves inside two beats: shake the phone and shake it again, or carry the two big arrows outward — one, then the other. They glow, then close, and the colour bleeds in as they do.",
      p1: "Yours, and it is not a button. Shake the phone twice; if it will not answer, carry one arrow off its edge and then the other. Two moves, two beats. Stop after the first and it sings, and the hull pays.",
      p2: "You cannot open it, and a shot before it is one is spent on nothing. The glow says it has started; the colour bleeding in says which trigger. Load it, wait for them to close, then fire up their lane.",
      scene: "theChoir",
    },
    entries: [
      { beat: 0, col: 2, kind: "choir", color: "red" },
      { beat: 10, col: 0, kind: "choir", color: "cyan" },
      { beat: 22, col: 4, kind: "choir", color: "cyan" },
      { beat: 34, col: 1, kind: "choir", color: "red" },
    ],
  },
  {
    id: "pulse",
    name: "THE PULSE",
    sentence: "The one where you both play the same song and neither of you can read all of it.",
    guide: {
      both: "Things fall into four sockets. Press the matching button as each one lands. A grey shape is one only your partner can name.",
      p1: "1. Press the button for each thing as it lands. Late beats skipped.\n2. A grey shape is your partner's to name: press what they say.\n3. Say what the shape marked CALL is, early and once.",
      p2: "1. Press the button for each thing as it lands, one bar after your partner.\n2. Say what the shape marked CALL is, early and once.\n3. A grey shape is theirs to name: press what they say.",
      scene: "thePulse",
    },
    entries: [],
    boss: { kind: "pulse", stages: PULSE_STAGES },
    bossType: "special",
    controls: "pulse",
  },
  {
    id: "theBalloon",
    name: "THE BALLOON",
    sentence: "The one where a hand on each of two different bodies is no hands at all.",
    guide: {
      both: "They come up out of nothing a lane above the ship, swell, and then drift — a row and a lane every other beat, turning at the walls. Reach the top and one turns into a torch there and drops back down the field. Nothing either of you can fire touches them. Each one has a handle on its left and a handle on its right: carry both out at the same instant, two lanes' worth, and hold until the skin gives. The first time it splits in two and the halves part, a lane each way, and both of them go on up, each turning at its own wall. The second pull pops what is left, for nothing.",
      p1: "Left handles are yours, carried left, and far. Name the one you are taking — its lane, and how high — before you take it: a pull on your own is nothing, and a hand that lets go early gives the hold back.",
      p2: "Right handles are yours, carried right, and far. Say the one you are taking back before you take it, then hold until it gives. The half nobody agreed on is the one that gets away — up, and back down as a torch.",
      scene: "theBalloon",
    },
    entries: [
      { beat: 0, col: 2, kind: "balloon", color: null },
      { beat: 6, col: 5, kind: "balloon", color: null },
      { beat: 16, col: 4, kind: "balloon", color: null },
      { beat: 24, col: 0, kind: "balloon", color: null },
      { beat: 26, col: 6, kind: "balloon", color: null },
      { beat: 36, col: 2, kind: "balloon", color: null },
    ],
  },
  {
    id: "theDiastole",
    name: "THE DIASTOLE",
    sentence:
      "The one where you are each counting a different number and neither of you can see the other's.",
    guide: {
      both: "Two chambers beat on different counts. Hit each while it contracts. Once both beat, lance the middle lane on the beat they share.",
      p1: "1. Count the left chamber out loud, in threes.\n2. Say which beat both chambers meet on.\n3. Cannon in the middle lane, held still for the lance.\n4. Once your chamber is gone, clamp the grey one when your partner says now.",
      p2: "1. Count the right chamber out loud in fives. Later it goes to sevens.\n2. Take your partner's threes off it: they meet once in fifteen.\n3. Hold a colour to fill the lance three beats early.\n4. Alone, say now on its beat.",
      scene: "theDiastole",
    },
    entries: [
      { beat: 4, col: 0, color: "red" },
      { beat: 7, col: 6, color: "cyan" },
      { beat: 12, col: 1, kind: "meteor", color: null },
      { beat: 16, col: 5, color: "red" },
      { beat: 20, col: 6, kind: "meteor", color: null },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 28, col: 5, kind: "meteor", color: null },
      { beat: 32, col: 1, color: "red" },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 40, col: 0, kind: "meteor", color: null },
      { beat: 45, col: 5, color: "cyan" },
      { beat: 50, col: 1, kind: "meteor", color: null },
      { beat: 55, col: 6, color: "red" },
      { beat: 60, col: 0, color: "cyan" },
      { beat: 66, col: 5, kind: "meteor", color: null },
      { beat: 72, col: 1, color: "cyan" },
    ],
    boss: { kind: "diastole" },
    bossType: "normal",
  },
  {
    id: "theBaton",
    name: "THE BATON",
    sentence:
      "The one where acting locks you out of the next beat, so the two of you have to become a metronome.",
    guide: {
      both: "Pass the bead down the arm, one socket at a time: launch it, shoot it in the air, take turns.",
      p1: "1. Slide the cannon under the bead.\n2. Press the trigger to launch it. Your phone greys for a beat.\n3. Say the colour: it flips on every landing.\n4. After four dark sockets the arm swings: be under the bead first.",
      p2: "1. Load the bead's colour.\n2. Fire up the bead's lane while it flies, not before. Your phone greys for a beat.\n3. Say the colour back as it lands.\n4. Ward the dark sockets that drop as rocks.",
      scene: "theBaton",
    },
    entries: [
      { beat: 14, col: 0, color: "red" },
      { beat: 19, col: 6, color: "cyan" },
      { beat: 25, col: 1, color: "red" },
      { beat: 31, col: 5, kind: "meteor", color: null },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 42, col: 0, color: "red" },
      { beat: 47, col: 1, kind: "meteor", color: null },
      { beat: 52, col: 5, color: "cyan" },
      { beat: 57, col: 6, color: "red" },
      { beat: 62, col: 0, kind: "meteor", color: null },
      { beat: 67, col: 1, color: "cyan" },
      { beat: 72, col: 5, color: "red" },
      { beat: 77, col: 6, kind: "meteor", color: null },
      { beat: 82, col: 0, color: "cyan" },
      { beat: 87, col: 1, color: "red" },
      { beat: 92, col: 5, kind: "meteor", color: null },
      { beat: 97, col: 6, color: "cyan" },
      { beat: 102, col: 0, color: "red" },
    ],
    boss: { kind: "baton" },
    bossType: "normal",
  },
];
