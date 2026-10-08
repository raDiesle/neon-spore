import type { Wave } from "../wave-types.js";

/**
 * Act thirteen, opened for THE DAVIT on 26 September 2026 — `act-12.ts` had
 * fourteen lines left under the 250-line ceiling, which is less than one
 * wave with its argument written above it (`waves.ts`). THE DAVIT itself
 * left the game on 8 October 2026: the owner did not like it, and it was
 * short to play (`docs/spec/bosses.md` §11.52).
 *
 * **THE HALTER is the first boss that asks a seat to do nothing.** A wary
 * seam on the hull's spine: on each lit segment one seat sends no command at
 * all while the other holds both grips, and held together the segment cracks
 * (§36, `sim/halter.ts`). The left mark rests the navigator and the right the
 * pilot; after the bare, a guard takes either way round. Three shots at the
 * bared centre, the last one white.
 *
 * **THE CAPSTAN is the first boss one seat turns for the other to work.** A
 * rusted drum on a cradle: one seat drags the drum to rock a face toward the
 * pair, the other wipes that face's band bright, and only the bared face
 * wears (§37, `sim/capstan.ts`). The left mark is the pilot's pull and the
 * right the navigator's; after the bare, a hold takes either way round. Three
 * shots at the core, the last one white.
 *
 * **THE GALL is the first boss that moves when it is answered.** A soft
 * nodule on a raised seam across the hull: the seat nearer it presses it
 * shut and holds it shut, and the instant it closes it jumps to another of
 * the seam's four points, for whichever seat is nearer there (§38,
 * `sim/gall.ts`). Three closes bare the root, and one shot in red ends it.
 *
 * **THE TRAPEZE is the first boss the pair swings up.** An alien sits on a
 * swing hung from long ropes over the middle; the pair push it as it comes
 * back toward the middle until it is high enough to kick the gong (§39,
 * `sim/trapeze.ts`, the owner's rework of 7 October 2026). Four levels, one
 * new thing each: P1 left and P2 right; who pushes a side called by chance;
 * shots from below; the pilot's tap locking the cannon for a shot from the
 * side. Every gong a little higher than the last.
 *
 * **THE FLUE is the first boss only one seat can see.** An ember runs along
 * a flue across the top of the field, end to end and back, over the cannon
 * held still under the middle (§11.57, `sim/flue.ts`). The pilot sees it and
 * the navigator does not, so the pilot says when, early by the shot's own
 * delay: a bolt climbs for most of a beat, a beam fills for three. Six
 * levels, each one weapon in one colour, the ember at its own speed and THE
 * SLOW at its own strength; three shots a level, and the third one missed is
 * the wave. The levels climb from a slow bolt to a fast beam, and the slow
 * comes in as the ember speeds up.
 *
 * **Every shot in this act waits six beats**, 3.75 seconds at 96 bpm. It was
 * three, which left little over a second once the cannon was under the core
 * and the bolt had climbed, and a shot run out is the wave; the owner, 7
 * October 2026: *when in boss sequences player needs to shoot cannon, we must
 * give players more time to shoot and hit.*
 */
export const WAVES_ACT_13: Wave[] = [
  {
    id: "theHalter",
    name: "THE HALTER",
    guide: {
      both: "One of you touches nothing while the other holds both grips. Hold it together and the seam opens. Then shoot the bared centre.",
      p1: "1. Left mark: hold both grips down while your partner keeps still.\n2. Right mark: let go and touch nothing at all.\n3. When the seam starts to close, do it again, either way round.\n4. Shoot the centre in its colour.",
      p2: "1. Left mark: let go and touch nothing at all.\n2. Right mark: hold both grips down while your partner keeps still.\n3. When the seam starts to close, do it again, either way round.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "halter",
      steps: [
        { ask: "left", color: "either", beats: 10 },
        { ask: "right", color: "either", beats: 10 },
        { ask: "fire", color: "red", beats: 6 },
        { ask: "guard", color: "either", beats: 8 },
        { ask: "fire", color: "cyan", beats: 6 },
        { ask: "guard", color: "either", beats: 6 },
        { ask: "fire", color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theCapstan",
    name: "THE CAPSTAN",
    guide: {
      both: "One of you drags the drum to turn a band toward the other, who rubs it bright. Both bands bright bare the core. Shoot it in its colour.",
      p1: "1. Left mark: drag the drum left and hold it.\n2. Right mark: rub the band your partner turns to you.\n3. When rust creeps back, do it again, either way round.\n4. Shoot the core in its colour.",
      p2: "1. Left mark: rub the band your partner turns to you.\n2. Right mark: drag the drum right and hold it.\n3. When rust creeps back, do it again, either way round.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "capstan",
      steps: [
        { ask: "left", color: "either", beats: 12 },
        { ask: "right", color: "either", beats: 12 },
        { ask: "fire", color: "red", beats: 6 },
        { ask: "hold", color: "either", beats: 8 },
        { ask: "fire", color: "cyan", beats: 6 },
        { ask: "hold", color: "either", beats: 6 },
        { ask: "fire", color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theGall",
    name: "THE GALL",
    guide: {
      both: "Press and hold the gall where it sits, on your half. It jumps: call its number and press it there. Three closes bare the root. Shoot it in its colour.",
      p1: "1. The gall starts on your half, 1 and 2. Press it and hold until it jumps.\n2. Call its number. Press it again when it is on 1 or 2.\n3. After three closes, move the cannon to the middle.",
      p2: "1. When the gall jumps to your half, 3 and 4, press it and hold until it jumps.\n2. Call its number.\n3. After three closes, shoot the root in its colour.",
    },
    entries: [],
    boss: {
      kind: "gall",
      steps: [
        { ask: "close", color: "either", beats: 6 },
        { ask: "close", color: "either", beats: 5 },
        { ask: "close", color: "either", beats: 5 },
        { ask: "fire", color: "red", beats: 6 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theTrapeze",
    name: "THE TRAPEZE",
    guide: {
      scene: "theTrapeze",
    },
    entries: [],
    boss: {
      kind: "trapeze",
      steps: [
        { ask: "push", gongSide: 1, gongMilli: 10000, beats: 32 },
        { ask: "call", gongSide: -1, gongMilli: 14000, beats: 40 },
        { ask: "shoot", gongSide: 1, gongMilli: 16000, beats: 48 },
        { ask: "lock", gongSide: -1, gongMilli: 18000, beats: 48 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theFlue",
    name: "THE FLUE",
    guide: {
      scene: "theFlue",
    },
    entries: [],
    boss: {
      kind: "flue",
      levels: [
        { weapon: "bolt", color: "red", speedMilli: 1000, slowMilli: 1000, from: "left", needs: 1 },
        {
          weapon: "bolt",
          color: "cyan",
          speedMilli: 1000,
          slowMilli: 1000,
          from: "right",
          needs: 1,
        },
        { weapon: "bolt", color: "red", speedMilli: 1500, slowMilli: 1000, from: "left", needs: 1 },
        {
          weapon: "beam",
          color: "cyan",
          speedMilli: 1000,
          slowMilli: 1000,
          from: "left",
          needs: 1,
        },
        {
          weapon: "bolt",
          color: "cyan",
          speedMilli: 1500,
          slowMilli: 1000,
          from: "left",
          needs: 2,
        },
        { weapon: "beam", color: "red", speedMilli: 1500, slowMilli: 500, from: "right", needs: 1 },
        { weapon: "bolt", color: "red", speedMilli: 2250, slowMilli: 750, from: "right", needs: 1 },
        { weapon: "beam", color: "cyan", speedMilli: 2000, slowMilli: 500, from: "left", needs: 1 },
        { weapon: "bolt", color: "cyan", speedMilli: 3000, slowMilli: 500, from: "left", needs: 2 },
        { weapon: "bolt", color: "red", speedMilli: 3600, slowMilli: 250, from: "right", needs: 1 },
        { weapon: "beam", color: "red", speedMilli: 2250, slowMilli: 250, from: "left", needs: 2 },
      ],
    },
    bossType: "normal",
    controls: "shots",
  },
];
