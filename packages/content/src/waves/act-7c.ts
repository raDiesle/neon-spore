import { PULSE_STAGES } from "../pulse-stages.js";
import { SCOUT_ARENAS } from "../scout-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * The third page of act seven, cut off `act-7b.ts` when THE STARE took that
 * file twenty-one lines over the 250-line ceiling.
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
 * twenty-four beats at the opening rhythm: twelve to play in, four of warning,
 * six watched, two turning back. The rocks are deliberately *inside* the
 * looks — a rock is answered by the dome, which is player 1's, and a colour by
 * the trigger, which is player 2's — so a look that takes one seat is a look
 * the pair can still play through if the other control was parked before it
 * landed. The colours sit in the windows, where both seats are free. The looks
 * grow (`stareLookGrowBeats`), so the last window is the short one and the
 * last rock falls with the eye already open.
 */
export const WAVES_ACT_7C: Wave[] = [
  {
    id: "theScout",
    name: "THE SCOUT",
    sentence:
      "The one where the ship puts something small out into the dark, and only one of you can see where it is going.",
    guide: {
      both: "The field is gone. The ship opens and a little one drifts out of it, and everything it has to collect is hanging still while everything that would end it is moving. Collect every mote and the wave is over; let one of the moving ones touch it and the hull pays and the wave starts again.",
      p1: "You fly it and cannot see the arena. ◀ and ▶ swing the nose while held; BURN pushes it that way and it keeps going after you let go. Ask for a heading and how long to burn.",
      p2: "Your screen has the motes and the moving things; MAW is yours, and a mote only comes off the ship while it is open at home. Give them an o'clock and a moment, and say what is crossing.",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_ARENAS },
    controls: "scout",
  },
  {
    id: "theStare",
    name: "THE STARE",
    sentence:
      "The one where something is watching, and the one it is watching has to sit on their hands.",
    guide: {
      both: "An eye over the field. It turns towards one of you for four beats — and only the other seat is told which — then it watches, and that player may not press anything at all until it looks away. Touch a button under it and the hull breaks and the wave starts again. The looks get longer.",
      p1: "You have the column and the dome, and the four beats of the turn are for parking both. If it is watching you, take your hands off and read the field out. If it is watching them, you can still slide — but nothing fires.",
      p2: "Only your screen says who it has chosen, so say it: THEM or YOU, every time it turns. If it is watching you, the triggers are dead and they have the dome. If not, fire up whatever column they parked in.",
    },
    entries: [
      { beat: 3, col: 2, color: "red" },
      { beat: 6, col: 4, color: "cyan" },
      { beat: 9, col: 1, color: "cyan" },
      { beat: 17, col: 3, kind: "meteor", color: null },
      { beat: 20, col: 3, kind: "meteor", color: null },
      { beat: 26, col: 5, color: "red" },
      { beat: 29, col: 0, color: "red" },
      { beat: 32, col: 6, color: "cyan" },
      { beat: 41, col: 2, kind: "meteor", color: null },
      { beat: 44, col: 4, kind: "meteor", color: null },
      { beat: 52, col: 3, color: "red" },
      { beat: 55, col: 1, color: "cyan" },
      { beat: 58, col: 5, color: "red" },
      { beat: 67, col: 3, kind: "meteor", color: null },
      { beat: 72, col: 3, kind: "meteor", color: null },
    ],
    boss: { kind: "stare" },
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
      both: "Slicks, bulbs, rocks and pods fall into four sockets in the hull, and both of you have the same four buttons. Press each one as it lands. Some arrive on your screen as a grey shape you cannot name — those are the ones your partner can read and you cannot.",
      p1: "A shape between the lanes, cycling, is yours to press and theirs to name. Press on the beat rather than waiting to be sure — a late one counts, and anything you skip goes through the hull.",
      p2: "The same is true of you, one bar later. When something on your screen is marked CALL, that is the one they are blind to — say what it is early and say it once, because the window is a sixth of a second wide.",
      scene: "thePulse",
    },
    entries: [],
    boss: { kind: "pulse", stages: PULSE_STAGES },
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
      both: "Two chambers above the top of the field, one lane apart, with a bridge of vessels between them. They beat on different counts and each of you sees only your own beating true — the other one is a still grey mass on your screen. A chamber can only be hurt while it is contracting. Once both of them are beating, nothing single reaches either: the only answer is the lance standing in the middle lane on a beat they contract on together.",
      p1: "The left chamber is yours, and it is threes. Say every contraction out loud. The lance is yours too: cannon in the middle lane, held still three beats. An ordinary shot goes a beat early — a bolt is a beat from the top.",
      p2: "The right chamber is yours, and it is fives. Count it aloud and take their threes off it: the beat both meet on comes round once in fifteen. Your thumb starts the fill and may not lift. Then the right goes to sevens.",
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
  },
  {
    id: "theBaton",
    name: "THE BATON",
    sentence:
      "The one where acting locks you out of the next beat, so the two of you have to become a metronome.",
    guide: {
      both: "An arm hangs from the top of the middle lane, eleven sockets long, with one bright bead in the topmost. The bead is safe in a socket and can only be hurt in the air between two. He launches it with the trigger; she shoots it while it flies; it lands a socket lower and the one it left goes dark. Whoever acts is locked out of their own phone for the next beat, so it can only be passed by taking turns. A launched bead nobody hits lands back where it was. A bead left sitting too long settles, and a settled bead goes back to the top.",
      p1: "The trigger is yours alone: press it, and your phone greys for a beat while she shoots. Say the colour — it flips on every landing. Once four sockets are dark the arm swings, so be under the bead before you press.",
      p2: "The shot is yours: the bead's colour, up the bead's lane, while it flies and not before. After every shot your phone greys for a beat. Say the colour back as it lands. Dark sockets drop as rocks: the plate is yours.",
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
  },
];
