import type { Wave } from "../wave-types.js";

/**
 * Act thirteen's second page, opened for THE GOVERNOR on 6 October 2026,
 * when the owner reworked it and a step became a list of marks — `act-13.ts`
 * had no room for the longer script, and the director writes this page whole
 * every time somebody paints on it (`tools/director/src/waves-act-files.ts`).
 *
 * **THE GOVERNOR is a needle both seats tap at once.** A needle runs round a
 * dial mid-hull on its own (§43, `sim/governor.ts`), and every tap step lights
 * a mark for each seat; later steps light more, numbered, to be tapped in
 * order. Then the needle's lit tip is shot through the gap at the bottom of
 * the rim, under THE SLOW, and only then — the taps are played at the beat's
 * own rate. The owner's rework of 6 October 2026 gave it a quicker needle and
 * longer shots; on 7 October he asked for the tip as the target and for more
 * time, counted where it can be seen, so every window is longer now.
 *
 * The script: three steps of a mark each, the shot earned; a red shot; three
 * marks in order; a cyan shot; four in order; the white shot. A lap is a
 * thousand over the pace, in ticks, and a beat is 75; each tap window holds
 * three laps or more of its needle, an ordered step's the longest way round
 * its order with two laps to spare, and each shot two passes of the tip at
 * the gap or more. A shot's needle turns slowly, because the bolt is judged as
 * it meets the tip and the tip must not run far while the bolt climbs.
 */
export const WAVES_ACT_13B: Wave[] = [
  {
    id: "theGovernor",
    name: "THE GOVERNOR",
    guide: {
      both: "Each of you has a mark on the dial. Tap as the needle crosses yours. Later, tap the numbered marks in order. Shoot the needle's tip in the gap.",
      p1: "1. Tap as the needle crosses your mark. Your partner has one too.\n2. Tap the numbered marks in order. Your partner has 1 first.\n3. Shoot the needle's tip as it passes the gap, in its colour.",
      p2: "1. Tap as the needle crosses your mark. Your partner has one too.\n2. Tap the numbered marks in order. You have 1 first.\n3. Shoot the needle's tip as it passes the gap, in its colour.",
    },
    entries: [],
    boss: {
      kind: "governor",
      steps: [
        {
          ask: "tap",
          marks: [
            { seat: 1, markMilli: 250 },
            { seat: 2, markMilli: 750 },
          ],
          ordered: false,
          paceMilli: 7,
          color: "either",
          beats: 7,
        },
        {
          ask: "tap",
          marks: [
            { seat: 1, markMilli: 625 },
            { seat: 2, markMilli: 125 },
          ],
          ordered: false,
          paceMilli: 7,
          color: "either",
          beats: 7,
        },
        {
          ask: "tap",
          marks: [
            { seat: 1, markMilli: 875 },
            { seat: 2, markMilli: 375 },
          ],
          ordered: false,
          paceMilli: 8,
          color: "either",
          beats: 7,
        },
        { ask: "fire", marks: [], ordered: false, paceMilli: 3, color: "red", beats: 10 },
        {
          ask: "retap",
          marks: [
            { seat: 2, markMilli: 250 },
            { seat: 1, markMilli: 500 },
            { seat: 2, markMilli: 750 },
          ],
          ordered: true,
          paceMilli: 8,
          color: "either",
          beats: 8,
        },
        { ask: "fire", marks: [], ordered: false, paceMilli: 3, color: "cyan", beats: 10 },
        {
          ask: "retap",
          marks: [
            { seat: 1, markMilli: 875 },
            { seat: 2, markMilli: 375 },
            { seat: 1, markMilli: 625 },
            { seat: 2, markMilli: 125 },
          ],
          ordered: true,
          paceMilli: 9,
          color: "either",
          beats: 8,
        },
        { ask: "fire", marks: [], ordered: false, paceMilli: 4, color: "either", beats: 10 },
      ],
    },
    bossType: "normal",
  },
];
