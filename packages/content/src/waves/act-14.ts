import type { Wave } from "../wave-types.js";

/**
 * Act fourteen, opened for THE LAMPREY on 1 October 2026 — `act-13.ts` had
 * six lines left under the 250-line ceiling, which is less than one wave with
 * its argument written above it (`waves.ts`).
 *
 * **THE LAMPREY is the first boss that leaps about the field.** An eel that
 * jumps from tile to tile and bites into each, every leap a tile longer than
 * the last (`docs/spec/bosses-choreographed.md` §41, `sim/lamprey.ts`, the
 * owner's rework of 5 October 2026). One seat holds the tail and the other
 * frees the head — pulled up, or its lit tooth tapped out twice — or the two
 * pull it apart at once; a stay the fuse runs out on bites through to the
 * hull. Then the gullet rears on its tile and is shot in its colour.
 *
 * It authors the whole script, the controls changed every leap: a pull, the
 * teeth, the pull apart, a red gullet, then a pull and the teeth with the
 * seats traded, and a white gullet last. Each stay's window is THE SLOW.
 *
 * **THE MIMIC is the boss answered by painting** (§42, `sim/mimic.ts`): a
 * picture of tiles shows on one seat's screen only, and the other seat taps
 * it into the frame the mantle holds. The pilot reads three pictures three
 * tiles square, the mantle rolls, and the navigator reads three five square,
 * the last two changing; then the board splits, each seat reads the half the
 * other paints, and the core it bares is tapped. **No panel, no SLOW and no
 * tutorial** — the owner, 5 October 2026: the help is said on the field
 * while it plays (`render/boss-cue-read-zt.ts`), so the windows are long in
 * plain beats: a picture is said tile by tile across a room.
 */
export const WAVES_ACT_14: Wave[] = [
  {
    id: "theLamprey",
    name: "THE LAMPREY",
    guide: {
      both: "The eel jumps to a tile and bites in. One of you holds the tail. The other pulls the head up or taps the lit tooth. Then shoot the gullet.",
      p1: "1. First bite: hold the tail.\n2. Second bite: tap the lit tooth.\n3. Third bite: pull the tail away while the other pulls the head up.",
      p2: "1. First bite: pull the head up.\n2. Second bite: hold the tail.\n3. Third bite: pull the head up while the other pulls the tail.",
    },
    entries: [],
    boss: {
      kind: "lamprey",
      steps: [
        { ask: "pull", holder: 1, teeth: 0, jump: 1, beats: 12, color: "either" },
        { ask: "teeth", holder: 2, teeth: 2, jump: 2, beats: 16, color: "either" },
        { ask: "apart", holder: 1, teeth: 0, jump: 3, beats: 14, color: "either" },
        { ask: "gullet", holder: 1, teeth: 0, jump: 4, beats: 12, color: "red" },
        { ask: "pull", holder: 2, teeth: 0, jump: 5, beats: 12, color: "either" },
        { ask: "teeth", holder: 1, teeth: 2, jump: 6, beats: 16, color: "either" },
        { ask: "gullet", holder: 1, teeth: 0, jump: 7, beats: 12, color: "either" },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theMimic",
    name: "THE MIMIC",
    entries: [],
    boss: {
      kind: "mimic",
      steps: [
        { ask: "sign", reader: 1, changes: false, size: 3, beats: 36 },
        { ask: "sign", reader: 1, changes: false, size: 3, beats: 36 },
        { ask: "sign", reader: 1, changes: false, size: 3, beats: 36 },
        { ask: "roll", reader: 1, changes: false, size: 0, beats: 2 },
        { ask: "sign", reader: 2, changes: false, size: 5, beats: 56 },
        { ask: "sign", reader: 2, changes: true, size: 5, beats: 56 },
        { ask: "sign", reader: 2, changes: true, size: 5, beats: 56 },
        { ask: "roll", reader: 2, changes: false, size: 0, beats: 2 },
        { ask: "split", reader: 1, changes: false, size: 3, beats: 44 },
        { ask: "core", reader: 1, changes: false, size: 0, beats: 10 },
        { ask: "split", reader: 1, changes: false, size: 3, beats: 44 },
        { ask: "core", reader: 1, changes: false, size: 0, beats: 10 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
];
