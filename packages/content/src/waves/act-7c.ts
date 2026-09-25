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
