import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  deriveHeaderSentence,
  filterScopeFiles,
  generateIndex,
  parseRows,
  rowLives,
  type Tree,
} from "../index.js";

const ROOT = join(import.meta.dirname, "..", "..", "..");
// `.claude` for the reason `tools/test/tree-walk.test.ts` gives: a worktree is
// a full copy of the repository sitting inside the repository. This walk starts
// at `packages`, `apps` and `tools` and so cannot reach one today; it is here so
// that changing where it starts is not also a silent change to what it scans.
const SKIP_DIRS = new Set([".claude", "node_modules", "dist", ".git"]);

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts")) out.push(full);
  }
}

function currentScope(): string[] {
  const all: string[] = [];
  for (const top of ["packages", "apps", "tools"]) walk(join(ROOT, top), all);
  const relPaths = all.map((p) => relative(ROOT, p).split("\\").join("/"));
  return filterScopeFiles(relPaths);
}

describe("docs/INDEX.md completeness", () => {
  const indexPath = join(ROOT, "docs", "INDEX.md");
  const committed = readFileSync(indexPath, "utf8");
  const scope = currentScope();

  test("generating from the committed file and the tree changes nothing", () => {
    const generated = generateIndex(committed, {
      scope,
      read: (relPath) => readFileSync(join(ROOT, relPath), "utf8"),
      has: (relPath) => existsSync(join(ROOT, relPath)),
    });
    if (generated !== committed) {
      const before = new Set(parseRows(committed).map((r) => r.path));
      const after = parseRows(generated);
      const missing = after.filter((r) => !before.has(r.path)).map((r) => r.path);
      const stale = [...before].filter(
        (p) => !p.endsWith("/") && !scope.includes(p) && !after.some((r) => r.path === p),
      );
      const hint =
        missing.length > 0
          ? `no row for: ${missing.join(", ")}`
          : stale.length > 0
            ? `row points at a deleted file: ${stale.join(", ")}`
            : "row text does not match — see the diff";
      throw new Error(
        `docs/INDEX.md is out of date (${hint}). Run \`bun run index\` — it adds and drops rows — and write the text of any it adds.`,
      );
    }
    expect(generated).toBe(committed);
  });

  test("every row's path exists", () => {
    const rows = parseRows(committed);
    const missing = rows.filter((r) => !existsSync(join(ROOT, r.path)));
    expect(missing.map((r) => r.path)).toEqual([]);
  });
});

/**
 * The generator's other half. It completes the table — every in-scope file gets
 * a row — and for a long time that was all it did, so a deleted file's row
 * stayed put: `bun run index` wrote nothing while the test above failed on
 * "every row's path exists", and the fix was a hand edit found by reading test
 * output. Dropping is now the same pass, and the invariant that has to survive
 * it is the one the keeping was for — a row somebody wrote by hand keeps its
 * text word for word as long as its file is still there.
 */
describe("a row whose file is gone", () => {
  const doc = [
    "## Code\n",
    "<!-- index:code:start -->",
    "",
    "### packages/sim",
    "",
    "| Path | One line |",
    "|---|---|",
    "| `packages/sim/src/step.ts` | The beat, in the words a human chose |",
    "| `packages/sim/src/gone.ts` | A file nobody has any more |",
    "",
    "<!-- index:code:end -->",
    "",
  ].join("\n");
  const read = (path: string) => `/** Derived from ${path}. */\nexport const x = 1;`;
  const tree = (present: string[], scope = present): Tree => ({
    scope,
    read,
    has: (path) => present.includes(path),
  });

  test("is dropped, and the row beside it keeps its hand-written text", () => {
    const out = generateIndex(doc, tree(["packages/sim/src/step.ts"]));
    expect(parseRows(out).map((r) => r.path)).toEqual(["packages/sim/src/step.ts"]);
    expect(out).toContain("| `packages/sim/src/step.ts` | The beat, in the words a human chose |");
  });

  test("goes in the same pass that adds a row for a new file", () => {
    const out = generateIndex(doc, tree(["packages/sim/src/here.ts", "packages/sim/src/step.ts"]));
    expect(parseRows(out).map((r) => r.path)).toEqual([
      "packages/sim/src/step.ts",
      "packages/sim/src/here.ts",
    ]);
  });

  /**
   * `apps/server/src/index.ts` is the live example: it exists, and the scope
   * filter drops every `index.ts` as a barrel. Its row is one a person wrote.
   */
  test("stays when the file is there but out of scope", () => {
    const out = generateIndex(
      doc,
      tree(["packages/sim/src/step.ts", "packages/sim/src/gone.ts"], []),
    );
    expect(parseRows(out).map((r) => r.path)).toEqual([
      "packages/sim/src/step.ts",
      "packages/sim/src/gone.ts",
    ]);
  });
});

describe("rowLives", () => {
  const has = (path: string) =>
    path === "packages/sim/src/step.ts" || path === "packages/audio/src/sounds";

  test("keeps a file row while the file is there", () => {
    expect(rowLives("packages/sim/src/step.ts", has)).toBe(true);
    expect(rowLives("packages/sim/src/gone.ts", has)).toBe(false);
  });

  /** A path ending in `/` stands for a directory, so that is what is asked. */
  test("asks a directory row about its directory", () => {
    expect(rowLives("packages/audio/src/sounds/", has)).toBe(true);
    expect(rowLives("packages/audio/src/drafts/", has)).toBe(false);
  });
});

describe("deriveHeaderSentence", () => {
  test("takes the first sentence of a block comment", () => {
    const source = `/**\n * The beat: spawning, gliding, the hull. More detail follows here.\n */\nexport const x = 1;`;
    expect(deriveHeaderSentence(source)).toBe("The beat: spawning, gliding, the hull");
  });

  test("falls back to the first line comment when there is no block comment", () => {
    const source = `// The room code alphabet, chosen for the ear.\nexport const x = 1;`;
    expect(deriveHeaderSentence(source)).toBe("The room code alphabet, chosen for the ear");
  });

  test("falls back to a placeholder when there is no header comment", () => {
    const source = `export const x = 1;\nexport const y = 2;\n`;
    expect(deriveHeaderSentence(source)).toBe("(no header comment — add one)");
  });

  test("truncates a long sentence at 110 characters, and says that it did", () => {
    const long = `${"a".repeat(60)} ${"b".repeat(60)}`;
    const source = `/** ${long} */\nexport const x = 1;`;
    const result = deriveHeaderSentence(source);
    expect(result.length).toBeLessThanOrEqual(110);
    expect(result).toBe(`${"a".repeat(60)}…`);
  });

  /**
   * A clause is a finished thought and needs no ellipsis. The last one before
   * the limit wins — an earlier one would throw away half the line — and a
   * clause in the first third is too little of the sentence to stand for it.
   */
  test("prefers a clause boundary to a word boundary", () => {
    const head = "The panel under the map, and what can be done to what it holds";
    const source = `/** ${head}, ${"and a long tail ".repeat(8)} */\nexport const x = 1;`;
    expect(deriveHeaderSentence(source)).toBe(head);
  });
});
