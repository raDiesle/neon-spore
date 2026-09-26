import { INSTAR_SCRIPT } from "../instar-script.js";
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
    id: "theLedger",
    name: "THE LEDGER",
    guide: {
      scene: "theLedger",
    },
    entries: [
      { beat: 18, col: 1, kind: "meteor", color: null },
      { beat: 26, col: 5, color: "red" },
      { beat: 34, col: 3, color: "cyan" },
      { beat: 44, col: 0, kind: "meteor", color: null },
      { beat: 52, col: 6, color: "red" },
      { beat: 62, col: 2, color: "cyan" },
      { beat: 72, col: 4, kind: "meteor", color: null },
      { beat: 82, col: 5, color: "cyan" },
    ],
    boss: { kind: "ledger" },
    bossType: "normal",
  },
  {
    id: "theSurge",
    name: "THE SURGE",
    guide: {
      scene: "theSurge",
    },
    entries: [
      { beat: 14, col: 1, kind: "meteor", color: null },
      { beat: 22, col: 5, color: "red" },
      { beat: 30, col: 3, kind: "meteor", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 48, col: 4, kind: "meteor", color: null },
      { beat: 58, col: 6, color: "red" },
      { beat: 66, col: 2, color: "cyan" },
      { beat: 76, col: 3, kind: "meteor", color: null },
    ],
    boss: { kind: "surge" },
    bossType: "normal",
  },
  {
    id: "theLead",
    name: "THE LEAD",
    guide: {
      scene: "theLead",
    },
    entries: [
      { beat: 10, col: 2, kind: "meteor", color: null },
      { beat: 18, col: 0, color: "red" },
      { beat: 26, col: 4, kind: "meteor", color: null },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 46, col: 1, kind: "meteor", color: null },
      { beat: 58, col: 0, color: "cyan" },
      { beat: 70, col: 5, kind: "meteor", color: null },
      { beat: 84, col: 6, color: "red" },
    ],
    boss: { kind: "lead" },
    bossType: "normal",
  },
  {
    id: "theScuttle",
    name: "THE SCUTTLE",
    guide: {
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
    bossType: "normal",
  },
  {
    id: "theAntiphon",
    name: "THE ANTIPHON",
    guide: {
      scene: "theAntiphon",
    },
    entries: [],
    boss: { kind: "antiphon" },
    bossType: "normal",
  },
  {
    id: "theHive",
    name: "THE HIVE",
    guide: {
      scene: "theHive",
    },
    entries: [],
    boss: { kind: "hive" },
    bossType: "normal",
  },
  {
    id: "theInstar",
    name: "THE INSTAR",
    entries: [],
    boss: { kind: "instar", steps: INSTAR_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
