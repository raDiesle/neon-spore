import type { Wave } from "../wave-types.js";

/**
 * Act fourteen, opened for THE LAMPREY on 1 October 2026 — `act-13.ts` had
 * six lines left under the 250-line ceiling, which is less than one wave with
 * its argument written above it (`waves.ts`).
 *
 * **THE LAMPREY is the first boss one seat pins for the other to pick.** A
 * sucker mouth bitten onto the hull, crawling along it: one seat keeps a thumb
 * on the jaw wherever it crawls, and the other taps the one lit tooth before
 * it snaps back (`docs/spec/bosses-choreographed.md` §41, `sim/lamprey.ts`).
 * A jaw let go bites deeper, and a full bite is the hull. Five teeth over two
 * bites drop the mouth off; then the gullet rears and is shot in its colour,
 * three times, and a shot run out is a lunge that bites again with the teeth
 * it has left.
 *
 * It authors the whole script: the pilot pins the first bite and the
 * navigator the second, from the two ends of the hull crawling inward; each
 * gullet's re-bite is the pilot's again, and the last shot is white.
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
      both: "One of you keeps a thumb on the crawling jaw. The other taps the lit tooth before it snaps back. Five teeth out, then shoot the gullet in its colour.",
      p1: "1. First bite: drag the jaw and keep your thumb on it as it crawls.\n2. Second bite: tap the one lit tooth, quickly.\n3. Shoot the gullet in its colour.",
      p2: "1. First bite: tap the one lit tooth, quickly.\n2. Second bite: drag the jaw and keep your thumb on it as it crawls.\n3. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "lamprey",
      steps: [
        {
          ask: "bite",
          pinner: 1,
          teeth: 3,
          toothBeats: 3,
          col: 2,
          crawl: 1,
          crawlBeats: 3,
          color: "either",
          beats: 0,
        },
        {
          ask: "bite",
          pinner: 2,
          teeth: 2,
          toothBeats: 2,
          col: 8,
          crawl: -1,
          crawlBeats: 2,
          color: "either",
          beats: 0,
        },
        {
          ask: "gullet",
          pinner: 1,
          teeth: 2,
          toothBeats: 2,
          col: 2,
          crawl: 1,
          crawlBeats: 1,
          color: "red",
          beats: 3,
        },
        {
          ask: "gullet",
          pinner: 1,
          teeth: 2,
          toothBeats: 2,
          col: 2,
          crawl: 1,
          crawlBeats: 1,
          color: "cyan",
          beats: 3,
        },
        {
          ask: "gullet",
          pinner: 1,
          teeth: 2,
          toothBeats: 2,
          col: 2,
          crawl: 1,
          crawlBeats: 1,
          color: "either",
          beats: 3,
        },
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
