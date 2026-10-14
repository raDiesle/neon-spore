import type { Wave } from "../wave-types.js";

/**
 * Act twelve, opened for THE VISE on 26 September 2026 — `act-11.ts` had
 * seventeen lines left under the 250-line ceiling, which is less than one
 * wave with its argument written above it (`waves.ts`).
 *
 * **THE VISE's lobes are dragged shut.** A case of two lobes clamps a kernel
 * over the middle column; each seat has one lobe, and a seam cracks when its
 * lobe is carried shut by one thumb and kept shut for the count
 * (`docs/spec/bosses-choreographed.md` §28, `sim/vise.ts`). Two seams a lobe
 * bare the kernel, which is shot in its colour; between the shots both lobes
 * are dragged shut at once to hold the case off it. It was a two-finger pinch
 * until the owner ruled one finger a player on 8 October 2026.
 *
 * It authors the whole script, and nothing that falls: the pilot's two seams,
 * the navigator's two, then fire and hold in turn up to the white last hit.
 *
 * **THE PLUMB is the first boss answered by the phone itself**, the same
 * shape a second time: a bob over the middle column, each seat's weight hung
 * true by holding its own phone level, inside a range that narrows on the
 * second settle (`docs/spec/bosses-choreographed.md` §31, `sim/plumb.ts`).
 * Both weights true light the core, which is shot in its colour; between the
 * shots both seats hold level at once to keep the weights true under it.
 *
 * **THE SLING is the first boss answered at the lift**, the same shape a
 * third time: a fork over the middle column, each seat's arm drawn by
 * holding a finger down for the count and loosed by swiping toward the lit
 * side as it leaves (`docs/spec/bosses-choreographed.md` §32,
 * `sim/sling.ts`). Both arms drawn light the yoke, which is shot in its
 * colour; between the shots both seats draw and loose at once to keep it lit.
 *
 * Every shot in this act waits six beats, as in act thirteen (`act-13.ts`).
 */
export const WAVES_ACT_12: Wave[] = [
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
  {
    id: "theVise",
    name: "THE VISE",
    guide: {
      both: "Pull your lobe shut until its seam cracks. Two seams each bare the kernel. Shoot it in its colour. When both light, pull together. Shield the bite. Shoot the seed.",
      p1: "1. Pull the left lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. When the kernel shows a colour, fire it.",
      p2: "1. Pull the right lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. White takes either colour. Pull with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "vise",
      steps: [
        { ask: "left", color: "either", beats: 5 },
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 5 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 6 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "bite", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 6 },
        { ask: "spit", color: "red", beats: 4, offset: 2 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "fire", color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "thePlumb",
    name: "THE PLUMB",
    guide: {
      both: "Each drags a stone. Pull away from the low side, together, until the bob hangs true. Both weights true light the core. Shoot it in its colour.",
      p1: "1. When a weight lights, drag the left stone.\n2. Pull away from the low side. Say how far you are.\n3. One pull is not enough: hold it with the other until the bob is true.\n4. When the core shows a colour, fire it.",
      p2: "1. When a weight lights, drag the right stone.\n2. Pull away from the low side. Say how far you are.\n3. One pull is not enough: hold it with the other until the bob is true.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "plumb",
      steps: [
        { ask: "left", skewMilli: -3000, rangeMilli: 600, color: "either", beats: 6 },
        { ask: "left", skewMilli: 2800, rangeMilli: 400, color: "either", beats: 4 },
        { ask: "right", skewMilli: 3200, rangeMilli: 600, color: "either", beats: 6 },
        { ask: "right", skewMilli: -2800, rangeMilli: 400, color: "either", beats: 4 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "red", beats: 6 },
        { ask: "both", skewMilli: -2800, rangeMilli: 500, color: "either", beats: 3 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "cyan", beats: 6 },
        { ask: "both", skewMilli: 3000, rangeMilli: 450, color: "either", beats: 3 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
