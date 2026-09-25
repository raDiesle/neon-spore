import { PULSE_STAGES } from "../pulse-stages.js";
import { SCOUT_ARENAS } from "../scout-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * The third page of act seven, cut off `act-7b.ts` when THE STARE took that
 * file twenty-one lines over the 250-line ceiling.
 *
 * **THE UNDERTOW stood last on this page until 18 September 2026**, when one
 * line per boss wave — which kind of boss it is (`Wave.bossType`) — took three
 * act files over at once. It moved to the head of `act-7e.ts`, which is the
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
 * **THE DIASTOLE and THE BATON left for a new `act-7d.ts` on 20 September
 * 2026**, this page's own last two waves, when this page sat at 241 of 250
 * lines with no room left for another wave and no letter of its own to give
 * one: it is not the last page of act seven, so the overflow could not simply
 * take the next free letter without playing every wave after it out of order.
 * Every page from `7d` on shifted up one letter instead — the standing
 * convention `docs/queue.md`'s *Act seven has no room* entry settled, the
 * same move `act-7e.ts` (as `act-7d.ts`, the day before) made for THE TASTER
 * and THE SINEW.
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
    guide: {
      both: "An eye watches one of you at a time. Only the other screen is told who, seven beats early. The other keeps playing.",
      p1: "1. Every time it turns, listen for YOU or THEM. Your screen is not told.\n2. YOU: a touch breaks the hull. Say what is falling.\n3. THEM: play on, or pull the lid shut. Shut, they are free. Open, it looks at you.",
      p2: "1. Say who it picks, each turn: YOU or THEM. They are not told.\n2. YOU: a touch breaks the hull. Your partner moves the shield.\n3. THEM: play on, or pull the lid shut. Shut, they are free. Open, it looks at you.",
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
    guide: {
      both: "A rock comes over a side wall. It holds one row and crosses two columns a beat. It never reaches the ship. It blocks the cannon's shots as it passes.",
      p1: "1. Only you see the arrow at the edge.\n2. It shows the row, the side and the way it flies.\n3. Say the row. Count it across.\n4. Your column is yours only until it arrives.",
      p2: "1. You see it only once it is on the field.\n2. The trigger is still yours. Fire on their word.\n3. A shot that meets a rock dies there. The body above goes on falling.",
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
    guide: {
      both: "Two grey balls sit in one column. No shot reaches them. To open them, shake the phone twice, or carry both big arrows outward. Do it in two beats.",
      p1: "1. This is yours, and it is not a button.\n2. Shake the phone twice.\n3. No answer? Carry one arrow off its edge, then the other.\n4. Two moves, two beats. Stop after one and it sings, and the hull pays.",
      p2: "1. You cannot open it. A shot before it opens hits nothing.\n2. The glow says it has started. The colour says which trigger.\n3. Load it, wait for them to close, then fire up their column.",
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
    guide: {
      both: "Things fall into four sockets. Press the matching button as each one lands. A grey shape is one only your partner can name. The bar is yours together.",
      p1: "1. Press the button for each thing as it lands.\n2. A grey shape is theirs to name: press what they say.\n3. Say what the shape marked CALL is, early and once.\n4. Bar low: a thumb on it carries them, but you stop playing.",
      p2: "1. Press the button for each thing as it lands.\n2. Say what the shape marked CALL is, early and once.\n3. A grey shape is theirs to name: press what they say.\n4. Bar nearly gone: both thumbs on it, or it keeps falling.",
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
    guide: {
      both: "They drift up, turning at the walls. At the top one falls back as a torch. Pull both its handles out together, and hold. It splits, then pops.",
      p1: "1. Left handles are yours. Carry them left, and far.\n2. Name the one you take, its column and height, before you take it.\n3. A pull on your own does nothing. Let go early and you lose the hold.",
      p2: "1. Right handles are yours. Carry them right, and far.\n2. Say which one you take back before you take it.\n3. Hold until it gives.\n4. A half nobody agreed on gets away. It comes back down as a torch.",
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
];
