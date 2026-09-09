import { describe, expect, it } from "bun:test";
import { VARIANTS } from "../candidates/index.js";
import { discover, registryText } from "../registry.js";
import { CANDIDATES } from "../root.js";

/**
 * The registry is generated, so the failure worth catching is the one where
 * somebody wrote a candidate and did not run `bun run versus index`: the
 * directory is on disk, the tests here draw nothing from it, and the page it
 * was written for never shows it. The reverse — an entry naming a directory
 * that has gone — is caught by `variants.test.ts`, which stats every `dir`.
 *
 * It compares the *set* of candidates rather than the file's bytes, because
 * Biome owns the formatting of the generated file and a test that compared
 * text would fail on a line break the formatter is entitled to move.
 */
describe("the registry matches the directories", () => {
  it("names every candidate directory on disk", () => {
    const onDisk = discover(CANDIDATES).map((f) => f.dir);
    expect(VARIANTS.map((v) => v.dir).sort()).toEqual([...onDisk].sort());
  });

  it("has no two candidates in one directory", () => {
    const dirs = VARIANTS.map((v) => v.dir);
    expect(new Set(dirs).size).toBe(dirs.length);
  });

  it("generates a file that imports each one exactly once", () => {
    const text = registryText(discover(CANDIDATES));
    for (const v of VARIANTS) {
      const path = v.dir.replace("tools/versus/candidates/", "./");
      expect(text.split(`from "${path}/index.js"`).length).toBe(2);
    }
  });
});
