import { SNAKE_ROUNDS } from "../snake-rounds.js";
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
/**
 * **THE GHOST, in three figures.** Here for the reason the block above is:
 * the director rewrites the array and keeps only what stands over it, so a
 * note written between two entries is a note that survives until the next
 * time somebody saves a wave in the editor.
 *
 * What has to bite is neither the colour nor the timing — player 2 can see
 * both — but the *handover*. The number is worth nothing until the cannon is
 * standing on it, and the cannon belongs to the one player who cannot check.
 *
 * 1. Beats 0–5, the number. One ghost alone, then a real red slick across the
 *    field. The whole descent is available, so the pair finds the sentence —
 *    a column said as a digit and said back — with nothing pressing them; and
 *    the second arrival is there so that *which one am I standing under* is
 *    already a question the first time it is asked.
 * 2. Beats 10–12, the two of them. A ghost and an ordinary body four columns
 *    apart. Player 1 can see one of them, and the one they can see is the one
 *    that is wrong to stand under — the beat where believing the partner over
 *    your own eyes stops being advice.
 * 3. Beats 18–26, the crossing one. The path that does not hold still: it
 *    prowls a row, turns at each wall, and on the third turn it comes down
 *    head first at the ship. A rock lands in the middle of it, because the
 *    shield's column is player 2's hand and the trigger is player 1's — so
 *    the pair is already talking about something else while a number they
 *    agreed on is going stale one lane a beat.
 *
 * A ghost entry names its kind and its colour, the way a dart does: the
 * silhouette is the ghost's and the colour is which trigger answers it.
 * `path: "across"` is the only other thing it can say, and absent means it
 * falls.
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
  {
    name: "THE GHOST",
    sentence: "The one where waiting to see it is the miss.",
    guide: {
      both: "Something is falling that only one of your screens draws. The other gets a band across the row it is in, and nothing at all about the column.",
      p1: "You will never see it — read the band for how long you have, and take the column you are told. Say the number back: you standing there is the only proof it was heard.",
      p2: "You are the only one who can see it, and you cannot move the cannon. Say the column as a digit, not “there”, and say it again until they are under it. The last one crosses: call where it is going.",
    },
    entries: [
      { beat: 0, col: 2, kind: "ghost", color: "cyan" },
      { beat: 5, col: 6, color: "red" },
      { beat: 10, col: 1, kind: "ghost", color: "red" },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 18, col: 1, kind: "ghost", color: "cyan", path: "across" },
      { beat: 22, col: 4, kind: "meteor", color: null },
      { beat: 26, col: 6, color: "red" },
    ],
  },
  {
    name: "SNAKE",
    sentence: "The one where the ship is the body, and neither of you can turn a whole corner.",
    guide: {
      both: "The ship folds into a snake and it never stops. One of you has left and right, the other up and down, and a turn only counts across the way it is already going — so every corner is both of you, in order.",
      p1: "You steer sideways and you are the only one who can see the food. Say where it is as a place, not a direction. FLIP swaps the ends when they tell you there is nowhere left to go.",
      p2: "You steer up and down and you are the only one who can see the body. Say what is in the way before they ask. SLOW buys about a tile — use it on the corner, not on the straight.",
    },
    entries: [],
    boss: { kind: "snake", rounds: SNAKE_ROUNDS },
    controls: "snake",
  },
];
