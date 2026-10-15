import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-3.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_3_P2: Wave[] = [
  {
    id: "bulbQueen",
    name: "BULB QUEEN",
    guide: {
      scene: "bulbQueen",
    },
    entries: [],
    pods: [{ beat: 2, col: 5, row: 4, kind: "purge" }],
    boss: { kind: "queen", col: 5, petals: 9 },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theMirror",
    name: "THE MIRROR",
    guide: {
      scene: "theMirror",
    },
    entries: [],
    boss: {
      kind: "mirror",
      rounds: [
        ["fireRed", "guard"],
        ["cannonLeft", "cannonRight", "cannonRight"],
        ["intake", "fireRed", "intake", "fireCyan", "intake", "fireRed"],
      ],
    },
    bossType: "special",
    controls: "standard5",
  },
];
