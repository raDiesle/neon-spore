import type { BriefingId } from "@neon-spore/sim";

/**
 * What each card says. Which card is due, and when, is the simulation's
 * (`packages/sim/src/briefing.ts`); this is only the words.
 *
 * **Every card is split, and the split is the point.** Three lines: one both
 * screens carry, and one each. A card that put all of it on both screens would
 * have taught the pair, in the first ten seconds of the game, that they do not
 * need to talk to each other — which is the one thing this game cannot survive
 * (docs/spec/roles.md). So neither half is ever a restatement of the other, and
 * neither is optional: `both` says what the thing *is*, and the two halves say
 * what each player does about it. Read alone, a card is half an instruction.
 *
 * Keep the lines short. They are read on a phone, under a beat, by someone who
 * is about to have to say them out loud.
 */
export interface BriefingCard {
  /** Two or three words, in the vocabulary the pair will use out loud. */
  title: string;
  /** The line both screens carry. Never the whole of it. */
  both: string;
  /** Player 1's half: the cannon, the shield's trigger, the maw. */
  p1: string;
  /** Player 2's half: the shield itself, and the two colours. */
  p2: string;
}

/**
 * A record over the closed subject list, so a creature that ships without a
 * card is a type error rather than a blank card in front of two people who
 * have never played.
 */
export const BRIEFINGS: Record<BriefingId, BriefingCard> = {
  opening: {
    title: "TWO SCREENS",
    both: "One ship, two screens — and the two screens do not show the same thing. What is coming is on one of them; the control that answers it is on the other.",
    p1: "Yours is the cannon, the shield's trigger and the maw.",
    p2: "Yours is the shield itself, and the two colours.",
  },
  slick: {
    title: "THE SLICK",
    both: "Flat, wide, and always red. It holds its lane and steps down one row on every beat.",
    p1: "Slide your strip until the cannon stands in its column. Say which column.",
    p2: "Press red. Nothing leaves the hull until you do.",
  },
  bulb: {
    title: "THE BULB",
    both: "Round, swollen, and always cyan. Same fall, same lane — the colour is the whole of the difference.",
    p1: "The column is still yours to stand in. Say the colour you can see.",
    p2: "Cyan for this one. A wrong colour is spent, not missed.",
  },
  runt: {
    title: "THE RUNT",
    both: "Tiny, and carries no colour at all. A shot that lands on it is the mistake — it costs points, whatever colour was fired.",
    p1: "The column is still yours to hold. Say when it is not worth standing in.",
    p2: "No colour is the right one here. Hold your fire and let it reach the hull instead.",
  },
  throb: {
    title: "THE THROB",
    both: "Swells and shrinks on the beat, and carries no colour either. Only a shot on the beat it is open lands at all.",
    p1: "Call the beat it swells on, out loud, the way you call a column.",
    p2: "Fire on the count, not on sight — a shot on the wrong beat does nothing.",
  },
  meteor: {
    title: "THE ROCK",
    both: "Dead rock. It cannot be shot, and it stops a shot of yours going up its column.",
    p1: "It announces itself on your strip, before it is on the field. Trigger the shield at the moment it lands — not before.",
    p2: "Slide the shield into its column and hold it there. You cannot fire it yourself.",
  },
  meteorMedium: {
    title: "A QUICKER ROCK",
    both: "The same rock, falling two rows a beat instead of one.",
    p1: "The window has not moved. It simply arrives sooner than the last one.",
    p2: "Be in the column early. There is no time left to slide late.",
  },
  meteorFast: {
    title: "A FAST ROCK",
    both: "The same rock again, three rows a beat.",
    p1: "Count it out loud from the strip. By the time it is visible it is nearly here.",
    p2: "Park the shield where it is going, not where it is.",
  },
  meteorFaster: {
    title: "A FASTER ROCK",
    both: "Four rows a beat. It crosses the field in the time a bulb takes to fall a quarter of it.",
    p1: "Say the column the moment it appears on your strip.",
    p2: "One slide, no correction. There is no second one.",
  },
  meteorFastest: {
    title: "THE FASTEST ROCK",
    both: "Five rows a beat, and nothing in the field is quicker except a torch.",
    p1: "This is the one that has to be called before it exists on the field.",
    p2: "Trust the column you were given and stay in it.",
  },
  torch: {
    title: "THE TORCH",
    both: "Rock again, twice as wide, and the fastest thing in the field. It cannot be shot either.",
    p1: "It is on your strip and on nobody else's. Call it before it arrives.",
    p2: "It covers two columns at once. The shield has to sit across both of them.",
  },
  queen: {
    title: "THE BULB QUEEN",
    both: "Huge and armoured. Two marks under her middle, one real and one not. She opens for two beats, and every eight a torch drops out of one of her wings.",
    p1: "You see *what* is coming — the shape and the colour. Say both.",
    p2: "You see *where* — which of the two marks is real, and which wing drops. Say the side.",
  },
  warden: {
    title: "THE WARDEN",
    both: "A ring five columns wide with a hole you can see the field through. It never moves, and it takes one of your two sliding controls at a time.",
    p1: "Only a shot of the rim's own colour, in the hole's own column, takes a plate off it.",
    p2: "The core only stands still for two beats after a line comes free. That is the whole window.",
  },
  tether: {
    title: "THE LINE",
    both: "A line out of the rim onto one of your sliding controls. It cannot be shot and it cannot be warded.",
    p1: "Whichever of you it is holding cannot slide at all until it is off.",
    p2: "Only the one it is *not* holding can pull it — and pulling costs that hand.",
  },
  mirror: {
    title: "THE MIRROR",
    both: "The boss is your own ship. It performs a sequence of your own moves, then asks for the whole of it back.",
    p1: "Say every step out loud as it happens. Neither of you can hold six of them alone.",
    p2: "Nothing you press counts while it is still showing. Wait for it to finish.",
  },
  mend: {
    title: "A POD",
    both: "It hangs where it was left. Shooting it loose is only half of getting it — after that it sinks and drifts.",
    p1: "Chase it with the cannon and open the maw as it reaches the hull. It mends the ship.",
    p2: "Free it with a shot of either colour, then say which way it is drifting.",
  },
  purge: {
    title: "A SWEEP POD",
    both: "The same pod with different cargo: taking this one in clears the field of everything that is falling.",
    p1: "Hold it for the beat that is about to go wrong, not for the one that already has.",
    p2: "Freeing it is still a shot, and a shot spent here is a creature still coming.",
  },
  ward: {
    title: "A WARD POD",
    both: "This one holds the shield armed for six beats with no trigger at all.",
    p1: "Your trigger is free while it lasts. Spend the hand on something else.",
    p2: "Armed is not aimed — the column is still yours to be standing in.",
  },
};
