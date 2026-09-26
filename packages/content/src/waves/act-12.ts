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
];
