import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { fileCosts } from "../../test/figure.js";
import { VARIANTS } from "../candidates/index.js";
import { discover, type Registered, registryText } from "../registry.js";
import { CANDIDATES, ROOT } from "../root.js";
import { candidatesIn, slotDir, slotOfDir, slotsOnDisk } from "../slots.js";

// What this file is allowed to take, scaled to how busy the machine is
// (`tools/test/repo-time.ts`), because bun's five-second default is a flat number and
// these cases are not. `bunx biome format` once per case, to prove the generated file
// is printed the way the formatter would print it. 200 ms alone for the widest.
fileCosts(200);

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

/**
 * **Closing a slot reads the directory names and opens nothing.**
 *
 * `drop` is the last step of the by-hand sequence `adopt` prints when it
 * refuses a function: move the paint into the package, rewrite the record,
 * delete what nothing reads, then close the slot. That sequence leaves the
 * slot's own modules unimportable — the moved file is gone from the candidate
 * that had it, and the shipped module it came from has lost the exports the
 * *other* candidates were composing — so a `drop` that imported the registry
 * could not run at the one moment it is prescribed for (`lost:screen` / `shut`,
 * 17 September 2026, run against the shipped file restored for the length of
 * the command). The first case here builds exactly that tree and shows both
 * halves of it: the candidate will not import, and the slot is read anyway.
 */
describe("a slot is closed off its directories", () => {
  let tree = "";
  const SHUT = "lost-screen/shut/index.ts";

  beforeAll(async () => {
    tree = await mkdtemp(join(tmpdir(), "ns-versus-"));
    for (const path of [SHUT, "lost-screen/keep/index.ts", "panel-ship-join/seam/index.ts"]) {
      mkdirSync(join(tree, path, ".."), { recursive: true });
      // The paint this candidate composed has been moved into the package and
      // the export it took is gone: an import of this file throws.
      await writeFile(
        join(tree, path),
        'import { plates } from "./paint.js";\nexport const SHUT_X = plates;\n',
      );
    }
  });

  afterAll(async () => {
    await rm(tree, { recursive: true, force: true });
  });

  it("names a candidate whose own module will not import", async () => {
    await expect(import(pathToFileURL(join(tree, SHUT)).href)).rejects.toThrow();
    expect(candidatesIn(tree, "lost:screen").map((c) => c.name)).toEqual(["keep", "shut"]);
  });

  it("gives each one the repo-relative directory a removal takes", () => {
    expect(candidatesIn(tree, "lost:screen").map((c) => c.dir)).toEqual([
      "tools/versus/candidates/lost-screen/keep",
      "tools/versus/candidates/lost-screen/shut",
    ]);
  });

  it("has nothing for a slot with no directory, which is how `drop` refuses a name", () => {
    expect(candidatesIn(tree, "torch:veil")).toEqual([]);
  });

  it("names the open slots the way they are asked for, a dash in the name kept", () => {
    expect(slotsOnDisk(tree)).toEqual(["lost:screen", "panel:ship-join"]);
    expect(slotOfDir(slotDir("panel:ship-join"))).toBe("panel:ship-join");
  });

  /**
   * The defect was one line: a top-level `import { VARIANTS }` in `decide.ts`
   * loaded every candidate in the tree before `drop` removed any of them.
   * `adopt` writes a candidate's own values and cannot work without them, so
   * the registry is reached where it is needed and nowhere above it.
   */
  it("reaches the registry from `adopt` alone", () => {
    const src = readFileSync(join(ROOT, "tools/versus/decide.ts"), "utf8");
    expect(src).not.toMatch(/^import .*candidates\/index\.js/m);
    expect(src).toContain('await import("./candidates/index.js")');
  });
});

/**
 * **A directory that is not a candidate says which half is missing.**
 *
 * A slot wants two answers, so a lane opening one writes the first candidate's
 * files and the second's a few minutes later, and in between there is a
 * directory with nothing in it. Every `bun run versus index` and every
 * `bun test` until the files landed used to fail with `lost-screen/pool/
 * index.ts exports no const … : Variant` — true, and about a file nobody had
 * written (21 September 2026). The three cases are tested apart because
 * `discover` throws on the first one it reaches and the sorted walk would hide
 * the other two behind it.
 */
describe("a directory under `candidates/` that is not a candidate", () => {
  const made: string[] = [];

  /** A tree holding one candidate directory, `lost-screen/pool`, with these files in it. */
  const treeWith = async (files: Record<string, string>): Promise<string> => {
    const root = await mkdtemp(join(tmpdir(), "ns-versus-half-"));
    made.push(root);
    mkdirSync(join(root, "lost-screen", "pool"), { recursive: true });
    for (const [name, text] of Object.entries(files)) {
      await writeFile(join(root, "lost-screen", "pool", name), text);
    }
    return root;
  };

  afterAll(async () => {
    for (const root of made) await rm(root, { recursive: true, force: true });
  });

  it("says an empty one is empty, and what to do about it", async () => {
    const tree = await treeWith({});
    expect(() => discover(tree)).toThrow(
      "tools/versus/candidates/lost-screen/pool/ is empty — write its `index.ts`",
    );
  });

  it("says a paint with no registration is a paint with no registration", async () => {
    const tree = await treeWith({ "paint.ts": "export const veil = () => {};" });
    expect(() => discover(tree)).toThrow("holds `paint.ts` and no `index.ts`");
  });

  it("keeps the missing export for the file that really is missing one", async () => {
    const tree = await treeWith({ "index.ts": "export const POOL = {};" });
    expect(() => discover(tree)).toThrow(
      "tools/versus/candidates/lost-screen/pool/index.ts exports no",
    );
  });
});
