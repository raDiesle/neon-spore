import { describe, expect, test } from "bun:test";
import { biomeChecks, crlfOnDisk, crlfRefusal } from "../crlf.js";

/**
 * The landing failure that named a formatter instead of a line ending.
 *
 * `.claude/launch.json` had CRLF on disk while its blob in `HEAD` was LF, so
 * `git status` was clean and biome printed the entire file as a diff. Six
 * commands to find, one substitution to fix. Everything here is the reading of
 * `git ls-files --eol` that lets the landing say the words first.
 */

const LINE = (worktree: string, path: string) =>
  `i/lf    w/${worktree}  attr/text=auto eol=lf \t${path}`;

describe("crlfOnDisk", () => {
  test("a working copy with CRLF is reported", () => {
    expect(crlfOnDisk(LINE("crlf", "tools/land/run.ts"))).toEqual(["tools/land/run.ts"]);
  });

  test("a mixed file counts too — biome rewrites it whole either way", () => {
    expect(crlfOnDisk(LINE("mixed", "apps/game/src/main.ts"))).toEqual(["apps/game/src/main.ts"]);
  });

  /**
   * Only the `w/` half is a fact about disk. `i/crlf` is a file committed with
   * CRLF, which is a different problem and not one `bun run format` fixes.
   */
  test("CRLF in the index alone is not this", () => {
    expect(crlfOnDisk(`i/crlf  w/lf     attr/ \tpackages/sim/src/step.ts`)).toEqual([]);
  });

  test("a file biome never opens cannot fail its lint", () => {
    const listing = [
      LINE("crlf", "docs/queue.md"),
      LINE("crlf", "assets/raster/atlas.bin"),
      LINE("crlf", "packages/sim/src/step.ts"),
    ].join("\n");
    expect(crlfOnDisk(listing)).toEqual(["packages/sim/src/step.ts"]);
  });

  test("and neither can one biome is told to skip", () => {
    expect(crlfOnDisk(LINE("crlf", ".claude/launch.json"))).toEqual([]);
    expect(crlfOnDisk(LINE("crlf", "legacy/old.js"))).toEqual([]);
    expect(crlfOnDisk(LINE("crlf", "apps/game/node_modules/x/index.js"))).toEqual([]);
  });

  test("an empty listing is no complaint at all", () => {
    expect(crlfOnDisk("")).toEqual([]);
  });
});

describe("biomeChecks", () => {
  test("the extensions biome.json includes", () => {
    for (const path of ["a.ts", "a.tsx", "a.js", "a.jsx", "a.json", "a.css"]) {
      expect(biomeChecks(path)).toBe(true);
    }
    expect(biomeChecks("docs/notes.md")).toBe(false);
  });

  test("a Windows separator is the same path", () => {
    expect(biomeChecks(String.raw`tools\land\run.ts`)).toBe(true);
    expect(biomeChecks(String.raw`.claude\launch.json`)).toBe(false);
  });
});

describe("crlfRefusal", () => {
  test("says the trunk did not move, and the one command that fixes it", () => {
    const said = crlfRefusal(["a.ts"], "main").join("\n");
    expect(said).toContain("1 tracked file has");
    expect(said).toContain("main was not moved");
    expect(said).toContain("bun run format");
  });

  test("a long list is cut off rather than printed whole", () => {
    const many = Array.from({ length: 14 }, (_, i) => `f${i}.ts`);
    const said = crlfRefusal(many, "main");
    expect(said.join("\n")).toContain("and 4 more");
    expect(said.length).toBe(14);
  });
});
