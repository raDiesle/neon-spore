import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p3.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P4: Wave[] = [
  {
    id: "theHydra",
    name: "THE HYDRA",
    guide: {
      both: "A slime with many heads. Stop each head before it reaches the ship. Four kinds of head, each comes twice.",
      p1: "1. Swipe across your left necks to cut them.\n2. Turn your left coil off the ship.\n3. Tap your left eye while it is open.\n4. Only you see the fire's colour: say it. Slide the cannon where the other says.",
      p2: "1. Swipe across your right necks to cut them.\n2. Turn your right coil off the ship.\n3. Tap your right eye while it is open.\n4. Only you see which mouth opens: say where. Fire the colour the other says.",
    },
    entries: [],
    boss: {
      kind: "hydra",
      steps: [
        { head: "bite", count: 2, beats: 28 },
        { head: "bite", count: 3, ways: [-1, 1, -1], beats: 36 },
        { head: "coil", laps: 2, beats: 32 },
        { head: "coil", laps: 3, beats: 40 },
        { head: "eye", count: 4, beats: 36 },
        { head: "eye", count: 6, beats: 48 },
        { head: "maw", offsets: [-2, 1, 0], colors: ["red", "cyan", "red"], beats: 36 },
        { head: "maw", offsets: [2, -1, 1, -2], colors: ["cyan", "red", "cyan", "red"], beats: 44 },
      ],
    },
    bossType: "normal",
    controls: "standard5",
  },
];
