import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * **A module-level cache of paths or canvases is a `bakedCache`** (`baked.ts`).
 *
 * `installCanvasGlobals` and `installPixelGlobals` swap the global `Path2D`
 * and canvas between a stub and a real one, and empty every cache
 * `bakedCache` registered as they do. A plain `new Map` they cannot see:
 * THE STARE's lattice was one (`stare-shell.ts`), and a stub `Path2D` it had
 * baked in one test reached a real canvas in `pixel-frame.test.ts` and threw
 * *Failed to recover `Path` type from napi value* — only when the shards
 * dealt the two files together, which a new test file elsewhere did.
 *
 * So a top-level `Map` whose type names one of `HELD` is refused, by its
 * text. A `WeakMap` is not: its keys are objects, and what it holds goes with
 * them.
 */

const SRC = join(import.meta.dir, "..", "src");
const HELD = ["Path2D", "HTMLCanvasElement", "OffscreenCanvas", "CanvasGradient", "CanvasPattern"];
const TOP_MAP = /^(?:export\s+)?(?:const|let)\s+(\w+)[^=\n]*=\s*new\s+Map\s*<([^\n]*)/gm;

/** Every top-level `Map` in `src` whose declaration names a canvas thing, as `file: NAME`. */
function unregistered(): string[] {
  const found: string[] = [];
  for (const file of readdirSync(SRC).filter((f) => f.endsWith(".ts"))) {
    const text = readFileSync(join(SRC, file), "utf8");
    for (const m of text.matchAll(TOP_MAP)) {
      const decl = m[0];
      if (HELD.some((h) => new RegExp(`\\b${h}\\b`).test(decl))) found.push(`${file}: ${m[1]}`);
    }
  }
  return found;
}

describe("a module-level cache of paths or canvases", () => {
  it("is a bakedCache, so a test's canvas swap empties it", () => {
    expect(unregistered(), "hold it in bakedCache() from baked.ts instead of new Map").toEqual([]);
  });

  it("is found by the scan when it is a plain Map", () => {
    const sample = "const CELLS = new Map<string, Path2D>();\n";
    expect([...sample.matchAll(TOP_MAP)].map((m) => m[1])).toEqual(["CELLS"]);
  });
});
