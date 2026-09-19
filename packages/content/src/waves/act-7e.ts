import { INSTAR_SCRIPT } from "../instar-script.js";
import type { Wave } from "../wave-types.js";

/**
 * The fifth page of act seven, cut off `act-7d.ts` when THE LEAD would have
 * taken it over the 250-line ceiling: THE SURGE had left it three under.
 *
 * **`7e` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order
 * of the game. It started one wave long, and THE LEDGER and THE SURGE came
 * over from `act-7d.ts` on 18 September 2026, when one line per boss wave —
 * which kind of boss it is (`Wave.bossType`) — took that page over the ceiling.
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
 * body's own column, for THE DIASTOLE's reason: where it is on a beat
 * depends on which shots the pair has landed, which no author can know.
 *
 * **THE SCUTTLE authors nothing.** Every body that falls in its wave is a
 * part of the frame thrown down its own column, and which part goes next
 * is the frame's clock; the wave is the frame (`sim/scuttle-step.ts`,
 * `bossFillsWave`) — THE ORRERY's shape, one page back.
 *
 * **THE ANTIPHON authors nothing either.** What falls in its wave is what
 * the pair got wrong — a candidate a pit rejected, an organ left to sink —
 * and the design says nothing else arrives (`sim/antiphon-step.ts`).
 *
 * **THE HIVE authors nothing either, and THE SCUTTLE's way.** Every body that falls in its wave is
 * a rock an open breach spilled down its own column, on the breach's clock,
 * and a wave authored beside it would be a spill nobody could seal
 * (`sim/hive-step.ts`). What the pair's speed buys is how many breaches are
 * spilling at once, never whether one is.
 *
 * **THE INSTAR authors its script and nothing that falls.** The body is the
 * wave (`instar-script.ts`, `bossFillsWave`), and **its guide says only that
 * there is nothing to read.** The owner's ask of 17 September 2026 was a
 * boss understood without a tutorial — and the game's rule is that the first
 * wave on a panel carries one (`test/waves.test.ts`), so this one is the
 * shortest it can be: the marks are the instruction, and where a mark sits
 * says whose. Nothing in it names a gesture; the picture does that. The
 * comment is up here rather than on the wave because the director writes
 * this file back and keeps nothing between a wave's braces.
 */
export const WAVES_ACT_7E: Wave[] = [
  {
    id: "theLedger",
    name: "THE LEDGER",
    sentence: "The one where every hit you land comes back at your own hull.",
    guide: {
      both: "Hit the split five times in the colour it shows. Every hit comes back down the cord four beats later, a beat sooner each time after, down to two. Ward it in the socket or lose the wave. Let the last one land.",
      p1: "1. Only you see the return coming. Count it down aloud.\n2. Trigger on the beat it lands; the column is hers.\n3. From the second hit every shot is billed, and every ward widens the split.\n4. The last one: do not press.",
      p2: "1. Only you see the socket. Say the column it walks to, every time.\n2. Load the colour the split shows; it fires up his column.\n3. Plate in the socket before his beat.\n4. On the last return, move the plate off it.",
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
    sentence: "The one you beat by letting go, and only if you both let go at once.",
    guide: {
      both: "Both thumbs on the bulb charge it. Let go together inside the band. Five notches, and from the second it keeps what it has and feeds on the wave.",
      p1: "1. Only you see the band. Say OFF as the pressure reaches it.\n2. Lift on OFF, never alone: one thumb loses it.\n3. From the second notch it holds the charge with no hand on.\n4. From the third, a burst shuts a notch.",
      p2: "1. Only you see the pressure. Read it out every beat.\n2. Lift the instant OFF is called. Over the band it bursts.\n3. From the second notch it stops leaking between tries.\n4. From the third your thumb adds double.",
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
    sentence: "The one you shoot where it will be, not where it is.",
    guide: {
      both: "Shoot the walking body where it will be, not where it is. One segment a hit. On the last, hold the beam in its path.",
      p1: "1. Say LEFT or RIGHT every beat: where it goes next.\n2. From the second segment, say the turn a beat early.\n3. Slide the cannon under the column it will be in.\n4. On the last segment, keep the cannon in its path.",
      p2: "1. Say the column it stands in, every beat.\n2. Fire the beat your partner says the cannon is under where it will be.\n3. On the last segment, hold a colour for the beam.",
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
    sentence: "The one that throws itself at you, a part at a time, and each part is a window.",
    guide: {
      both: "Shoot each part off the frame while it hangs, in its colour and column, before it is thrown. Hold the beam under the last.",
      p1: "1. Say the count down to the throw.\n2. Slide the cannon under the column your partner says.\n3. Trigger the plate under thrown rocks. Take a pod that drops.\n4. On the last part, keep the cannon under it.",
      p2: "1. As a part comes loose, say which one is live, its colour and its column.\n2. Load that colour and fire once the cannon is under it.\n3. Move the plate under thrown rocks.\n4. On the last part, hold its colour: the beam.",
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
    bossType: "normal",
  },
  {
    id: "theAntiphon",
    name: "THE ANTIPHON",
    sentence:
      "The one that grows a thing nobody has a word for, and one of you has to say it anyway.",
    guide: {
      both: "Describe the organ; find it on the rail; shoot it in its column and colour. Six pits.",
      p1: "1. Say the organ's shape in your own words: lobes, leaning, hollow.\n2. Keep going until your partner names a column.\n3. Slide the cannon there.\n4. From three pits, slide under whatever falls.",
      p2: "1. Listen, and find the candidate on the rail.\n2. Say its column and its colour. If you cannot tell, ask what would tell them apart.\n3. Load the colour and fire once the cannon is there.",
      scene: "theAntiphon",
    },
    entries: [],
    boss: { kind: "antiphon" },
    bossType: "normal",
  },
  {
    id: "theHive",
    name: "THE HIVE",
    sentence: "The one you seal, and every breach you have not sealed yet is spilling.",
    guide: {
      both: "Seal all nine breaches: a shot in each one's colour, up its column, while it is open. Ward the rocks they spill.",
      p1: "1. Say each breach's colour as it opens: THREE IS RED.\n2. Slide the cannon under the breach your partner names.\n3. When they say where the next opens, be there before it does.\n4. Trigger the plate on rocks.",
      p2: "1. Say the column where the next breach swells, three beats ahead.\n2. Load the colour your partner gives for the breach the cannon is under.\n3. Fire.\n4. Move the plate under the rocks.",
    },
    entries: [],
    boss: { kind: "hive" },
    bossType: "normal",
  },
  {
    id: "theInstar",
    name: "THE INSTAR",
    sentence:
      "The one with no panel: its body is marked where it will hurt you, and whose thumb the mark wants.",
    guide: {
      both: "No buttons. The body says what to do and where, in red. Do it before the ring closes.",
      p1: "1. Find the bright mark with a word over it. That one is yours.\n2. Do what the word says, on the mark, before the ring closes.\n3. A dim mark is your partner's: watch it, and say when they have it.",
      p2: "1. Find the bright mark with a word over it. That one is yours.\n2. Do what the word says, on the mark, before the ring closes.\n3. A dim mark is your partner's: say when they have it, then wait for them to say yours.",
    },
    entries: [],
    boss: { kind: "instar", steps: INSTAR_SCRIPT },
    bossType: "normal",
    controls: "scene",
  },
];
