import type { CairnState, Creature } from "@neon-spore/sim";
import { livePile } from "./cairn-pile.js";
import type { Layout } from "./layout.js";

/**
 * THE ONE RECORD A CANDIDATE **PILE** PATCHES.
 *
 * `crater-look.ts`'s kind and its reasons. What sits behind it is THE CAIRN
 * standing on the field: the stack of stones the pair takes apart one pull at
 * a time, on screen for the whole of the wave. The field is the whole picture
 * of the pile — stones, fire, clip and seams — because the question a
 * candidate asks is whether that picture is drawn live every frame or taken
 * once and held, and a record that held only the stones would leave the clip
 * drifting against a sprite that does not.
 *
 * What a look may **not** move: how many stones stand, which is the
 * simulation's (`CairnState.units`), and where each one stands, which is
 * `cairn-units.ts` and is read by the tell and the hand as well. A look draws
 * the stones where the geometry puts them, or the mark that says *this one is
 * next* stands beside a stone instead of on it.
 */
export const CAIRN_LOOK: {
  pile: (
    ctx: CanvasRenderingContext2D,
    l: Layout,
    body: Creature,
    boss: CairnState,
    time: number,
  ) => void;
} = { pile: livePile };
