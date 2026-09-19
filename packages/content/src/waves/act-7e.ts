import type { Wave } from "../wave-types.js";

/**
 * The fifth page of act seven, cut off `act-7d.ts` on 19 September 2026, when
 * that page sat eight lines under the ceiling with six §6.1/§6.2 guide-line
 * lanes still queued against it: a guide line is the one thing in a wave file
 * that gets longer when it gets truer, so the next of those lanes to land
 * would have paid for the seam rather than asked for it (`docs/queue.md`).
 *
 * **It takes the letter `e` and the old `act-7e.ts` becomes `act-7f.ts`**,
 * rather than appending after it, because THE TASTER and THE SINEW were
 * `act-7d.ts`'s own last two waves and the order of the waves is the order
 * of the game: the old `act-7e.ts` (THE LEDGER onward) already comes *after*
 * them in that order, so a page appended past it would have played them
 * seven waves later than the game has always played them. The letters
 * after the cut shift down one, the way `docs/queue.md`'s *Act seven has no
 * room* entry names as an option for exactly this shape of overflow.
 *
 * **THE TASTER's arrivals are the colours it is counting.** The fan reads what
 * the pair has fired over the last thirty beats, so every body under it costs
 * a shot in a colour the boss will then grow armour in — which makes this the
 * one wave where a body answered *without* firing is worth something. Rocks
 * for the shield, and three slicks and three bulbs, evenly split and
 * alternating, so the lean is a decision the pair makes rather than one the
 * wave makes for them. Nothing is placed against the fan's own count, for THE
 * DIASTOLE's reason: which beat a blade sets its edge on depends on when the
 * pair sheared the last one, a beat nobody can know at authoring time.
 */
export const WAVES_ACT_7E: Wave[] = [
  {
    id: "theTaster",
    name: "THE TASTER",
    sentence: "The one where the colour you keep firing is the colour that stops working.",
    guide: {
      both: "Strike each blade off with the colour it is not. Cut the gaps to stop the fan re-edging. The last two lock over the body: pull them apart, then the beam.",
      p1: "1. Say the colour on the next blade.\n2. Hold the cannon on that blade's column.\n3. Once three grow at once, hold one so it cannot decide.\n4. On the last two, drag the locked blades apart for the beam.",
      p2: "1. Fire the colour the blade is not.\n2. Keep the colours level: the next blade takes the one you use most.\n3. Drag across a gap: it cuts and costs no colour.\n4. Beam the colour you fired least, once they are apart.",
      scene: "theTaster",
    },
    entries: [
      { beat: 16, col: 1, kind: "meteor", color: null },
      { beat: 24, col: 5, kind: "meteor", color: null },
      { beat: 30, col: 3, color: "red" },
      { beat: 36, col: 0, color: "cyan" },
      { beat: 44, col: 6, kind: "meteor", color: null },
      { beat: 50, col: 2, color: "red" },
      { beat: 56, col: 4, color: "cyan" },
      { beat: 64, col: 3, kind: "meteor", color: null },
      { beat: 72, col: 1, color: "cyan" },
      { beat: 80, col: 5, color: "red" },
    ],
    boss: { kind: "taster" },
    bossType: "normal",
  },
  {
    id: "theSinew",
    name: "THE SINEW",
    sentence: "The one that asks how hard, not when, and only the two of you together can say.",
    guide: {
      both: "Pull both handles and hold the sum inside the band, four beats a fibre. Six fibres. From the fourth the tendon creeps slack under any hand, and only both of you letting go resets it.",
      p1: "1. Only you can see the band. Call the number to aim at.\n2. HOLD means the sum is in: stop moving, four beats.\n3. LIFT means no pull can reach it. Both thumbs off, together.\n4. On the fall, say which way is clear.",
      p2: "1. Only you can see the sum. Read it out every beat.\n2. Pull to the number called, never past it: over the top it snaps.\n3. Your sum sliding with your hand still is the slack. Say so.\n4. On the fall, sway the way called.",
      scene: "theSinew",
    },
    entries: [
      { beat: 16, col: 1, color: "red" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 34, col: 2, kind: "meteor", color: null },
      { beat: 42, col: 4, color: "red" },
      { beat: 52, col: 0, color: "cyan" },
      { beat: 60, col: 6, kind: "meteor", color: null },
      { beat: 70, col: 1, color: "cyan" },
      { beat: 80, col: 5, color: "red" },
    ],
    boss: { kind: "sinew" },
    bossType: "normal",
  },
];
