import type { Wave } from "../wave-types.js";

/**
 * Act five, and it opens with a wheel.
 *
 * The acts are not a design unit — `waves.ts` says so at length: they exist
 * because a list that grows a dozen lines a wave has to be cut somewhere, and
 * a chapter of the game is the least arbitrary place to cut it. `act-4.ts`
 * reached the 250-line limit the day THE GYRE was written, exactly as
 * `act-3.ts` and `act-2.ts` did before it, so this is where new waves land now.
 */
/**
 * **THE GYRE, in three figures.** Here for the reason every block above its
 * own array is: the director rewrites the array and keeps only what stands
 * over it.
 *
 * What has to bite is that every sentence the pair has learned so far expires.
 * A wheel carries a red and a cyan two columns apart and turns, so "red in
 * four" is a true statement with a shelf life of one beat — and the wheel gets
 * quicker the longer it is up. The wave has to let them find that out, then
 * show them the one thing that answers it, then charge them for being slow.
 *
 * 1. Beat 0, the wheel alone. Nothing else on the field for twelve beats, so
 *    a pair may spend as many misses as they need discovering that a column
 *    called on one beat is empty on the next. It cannot reach the ship yet —
 *    the diamond has three laps to sink first — so the cost of a slow start is
 *    only that the rim is faster when they work it out.
 * 2. Beats 12–20, the ordinary bodies. Two slicks and a bulb in their own
 *    lanes, at the moment the wheel is quick enough to need the maw. They are
 *    there to be the thing the pilot is *not* doing while they hold the pull:
 *    the maw is free of the column, but the thumb is not, and a wave with
 *    nothing else in it would never say so.
 * 3. Beat 26, a rock. It arrives about when a wheel left alone starts
 *    grinding, so the pair is choosing between the shield's column and the
 *    wheel's beat with the hull already going down. That is the wave.
 */
export const WAVES_ACT_5: Wave[] = [
  {
    name: "THE GYRE",
    sentence: "The one where the column you were told is the right one for a single beat.",
    guide: {
      both: "Six bodies bolted round a turning wheel, red and cyan alternating. It stops falling in the middle of the field, walks a diamond there, and turns faster the longer it is up — sinking a row each lap until it grinds along the ship.",
      p1: "SUCK slows the wheel for four beats and does not care where you are standing. Spend it on the beat you have both agreed to fire on, then be in the column — not the other way round.",
      p2: "Do not call where a body is, call where it will be. One position round the rim per beat, and the colour two along is the other one — so say the colour and the beat together, or it has turned by the time they hear it.",
    },
    entries: [
      { beat: 0, col: 3, kind: "gyre", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 20, col: 1, color: "red" },
      { beat: 26, col: 5, kind: "meteor", color: null },
    ],
  },
];
