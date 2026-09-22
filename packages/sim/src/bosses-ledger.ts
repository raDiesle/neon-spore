/**
 * **THE LEDGER's names, in the boss barrel** — its state, its phases, the
 * clock its cord keeps and the three gates its hands hang off.
 *
 * Cut off `bosses-clocks.ts` when the pilot's two handles were lifted out of
 * `pull` and `haul` and that page came within a few lines of its 250-line
 * limit; the page next door re-exports the whole of this, so nothing that
 * reached for a `LedgerBead` had to move. It is the right boss to cut: it is
 * the only one on that page **half of whose one drawn object is hidden from
 * each seat**, so its list is the one read by two screens asking different
 * questions of it — which is also why `boss-surface-ledger.ts` exists a layer
 * out, and this is that seam taken one file deeper.
 *
 * THE LEDGER's cord is a clock with the pair's own hand on it: every return
 * on it is a beat count they started, and the cadence shortens as the seam
 * widens (`ledger.ts`, `config-ledger.ts`).
 */

export {
  LEDGER_PHASES,
  type LedgerBead,
  type LedgerPhase,
  type LedgerState,
  ledgerBoss,
  ledgerCadence,
  ledgerCovers,
  ledgerLetThrough,
  ledgerNext,
  ledgerPhase,
  ledgerPlugs,
  ledgerSeamCol,
  ledgerWalk,
  ledgerWhips,
} from "./ledger.js";
// And the three gates the hands hang off, each called by the rule and by the
// ring drawn on it rather than restated in the drawing (`ledger-gates.ts`).
export { ledgerFootable, ledgerHaulable, ledgerPullable } from "./ledger-gates.js";
