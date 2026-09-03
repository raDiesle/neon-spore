import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { deriveHeaderSentence, filterScopeFiles, generateIndex, parseRows } from "../index.js";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);

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
    const generated = generateIndex(committed, scope, (relPath) =>
      readFileSync(join(ROOT, relPath), "utf8"),
    );
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
        `docs/INDEX.md is out of date (${hint}). Run \`bun run index\` and edit the new row's text.`,
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
