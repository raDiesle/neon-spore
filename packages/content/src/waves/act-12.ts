import type { Wave } from "../wave-types.js";

/**
 * Act twelve, opened for THE VISE on 26 September 2026 — `act-11.ts` had
 * seventeen lines left under the 250-line ceiling, which is less than one
 * wave with its argument written above it (`waves.ts`).
 *
 * **THE VISE is the first boss answered by a pinch.** A case of two lobes
 * clamps a kernel over the middle column; each seat has one lobe, and a seam
 * cracks when its lobe is pinched shut and kept shut for the count
 * (`docs/spec/bosses-choreographed.md` §28, `sim/vise.ts`). Two seams a lobe
 * bare the kernel, which is shot in its colour; between the shots both lobes
 * are pinched at once to hold the case off it.
 *
 * It authors the whole script, and nothing that falls: the pilot's two seams,
 * the navigator's two, then fire and hold in turn up to the white last hit.
 *
 * **THE RIME is the first boss answered by a rub.** Each seat wipes its own
 * half of a frosted lens back and forth, and the frost it has not rubbed this
 * beat grows back (§29, `sim/rime.ts`). Two wipes a half bare the core, which
 * is shot in its colour; between the shots a surge of frost comes, and the
 * shield under the middle turns it. Its script runs as THE VISE's does, with
 * the shield where the hold was. A half's first wipe is from solid frost and
 * gets the longer window; the second is from the film the first left.
 *
 * **THE TRIVET is the first boss answered by a chord**, the same shape a
 * third time: a stand of three legs over the middle column, each seat's foot
 * planted by holding two — then three — of its own pads down together for
 * the count (`docs/spec/bosses-choreographed.md` §30, `sim/trivet.ts`). Both
 * feet home light the hub, which is shot in its colour; between the shots
 * both seats chord at once to keep the feet planted under it.
 */
export const WAVES_ACT_12: Wave[] = [
  {
    id: "theVise",
    name: "THE VISE",
    guide: {
      both: "Pinch your lobe shut until its seam cracks. Two seams each bare the kernel. Shoot it in its colour. When both light, pinch together.",
      p1: "1. Pinch the left lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. When the kernel shows a colour, fire it.",
      p2: "1. Pinch the right lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. White takes either colour. Pinch with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "vise",
      steps: [
        { ask: "left", color: "either", beats: 5 },
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 5 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theRime",
    name: "THE RIME",
    guide: {
      both: "Rub your half of the lens back and forth until it clears. Two wipes each bare the core. Shoot it in its colour. When the surge comes, shield it.",
      p1: "1. Rub the left half back and forth and say so.\n2. Keep rubbing until it clears. If you stop, the frost grows back.\n3. When the core shows a colour, fire it. Press the shield when it is under the lens.",
      p2: "1. Rub the right half back and forth and say so.\n2. Keep rubbing until it clears.\n3. White takes either colour. When the surge comes, move the shield under the lens.",
    },
    entries: [],
    boss: {
      kind: "rime",
      steps: [
        { ask: "left", color: "either", beats: 6 },
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 6 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "shield", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "shield", color: "either", beats: 3 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theTrivet",
    name: "THE TRIVET",
    guide: {
      both: "Hold your foot's lit pads down together until it plants. Two plants each light the hub. Shoot it in its colour. When both light, hold together.",
      p1: "1. Hold the front foot's lit pads down together and say so.\n2. Keep every one down until the foot plants.\n3. When the hub shows a colour, fire it.",
      p2: "1. Hold the rear foot's lit pads down together and say so.\n2. Keep every one down until the foot plants.\n3. White takes either colour. Hold with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "trivet",
      steps: [
        { ask: "front", pads: 2, color: "either", beats: 5 },
        { ask: "front", pads: 3, color: "either", beats: 4 },
        { ask: "rear", pads: 2, color: "either", beats: 5 },
        { ask: "rear", pads: 3, color: "either", beats: 4 },
        { ask: "fire", pads: 2, color: "red", beats: 3 },
        { ask: "both", pads: 2, color: "either", beats: 3 },
        { ask: "fire", pads: 2, color: "cyan", beats: 3 },
        { ask: "both", pads: 2, color: "either", beats: 3 },
        { ask: "fire", pads: 2, color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
];
