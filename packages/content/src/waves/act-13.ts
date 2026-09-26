import type { Wave } from "../wave-types.js";

/**
 * Act thirteen, opened for THE DAVIT on 26 September 2026 — `act-12.ts` had
 * fourteen lines left under the 250-line ceiling, which is less than one
 * wave with its argument written above it (`waves.ts`).
 *
 * **THE DAVIT is the first boss where one seat aims what the other looses.**
 * A crane boom pivoted off the hull's spine: on each swing one seat leans its
 * phone onto a lit target and keeps it there while the other holds a draw,
 * and the draw lands only if it lifts while the lean still holds, swiping
 * toward the lean's half (`docs/spec/bosses-choreographed.md` §35,
 * `sim/davit.ts`). Two looses a swing light the pivot, which is shot in its
 * colour; between the shots either seat steers for the other to reland it.
 *
 * It authors the whole script, and nothing that falls: the left swing twice,
 * the right swing twice, each to one half and then the other, then fire and
 * reland in turn up to the white last hit.
 */
export const WAVES_ACT_13: Wave[] = [
  {
    id: "theDavit",
    name: "THE DAVIT",
    guide: {
      both: "Your partner leans the boom onto the lit side: hold a draw, then swipe that way. Two each way light the pivot. Shoot it in its colour. Then reland it.",
      p1: "1. On the left swing, lean your phone onto the lit side and hold it there.\n2. On the right swing, hold a draw while your partner leans, then swipe toward the lit side.\n3. Shoot the pivot in its colour.",
      p2: "1. On the left swing, hold a draw while your partner leans, then swipe toward the lit side.\n2. On the right swing, lean your phone onto the lit side and hold it.\n3. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "davit",
      steps: [
        { ask: "left", leanMilli: -20000, rangeMilli: 8000, color: "either", beats: 6 },
        { ask: "left", leanMilli: 15000, rangeMilli: 8000, color: "either", beats: 4 },
        { ask: "right", leanMilli: 20000, rangeMilli: 8000, color: "either", beats: 6 },
        { ask: "right", leanMilli: -15000, rangeMilli: 8000, color: "either", beats: 4 },
        { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
        { ask: "reland", leanMilli: -10000, rangeMilli: 8000, color: "either", beats: 3 },
        { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "cyan", beats: 3 },
        { ask: "reland", leanMilli: 10000, rangeMilli: 8000, color: "either", beats: 3 },
        { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
];
