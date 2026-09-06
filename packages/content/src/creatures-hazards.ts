import type { CreatureKind, RockKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * **The arrivals with nothing alive in them**: the five speed tiers, THE VEER,
 * the torch — and THE FENCE, which is not made of stone.
 *
 * Split out of `creatures-table.ts` when THE WISP took that file past its
 * 250-line limit, along the seam the file itself already reads on. Six of its
 * eighteen rows were one family saying one thing six times — dead, cannot be
 * shot, ward it — differing only in a number written into the blurb, and they
 * are the six a reader looking for a *creature* scrolls past. Everything left
 * next door is a body that lives, and no two of those are alike.
 *
 * **It was `creatures-rocks.ts` until THE FENCE**, and `creatures-guarded.ts`
 * for one commit after that. Neither name survived the creature: a fence is
 * not stone, and it is not the shield's alone either — the cannon can cut a
 * way through one (`fenceBurn`), which makes it `mixed` in the bestiary's own
 * categories. What every member of this file *does* have in common is that
 * **nothing in it lives**: none carries a colour, none can be killed, and none
 * is ever destroyed. A rock is turned or it lands; a fence passes or it
 * discharges. Everything next door is a body, and no two of those are alike.
 *
 * `Record<HazardKind, CreatureDef>` rather than a loose object: `RockKind` is
 * the sim's own list of what `isMeteorKind` accepts, so a rock added there and
 * left out here is a build error, and a living kind written in here by mistake
 * is one too. `CREATURES` spreads this back in at the position the rocks have
 * always held, so nothing that reads the table in key order — the director's
 * brush strip, the bestiary sheet — sees any change at all.
 */
type HazardKind = RockKind | Extract<CreatureKind, "fence">;

export const HAZARD_CREATURES: Record<HazardKind, CreatureDef> = {
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
  fence: {
    kind: "fence",
    // **Both**, and it is the only entry in this file that is not the shield's
    // alone. The shield is the ordinary answer — the dome standing in a gap —
    // but the cannon can cut a gap of its own (`fenceBurn`), and a wave may
    // author a fence with no gaps at all, which is a wave the cannon is the
    // *only* answer to. A panel missing either half is a panel that cannot
    // answer one of those two waves, and `test/waves.test.ts` is where that
    // would otherwise go unnoticed.
    controls: ["aim", "guard"],
    // None, and none ever authored. A wall is not a body and there is nothing
    // inside it — the pair's whole exchange about one is a number, and a
    // colour here would be an offer to load a cannon that has nothing to fire
    // at (the throb's blank, arrived at from the far side of the field).
    color: null,
    // Player 1's strip, like every other thing the shield answers — and this
    // is the sharpest that ordinary answer has ever been. The pilot is shown
    // the wall coming *and* shown where its gaps are; the navigator, the only
    // seat that can move the dome, is shown a line with nothing in it.
    radar: "p1",
    blurb:
      "A live wire across the whole field with a gap burnt through it, coming down twice as fast as anything else. The trigger does nothing to it: the ship survives by having the shield standing in a gap when it arrives, and only the pilot can see where the gaps are. A shot cuts a new one in the cannon's own column — so the other way through is the navigator saying where the dome is and the pilot putting the cannon over it.",
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
