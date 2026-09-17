import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { loadedTimeout } from "../../test/repo-time.js";
import { VARIANTS } from "../candidates/index.js";
import { discover, type Registered, registryText } from "../registry.js";
import { CANDIDATES, ROOT } from "../root.js";

// What this file is allowed to take, scaled to how busy the machine is
// (`tools/test/repo-time.ts`), because bun's five-second default is a flat number and
// these cases are not. `bunx biome format` once per case, to prove the generated file
// is printed the way the formatter would print it. 200 ms alone for the widest.
setDefaultTimeout(loadedTimeout(200));

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

  /**
   * **The generator prints what the formatter would print.** This file is
   * generated *and* linted, so a shape Biome would rewrite is a red
   * `bun run lint` on a file no hand touched — which is what happened on 17
   * September 2026 when the `lost:screen` slot came down to one answer and the
   * spread-out array was collapsed onto one line. The empty list had already
   * been special-cased here for the same reason; the rule is the formatter's
   * and this asks the formatter rather than guessing at it.
   */
  const asBiomeWouldPrint = (text: string): string => {
    const run = Bun.spawnSync(["bunx", "biome", "format", "--stdin-file-path=registry.ts"], {
      cwd: ROOT,
      stdin: Buffer.from(text),
    });
    return new TextDecoder().decode(run.stdout);
  };

  const fake = (n: number): Registered[] =>
    Array.from({ length: n }, (_, i) => ({
      symbol: `SLOT_ANSWER_${i}`,
      path: `slot/answer-${i}`,
      dir: `tools/versus/candidates/slot/answer-${i}`,
    }));

  for (const n of [0, 1, 2, 9]) {
    it(`prints ${n} candidates the way Biome would`, () => {
      const text = registryText(fake(n));
      expect(text).toBe(asBiomeWouldPrint(text));
    });
  }

  it("prints the real tree the way Biome would", () => {
    const text = registryText(discover(CANDIDATES));
    expect(text).toBe(asBiomeWouldPrint(text));
  });
});
