import type { Wave } from "../wave-types.js";

/**
 * The seventh page of act seven, cut off `act-7e.ts` when THE LEAD would have
 * taken it over the 250-line ceiling: THE SURGE had left it three under.
 *
 * **`7g` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order
 * of the game. It started one wave long, and THE LEDGER and THE SURGE came
 * over from `act-7e.ts` on 18 September 2026, when one line per boss wave —
 * which kind of boss it is (`Wave.bossType`) — took that page over the ceiling.
 *
 * **It was `act-7f.ts` until 19 September 2026**, when THE TASTER and THE
 * SINEW — `act-7e.ts`'s own last two waves at the time, and earlier in the
 * order of the game than everything on this page — needed a page of their
 * own between `act-7e.ts` and this one. Taking this page's own letter would
 * have played them after THE INSTAR, seven waves later than the game has
 * always played them, so this page's letter moved instead and its content
 * did not.
 *
 * **It became `act-7g.ts` in turn on 20 September 2026**, the same way and
 * for the same reason: `act-7c.ts` had no room left for another wave and no
 * letter of its own to give one, so `act-7c.ts`'s own last two waves, THE
 * BATON among them, took the new `act-7d.ts`, and every page from there on
 * shifted up one letter (`docs/queue.md`'s *Act seven has no room* entry).
 *
 * **THE LEAD's arrivals are the shots the pair cannot spare.** The body is
 * hit only by a shot put where it *will* be, a beat after it leaves the top
 * — so every body under it costs a shot fired at where something *is*, and
 * a bolt fired at a body is a bolt not in the air over the column the pair
 * has just agreed on. Rocks for the shield, so the cannon can stay on the
 * sum, and a few slicks of both colours at the walls, well apart, so a wrong
 * one is a decision and not a reflex. Once it runs it litters the field
 * itself — a torch in the column it left, a rock in the column a shot has to
 * go to (`sim/lead-step.ts`) — so the authored list thins out from the
 * middle of the wave rather than thickening. Nothing is placed against the
 * body's own column, for THE TASTER's reason on the page before: where it is
 * on a beat depends on which shots the pair has landed, which no author can
 * know.
 *
 * **THE SCUTTLE authors nothing.** Every body that falls in its wave is a
 * part of the frame thrown down its own column, and which part goes next
 * is the frame's clock; the wave is the frame (`sim/scuttle-step.ts`,
 * `bossFillsWave`).
 *
 * **THE ANTIPHON authors nothing either.** What falls in its wave is what
 * the pair got wrong — a candidate a pit rejected, an organ left to sink —
 * and the design says nothing else arrives (`sim/antiphon-step.ts`).
 *
 * **THE HIVE authors nothing either, and THE SCUTTLE's way.** Every body that falls in its wave is
 * the breach's own colour, living, spilled down its own column on the
 * breach's clock, and a wave authored beside it would be a spill nobody
 * could seal (`sim/hive-step.ts`). What the pair's speed buys is how many
 * breaches are spilling at once, never whether one is.
 *
 * **THE INSTAR authors its script and nothing that falls.** The body is the
 * wave (`instar-script.ts`, `bossFillsWave`), and **it carries no guide.**
 * The owner's ask of 17 September 2026 was a boss understood without a
 * tutorial, and on 25 September 2026 the owner took what was left of one off:
 * *the boss is self explanatory, because it contains in game text
 * descriptions and visual helps, so remove completely the guide/tutorial
 * stepper part with its text.* The marks are the instruction, where a mark
 * sits says whose, and its scanner box names the gesture; the wave opens on
 * its number and name. `test/waves.test.ts` names it, with THE FILAMENT, as a
 * wave first on a panel with nothing to say. Since its second act (26
 * September 2026) it plays on STANDARD 5, because five of its steps are
 * answered by the ship's own panel — shield, shoot and suck under a mark
 * (`sim/scene-panel.ts`). The comment is up here rather than on the
 * wave because the director writes this file back and keeps nothing between
 * a wave's braces.
 */
export const WAVES_ACT_7G: Wave[] = [
  {
    id: "theTaster",
    name: "THE TASTER",
    guide: {
      scene: "theTaster",
    },
    entries: [
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 24, col: 8, kind: "meteor", color: null },
      { beat: 30, col: 5, color: "red" },
      { beat: 36, col: 0, color: "cyan" },
      { beat: 44, col: 10, kind: "meteor", color: null },
      { beat: 50, col: 3, color: "red" },
      { beat: 56, col: 7, color: "cyan" },
      { beat: 64, col: 5, kind: "meteor", color: null },
      { beat: 72, col: 2, color: "cyan" },
      { beat: 80, col: 8, color: "red" },
    ],
    boss: { kind: "taster" },
    bossType: "normal",
  },
  {
    id: "theVeer",
    name: "THE VEER",
    guide: {
      scene: "theVeer",
    },
    entries: [
      { beat: 0, col: 5, kind: "veer", color: null },
      { beat: 18, col: 8, kind: "veer", color: null },
      { beat: 34, col: 3, kind: "veer", color: null },
      { beat: 38, col: 10, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerAgain",
    name: "VEERS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "veer", color: null },
      { beat: 6, col: 9, kind: "veer", color: null },
      { beat: 13, col: 2, kind: "veer", color: null },
      { beat: 19, col: 7, kind: "veer", color: null },
      { beat: 26, col: 10, kind: "veer", color: null },
      { beat: 32, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerSpread",
    name: "VEERS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veer", color: null },
      { beat: 7, col: 3, kind: "volley", color: "red" },
      { beat: 14, col: 4, kind: "veer", color: null },
      { beat: 21, col: 2, kind: "volley", color: "red" },
      { beat: 28, col: 5, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerReach",
    name: "VEERS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veer", color: null },
      { beat: 6, col: 5, kind: "volley", color: "red" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 5, kind: "veer", color: null },
      { beat: 23, col: 1, kind: "volley", color: "red" },
      { beat: 29, col: 6, color: "cyan" },
    ],
  },
  {
    id: "theVeerPair",
    name: "VEER AND VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 10, col: 0, color: "red" },
      { beat: 15, col: 6, kind: "volley", color: "cyan" },
      { beat: 21, col: 2, color: "red" },
      { beat: 26, col: 1, kind: "veer", color: null },
      { beat: 32, col: 10, color: "cyan" },
      { beat: 36, col: 6, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "theVeerBreathe",
    name: "EASY VEERS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 0, kind: "veer", color: null },
      { beat: 13, col: 4, color: "cyan" },
      { beat: 19, col: 0, kind: "volley", color: "red" },
      { beat: 26, col: 2, color: "red" },
      { beat: 34, col: 7, kind: "carom", color: "cyan" },
    ],
  },
  {
    id: "theVeerRecall",
    name: "VEER RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 17, col: 10, kind: "ghost", color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 1, kind: "veer", color: null },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 39, col: 2, kind: "ghost", color: "red" },
    ],
  },
  {
    id: "theVeerBend",
    name: "VEERS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 7, kind: "veer", color: null },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 17, col: 6, kind: "volley", color: "red" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 29, col: 8, kind: "veer", color: null },
      { beat: 35, col: 4, kind: "volley", color: "red" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 6, color: "cyan" },
      { beat: 45, col: 7, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerPeak",
    name: "VEER PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 4, col: 4, kind: "veer", color: null },
      { beat: 8, col: 2, color: "red" },
      { beat: 12, col: 0, kind: "volley", color: "cyan" },
      { beat: 15, col: 1, color: "cyan" },
      { beat: 15, col: 9, color: "cyan" },
      { beat: 22, col: 4, kind: "veer", color: null },
      { beat: 26, col: 2, color: "red" },
      { beat: 26, col: 8, color: "red" },
      { beat: 30, col: 10, kind: "volley", color: "red" },
      { beat: 37, col: 2, color: "red" },
      { beat: 37, col: 8, color: "red" },
      { beat: 41, col: 4, kind: "veer", color: null },
      { beat: 45, col: 7, kind: "volley", color: "cyan" },
    ],
    pods: [
      { beat: 19, col: 6, row: 3, kind: "ward" },
      { beat: 34, col: 0, row: 4, kind: "ward" },
    ],
  },
];
