import type { RockKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * The rocks: the five speed tiers, THE VEER and the torch.
 *
 * Split out of `creatures-table.ts` when THE WISP took that file past its
 * 250-line limit, along the seam the file itself already reads on. Six of its
 * eighteen rows were one family saying one thing six times — dead, cannot be
 * shot, ward it — differing only in a number written into the blurb, and they
 * are the six a reader looking for a *creature* scrolls past. Everything left
 * next door is a body that lives, and no two of those are alike.
 *
 * `Record<RockKind, CreatureDef>` rather than a loose object: `RockKind` is
 * the sim's own list of what `isMeteorKind` accepts, so a rock added there and
 * left out here is a build error, and a living kind written in here by mistake
 * is one too. `CREATURES` spreads this back in at the position the rocks have
 * always held, so nothing that reads the table in key order — the director's
 * brush strip, the bestiary sheet — sees any change at all.
 */
export const ROCK_CREATURES: Record<RockKind, CreatureDef> = {
  meteor: {
    kind: "meteor",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb: "Dead rock. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorMedium: {
    kind: "meteorMedium",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling twice as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFast: {
    kind: "meteorFast",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling three times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFaster: {
    kind: "meteorFaster",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling four times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFastest: {
    kind: "meteorFastest",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling five times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  veer: {
    kind: "veer",
    controls: ["guard"],
    color: null,
    // Player 1's strip, like every other rock — and here that ordinary answer
    // does the most work it has ever done. The pilot is shown one coming *and*
    // shown which way its next step goes; the navigator, who is the only one
    // who can move the shield under it, is shown the rock and nothing else.
    radar: "p1",
    blurb:
      "Dead rock with a rider on it, coming down a row a beat. Cannot be shot. Three times on the way down it steps a lane to one side — at the same three rows every time, and only the pilot is shown which side the next one takes.",
  },
  torch: {
    kind: "torch",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Same rock, same colour as a meteor, just twice as wide and the fastest thing in the field. Cannot be shot — and it is what the queen carries on each wing. Shield across both columns, triggered at the right moment.",
  },
};
