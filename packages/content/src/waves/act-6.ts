import type { Wave } from "../wave-types.js";

/**
 * Act six, and it opens with a rock that will not hold its lane.
 *
 * The acts are not a design unit — `waves.ts` says so at length: they exist
 * because a list that grows a dozen lines a wave has to be cut somewhere, and
 * a chapter of the game is the least arbitrary place to cut it. `act-5.ts`
 * reached the 250-line limit the day THE VEER was written, exactly as
 * `act-4.ts`, `act-3.ts` and `act-2.ts` did before it, so this is where new
 * waves land now.
 */
/**
 * **THE VEER, in three figures**, and what has to bite is the one habit every
 * rock so far has rewarded: *say the column once, put the shield there, stop
 * looking*. Five speed tiers, a torch, a volley and a carom have all been
 * answered that way — the number a pilot reads off the strip has never gone
 * stale before it landed. This rock's number expires three times.
 *
 * The split is the sharp end of it. A rock is the pilot's on the radar and the
 * navigator's on the field, so the seat that can see which way the next step
 * goes is the seat that cannot move the shield an inch. Everything the pair
 * does here has to cross the room twice: a side, then a column.
 *
 * 1. Beat 0, one alone, dead centre. Nothing else on the field for eighteen
 *    beats, so the pair can spend the whole fall discovering that it steps at
 *    all, that it steps at the same three rows every time, and that only one
 *    of them is being told which way. It reaches the ship if they give up on
 *    it, and it costs exactly what a rock costs.
 * 2. Beats 18–20, a veer and an ordinary slick beside it. This is the wave:
 *    the pilot is reading an arrow and calling sides while the cannon is
 *    wanted in another lane, and the thumb on GUARD is the same thumb.
 * 3. Beats 34–38, two veers with a plain rock between them. Three things the
 *    shield owes and only one of them stays where it was put — which is where
 *    "call it every time it re-aims" stops being advice and becomes the only
 *    way through.
 *
 * A veer entry names its kind and no colour, the way every rock does: nothing
 * about it can be shot, so there is nothing on the arrival to author.
 */
export const WAVES_ACT_6: Wave[] = [
  {
    id: "theVeer",
    name: "THE VEER",
    sentence: "The one where parking the shield under it is what loses it.",
    guide: {
      both: "A rock with a rider on it. Three times on the way down it steps one lane to the side — the same three rows every fall, and nothing about it can be shot. What lands is still a rock, and still wants the shield.",
      p1: "You are the only one who sees the arrow over its hat, and it points three rows before it moves. Say the side out loud every single time it re-aims — and keep the thumb on GUARD, because saying it is not warding it.",
      p2: "You can see where it is, not where it is going. Move the shield on what you are told rather than on what you can see, and never park it early — count the rows it steps on and be one call behind, not one lane.",
    },
    entries: [
      { beat: 0, col: 3, kind: "veer", color: null },
      { beat: 18, col: 5, kind: "veer", color: null },
      { beat: 20, col: 1, color: "red" },
      { beat: 34, col: 2, kind: "veer", color: null },
      { beat: 36, col: 4, kind: "meteor", color: null },
      { beat: 38, col: 6, kind: "veer", color: null },
    ],
  },
];
