import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * **THE LIMPET and THE LEECH — the bodies that take a control and go off if
 * it stands still.** Next door to `creatures-handed.ts` rather than in it:
 * those three are answered by a hand on the body, these two by the control
 * itself being moved, and the `controls` row says so — `guard` for the one
 * that takes the plate, `aim` for the one that takes the cannon, because a
 * wave with one on it must show the strip that shakes it off.
 *
 * Both without a colour: nothing fired reaches either. Each is announced on
 * the strip of the seat **without** the control, since that is the seat that
 * is shown the fuse once it lands and the seat whose word — *move* — is the
 * whole answer (`sim/cling.ts`).
 */
export type ClingCreatureKind = Extract<CreatureKind, "limpet" | "leech">;

export const CLING_CREATURES: Record<ClingCreatureKind, CreatureDef> = {
  limpet: {
    kind: "limpet",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "A round body ringed with hooks that falls straight down one lane. No shot touches it and the shield does not stop it; it lands on the ship and clamps onto the plate, wherever the plate is. From then on every beat the shield stands in the same column is a beat of its fuse, and when the fuse runs out it goes off — a hit on the hull, and the wave is lost. Every beat the shield is found in a new column puts the fuse back and loosens the grip by one; enough of those and it drops off. Only player 1 is shown the fuse. Player 2, who holds the plate, sees the body and has to be told to move.",
  },
  leech: {
    kind: "leech",
    controls: ["aim"],
    color: null,
    radar: "p2",
    blurb:
      "Four needles on a round body, falling straight down one lane. No shot touches it and the shield does not stop it; it lands on the ship and drives itself into the cannon, wherever the cannon is. Every beat the cannon stands in the same column is a beat of its fuse, and when the fuse runs out it goes off — a hit on the hull, and the wave is lost. Every beat the cannon is found in a new column puts the fuse back and loosens it by one; enough of those and it drops off. Only player 2 is shown the fuse. Player 1, who steers, sees the body and has to be told to move.",
  },
};
