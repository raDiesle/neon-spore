import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG, surgeBulbLeft, surgeBulbSpan } from "@neon-spore/sim";
import { WORD_FONT } from "../src/boss-cue-text.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { surgeWordX } from "../src/surge-grip.js";
import { SHIELD } from "../src/surge-word.js";
import { FRAME_TIMEOUT_MS, StubContext } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE THE SURGE'S `SHIELD` STANDS.
 *
 * The rock it names is spat from a column the bulb covers, so the word under
 * the pilot's grip mark was printed across it and read `SHIE D`
 * (`docs/queue.md`, 21 September 2026). It ends clear of those columns on the
 * mark's side now; every other word stays under its mark.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const ctx = new StubContext() as unknown as CanvasRenderingContext2D;

function halfWidth(word: string): number {
  ctx.font = WORD_FONT;
  return ctx.measureText(word).width / 2;
}

const coveredLeft = tileCX(L, surgeBulbLeft(CFG)) - L.tile / 2;
const coveredRight = tileCX(L, surgeBulbLeft(CFG) + surgeBulbSpan(CFG) - 1) + L.tile / 2;

describe("THE SURGE's SHIELD", () => {
  it("ends clear of the bulb's columns on the pilot's side", () => {
    const x = surgeWordX(ctx, L, CFG, -1, 150, SHIELD.word);
    expect(x + halfWidth(SHIELD.word)).toBeLessThan(coveredLeft);
    expect(x - halfWidth(SHIELD.word)).toBeGreaterThanOrEqual(0);
  });

  it("ends clear of them on the other side too", () => {
    const x = surgeWordX(ctx, L, CFG, 1, 240, SHIELD.word);
    expect(x - halfWidth(SHIELD.word)).toBeGreaterThan(coveredRight);
    expect(x + halfWidth(SHIELD.word)).toBeLessThanOrEqual(L.width);
  });

  it("leaves every other word under its mark", () => {
    expect(surgeWordX(ctx, L, CFG, -1, 150, "HOLD")).toBe(150);
    expect(surgeWordX(ctx, L, CFG, 1, 240, "LIFT")).toBe(240);
  });
});
