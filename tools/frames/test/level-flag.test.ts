import { afterEach, describe, expect, it } from "bun:test";
import type { Page } from "playwright-core";
import { parseFrameSpec } from "../flags.js";
import { storeBeforeBoot } from "../page-storage.js";

/**
 * **`--level`**: a capture played at a difficulty, which lives in the page's
 * storage rather than in any command. Checked in two halves: the flag is read
 * and refused the way `--seat` is, and what the page is handed before boot
 * writes the level into the record the game reads it from
 * (`apps/game/src/progress.ts`) without losing the rest of that record.
 */

const waves = [{ name: "THE DRIFT" }, { name: "THE SHELL" }];

describe("--level", () => {
  it("is read, and left out when nobody wrote it", () => {
    expect(parseFrameSpec(["<sha>", "--wave", "1", "--level", "hard"], waves).spec.level).toBe(
      "hard",
    );
    expect("level" in parseFrameSpec(["<sha>", "--wave", "1"], waves).spec).toBe(false);
  });

  it("refuses a level the game does not have, and a flag with nothing after it", () => {
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--level", "brutal"], waves)).toThrow(
      /one of easy, medium, hard/,
    );
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--level"], waves)).toThrow(/--level/);
  });
});

/** The scripts a page was handed before boot, run here against a stand-in store. */
async function boot(spec: Parameters<typeof storeBeforeBoot>[1], stored: Map<string, string>) {
  const scripts: [(arg: string[]) => void, string[]][] = [];
  const page = {
    addInitScript: async (fn: (arg: string[]) => void, arg: string[]) => {
      scripts.push([fn, arg]);
    },
  } as unknown as Page;
  await storeBeforeBoot(page, spec);
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => stored.get(k) ?? null,
    setItem: (k: string, v: string) => stored.set(k, v),
  };
  for (const [fn, arg] of scripts) fn(arg);
  return scripts.length;
}

describe("the level written before boot", () => {
  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it("goes into the progress record, beside the seat", async () => {
    const stored = new Map<string, string>();
    await boot({ seat: "p1", level: "hard" }, stored);
    expect(stored.get("neon-spore.view")).toBe("p1");
    expect(JSON.parse(stored.get("neon-spore.progress") ?? "")).toEqual({ level: "hard" });
  });

  it("keeps the rest of a record the device already had", async () => {
    const stored = new Map([["neon-spore.progress", '{"furthest":7,"level":"easy"}']]);
    await boot({ level: "hard" }, stored);
    expect(JSON.parse(stored.get("neon-spore.progress") ?? "")).toEqual({
      furthest: 7,
      level: "hard",
    });
  });

  it("writes nothing for a capture that asked for neither", async () => {
    expect(await boot({}, new Map())).toBe(0);
  });
});
