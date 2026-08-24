import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { ignoredBy } from "../ignored.js";

const SAMPLE_PATTERNS = `
# Comment line
legacy/
dist/

tools/shape-sheet/*.svg

.aider.conf.yml
`;

describe("ignoredBy", () => {
  test("directory pattern matches paths under it", () => {
    expect(ignoredBy(SAMPLE_PATTERNS, "legacy/old.ts")).toBe(true);
    expect(ignoredBy(SAMPLE_PATTERNS, "legacy/deep/nested/file.ts")).toBe(true);
  });

  test("directory pattern matches with backslashes", () => {
    expect(ignoredBy(SAMPLE_PATTERNS, "dist\\bundle.js")).toBe(true);
  });

  test("exact path matches only that path", () => {
    expect(ignoredBy(SAMPLE_PATTERNS, ".aider.conf.yml")).toBe(true);
    expect(ignoredBy(SAMPLE_PATTERNS, ".aider.conf.yaml")).toBe(false);
    expect(ignoredBy(SAMPLE_PATTERNS, "other/.aider.conf.yml")).toBe(false);
  });

  test("glob pattern matches correctly", () => {
    expect(ignoredBy(SAMPLE_PATTERNS, "tools/shape-sheet/hull.svg")).toBe(true);
    expect(ignoredBy(SAMPLE_PATTERNS, "tools/shape-sheet/data.json")).toBe(false);
  });

  test("comment and blank lines match nothing", () => {
    expect(ignoredBy(SAMPLE_PATTERNS, "# Comment line")).toBe(false);
    expect(ignoredBy(SAMPLE_PATTERNS, "")).toBe(false);
  });

  test("uncovered path is not ignored", () => {
    expect(ignoredBy(SAMPLE_PATTERNS, "packages/sim/src/world.ts")).toBe(false);
  });

  test("real .aiderignore policy", async () => {
    if (!existsSync(".aiderignore")) {
      throw new Error(".aiderignore not found at repository root");
    }

    const realPatterns = await Bun.file(".aiderignore").text();

    expect(ignoredBy(realPatterns, ".claude/harness.ts")).toBe(true);
    expect(ignoredBy(realPatterns, "packages/sim/src/world.ts")).toBe(false);
  });
});
