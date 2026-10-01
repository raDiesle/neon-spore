import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { landingPage, readTestMode, writeTestMode } from "../src/test-mode.js";

/**
 * The three presses on the spore are remembered on the device. The owner,
 * 1 October 2026: *"it should remember it in the device (local storage)."*
 */

const had = (globalThis as { localStorage?: unknown }).localStorage;
let store: Map<string, string>;

beforeEach(() => {
  store = new Map();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});

afterEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = had;
});

describe("test mode", () => {
  test("a fresh device is not in it", () => {
    expect(readTestMode()).toBe(false);
  });

  test("the spore puts the device in, and the next visit reads it", () => {
    writeTestMode(true);
    expect(readTestMode()).toBe(true);
  });

  test("the rig's BACK takes it out again", () => {
    writeTestMode(true);
    writeTestMode(false);
    expect(readTestMode()).toBe(false);
  });

  test("a store that refuses is a device that is not in it", () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => {
        throw new Error("private");
      },
      setItem: () => {
        throw new Error("private");
      },
      removeItem: () => {
        throw new Error("private");
      },
    };
    expect(() => writeTestMode(true)).not.toThrow();
    expect(readTestMode()).toBe(false);
  });
});

describe("landingPage", () => {
  test("in test mode the front page is TESTING", () => {
    expect(landingPage("root", true)).toBe("testing");
  });

  test("out of it the front page is the front page", () => {
    expect(landingPage("root", false)).toBe("root");
  });

  test("a page asked for by name is that page either way", () => {
    expect(landingPage("settings", true)).toBe("settings");
    expect(landingPage("testing", false)).toBe("testing");
  });
});
