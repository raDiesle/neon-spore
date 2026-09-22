/**
 * **THE LEDGER's names on `@neon-spore/sim`'s surface**, cut off
 * `boss-surface-clocks.ts` the day the navigator's two hands were drawn and
 * the gates behind them (`ledgerFootable`, `ledgerPlugs`) took that file over
 * its 250-line limit.
 *
 * The fourth page along this seam, after the clocks, SNAKE and PINBALL, and
 * cut for the same reason each time: the page next door re-exports the whole
 * of this, so nothing that reached for a `LedgerBead` had to move. THE LEDGER
 * is the right one to cut next — it is the only boss on that page **half of
 * whose one drawn object is hidden from each seat**, so its list is read by
 * two screens asking different questions of it rather than by one.
 *
 * `ledgerWalk` is the one a *picture* asks about a beat that has not happened:
 * the navigator is shown a chevron on the column the plate will be needed in,
 * and that answer has to be the step's own answer (`test/copies-table.ts`,
 * `render/ledger-read.ts`). `LedgerEntry` authors nothing — the director's own
 * guard narrows on it (`tools/director/src/boss-nothing.ts`).
 */

export {
  type LedgerBead,
  type LedgerEntry,
  type LedgerPhase,
  type LedgerState,
  ledgerBoss,
  ledgerCovers,
  // The foot's gate, which is the first two beats of the fight and nothing
  // else, and the plug's — both asked by the rule and by the ring drawn on
  // it rather than written out twice (`ledger-hand.ts`).
  ledgerFootable,
  // And the pilot's two, for the same reason: the bead his thumb may haul a
  // beat down is the bead his ring rides, so one of these answers the rule and
  // the ring both (`ledger-gates.ts`, `render/ledger-pull.ts`).
  ledgerHaulable,
  ledgerLetThrough,
  ledgerNext,
  ledgerPhase,
  ledgerPlugs,
  ledgerPullable,
  ledgerSeamCol,
  ledgerWalk,
} from "./bosses.js";
