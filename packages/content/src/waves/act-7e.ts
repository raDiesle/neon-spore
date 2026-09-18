import { INSTAR_SCRIPT } from "../instar-script.js";
import type { Wave } from "../wave-types.js";

/**
 * The fifth page of act seven, cut off `act-7d.ts` when THE LEAD would have
 * taken it over the 250-line ceiling: THE SURGE had left it three under.
 *
 * **`7e` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order
 * of the game. It starts one wave long.
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
    id: "theLead",
    name: "THE LEAD",
    sentence: "The one you shoot where it will be, not where it is.",
    guide: {
      both: "A body paces along the top of the field on a stalk of five segments, a column a beat, turning at the walls. A shot out of the top hangs a beat in the air and is judged against the column it is in then — so aim where it will be. A hit takes a segment; a beat every shot missed turns it round. From the fourth segment it runs, dropping a torch behind and a rock ahead. On the last segment it stops dead, and only the beam standing in a column it then passes through ends it.",
      p1: "Only you see which way the stalk leans: where it goes next, and from the second segment the turn a beat early. Say it every beat, left or right, and slide the cannon under the column it will be in, not the one it is in.",
      p2: "Only you see the column it stands in. Read it out every beat; he has where it goes next. Fire the beat he says the cannon is under where it will be: the shot takes a beat to get there. On the last segment, hold the beam.",
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
  },
  {
    id: "theScuttle",
    name: "THE SCUTTLE",
    sentence: "The one that throws itself at you, a part at a time, and each part is a window.",
    guide: {
      both: "A frame of twenty-one parts hangs over the middle of the field: rocks and bodies of both colours, and two pods. Every few beats a part comes loose and hangs in its socket, then is thrown down its column. A bolt in its column and its colour while it hangs takes it off the frame instead. A pod thrown is a pod to take, and taken it slows the next throw a beat. Under eight parts left it throws faster and from the far side; from twelve, two at a time, one of them live. The last part winds up — hold the beam under it.",
      p1: "Only you see the count: say it down so the shot is in the air before the throw. Slide the cannon under the column she says, guard the rocks it throws, and take a pod that drops. On the last part keep the cannon under it.",
      p2: "Only you see which hanging part is live, its colour and its column: say them the beat it comes loose and fire in that colour once the cannon is under it. On the last part, hold that colour until the beam stands.",
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
  },
  {
    id: "theAntiphon",
    name: "THE ANTIPHON",
    sentence:
      "The one that grows a thing nobody has a word for, and one of you has to say it anyway.",
    guide: {
      both: "A smooth body over the field grows one organ at a time, and the organ is one of the candidates on a rail — each with a column and a colour. Describe it; name it; a bolt in its column and its colour takes it to a pit. The wrong candidate hardens it and the next rail is wider; the wrong colour is nothing. Six pits, and the rail closes in as you go. Last, the body grows your own ship among ships: the right one erupts every pit.",
      p1: "Only you see the organ. Say its shape in whatever words you have — lobes, leaning, hollow — and keep saying it until she names a column; then put the cannon there and fire her colour. The count under it is hers.",
      p2: "Only you see the rail: the candidates, their columns and colours. Listen, and say the column and the colour of the one he is describing; if he cannot, ask what would tell them apart. Say the beats left before it sinks.",
    },
    entries: [],
    boss: { kind: "antiphon" },
  },
  {
    id: "theHive",
    name: "THE HIVE",
    sentence: "The one you seal, and every breach you have not sealed yet is spilling.",
    guide: {
      both: "Nine sites lie across the underside of a mass over the field, each with a colour of its own. Four beats to look, then one opens, then another every eight beats — two at once from the fifth. Nothing you do slows that. Every open breach spills a rock down its column every three beats; rocks are for the shield. A bolt in an open breach's column and its colour seals it for good; the wrong colour makes every open breach spill sooner; the skin between them swallows a shot. Seal all nine.",
      p1: "Only you see a breach's colour, and you cannot fire. Say it as each one opens — three is red, seven is cyan — and slide the cannon under the one she names. When she says where the next swells, be there before it opens.",
      p2: "Only you see the swell where the next breach opens, three beats early, and you cannot move the cannon. Say its column ahead. Fire the colour he gives you for the breach the cannon is under, and ward the rocks.",
    },
    entries: [],
    boss: { kind: "hive" },
  },
  {
    id: "theInstar",
    name: "THE INSTAR",
    sentence:
      "The one with no panel: its body is marked where it will hurt you, and whose thumb the mark wants.",
    guide: {
      both: "No buttons this time. The body over the field says what to do and where, in red, one step at a time. Do it before the ring closes on it.",
      p1: "A bright mark with a word over it is yours. A dim one is hers: watch it, and say when she has it.",
      p2: "A bright mark with a word over it is yours. A dim one is his: watch it, and say when he has it.",
    },
    entries: [],
    boss: { kind: "instar", steps: INSTAR_SCRIPT },
    controls: "scene",
  },
];
