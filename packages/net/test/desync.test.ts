import { describe, expect, it } from "bun:test";
import { HashLedger } from "../src/index.js";

/**
 * What the fingerprint ledger catches, and — the half that matters more — what
 * it does not.
 *
 * `HashLedger` reports and never repairs, so the only thing it owes anybody is
 * an honest verdict: the tick two worlds parted, or nothing. Its depth is the
 * whole of its limit, and a run that leans on it has to know where that limit
 * falls rather than assume a mismatch is always named.
 */

/**
 * `DEPTH` in `desync.ts`, mirrored here rather than exported for a test: what
 * is under test is the *boundary*, so the number has to be written down on
 * this side too for the two halves below to mean anything.
 */
const DEPTH = 64;

/** Beat-spaced checkpoints, the way `link-run.ts` takes them. */
const EVERY = 16;

describe("desync ledger", () => {
  it("says nothing until both sides have reported a tick", () => {
    const ledger = new HashLedger();
    expect(ledger.record(0, 123)).toBe("pending");
    expect(ledger.observe(0, 123)).toBe("match");
    expect(ledger.desyncTick).toBeNull();
  });

  it("names the tick the two worlds parted, whichever side reports first", () => {
    const ledger = new HashLedger();
    ledger.record(0, 1);
    ledger.observe(0, 1);
    expect(ledger.observe(300, 9)).toBe("pending");
    expect(ledger.record(300, 8)).toBe("mismatch");
    expect(ledger.desyncTick).toBe(300);
    expect(ledger.agreements).toBe(1);
  });

  it("keeps the earliest parting, not the latest", () => {
    const ledger = new HashLedger();
    for (const tick of [600, 300]) {
      ledger.record(tick, 1);
      ledger.observe(tick, 2);
    }
    expect(ledger.desyncTick).toBe(300);
  });

  it("still checks a pair after a run longer than everything it keeps", () => {
    const ledger = new HashLedger();
    // Five times the depth, so all but the last stretch of it has been trimmed
    // away underneath. A wave is minutes long and the ledger is sixty-four
    // entries; every checkpoint but the first handful is on this side of a trim.
    const checks = 5 * DEPTH;
    for (let i = 0; i < checks; i++) {
      const tick = i * EVERY;
      ledger.record(tick, tick + 1);
      expect(ledger.observe(tick, tick + 1)).toBe("match");
    }
    expect(ledger.agreements).toBe(checks);
    expect(ledger.desyncTick).toBeNull();

    // And the parting that comes after all of them is named as plainly as one
    // on the first beat would have been.
    const parted = checks * EVERY;
    ledger.record(parted, 7);
    expect(ledger.observe(parted, 8)).toBe("mismatch");
    expect(ledger.desyncTick).toBe(parted);
  });

  it("loses a parting whose two halves arrive more checks apart than it keeps", () => {
    // A peer's fingerprint that has been in the air for a while still finds its
    // own tick, as long as the tick is one of the entries still held.
    const inTime = new HashLedger();
    for (let i = 0; i < DEPTH; i++) inTime.record(i * EVERY, 1);
    expect(inTime.observe(0, 2)).toBe("mismatch");
    expect(inTime.desyncTick).toBe(0);

    // One check further and the tick is gone, so there is nothing for the
    // report to disagree with and the ledger says `pending` for ever. This is
    // the limit `desync.ts` states in one line — *a desync that is not caught
    // within this many checks is not caught* — and it is the reason a broken
    // promise is reported on the spot instead of being left to the
    // fingerprints (`link-run.ts`, `receive`).
    const tooLate = new HashLedger();
    for (let i = 0; i <= DEPTH; i++) tooLate.record(i * EVERY, 1);
    expect(tooLate.observe(0, 2)).toBe("pending");
    expect(tooLate.desyncTick).toBeNull();
  });
});
