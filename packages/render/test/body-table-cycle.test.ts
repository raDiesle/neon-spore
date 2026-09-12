import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * `creature-body.ts` holds a table built at module load out of functions it
 * imports — `["limpet", drawLimpetBody]` and its rows. A table like that
 * reads every import the moment the module evaluates, so it is the one file
 * in `render/` that an import cycle can break outright: if a module it
 * imports also imports it, whichever side the bundle enters first decides
 * whether the other side's exports exist yet. A bundle happened to enter from
 * the table's side; the director's dev server entered from `canvas2d.ts`
 * through `cling.ts`, and the table read `drawLimpetBody` as null. So the
 * ordinary body moved to `creature-body-living.ts` and this test holds the
 * table out of every cycle — a function that calls across a cycle at draw
 * time is fine, a table that reads across one at load time is not.
 */

const SRC = join(import.meta.dir, "../src");
const TABLE = "creature-body.ts";

/** Value imports of `./x.js` — `import type` and inline `type` names ignored. */
function valueImports(file: string): string[] {
  const text = readFileSync(join(SRC, file), "utf8");
  const out: string[] = [];
  for (const m of text.matchAll(/^import\s+([^;]*?)\s+from\s+"\.\/([^"]+)\.js";/gm)) {
    const clause = m[1] ?? "";
    if (clause.startsWith("type ")) continue;
    const names = clause
      .replace(/[{}]/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "" && !s.startsWith("type "));
    if (names.length > 0) out.push(`${m[2]}.ts`);
  }
  return out;
}

describe("the body table is in no import cycle", () => {
  it("nothing creature-body.ts imports reaches back to it", () => {
    const files = new Set(readdirSync(SRC).filter((f) => f.endsWith(".ts")));
    const seen = new Map<string, string[]>();
    const stack: [string, string[]][] = valueImports(TABLE).map((f) => [f, [TABLE, f]]);
    while (stack.length > 0) {
      const [file, path] = stack.pop() as [string, string[]];
      if (!files.has(file) || seen.has(file)) continue;
      seen.set(file, path);
      for (const next of valueImports(file)) {
        if (next === TABLE) {
          expect(`${path.join(" → ")} → ${TABLE}`).toBe("no cycle");
        }
        stack.push([next, [...path, next]]);
      }
    }
    expect(seen.size).toBeGreaterThan(10);
  });
});
