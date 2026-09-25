import { describe, expect, test } from "bun:test";
import { parsePressed } from "../src/rail-symbols.js";
import { readRemembered, writeRemembered } from "../src/remembered.js";
import { installDom } from "./fake-dom.js";

/**
 * THE WAVE LIST'S FILTERS SURVIVE A RELOAD — the owner, 25 September 2026.
 * The binders are DOM end to end, so what is tested is the storage pair they
 * share and the one pure parse the marks go through on the way back.
 */

describe("readRemembered / writeRemembered", () => {
  test("what is written is read back", () => {
    const dom = installDom();
    try {
      writeRemembered("wave-filter", "slick ward");
      expect(readRemembered("wave-filter")).toBe("slick ward");
    } finally {
      dom.restore();
    }
  });

  test("an emptied filter is forgotten, not stored as an empty string", () => {
    const dom = installDom();
    try {
      writeRemembered("wave-filter", "boss");
      writeRemembered("wave-filter", "");
      expect(readRemembered("wave-filter")).toBeNull();
      writeRemembered("wave-marks", "boss");
      writeRemembered("wave-marks", null);
      expect(readRemembered("wave-marks")).toBeNull();
    } finally {
      dom.restore();
    }
  });

  test("no storage at all is nothing remembered, not a throw", () => {
    const had = (globalThis as { localStorage?: unknown }).localStorage;
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    try {
      expect(() => writeRemembered("wave-filter", "boss")).not.toThrow();
      expect(readRemembered("wave-filter")).toBeNull();
    } finally {
      (globalThis as { localStorage?: unknown }).localStorage = had;
    }
  });
});

describe("parsePressed", () => {
  test("nothing stored presses nothing", () => {
    expect(parsePressed(null).size).toBe(0);
    expect(parsePressed("").size).toBe(0);
  });

  test("the stored ids come back pressed", () => {
    expect([...parsePressed("boss,fault")]).toEqual(["boss", "fault"]);
  });

  test("an id no mark has any more is dropped", () => {
    expect([...parsePressed("boss,gone,card")]).toEqual(["boss", "card"]);
  });
});
