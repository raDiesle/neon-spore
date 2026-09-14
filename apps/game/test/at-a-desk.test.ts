import { afterEach, describe, expect, it } from "bun:test";
import { atADesk } from "../src/at-a-desk.js";

/**
 * The one question three callers ask: is there a mouse and a keyboard in front
 * of this, or a thumb.
 *
 * It was three copies of `matchMedia("(pointer: fine)")` — the keyboard hint
 * over the field, the splash trail, and then the menu's CONTROLS row, which the
 * owner asked on 14 September 2026 to be a desk-only door. Three copies is
 * three places for one to be written `(pointer:fine)` and quietly never match,
 * and every one of them fails by simply not appearing, which is the shape of
 * bug nobody reports.
 *
 * There is no DOM in this runner, so `window` is stood up here. That is not a
 * workaround: *no window at all* is one of the answers this function has to
 * get right, because a page that asked anyway would throw before anything was
 * drawn.
 */

const held = Object.getOwnPropertyDescriptor(globalThis, "window");

afterEach(() => {
  if (held) Object.defineProperty(globalThis, "window", held);
  else delete (globalThis as { window?: unknown }).window;
});

/** A window whose `matchMedia` answers `matches` to every query it is asked. */
function windowMatching(matches: boolean): void {
  const asked: string[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia: (query: string) => {
        asked.push(query);
        return { matches };
      },
      asked,
    },
  });
}

describe("atADesk", () => {
  it("is true where the pointer is fine — a mouse", () => {
    windowMatching(true);
    expect(atADesk()).toBe(true);
  });

  it("is false where it is not — a thumb", () => {
    windowMatching(false);
    expect(atADesk()).toBe(false);
  });

  it("asks the query CSS asks, spelled the way CSS spells it", () => {
    windowMatching(true);
    atADesk();
    expect((globalThis.window as unknown as { asked: string[] }).asked).toEqual([
      "(pointer: fine)",
    ]);
  });

  /**
   * Absent is answered as *not a desk*, which is the safe way round: a phone
   * offered a keyboard page reads as a bug, a desk not offered one reads as a
   * page that is not built yet.
   */
  it("says no rather than throwing where there is no window at all", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(atADesk()).toBe(false);
  });

  it("says no rather than throwing where the window cannot match media", () => {
    Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
    expect(atADesk()).toBe(false);
  });
});
