/**
 * Every name THE MALFUNCTION and THE BARB put on `@neon-spore/sim`'s surface,
 * written out.
 *
 * `boss-surface.ts`'s file, one mechanic along, and cut for the plainer of that
 * file's two reasons: `index.ts` was at its 250-line limit, and these two are
 * the widest thing a mechanic has ever had to publish — the panel has to know
 * which seat holds the relief, the button has to know how much of its rest is
 * left, the ship has to know the dome is torn, and the director has to be able
 * to offer an author every kind and every colour by name.
 *
 * A name here is one something outside `packages/sim` imports. `barbCatchesDome`
 * and `armShield` are deliberately not among them: a body is caught and a dome
 * is armed by the simulation and by nothing else, and a caller outside it that
 * could arm the shield would be a second copy of the rule.
 */

export { domeScarred } from "./barb.js";
export {
  MALFUNCTION_COLORS,
  MALFUNCTION_KINDS,
  type Malfunction,
  type MalfunctionColor,
  type MalfunctionKind,
  malfunctionColor,
  reliefHolds,
  reliefReady,
  reliefRest,
  reliefSeat,
} from "./malfunction.js";
