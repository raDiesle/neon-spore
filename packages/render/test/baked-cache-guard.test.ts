import { describe, expect, it } from "bun:test";
import { readdirSync } from "node:fs";
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
 *
 * **It reads fourteen hundred files, so it reads them at once.** One at a time
 * it took two tenths of a second on a quiet machine, and once, under a full
 * `check:fast` beside the director's bundler, more than the five-second
 * timeout (5 October 2026). Read together it is a sixth of that. Only a file
 * that says `new Map` is scanned, and `HELD` is one pattern, built once.
 */

const SRC = join(import.meta.dir, "..", "src");
const HELD = ["Path2D", "HTMLCanvasElement", "OffscreenCanvas", "CanvasGradient", "CanvasPattern"];
const NAMES_HELD = new RegExp(`\\b(?:${HELD.join("|")})\\b`);
const TOP_MAP = /^(?:export\s+)?(?:const|let)\s+(\w+)[^=\n]*=\s*new\s+Map\s*<([^\n]*)/gm;

/** Every top-level `Map` in `src` whose declaration names a canvas thing, as `file: NAME`. */
async function unregistered(): Promise<string[]> {
  const files = readdirSync(SRC).filter((f) => f.endsWith(".ts"));
  const texts = await Promise.all(files.map((f) => Bun.file(join(SRC, f)).text()));
  const found: string[] = [];
  files.forEach((file, i) => {
    const text = texts[i] ?? "";
    if (!text.includes("new Map")) return;
    for (const m of text.matchAll(TOP_MAP)) {
      if (NAMES_HELD.test(m[0])) found.push(`${file}: ${m[1]}`);
    }
  });
  return found;
}

describe("a module-level cache of paths or canvases", () => {
  it("is a bakedCache, so a test's canvas swap empties it", async () => {
    const found = await unregistered();
    expect(found, "hold it in bakedCache() from baked.ts instead of new Map").toEqual([]);
  });

  it("is found by the scan when it is a plain Map", () => {
    const sample = "const CELLS = new Map<string, Path2D>();\n";
    expect([...sample.matchAll(TOP_MAP)].map((m) => m[1])).toEqual(["CELLS"]);
    expect(NAMES_HELD.test(sample)).toBe(true);
    expect(NAMES_HELD.test("const CELLS = new Map<string, Path2DLike>();")).toBe(false);
  });
});
