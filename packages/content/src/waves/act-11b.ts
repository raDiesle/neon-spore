import type { Wave } from "../wave-types.js";

/**
 * Act eleven's second page, opened for THE OCULUS on 2 October 2026, when
 * the owner reworked it and a wave came in to fall round it — `act-11.ts`
 * had no room for the arrivals, and the director writes this page whole
 * every time somebody paints on it (`tools/director/src/waves-act-files.ts`).
 *
 * **THE OCULUS**: an eye both seats shut together, then shoot in the socket
 * it cracks (`docs/spec/bosses-choreographed.md` §27). Three levels — a pair
 * held shut, a pair tapped shut, a pair turned shut by a lever each — and
 * after each one shot at the core, which waits for it. The owner: *people
 * need to fight wave, but when there is some idle time to keep fingers hold
 * the boss to proceed.* So nothing slows, and each level's fuse is long.
 *
 * The arrivals are a starting trickle of plain slicks, off the middle column
 * the core is shot up, to be painted over in the director.
 */
export const WAVES_ACT_11B: Wave[] = [
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
];
