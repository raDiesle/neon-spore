import { MANTLE_SCRIPT } from "../mantle-script.js";
import { NETTLE_SCRIPT } from "../nettle-script.js";
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
    id: "theHasp",
    name: "THE HASP",
    guide: {
      scene: "theHasp",
    },
    entries: [],
    boss: { kind: "hasp" },
    bossType: "normal",
  },
  {
    id: "theRatchet",
    name: "THE RATCHET",
    guide: {
      scene: "theRatchet",
    },
    entries: [],
    boss: { kind: "ratchet" },
    bossType: "normal",
  },
  {
    id: "theNettle",
    name: "THE NETTLE",
    guide: {
      both: "A jellyfish over the ship. Its rings say what to do. A hand is your thumb on it. SHOOT, SHIELD or SUCK is the panel, under the ring.",
      p1: "1. Pull, tap, turn or hold the rings on the left, and the shared ones.\n2. Move the cannon under SHOOT or SUCK. Hold SUCK yourself.\n3. When the shield is under SHIELD, press your shield button.",
      p2: "1. Pull, tap, turn or hold the rings on the right, and the shared ones.\n2. Fire when the cannon is under SHOOT.\n3. Move the shield under SHIELD, and say when.",
    },
    entries: [],
    boss: { kind: "nettle", steps: NETTLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theMantle",
    name: "THE MANTLE",
    guide: {
      both: "Two handles, one each. Pull both down together, hard enough, to open one of its four joints. Letting go costs the whole pull. Then tap the bare core, turn about.",
      p1: "1. Drag the left handle down and hold it with the other screen's pull.\n2. Both must pull hard enough at once, or nothing shears.\n3. Once the core is bare, tap it only when it is your turn.",
      p2: "1. Drag the right handle down and hold it with the other screen's pull.\n2. Letting go costs the whole pull. Start again together.\n3. A spark leaks partway through. Shoot it before it reaches the hull.",
    },
    entries: [],
    boss: { kind: "mantle", thresholds: MANTLE_SCRIPT },
    bossType: "normal",
  },
  {
    id: "theKeel",
    name: "THE KEEL",
    guide: {
      both: "Six joints. When one lights, tap it if it is on your half. The middle opens: shoot it in its colour. Then the joints light fast. Shoot the rock.",
      p1: "1. Tap a lit joint on the left half of the spine.\n2. Move the cannon under the open middle, then under the rock.\n3. The joints light fast at the end. Watch which half.",
      p2: "1. Tap a lit joint on the right half of the spine.\n2. Fire the open middle in the colour it shows.\n3. Fire the rock the tail throws before it lands.",
    },
    entries: [],
    boss: { kind: "keel", socket: "red", reprise: [4, 3, 0] },
    bossType: "normal",
  },
  {
    id: "theValve",
    name: "THE VALVE",
    guide: {
      both: "One turns the wheel onto the mark. The other taps the pin to stop it. Then pull the pin down. Three pins. The last wants a full turn first.",
      p1: "1. Turn the wheel with your thumb until it sits on the mark.\n2. Hold it still. The other screen taps the pin.\n3. A spark falls after the first pin. Move the cannon under it.",
      p2: "1. When the wheel is on the mark, tap the pin once.\n2. Then drag the pin down before it thaws. Either of you may.\n3. Fire at the spark before it lands.",
    },
    entries: [],
    boss: { kind: "valve", marks: [250, 600, 850] },
    bossType: "normal",
  },
  {
    id: "theSeam",
    name: "THE SEAM",
    guide: {
      both: "A point on the crack lights in a colour. Shoot it in that colour. When grit flies, raise the shield under it. Three points close the crack. Never shoot grey.",
      p1: "1. Move the cannon under the lit point.\n2. When grit flies, press the shield.\n3. A rock falls to one side. Slide the cannon under it.",
      p2: "1. Fire the lit point in its colour. White takes either.\n2. Slide the shield under the ridge when grit flies.\n3. At the end one of you shields while the other fires.",
    },
    entries: [],
    boss: {
      kind: "seam",
      steps: [
        { ask: "point", color: "red", offset: 0, seals: false },
        { ask: "grit", color: "either", offset: 0, seals: false },
        { ask: "point", color: "cyan", offset: 0, seals: true },
        { ask: "blind", color: "either", offset: 0, seals: false },
        { ask: "point", color: "red", offset: 0, seals: false },
        { ask: "point", color: "cyan", offset: 0, seals: true },
        { ask: "grit", color: "either", offset: 0, seals: false },
        { ask: "decoy", color: "either", offset: 0, seals: false },
        { ask: "rock", color: "cyan", offset: 2, seals: false },
        { ask: "glow", color: "either", offset: 0, seals: false },
        { ask: "point", color: "either", offset: 0, seals: true },
        { ask: "both", color: "either", offset: -2, seals: false },
        { ask: "dark", color: "either", offset: 0, seals: false },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theOculus",
    name: "THE OCULUS",
    guide: {
      both: "Shut the eye's leaves together, three times: hold, then tap, then turn. After each, shoot the eye in its colour. Shoot what falls in between.",
      p1: "1. Hold the left half with the other one.\n2. Then tap it. Then turn it round.\n3. When the eye shows a colour, fire it.",
      p2: "1. Hold the right half with the other one.\n2. Then tap it. Then turn it round.\n3. White takes either colour.",
    },
    entries: [
      { beat: 6, col: 0, color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 2, color: "red" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 26, col: 0, color: "red" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 36, col: 2, color: "red" },
      { beat: 41, col: 8, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 51, col: 10, color: "cyan" },
      { beat: 56, col: 2, color: "red" },
      { beat: 61, col: 8, color: "cyan" },
      { beat: 66, col: 0, color: "red" },
      { beat: 71, col: 10, color: "cyan" },
      { beat: 76, col: 2, color: "red" },
      { beat: 81, col: 8, color: "cyan" },
      { beat: 86, col: 0, color: "red" },
    ],
    boss: {
      kind: "oculus",
      steps: [
        { ask: "shut", color: "either", beats: 6, fuse: 32 },
        { ask: "break", color: "either", beats: 2 },
        { ask: "fire", color: "red", beats: 0 },
        { ask: "tap", color: "either", beats: 32, need: 12 },
        { ask: "fire", color: "cyan", beats: 0 },
        { ask: "turn", color: "either", beats: 32, need: 8 },
        { ask: "fire", color: "either", beats: 0 },
      ],
    },
    bossType: "normal",
  },
];
