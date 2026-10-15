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
 * hits the hull. **It carries no guide**, THE VANE's way: the owner, 14
 * October 2026, *it does not need tutorial, it is self explanatory* — every
 * skin's mark says its own word (`RUB`, `PULL`, `SHIELD`, `COLOUR`, `FIRE`).
 *
 * **THE HYDRA is the one where every level is a different gesture** (the
 * owner, 14 October 2026: *another boss like THE CHRYSALIS and THE INSTAR …
 * varied in its on-screen mechanics*; `sim/hydra.ts`). A slime with many
 * heads, four kinds, each two courses deep: necks swinging down, cut by a
 * swipe across, two a side and then three with the way changing; coils round
 * the hull, turned off two laps and then three; eyes opening one at a time,
 * tapped while open, four a side and then six; and maws with fire in them,
 * crossed — the navigator sees which one opens, the pilot its colour. A level
 * run out is a head on the hull, and the wave is lost.
 */
export const WAVES_ACT_14B: Wave[] = [
  {
    id: "theSpool",
    name: "THE SPOOL",
    guide: {
      scene: "theSpool",
    },
    entries: [],
    boss: { kind: "spool" },
    bossType: "normal",
  },
  {
    id: "theBeatbox",
    name: "THE BEATBOX",
    guide: {
      scene: "theBeatbox",
    },
    entries: [
      { beat: 0, col: 5, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 2, kind: "beatbox", color: null, beats: 4 },
      { beat: 24, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 26, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 42, col: 8, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "theBeatboxAgain",
    name: "BEATBOXES AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "beatbox", color: null, beats: 2 },
      { beat: 6, col: 10, kind: "balloon", color: null },
      { beat: 13, col: 5, kind: "beatbox", color: null, beats: 2 },
      { beat: 21, col: 4, kind: "balloon", color: null },
      { beat: 27, col: 9, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "theBeatboxSpread",
    name: "BEATBOXES SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 7, col: 1, kind: "balloon", color: null },
      { beat: 14, col: 10, kind: "meteor", color: null },
      { beat: 19, col: 2, kind: "beatbox", color: null, beats: 2 },
      { beat: 24, col: 0, kind: "balloon", color: null },
      { beat: 31, col: 10, kind: "meteor", color: null },
    ],
  },
  {
    id: "theBeatboxReach",
    name: "BEATBOXES FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "beatbox", color: null, beats: 4 },
      { beat: 5, col: 2, kind: "balloon", color: null },
      { beat: 10, col: 8, kind: "ghost", color: "cyan", path: "across" },
      { beat: 15, col: 2, kind: "beatbox", color: null, beats: 4 },
      { beat: 20, col: 6, kind: "balloon", color: null },
      { beat: 26, col: 2, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "theBeatboxPair",
    name: "BEATBOX AND BALLOON",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 7, color: "red" },
      { beat: 15, col: 0, kind: "balloon", color: null },
      { beat: 21, col: 3, color: "red" },
      { beat: 21, col: 7, color: "red" },
      { beat: 26, col: 1, kind: "shell", color: "red" },
      { beat: 30, col: 6, kind: "beatbox", color: null, beats: 2 },
      { beat: 35, col: 1, color: "cyan" },
      { beat: 35, col: 9, color: "cyan" },
      { beat: 40, col: 2, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBeatboxBreathe",
    name: "EASY BEATBOXES",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 7, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 21, col: 10, kind: "balloon", color: null },
      { beat: 28, col: 0, color: "red" },
      { beat: 34, col: 9, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "theBeatboxRecall",
    name: "BEATBOX RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 17, col: 0, kind: "crystal", color: "red" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 28, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 33, col: 10, kind: "crystal", color: "cyan" },
      { beat: 39, col: 5, color: "red" },
      { beat: 39, col: 8, color: "red" },
    ],
  },
  {
    id: "theBeatboxBend",
    name: "BEATBOXES AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 7, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 17, col: 4, kind: "balloon", color: null },
      { beat: 22, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 27, col: 4, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 33, col: 1, kind: "balloon", color: null },
      { beat: 38, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 44, col: 1, color: "cyan" },
      { beat: 44, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theBeatboxPeak",
    name: "BEATBOX PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 4, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 7, col: 2, color: "cyan" },
      { beat: 7, col: 8, color: "cyan" },
      { beat: 11, col: 6, kind: "balloon", color: null },
      { beat: 14, col: 2, kind: "dart", color: "cyan" },
      { beat: 17, col: 3, color: "red" },
      { beat: 17, col: 6, color: "red" },
      { beat: 20, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 24, col: 6, kind: "balloon", color: null },
      { beat: 27, col: 4, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 31, col: 9, kind: "dart", color: "red" },
      { beat: 34, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 37, col: 3, color: "cyan" },
      { beat: 37, col: 7, color: "cyan" },
      { beat: 40, col: 7, kind: "balloon", color: null },
      { beat: 44, col: 10, kind: "dart", color: "cyan" },
      { beat: 47, col: 4, color: "red" },
      { beat: 47, col: 7, color: "red" },
    ],
  },
];
