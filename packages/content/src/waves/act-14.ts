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
 * **It arrives hungry and crawls between levels** (the owner, 6 October
 * 2026, `sim/lamprey-roam.ts`): it crawls in and eats two rocks, a slick and
 * a bulb as they fall — each caught on its own row, the gaps between them
 * uneven and the head after them at one, two or three tiles a beat (the
 * owner, 9 October 2026, `sim/lamprey-meal.ts`) — **comes down the middle
 * of the field at the ship, and both seats pull it back off**, the head
 * along a curve, the eel losing its temper two thirds of the way (the owner,
 * 9 October 2026, `sim/lamprey-tow.ts`) — and then leaps through three levels of three, four and five stays, every leap in a
 * level a tile longer than the last and each level ended on a gullet. Before
 * the second and third it crawls the field side to side like a worm, eats
 * what falls for it and drops dung the shield has to turn. A lit tooth takes
 * three taps, and four in the third level. Each stay's window is THE SLOW.
 * **In the fourth level it bites into the ship** (the owner, 10 October
 * 2026, `sim/lamprey-plug.ts`): twice down the middle into the hull, its
 * teeth pulling a button out of a panel — the pilot's SUCK, then the
 * navigator's RED — which that seat presses back in before the other pulls
 * the tail.
 */
export const WAVES_ACT_14: Wave[] = [
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
  {
    id: "theLamprey",
    name: "THE LAMPREY",
    guide: {
      both: "It goes for the ship: pull it back. One of you holds the tail. The other pulls the head or taps the lit tooth. Shield its dung. Shoot the gullet.",
      p1: "1. It goes for the ship: pull the tail out and keep it there.\n2. Second bite: tap the lit tooth until it breaks.\n3. When it drops dung, raise the shield.\n4. In the ship: press SUCK in. Then pull the tail when told.",
      p2: "1. It goes for the ship: pull the head back. When it gets angry, pull again.\n2. Second bite: hold the tail.\n3. When it drops dung, carry the shield under it.\n4. In the ship: pull the tail once SUCK is in. Then press RED.",
    },
    entries: [],
    boss: {
      kind: "lamprey",
      meal: [
        { kind: "meteor", col: 3, row: 4, beat: 0, tiles: 1 },
        { kind: "slick", col: 8, row: 8, beat: 2, tiles: 2 },
        { kind: "bulb", col: 2, row: 3, beat: 7, tiles: 3 },
        { kind: "meteor", col: 6, row: 6, beat: 9, tiles: 2 },
      ],
      steps: [
        { ask: "tow", holder: 1, teeth: 0, jump: 1, beats: 16, color: "either" },
        { ask: "teeth", holder: 2, teeth: 1, jump: 2, beats: 16, color: "either", taps: 3 },
        { ask: "gullet", holder: 1, teeth: 0, jump: 3, beats: 12, color: "red" },
        {
          ask: "apart",
          holder: 1,
          teeth: 0,
          jump: 1,
          beats: 14,
          color: "either",
          crawl: true,
          food: "slick",
          dung: true,
        },
        { ask: "teeth", holder: 1, teeth: 1, jump: 2, beats: 16, color: "either", taps: 3 },
        { ask: "pull", holder: 2, teeth: 0, jump: 3, beats: 12, color: "either" },
        { ask: "gullet", holder: 1, teeth: 0, jump: 4, beats: 12, color: "cyan" },
        {
          ask: "pull",
          holder: 1,
          teeth: 0,
          jump: 2,
          beats: 12,
          color: "either",
          crawl: true,
          food: "bulb",
          dung: true,
        },
        { ask: "teeth", holder: 2, teeth: 1, jump: 3, beats: 18, color: "either", taps: 4 },
        { ask: "apart", holder: 2, teeth: 0, jump: 4, beats: 14, color: "either" },
        { ask: "teeth", holder: 1, teeth: 1, jump: 5, beats: 18, color: "either", taps: 4 },
        { ask: "gullet", holder: 1, teeth: 0, jump: 6, beats: 12, color: "either" },
        {
          ask: "plug",
          holder: 2,
          teeth: 0,
          jump: 1,
          beats: 14,
          color: "either",
          crawl: true,
          food: "meteor",
          button: "intake",
        },
        {
          ask: "plug",
          holder: 1,
          teeth: 0,
          jump: 1,
          beats: 14,
          color: "either",
          button: "fireRed",
        },
        { ask: "gullet", holder: 1, teeth: 0, jump: 3, beats: 12, color: "cyan" },
      ],
    },
    bossType: "normal",
  },
];
