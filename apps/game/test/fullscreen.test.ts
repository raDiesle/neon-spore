import { describe, expect, it } from "bun:test";
import { canFullscreen, wantsFullscreen } from "../src/fullscreen.js";
import { TOGGLES } from "../src/menu-toggles.js";
import { DEFAULT_SETTINGS, parseSettings } from "../src/settings.js";

/**
 * Taking the browser's furniture off the screen — the rule, not the request.
 *
 * `requestFullscreen` itself cannot be run here and is not what would break:
 * what would is the deciding around it, which is why that half is a pure
 * function taking the two answers rather than asking for them
 * (`src/fullscreen.ts`). The runner has no DOM, so this file is also the check
 * that every guard survives having nothing to ask — a page that threw before
 * it was drawn is the way this goes wrong.
 */

describe("who gets the screen taken", () => {
  it("takes it on a phone with the switch on", () => {
    expect(wantsFullscreen(true, false)).toBe(true);
  });

  it("never takes it at a desk, switch or no switch", () => {
    // A fullscreen desktop window is a hull two feet wide with a column of
    // nothing either side, and a desk is where the game is tested from.
    expect(wantsFullscreen(true, true)).toBe(false);
    expect(wantsFullscreen(false, true)).toBe(false);
  });

  it("never takes it when the player has said no", () => {
    expect(wantsFullscreen(false, false)).toBe(false);
  });
});

describe("a runner with no document", () => {
  it("answers that it cannot, rather than throwing", () => {
    expect(canFullscreen()).toBe(false);
  });
});

describe("the setting behind it", () => {
  it("is on for a device that has said nothing, because the shortcut already was", () => {
    expect(DEFAULT_SETTINGS.fullscreen).toBe(true);
  });

  it("is readable off the store in both positions", () => {
    expect(parseSettings(JSON.stringify({ fullscreen: false })).fullscreen).toBe(false);
    expect(parseSettings(JSON.stringify({ fullscreen: true })).fullscreen).toBe(true);
  });

  it("has a switch that says what it means in both positions", () => {
    const row = TOGGLES.find((t) => t.key === "fullscreen");
    expect(row?.label).toBe("FULL SCREEN");
    expect(row?.on).not.toBe(row?.off);
    // Absent where it can do nothing, the way BUZZ is absent where nothing
    // vibrates: the runner has no document, so the row asks for none.
    expect(row?.available?.()).toBe(false);
  });
});
