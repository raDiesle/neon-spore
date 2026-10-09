import { describe, expect, it } from "bun:test";
import { computeLayout } from "@neon-spore/render";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { InputBuffer } from "../src/input-buffer.js";
import { PressSeats } from "../src/input-seat.js";

/**
 * **Who a press is from**, as `input.ts` asks it of every finger. The rule
 * itself is `render/desk-grab.ts` `pressSeat`'s and is held by
 * `packages/render/test/desk-handed.test.ts`; this holds that the pointer rig
 * keeps each finger's landing height until it lifts, and says nothing for a
 * press with no word yet.
 */

const L = computeLayout({ width: 390, height: 844, dpr: 1 }, DEFAULT_CONFIG, "test");
const band = L.bandTop + 10;
const fieldY = L.bandTop - 100;

function rig(handed: boolean) {
  const buffer = new InputBuffer();
  const seats = new PressSeats({ layout: () => L, handed: () => handed, player: () => 1 }, buffer);
  return { buffer, seats };
}

describe("a press signed by the seat it is from", () => {
  it("re-signs a band press as this device's while the panels are handed over", () => {
    const { buffer, seats } = rig(true);
    seats.press(7, band);
    seats.say([{ player: 2, command: { kind: "restart" } }], 7);
    expect(buffer.drain(0).map((c) => c.player)).toEqual([1]);
  });

  it("keeps the seat a field press was found for", () => {
    const { buffer, seats } = rig(true);
    seats.press(7, fieldY);
    seats.say([{ player: 2, command: { kind: "restart" } }], 7);
    expect(buffer.drain(0).map((c) => c.player)).toEqual([2]);
  });

  it("forgets where a finger landed once it lifts", () => {
    const { buffer, seats } = rig(true);
    seats.press(7, band);
    seats.lift(7);
    seats.say([{ player: 2, command: { kind: "restart" } }], 7);
    expect(buffer.drain(0).map((c) => c.player)).toEqual([2]);
  });

  it("says nothing for a press that took hold and has no word yet", () => {
    const { buffer, seats } = rig(false);
    seats.press(7, fieldY);
    seats.say([{ player: 2, command: null }, null, undefined], 7);
    expect(buffer.drain(0)).toEqual([]);
  });
});
