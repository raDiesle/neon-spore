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

/** Comments are not code, and one may quote an import to explain a rule. */
function withoutComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

/**
 * Every import or re-export statement, each as its own string.
 *
 * One statement at a time is the whole point. A single regex across the file
 * matched from one statement's keyword to a *later* statement's specifier —
 * `import { CREATURES } from "@neon-spore/content";` opened a match that ran
 * on to the next relative `from "…"`, and a following `import type` was read
 * as a runtime edge because the `type` was checked against the earlier line.
 * `brush-cards.ts` carried a workaround for exactly that.
 *
 * A statement therefore starts at a line that can only begin one — `import`,
 * or an `export` whose next token is `*` or `{` — and ends at the first `from
 * "…"`, the first bare `import "…"`, or the first `;` if neither arrives,
 * which is what closes a local `export { SVG_NS };`.
 */
function statements(src: string): string[] {
  const out: string[] = [];
  const lines = withoutComments(src).split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*(?:import\b|export\s+(?:type\s+)?[{*])/.test(lines[i]!)) continue;
    let text = "";
    // A statement is a handful of lines; anything longer is a brace that never
    // closed, and running to the end of the file is how the old regex went
    // wrong. Stop rather than swallow the rest of the tree.
    for (let j = i; j < lines.length && j < i + 60; j++) {
      text += (j === i ? "" : "\n") + lines[j]!;
      if (/from\s*"[^"]*"/.test(text) || /^\s*import\s*"[^"]*"/.test(text) || text.includes(";")) {
        i = j;
        break;
      }
    }
    out.push(text);
  }
  return out;
}

/**
 * Every relative specifier in a source that survives to runtime. `import type
 * ...` and `export type ...` are dropped; a mixed `import { type A, b }` is
 * kept, because `b` is a real binding.
 */
export function runtimeSpecifiers(src: string): string[] {
  const out: string[] = [];
  for (const statement of statements(src)) {
    if (/^\s*(?:import|export)\s+type[\s{*]/.test(statement)) continue;
    const spec =
      statement.match(/from\s*"([^"]+)"/)?.[1] ?? statement.match(/^\s*import\s*"([^"]+)"/)?.[1];
    if (spec?.startsWith(".")) out.push(spec);
  }
  return out;
}

/** The files a module reaches at runtime, as paths relative to `src`. */
function runtimeEdges(file: string): string[] {
  const src = readFileSync(join(SRC, file), "utf8");
  return runtimeSpecifiers(src).map((spec) => {
    const target = relative(SRC, resolve(dirname(join(SRC, file)), spec.replace(/\.js$/, ".ts")));
    return target.replaceAll("\\", "/");
  });
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

describe("reading the imports", () => {
  it("does not read a type import as runtime because a package import came first", () => {
    // The exact shape that fooled the old regex: the value import names a
    // package, so it has no relative specifier of its own to end the match on,
    // and the type import below it was the next `from "./…"` in the file.
    const src = `import { CREATURES } from "@neon-spore/content";\nimport type { Brush } from "./brushes.js";\n`;
    expect(runtimeSpecifiers(src)).toEqual([]);
  });

  it("keeps a value import, a bare import and a re-export", () => {
    const src = [
      `import "./side-effect.js";`,
      `import { brushOf } from "./brushes.js";`,
      `import def from "./default.js";`,
      `export { paint } from "./paint.js";`,
      `export * from "./state.js";`,
    ].join("\n");
    expect(runtimeSpecifiers(src)).toEqual([
      "./side-effect.js",
      "./brushes.js",
      "./default.js",
      "./paint.js",
      "./state.js",
    ]);
  });

  it("drops every type-only form and keeps a mixed one", () => {
    const src = [
      `import type { A } from "./a.js";`,
      `import type * as B from "./b.js";`,
      `export type { C } from "./c.js";`,
      `import { type D, e } from "./d.js";`,
    ].join("\n");
    expect(runtimeSpecifiers(src)).toEqual(["./d.js"]);
  });

  it("reads a multi-line import, and is not run away with by a local export", () => {
    const src = [
      `export { SVG_NS };`,
      `import {`,
      `  type Color,`,
      `  colSpan,`,
      `} from "./fields.js";`,
      `export type Named = { name: string };`,
      `import type { Late } from "./late.js";`,
    ].join("\n");
    expect(runtimeSpecifiers(src)).toEqual(["./fields.js"]);
  });

  it("ignores an import quoted inside a comment", () => {
    const src = [
      `/* import { ghost } from "./ghost.js"; */`,
      `// import { other } from "./other.js";`,
      `import { real } from "./real.js";`,
    ].join("\n");
    expect(runtimeSpecifiers(src)).toEqual(["./real.js"]);
  });
});
