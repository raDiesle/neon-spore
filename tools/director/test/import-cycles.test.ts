import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { Glob } from "bun";

/**
 * NO FILE IN THE DIRECTOR MAY IMPORT ITSELF BACK AT RUNTIME.
 *
 * A cycle between two modules that only pass types is nothing — TypeScript
 * erases it and no JavaScript is emitted for either edge. A cycle between two
 * that pass *values* is a live grenade: whichever one the bundler evaluates
 * second sees the first's bindings still uninitialised, and it works anyway
 * for exactly as long as every use of them happens after both modules have
 * finished evaluating. The SHAPES page ran that way for months — the axes
 * reached into `shapes-pair.ts` for state while `shapes-pair.ts` re-exported
 * the control bar that built them — and would have broken the first time
 * anything read a value at module scope.
 *
 * So this reads the imports rather than the behaviour, and it ignores exactly
 * what the emitter ignores: `import type` and `export type`.
 */

const SRC = resolve(import.meta.dir, "..", "src");
const FILES = [...new Glob("**/*.ts").scanSync(SRC)].map((f) => f.replaceAll("\\", "/"));

/**
 * Every relative import that survives to runtime. `import type ...` and
 * `export type ...` are dropped; a mixed `import { type A, b }` is kept,
 * because `b` is a real binding.
 */
function runtimeEdges(file: string): string[] {
  const src = readFileSync(join(SRC, file), "utf8");
  const out: string[] = [];
  const re = /(?:^|\n)\s*(?:import|export)\s+(?!type[\s{])[\s\S]*?from\s*"(\.[^"]+)"/g;
  for (const [, spec] of src.matchAll(re)) {
    const target = relative(SRC, resolve(dirname(join(SRC, file)), spec!.replace(/\.js$/, ".ts")));
    out.push(target.replaceAll("\\", "/"));
  }
  return out;
}

const GRAPH = new Map(FILES.map((f) => [f, runtimeEdges(f).filter((t) => FILES.includes(t))]));

/** The first cycle a depth-first walk finds, as the path around it. */
function findCycle(): string[] | undefined {
  const state = new Map<string, "open" | "done">();
  const stack: string[] = [];
  function walk(file: string): string[] | undefined {
    if (state.get(file) === "done") return undefined;
    if (state.get(file) === "open") return [...stack.slice(stack.indexOf(file)), file];
    state.set(file, "open");
    stack.push(file);
    for (const next of GRAPH.get(file) ?? []) {
      const found = walk(next);
      if (found) return found;
    }
    stack.pop();
    state.set(file, "done");
    return undefined;
  }
  for (const file of FILES) {
    const found = walk(file);
    if (found) return found;
  }
  return undefined;
}

describe("the director's module graph", () => {
  it("has no runtime import cycle", () => {
    const cycle = findCycle();
    expect(cycle?.join(" -> ") ?? "none").toBe("none");
  });

  it("reads enough of the tree to be worth trusting", () => {
    // A regex that stopped matching would pass this file silently. The
    // director is a few hundred modules with a few hundred edges between them.
    expect(FILES.length).toBeGreaterThan(100);
    expect([...GRAPH.values()].flat().length).toBeGreaterThan(100);
  });
});
