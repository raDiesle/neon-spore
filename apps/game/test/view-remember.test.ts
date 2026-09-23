import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { ViewRole } from "@neon-spore/render";
import { bindViewSwitch } from "../src/view.js";
import { installDom } from "./fake-dom.js";

/**
 * Which view a device opens on. The owner, 20 September 2026: *when in test
 * mode in game, "both seats" should be selected by default.* A fresh browser
 * already did; what took it away was the room, whose seat was written to
 * storage like a pick and never written back — so a person who had once joined
 * a room was P1 at their own desk from then on.
 *
 * Each case binds the switch twice over one store: the second binding is the
 * next visit, and the role it opens on is what the first one left behind.
 */

const had = (globalThis as { localStorage?: unknown }).localStorage;
let store: Map<string, string>;

beforeEach(() => {
  store = new Map();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
});

afterEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = had;
});

/** Binds the switch, lets `act` use it, and answers what the next visit opens on. */
function nextVisitAfter(act: (set: (role: ViewRole, remember: boolean) => void) => void): ViewRole {
  const dom = installDom();
  try {
    act(bindViewSwitch(() => {}).set);
    return bindViewSwitch(() => {}).role();
  } finally {
    dom.restore();
  }
}

describe("the view a device opens on", () => {
  it("is BOTH on a device that never picked", () => {
    expect(nextVisitAfter(() => {})).toBe("test");
  });

  it("is still BOTH after a room dealt this device P1", () => {
    expect(nextVisitAfter((set) => set("p1", false))).toBe("test");
  });

  it("is the player's own pick when there was one, whatever a room dealt since", () => {
    expect(
      nextVisitAfter((set) => {
        set("p2", true);
        set("p1", false);
      }),
    ).toBe("p2");
  });

  it("follows the room at once, stored or not", () => {
    const dom = installDom();
    try {
      const view = bindViewSwitch(() => {});
      view.set("p1", false);
      expect(view.role()).toBe("p1");
    } finally {
      dom.restore();
    }
  });
});
