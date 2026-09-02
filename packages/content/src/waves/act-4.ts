import type { Wave } from "../wave-types.js";

/**
 * Act four, and it opens with the creature that filled act three.
 *
 * The acts are not a design unit — `waves.ts` says so at length: they exist
 * because a list that grows a dozen lines a wave has to be cut somewhere, and
 * a chapter of the game is the least arbitrary place to cut it. `act-3.ts`
 * reached the 250-line limit the day THE WISP was written, exactly as
 * `act-2.ts` did before it, so this is where new waves land now.
 */
/**
 * **THE WISP, in three figures.** Here for the reason the two blocks above
 * are: the director rewrites the array and keeps only what stands over it.
 *
 * What has to bite is not finding the thing — player 2 can see it perfectly
 * well — but the *length of the sentence*. Two beats is 1.25 s, under what a
 * full spoken exchange takes (docs/spec/latency.md), so a pair who describe
 * the tile will never once be in time and a pair who name it will. The wave
 * has to make them find that out, and then make it cost something.
 *
 * 1. Beats 0–10, the shorthand. One wisp on an empty field, and nothing
 *    arriving to punish a slow first attempt. It cannot reach the ship and it
 *    will not leave, so the pair may spend as many hops as they need working
 *    out that "E nine" is the whole call — and the first real body only comes
 *    in once they have.
 * 2. Beat 14, the second one. Two wisps hop on the *same* beat, because the
 *    dwell is read off the shared clock rather than a phase of each body's own
 *    — so the count serves both and what has to be said is two squares on one
 *    number, not two of each. That is where "which one" becomes a word the
 *    pair has to have already agreed on.
 * 3. Beats 20–30, the squeeze. A red body, a rock, and a third wisp. The rock
 *    is the point: the shield's column is player 2's hand and its trigger is
 *    player 1's, so both of them are already saying something else on the beat
 *    a tile expires. Every hop spent re-asking is a hop of the run either side
 *    of it.
 *
 * A wisp entry names its kind and no colour, and that is not the veil's
 * arrangement with a field left out: a wisp carries no colour at all, the way
 * a throb does, and either shot kills one. The authored column is only where
 * it materialises — the first hop is two beats later and owes it nothing.
 */
export const WAVES_ACT_4: Wave[] = [
  {
    name: "THE WISP",
    sentence: "The one where describing it takes longer than it stays.",
    guide: {
      both: "One of you cannot see this one at all. It never falls and it never leaves — every two beats it is standing somewhere else on the field, and the lettered grid under everything is how you say where.",
      p1: "You will not see it once. Take the letter, put the cannon on it and hold still — the number is only so you both know you are talking about the same one. Asking again costs you the tile.",
      p2: "Only your screen has it. Two beats is not a sentence: say the square and nothing else, and say it again the moment it moves. Either colour kills it, so do not wait to pick one.",
    },
    entries: [
      { beat: 0, col: 3, kind: "wisp", color: null },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 14, col: 1, kind: "wisp", color: null },
      { beat: 20, col: 2, color: "red" },
      { beat: 22, col: 6, kind: "meteor", color: null },
      { beat: 28, col: 4, kind: "wisp", color: null },
      { beat: 30, col: 0, color: "cyan" },
    ],
  },
];
