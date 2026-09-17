import { describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG, hashWorld, type SimConfig, startWave } from "../src/index.js";
import {
  clearSpend,
  SPEND_BEATS,
  spendHashParts,
  spendLean,
  spendShot,
  spentOver,
} from "../src/spend.js";
import type { World } from "../src/world.js";

/**
 * **The spend ledger**: a rolling count, per colour, of what the pair's own
 * muzzle has put out — the first thing in this world that remembers the two
 * *players* rather than itself (`spend.ts`).
 *
 * It is a ring keyed by the beat, so the failures worth a test are the ones
 * a ring has and a list does not: a slot read a lap later and believed, a
 * window that runs off the end of the ledger, and a clock that went backwards
 * under it. The fourth is the tie, which is not an edge case at all — it is
 * the play THE TASTER is trying to teach, and `spendLean` has to keep saying
 * `null` rather than picking a side.
 */

const CFG: SimConfig = DEFAULT_CONFIG;

function world(): World {
  return createWorld(CFG, 5);
}

/** `n` of `color` on the beat the world is on. */
function spend(w: World, n: number, color: "red" | "cyan"): void {
  for (let i = 0; i < n; i++) spendShot(w, color);
}

describe("what the pair has spent", () => {
  it("counts this beat's shots, and nothing on an empty ledger", () => {
    const w = world();
    expect(spentOver(w, 8, "red")).toBe(0);
    expect(spendLean(w, 8)).toBeNull();
    spend(w, 3, "red");
    spend(w, 1, "cyan");
    expect(spentOver(w, 8, "red")).toBe(3);
    expect(spentOver(w, 8, "cyan")).toBe(1);
    expect(spendLean(w, 8)).toBe("red");
  });

  it("keeps a beat's shots on that beat, and drops them out of a window that has passed", () => {
    const w = world();
    spend(w, 2, "cyan");
    w.beat = 4;
    spend(w, 1, "red");
    expect(spentOver(w, 5, "cyan")).toBe(2);
    expect(spendLean(w, 5)).toBe("cyan");
    // A window four beats deep reaches beat 1 and no further, so the two cyan
    // on beat 0 are out of it and the one red is the whole of what is left.
    expect(spentOver(w, 4, "cyan")).toBe(0);
    expect(spendLean(w, 4)).toBe("red");
  });

  it("believes the beat a slot carries and not its index, a lap of the ring later", () => {
    const w = world();
    spend(w, 4, "red");
    w.beat = SPEND_BEATS;
    // Same slot, one lap on. Nothing has written it since, so it is stale and
    // its four red are not this beat's — and a shot lands on it fresh.
    expect(spentOver(w, 1, "red")).toBe(0);
    spend(w, 1, "cyan");
    expect(spentOver(w, 1, "red")).toBe(0);
    expect(spentOver(w, 1, "cyan")).toBe(1);
    expect(w.spend[0]?.beat).toBe(SPEND_BEATS);
  });

  it("answers a window deeper than the ring with every beat there is", () => {
    const w = world();
    spend(w, 1, "red");
    w.beat = SPEND_BEATS - 1;
    spend(w, 2, "cyan");
    expect(spentOver(w, SPEND_BEATS * 4, "red")).toBe(1);
    expect(spentOver(w, SPEND_BEATS * 4, "cyan")).toBe(2);
    expect(spendLean(w, SPEND_BEATS * 4)).toBe("cyan");
  });

  it("sees nothing of a beat the clock has gone back past", () => {
    const w = world();
    w.beat = 20;
    spend(w, 5, "red");
    // `resetClock` puts the beat back, and a slot whose own beat is ahead of
    // the window's end falls outside it — which is the whole reason a slot
    // carries its beat rather than trusting where it sits.
    w.beat = 0;
    expect(spentOver(w, SPEND_BEATS, "red")).toBe(0);
    expect(spendLean(w, SPEND_BEATS)).toBeNull();
  });

  it("says null on a dead heat, however deep it is", () => {
    const w = world();
    spend(w, 3, "red");
    spend(w, 3, "cyan");
    expect(spendLean(w, 1)).toBeNull();
    w.beat = 6;
    spend(w, 2, "red");
    spend(w, 2, "cyan");
    expect(spendLean(w, 8)).toBeNull();
    spend(w, 1, "cyan");
    expect(spendLean(w, 8)).toBe("cyan");
  });
});

describe("the ledger's place in the world", () => {
  it("is cleared by a wave opening, so a fight starts on no conversation", () => {
    const w = world();
    spend(w, 4, "red");
    startWave(w, 3, [], []);
    expect(spentOver(w, SPEND_BEATS, "red")).toBe(0);
    expect(w.spend.every((s) => s.beat === -1)).toBe(true);
  });

  it("is cleared to a ledger of the ring's own length", () => {
    const w = world();
    spend(w, 2, "cyan");
    clearSpend(w);
    expect(w.spend.length).toBe(SPEND_BEATS);
    expect(spendHashParts(w.spend)[0]).toBe(SPEND_BEATS);
  });

  it("moves the fingerprint, on all three numbers of a slot", () => {
    const w = world();
    const blank = hashWorld(w);
    spendShot(w, "red");
    const spent = hashWorld(w);
    expect(spent).not.toBe(blank);
    // The beat a slot carries is hashed too: the same count on another beat is
    // another ledger, because it is inside a different set of windows.
    const other = world();
    other.beat = 3;
    spendShot(other, "red");
    other.beat = 0;
    expect(hashWorld(other)).not.toBe(spent);
  });

  it("gathers three numbers per slot, in slot order", () => {
    const w = world();
    spend(w, 2, "red");
    spend(w, 1, "cyan");
    const parts = spendHashParts(w.spend);
    expect(parts.length).toBe(1 + SPEND_BEATS * 3);
    expect(parts.slice(1, 4)).toEqual([0, 2, 1]);
    expect(parts.slice(4, 7)).toEqual([-1, 0, 0]);
  });
});
