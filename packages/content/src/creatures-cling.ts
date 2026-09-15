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
 * the strip of the seat **without** the control, since that is the seat whose
 * word — *move* — is the whole answer (`render/duty-harpoon.ts`).
 *
 * **Both are `installed` since 15 September 2026**, which is the owner's ruling
 * of that day: *they should only exist as brush, but once they are placed on a
 * tile, for a defined period of time, the malfunction is applied.* So a wave
 * never names one. What puts the body on the field is a fault placed on the
 * map, which fires it at the control from the lantern at the top and reels it
 * back when the pencil runs out (`sim/harpoon.ts`) — and `installed` is exactly
 * the row for *a body something else on the field puts there, never a wave*.
 *
 * The rows stay because the body has not changed: the bestiary still describes
 * it, the radar still announces it, the shape sheet still draws it, and the
 * control groups still say which panel a wave carrying one has to show. What
 * went is the arrival — the fall down a lane, the fuse counted in beats, and
 * being shaken off by moving enough times. That is on the NOT BUILT YET page.
 */
export type ClingCreatureKind = Extract<CreatureKind, "limpet" | "leech">;

export const CLING_CREATURES: Record<ClingCreatureKind, CreatureDef> = {
  limpet: {
    kind: "limpet",
    controls: ["guard"],
    color: null,
    radar: "p1",
    installed: true,
    blurb:
      "A round body ringed with hooks. The thing at the top of the field fires it at the plate like a harpoon, very fast, and it clamps on wherever the plate is. A shot is spent on it — the bolt bounces off and the body is untouched. From then on the plate must keep moving: a plate that has not been in a new column for harpoonStillBeats loses the round, and a timer over the body says how many beats it stays before the line is reeled back in. Player 1, who cannot move the plate, is the seat told to say so.",
  },
  leech: {
    kind: "leech",
    controls: ["aim"],
    color: null,
    radar: "p2",
    installed: true,
    blurb:
      "Four needles on a round body. The thing at the top of the field fires it at the cannon like a harpoon, very fast, and it drives them into the swelling wherever the cannon is. A shot is spent on it — the bolt bounces off and the body is untouched. From then on the cannon must keep moving: a cannon that has not been in a new column for harpoonStillBeats loses the round, and a timer over the body says how many beats it stays before the line is reeled back in. Player 2, who cannot move the cannon, is the seat told to say so.",
  },
};
