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
 *
 * **THE CHRYSALIS is THE BASTION's idea on a body that is alive** (the owner,
 * 14 October 2026: *similar in concept to THE BASTION … something living,
 * alien-like … a similar number of levels*; `sim/chrysalis.ts`). A cocoon in
 * four skins, each a different job split across the seats and each two
 * courses deep: slime rubbed off a half each, six turns and then ten; spikes
 * pulled along their lines, straight and then round curves; spore sacs whose
 * spray the shield throws back, four and then five; and the heart, which only
 * the pilot sees — the pilot brings the cannon under it and says its colour,
 * and the navigator fires it. A course run out grows back whole, and nothing
 * hits the hull.
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
  {
    id: "theChrysalis",
    name: "THE CHRYSALIS",
    guide: {
      both: "A living cocoon in four skins, each two deep. Peel each skin off before it grows back. It gets smaller as you go.",
      p1: "1. Rub the slime off your left half.\n2. Pull your left spikes along their lines.\n3. Fire the SHIELD under the swelling sac.\n4. Only you see the heart: slide the cannon under it and say its colour.",
      p2: "1. Rub the slime off your right half.\n2. Pull your right spikes along their lines.\n3. Slide the shield under the swelling sac.\n4. Fire the colour the other says.",
    },
    entries: [],
    boss: {
      kind: "chrysalis",
      steps: [
        { skin: "slime", rubs: 6, beats: 32 },
        { skin: "slime", rubs: 10, beats: 40 },
        { skin: "quills", beats: 36 },
        { skin: "quills", tracks: ["sweep", "sweep", "snake", "climb"], beats: 48 },
        { skin: "sacs", offsets: [-2, 1, 0, 2], beats: 40 },
        { skin: "sacs", offsets: [1, -1, 2, -2, 0], beats: 48 },
        { skin: "heart", offsets: [-1, 2, 0], colors: ["red", "cyan", "red"], beats: 32 },
        {
          skin: "heart",
          offsets: [2, -2, 1, -1],
          colors: ["cyan", "red", "red", "cyan"],
          beats: 40,
        },
      ],
    },
    bossType: "normal",
    controls: "standard5",
  },
];
