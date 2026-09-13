/**
 * Every name THE MALFUNCTION puts on `@neon-spore/sim`'s surface, written out.
 *
 * `boss-surface.ts`'s file, one mechanic along, and cut for the plainer of that
 * file's two reasons: `index.ts` was at its 250-line limit, and the director
 * has to be able to offer an author every kind and every colour by name.
 *
 * A name here is one something outside `packages/sim` imports. `armShield` is
 * deliberately not among them: a dome is armed by the simulation and by
 * nothing else, and a caller outside it that could arm the shield would be a
 * second copy of the rule.
 */

// THE HANDOVER's clock. Three names rather than one because the picture needs
// all three: whether the panels are traded now, how many beats of warning are
// left before they are, and how many until they come back. Nothing outside reads
// `handoverAtBeat` or its two neighbours — the window is arithmetic and it is
// done in one place (`handover.ts`, `test/copies-table.ts`).
export { handedOver, handoverLeft, handoverWarning } from "./handover.js";
export {
  faultFiresThisBeat,
  MALFUNCTION_COLORS,
  MALFUNCTION_KINDS,
  type Malfunction,
  type MalfunctionColor,
  type MalfunctionKind,
  malfunctionColor,
  steerCol,
  steered,
  steerHeading,
} from "./malfunction.js";
