import { describe, expect, it } from "bun:test";
import { DEFAULT_SETTINGS, DEVICE_KEYS, parseSettings } from "../src/settings.js";

/**
 * The things a player turns on and off.
 *
 * Everything here is a preference, and nothing here may change what the
 * simulation does — two devices in a room would then disagree about the world
 * over something one of them tapped. The deciding is pure so it can be tested
 * without a DOM, which this runner has none of.
 */

describe("what a device that has said nothing gets", () => {
  it("opens with sound, because a game that opens silent reads as broken", () => {
    expect(DEFAULT_SETTINGS.sound).toBe(true);
  });

  it("opens with the buzz off, because it is a channel worth asking for", () => {
    expect(DEFAULT_SETTINGS.haptics).toBe(false);
  });

  it("is what an unreadable store falls back to, in every direction", () => {
    for (const raw of ["", "{", "null", "7", '"yes"', "[]", '{"sound":"loud"}']) {
      expect(parseSettings(raw)).toEqual(DEFAULT_SETTINGS);
    }
  });
});

describe("reading what was stored", () => {
  it("reads a setting it wrote", () => {
    expect(parseSettings(JSON.stringify({ sound: false })).sound).toBe(false);
    expect(parseSettings(JSON.stringify({ haptics: true })).haptics).toBe(true);
  });

  it("keeps the flags it can read when another is nonsense", () => {
    const half = JSON.stringify({ sound: false, motion: "sometimes" });
    expect(parseSettings(half)).toEqual({ ...DEFAULT_SETTINGS, sound: false });
  });

  it("leaves the others alone when one is turned off", () => {
    const one = parseSettings(JSON.stringify({ sound: false }));
    expect(one.motion).toBe(DEFAULT_SETTINGS.motion);
    expect(one.haptics).toBe(DEFAULT_SETTINGS.haptics);
  });
});

describe("what CLEAR THIS DEVICE forgets", () => {
  it("names every key this game keeps, so none is left behind", () => {
    // The list is the one place they are written down. A key added elsewhere
    // and not added here is data a player asked to be rid of and still has.
    expect([...DEVICE_KEYS].sort()).toEqual([
      "neon-spore.name",
      "neon-spore.pairs",
      "neon-spore.progress",
      "neon-spore.settings",
      "neon-spore.token",
      "neon-spore.view",
    ]);
  });

  it("names nothing that is not this game's", () => {
    for (const key of DEVICE_KEYS) expect(key.startsWith("neon-spore.")).toBe(true);
  });
});

const sources = await Promise.all(
  ["nickname", "pairing", "progress", "settings", "view"].map((name) =>
    Bun.file(Bun.fileURLToPath(new URL(`../src/${name}.ts`, import.meta.url))).text(),
  ),
);

describe("every key this game stores", () => {
  it("is one CLEAR THIS DEVICE knows about", () => {
    // The failure this catches: somebody adds a `localStorage` key, and the
    // button that promises to forget everything quietly does not.
    const found = new Set<string>();
    for (const source of sources) {
      for (const match of source.matchAll(/"(neon-spore\.[a-z]+)"/g)) {
        if (match[1]) found.add(match[1]);
      }
    }
    for (const key of found) {
      expect(DEVICE_KEYS as readonly string[], `${key} is stored but never cleared`).toContain(key);
    }
    // And the sweep really found them, rather than finding nothing and passing.
    expect(found.size).toBeGreaterThanOrEqual(5);
  });
});
