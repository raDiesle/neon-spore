import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p8.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P9: Wave[] = [
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
  {
    id: "theSling",
    name: "THE SLING",
    guide: {
      both: "Hold until your arm is drawn home, then swipe toward the lit side. Both arms drawn light the yoke: shoot it in its colour. When both light, draw together.",
      p1: "1. Hold a finger down when the left arm lights, and say which side is lit.\n2. Keep holding until the arm is home.\n3. Swipe toward the lit side as you let go.",
      p2: "1. Hold a finger down when the right arm lights, and say which side is lit.\n2. Keep holding until the arm is home.\n3. White takes either colour. Draw with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "sling",
      steps: [
        { ask: "left", aim: "left", color: "either", beats: 5 },
        { ask: "left", aim: "right", color: "either", beats: 4 },
        { ask: "right", aim: "right", color: "either", beats: 5 },
        { ask: "right", aim: "left", color: "either", beats: 4 },
        { ask: "fire", aim: "left", color: "red", beats: 6 },
        { ask: "both", aim: "left", color: "either", beats: 3 },
        { ask: "fire", aim: "left", color: "cyan", beats: 6 },
        { ask: "both", aim: "right", color: "either", beats: 3 },
        { ask: "fire", aim: "left", color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
