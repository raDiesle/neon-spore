import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p14.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P15: Wave[] = [
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
];
