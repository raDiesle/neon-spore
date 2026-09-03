import { describe, expect, it } from "bun:test";
import { join, relative } from "node:path";
import { Glob } from "bun";
import { COPIES } from "./copies-table.js";
import { ROOT, stripNonCode } from "./source-scan.js";

/**
 * The table lives next door in `copies-table.ts`, because it grows by a row
 * per finding and the check over it does not. This file is the check.
 */

function allSourceFiles(): string[] {
  const patterns = ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts", "tools/**/*.ts"];
  const all: string[] = [];
  for (const pattern of patterns) {
    const glob = new Glob(pattern);
    for (const f of glob.scanSync(ROOT)) {
      // Tested against the path *inside* the repository, never the absolute
      // one: a git worktree lives under `.claude/worktrees/`, so an absolute
      // test threw away every file in the tree and the whole guard passed
      // vacuously wherever it mattered most — in the copy work is done in.
      const rel = f.replaceAll("\\", "/");
      if (!rel.includes("node_modules") && !rel.includes("dist") && !rel.includes(".claude")) {
        all.push(join(ROOT, f));
      }
    }
  }
  return all;
}

describe("no re-derived rules", () => {
  const files = allSourceFiles();

  it("guards a non-empty set of files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const copy of COPIES) {
    const ownerPath = join(ROOT, copy.owner);

    it(`${copy.owner} contains its own pattern`, async () => {
      const text = await Bun.file(ownerPath).text();
      const code = copy.strip === false ? text : stripNonCode(text);
      expect(copy.pattern.test(code)).toBe(true);
    });

    const allowed = new Set([ownerPath, ...(copy.also ?? []).map((f) => join(ROOT, f))]);

    for (const file of files) {
      if (allowed.has(file)) continue;

      const name = relative(ROOT, file).replaceAll("\\", "/");
      it(`${name} calls ${copy.call} instead of re-deriving it`, async () => {
        const text = await Bun.file(file).text();
        const code = copy.strip === false ? text : stripNonCode(text);
        if (copy.pattern.test(code)) {
          throw new Error(`Call ${copy.call} from ${copy.owner}`);
        }
      });
    }
  }
});
