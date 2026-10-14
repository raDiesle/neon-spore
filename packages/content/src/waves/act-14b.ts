import type { Wave } from "../wave-types.js";

/**
 * Act fourteen, its second page, opened on 14 October 2026 when the
 * director's save brought THE GOVERNOR into `act-14.ts` and took it past the
 * 250-line ceiling. It plays straight after that page (`waves.ts`).
 *
 * **THE MIMIC is the boss answered by painting** (§42, `sim/mimic.ts`): a
 * picture of tiles shows on one seat's screen only, and the other seat taps
 * it into the frame the mantle holds. The pilot reads a picture three tiles
 * square and two four square, the last changing; the mantle rolls, and the
 * navigator reads two five square, the second changing, and one six; it
 * rolls again and the seats take one each, a six and a seven; then the board
 * splits, three and then four, each seat reads the half the other paints,
 * and the core it bares is tapped. **No picture comes up twice in a fight**
 * (`MimicState.shown`). The owner, 6 October 2026: *add more levels with more
 * tiles … reduce the available time by a third*, so every window is two
 * thirds of what it was — a three square 24 beats where it was 36, a five
 * 37 where it was 56, a split three 29 where it was 44, the core 7 where it
 * was 10 — and the new sizes are cut to the same measure. No panel and no
 * SLOW: the windows are in plain beats. **A worded guide opens it** (the
 * owner, 6 October 2026: *add a tutorial guide at the start of the wave
 * that briefly explains what has to be done*), and while it plays the
 * siren top right says whose turn it is (`render/comms-mimic.ts`).
 *
 * **FIVE BLISTERS is the one where the body never says how to hit it**
 * (`docs/spec/blister.md`, *The gestures*): THE BLISTER, met plain in act
 * nine, comes back wanting each of its five gestures in turn — tapped, held,
 * swiped, turned round and rubbed — every one the same body, so only the help
 * round it says which. The hand that knocks it down changes too, so a seat
 * that has just struck is the seat that has to call the next pore. The last
 * two are up together, one for each hand.
 */
export const WAVES_ACT_14B: Wave[] = [
  {
    id: "theMimic",
    name: "THE MIMIC",
    guide: {
      both: "One of you sees a picture of tiles. The other taps it into the frame. The siren top right says whose turn it is.",
      p1: "1. First you see the picture: tell the other which tiles.\n2. Then tap the tiles the other tells you.\n3. Last, each of you sees one half and taps the other half.",
      p2: "1. First tap the tiles the other tells you.\n2. Then you see the picture: tell the other which tiles.\n3. Last, each of you sees one half and taps the other half.",
    },
    entries: [],
    boss: {
      kind: "mimic",
      steps: [
        { ask: "sign", reader: 1, changes: false, size: 3, beats: 24 },
        { ask: "sign", reader: 1, changes: false, size: 4, beats: 30 },
        { ask: "sign", reader: 1, changes: true, size: 4, beats: 30 },
        { ask: "roll", reader: 1, changes: false, size: 0, beats: 2 },
        { ask: "sign", reader: 2, changes: false, size: 5, beats: 37 },
        { ask: "sign", reader: 2, changes: true, size: 5, beats: 37 },
        { ask: "sign", reader: 2, changes: false, size: 6, beats: 44 },
        { ask: "roll", reader: 2, changes: false, size: 0, beats: 2 },
        { ask: "sign", reader: 1, changes: false, size: 6, beats: 44 },
        { ask: "sign", reader: 2, changes: false, size: 7, beats: 50 },
        { ask: "roll", reader: 1, changes: false, size: 0, beats: 2 },
        { ask: "split", reader: 1, changes: false, size: 3, beats: 29 },
        { ask: "core", reader: 1, changes: false, size: 0, beats: 7 },
        { ask: "split", reader: 1, changes: false, size: 4, beats: 37 },
        { ask: "core", reader: 1, changes: false, size: 0, beats: 7 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
  {
    id: "theLatch",
    name: "THE LATCH",
    guide: {
      scene: "theLatch",
    },
    entries: [],
    boss: {
      kind: "latch",
      steps: [
        { ask: "haul", knots: 2, beats: 28 },
        { ask: "yank", knots: 2, beats: 32 },
        { ask: "cross", knots: 2, beats: 32 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
  {
    id: "fiveBlisters",
    name: "FIVE BLISTERS",
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 2, by: 2, count: 3 },
      { beat: 10, col: 8, kind: "blister", color: null, row: 2, by: 1, count: 2, gesture: "hold" },
      {
        beat: 20,
        col: 2,
        kind: "blister",
        color: null,
        row: 3,
        by: 2,
        count: 2,
        gesture: "swipe",
        way: "left",
      },
      { beat: 30, col: 7, kind: "blister", color: null, row: 2, by: 1, count: 2, gesture: "turn" },
      { beat: 40, col: 3, kind: "blister", color: null, row: 2, by: 2, count: 4, gesture: "rub" },
      {
        beat: 41,
        col: 8,
        kind: "blister",
        color: null,
        row: 3,
        by: 1,
        count: 2,
        gesture: "swipe",
        way: "up",
      },
    ],
  },
];
