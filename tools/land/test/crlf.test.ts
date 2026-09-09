import { describe, expect, test } from "bun:test";
import { crlfOnDisk, crlfRefusal, lineEndingsMatter } from "../crlf.js";

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

  /**
   * Markdown, which biome never opens and which `tools/index`, `tools/queue`
   * and the release notes all parse by matching on a newline. It passed every
   * part of `bun run check` and then made `bun run index` blame a heading that
   * was there (`PARSED` in `crlf.ts`).
   */
  test("catches a markdown file biome would never have opened", () => {
    expect(crlfOnDisk(LINE("crlf", "docs/INDEX.md"))).toEqual(["docs/INDEX.md"]);
    expect(crlfOnDisk(LINE("crlf", "docs/queue.md"))).toEqual(["docs/queue.md"]);
  });

  test("and still leaves alone what nothing in this repository parses", () => {
    expect(crlfOnDisk(LINE("crlf", "docs/style.png"))).toEqual([]);
    expect(crlfOnDisk(LINE("crlf", "assets/raster/atlas.bin"))).toEqual([]);
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

  test("a file nothing here parses is left out, whatever else is in the listing", () => {
    const listing = [
      LINE("crlf", "assets/raster/atlas.bin"),
      LINE("crlf", "docs/queue.md"),
      LINE("crlf", "packages/sim/src/step.ts"),
    ].join("\n");
    expect(crlfOnDisk(listing)).toEqual(["docs/queue.md", "packages/sim/src/step.ts"]);
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

describe("lineEndingsMatter", () => {
  test("the extensions biome.json includes", () => {
    for (const path of ["a.ts", "a.tsx", "a.js", "a.jsx", "a.json", "a.css"]) {
      expect(lineEndingsMatter(path)).toBe(true);
    }
  });

  /** And markdown, which biome does not format and four tools here parse. */
  test("and markdown, which biome does not format", () => {
    expect(lineEndingsMatter("docs/notes.md")).toBe(true);
    expect(lineEndingsMatter("docs/spec/bosses.md")).toBe(true);
  });

  test("and nothing else", () => {
    for (const path of ["a.png", "a.webp", "a.bin", "a.txt", "a.svg"]) {
      expect(lineEndingsMatter(path), path).toBe(false);
    }
  });

  test("a Windows separator is the same path", () => {
    expect(lineEndingsMatter(String.raw`tools\land\run.ts`)).toBe(true);
    expect(lineEndingsMatter(String.raw`.claude\launch.json`)).toBe(false);
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
    expect(said.length).toBe(15);
  });
});
