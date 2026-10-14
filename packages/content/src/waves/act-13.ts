import type { Wave } from "../wave-types.js";

/**
 * Act thirteen, opened for THE DAVIT on 26 September 2026 — `act-12.ts` had
 * fourteen lines left under the 250-line ceiling, which is less than one
 * wave with its argument written above it (`waves.ts`). THE DAVIT itself
 * left the game on 8 October 2026: the owner did not like it, and it was
 * short to play (`docs/spec/bosses.md` §11.52).
 *
 * **THE CAPSTAN is the first boss one seat turns for the other to work.** A
 * rusted drum on a cradle: one seat drags the drum to rock a face toward the
 * pair, the other wipes that face's band bright, and only the bared face
 * wears (§37, `sim/capstan.ts`). The left mark is the pilot's pull and the
 * right the navigator's; after the bare, a hold takes either way round. Three
 * shots at the core, the last one white.
 *
 * **THE GALL is the first boss the pair throw to each other.** A small
 * alien sits on one seat's half of the hull: that seat taps it until it is
 * charged and pulls it up, and it leaps to a point on the other half, where
 * the clock starts again (§38, `sim/gall.ts`, the owner's rework of 8
 * October 2026). Three levels, each more taps on a shorter clock, each ended
 * by a shot at the alien where it landed: red, cyan, then either.
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
      both: "Tap the alien on your half until it shakes. Then pull it up. It jumps to your partner's half. Shoot it when it glows.",
      p1: "1. It starts on your half. Tap it, then pull it up.\n2. When it lands on your half, do it again.\n3. When it glows, move the cannon under it.",
      p2: "1. When it lands on your half, tap it, then pull it up.\n2. Be fast. Every landing starts the clock.\n3. When it glows, shoot it in its colour.",
    },
    entries: [],
    boss: {
      kind: "gall",
      steps: [
        { ask: "leap", taps: 3, color: "either", beats: 6 },
        { ask: "leap", taps: 3, color: "either", beats: 5 },
        { ask: "fire", taps: 0, color: "red", beats: 6 },
        { ask: "leap", taps: 4, color: "either", beats: 5 },
        { ask: "leap", taps: 5, color: "either", beats: 5 },
        { ask: "leap", taps: 5, color: "either", beats: 4 },
        { ask: "fire", taps: 0, color: "cyan", beats: 6 },
        { ask: "leap", taps: 6, color: "either", beats: 4 },
        { ask: "leap", taps: 6, color: "either", beats: 4 },
        { ask: "leap", taps: 7, color: "either", beats: 4 },
        { ask: "fire", taps: 0, color: "either", beats: 6 },
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
];
