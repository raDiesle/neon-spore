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
 * letter of its own to give one, so THE DIASTOLE and THE BATON — `act-7c.ts`'s
 * own last two waves — took the new `act-7d.ts`, and every page from there on
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
 * the breach's own colour, living, spilled down its own column on the
 * breach's clock, and a wave authored beside it would be a spill nobody
 * could seal (`sim/hive-step.ts`). What the pair's speed buys is how many
 * breaches are spilling at once, never whether one is.
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
export const WAVES_ACT_7G: Wave[] = [
  {
    id: "theLedger",
    name: "THE LEDGER",
    sentence: "The one where every hit you land comes back at your own hull.",
    guide: {
      both: "Hit the split five times in its colour. Each hit comes back, sooner each time. Put the shield in the socket, or lose the wave. Let the last one land.",
      p1: "1. Only you see the return coming. Count it down aloud.\n2. Trigger on the beat it lands. The column is hers.\n3. From the second hit, every shot costs. Each shield catch widens the split.\n4. The last one: do not press.",
      p2: "1. Only you see the socket. Say the column it walks to, every time.\n2. Load the colour the split shows. It fires up his column.\n3. Put the shield in the socket before his beat.\n4. On the last return, take the shield off.",
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
      p2: "1. Only you see the pressure. Read it out every beat.\n2. Lift the instant your partner says OFF. Over the band it bursts.\n3. From the second notch it stops leaking between tries.\n4. From the third your thumb adds double.",
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
      both: "Shoot the body where it will be. Five segments. It walks faster after a hit. The last stands dead eight beats. Then two beams in its path end it.",
      p1: "1. Say LEFT or RIGHT every beat: where it goes next.\n2. Cannon two ahead of her column, four on a run.\n3. With two left the stalk adds the beat for you.\n4. On the last it stands dead, then leans the way out. Say it.",
      p2: "1. Say the column it stands in, every beat.\n2. Fire when your partner says the cannon is under where it will be.\n3. Standing dead, nothing touches it. Hold the colour then, and beam it twice on the run.",
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
      both: "Shoot each part off the frame while it hangs. It throws a part you miss at you. If the frame runs out, you lose. Beam the last one.",
      p1: "1. Say how many parts are left. She cannot see them.\n2. At twelve, two hang and one counts. At seven, faster.\n3. Cannon under the column she calls. Trigger her shield.\n4. Suck a pod: every throw after is a beat slower.",
      p2: "1. Say which part is live, its colour and its column.\n2. Load that colour. A shot leaves his column, not yours.\n3. Put the shield under thrown rocks. He triggers it.\n4. On the last, hold any colour: the beam ignores it.",
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
    bossType: "normal",
  },
  {
    id: "theAntiphon",
    name: "THE ANTIPHON",
    sentence: "The one that grows a thing nobody can name, and one of you has to name it.",
    guide: {
      both: "Describe the organ, find it on the rail, shoot it in its column and colour. Six pits. The last organ is your own ship. From three pits, rejects fall.",
      p1: "1. Say its shape in your words: lobes, leaning, hollow.\n2. Turn it under your thumb: it looks, it never answers.\n3. Cannon to the column she calls. You cannot see it.\n4. From five pits one a cycle is a shape you named.",
      p2: "1. Find the one he describes. Ask what tells them apart.\n2. Say its column and colour. Fire when the cannon is there.\n3. A wrong one widens the rail for the rest.\n4. The window is fourteen beats, eight from two pits.",
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
      both: "Seal all nine breaches: shoot each in its colour while it is open. CARRY and PRESS mark where and when. The colour and the swell are yours to say.",
      p1: "1. Say each breach's colour as it opens: THREE IS RED.\n2. CARRY marks an open breach: go to it.\n3. When she says where the next opens, be there before it does.\n4. Trigger the shield on rocks.",
      p2: "1. Say the column where the next breach swells, three beats ahead.\n2. Load the colour he gave. PRESS lights once he is under it: fire.\n3. Move the shield under the rocks.",
      scene: "theHive",
    },
    entries: [],
    boss: { kind: "hive" },
    bossType: "normal",
  },
  {
    id: "theInstar",
    name: "THE INSTAR",
    sentence:
      "The one with no panel, where its body marks where it hurts you and whose thumb it wants.",
    guide: {
      both: "No buttons. The body marks in red where it wants a hand. A word says what, a line above says what kind.",
      p1: "1. The bright mark is yours: do what its two words say, before the ring closes.\n2. A dim mark is hers: watch it, and say when she has it.",
      p2: "1. The bright mark is yours: do what its two words say, before the ring closes.\n2. A dim mark is his: say when he has it, then wait for him to say yours.",
    },
    entries: [],
    boss: { kind: "instar", steps: INSTAR_SCRIPT },
    bossType: "normal",
    controls: "scene",
  },
];
