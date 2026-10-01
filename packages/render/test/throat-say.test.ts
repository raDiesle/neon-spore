import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { throatReceipt } from "../src/throat-receipt.js";
import { SWALLOWED, THROAT_WHY } from "../src/throat-say.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";
import { cue, opened } from "./throat-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE THROAT's reasons and receipts** (`throat-say.ts`, `throat-receipt.ts`):
 * the line under each verb saying what its handle is for, and the word by the
 * mouth saying the last body into it was the right one. The owner could not
 * tell a swallow that counted from one that did not (25 September 2026).
 */

beforeAll(installCanvasGlobals);

describe("the line under each verb", () => {
  it("is carried by the cue each seat is given", () => {
    const { world } = opened();
    expect(cue(world, "p2")?.why).toBe(THROAT_WHY.PULL);
    expect(cue(world, "p1")?.why).toBe(THROAT_WHY.PUMP);
  });

  it("never says a column, a colour or a count", () => {
    for (const line of Object.values(THROAT_WHY)) {
      expect(line).toMatch(/^[A-Z0-9 ·,]+$/);
      expect(line).not.toMatch(/RED|CYAN|YELLOW|LEFT|RIGHT|COLUMN/);
      expect(line).not.toMatch(/[0-9]/);
    }
  });
});

describe("the receipt by the mouth", () => {
  it("says swallowed for two beats after a right body goes in", () => {
    const { t } = opened();
    t.fedBeat = 10;
    expect(throatReceipt(t, 10, 0)).toBe(SWALLOWED);
    expect(throatReceipt(t, 11, 0.9)).toBe(SWALLOWED);
    expect(throatReceipt(t, 12, 0)).toBeNull();
  });

  it("says nothing before anything went in, or while it everts", () => {
    const { t } = opened();
    expect(throatReceipt(t, 3, 0)).toBeNull();
    t.fedBeat = 3;
    t.phase = "everts";
    expect(throatReceipt(t, 3, 0)).toBeNull();
  });

  it("says nothing for a refusal", () => {
    const { t } = opened();
    t.refusedTick = 40;
    expect(throatReceipt(t, 3, 0)).toBeNull();
  });
});
