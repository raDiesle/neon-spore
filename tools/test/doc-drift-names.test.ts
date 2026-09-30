import { beforeAll, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { declaredNames, ownSubjectClaims, REMEMBERED, sourceFiles } from "./doc-names.js";
import { ROOT } from "./doc-paths.js";
import { itCosts } from "./figure.js";
import { loadedTimeout } from "./repo-time.js";
import { treeText } from "./tree-text.js";

/**
 * **A comment that names something in its own file's subject names something
 * the tree has** — or says, in `doc-names.ts`' `REMEMBERED`, that it is naming
 * what the tree deliberately lost.
 *
 * The fifth of `doc-drift.test.ts`' checks and the first about an identifier
 * rather than a path, in its own file because that one is at the 250-line
 * ceiling and because the harvesting this needs is a module of its own. Why the
 * claim is restricted the way it is, what the measurement said, and every one
 * of the ten remembered names: `doc-names.ts`.
 *
 * Two failures, and they want opposite fixes. A name that was never right is a
 * comment to repair — three were, in the commit that added this: `beatboxBroke`
 * for the `beatboxLapsed` that actually ends a run, `dartPath` for the
 * `drawDartGuides` in the file of that name, and `veilOnMorph` for the
 * `veilMorphBeats` clock a morph really lands on. A name the tree once had and
 * a paragraph is deliberately remembering is a row for `REMEMBERED`, with the
 * sentence saying what it was and when it went — and never a row written to
 * make a red test stop, which is the one way this check can be made worthless.
 */
describe("a comment naming something in its own file's subject", () => {
  // Read before the cases, the way `doc-drift.test.ts` reads its sources: the
  // walk is the machine's time, not the check's, and on 30 September 2026 it
  // took this case to 13.9 s at slowdown 5.0 against its 850 ms figure.
  let names: ReadonlySet<string> = new Set();
  const files = sourceFiles();
  let sources: string[] = [];
  beforeAll(async () => {
    [names, sources] = await Promise.all([declaredNames(), treeText(files)]);
  }, loadedTimeout(150));

  itCosts(850, "names something this tree still writes down", () => {
    const found: string[] = [];
    let claims = 0;
    for (const [i, file] of files.entries()) {
      const source = sources[i] as string;
      for (const name of ownSubjectClaims(file, source)) {
        claims++;
        const row = `${file} → ${name}`;
        if (!names.has(name) && !REMEMBERED.has(row)) found.push(row);
      }
    }
    const missing = [...new Set(found)].sort();
    // A run that checked nothing would pass.
    expect(claims).toBeGreaterThan(1000);
    expect(missing).toEqual([]);
  });

  itCosts(550, "remembers nothing the tree has got back", () => {
    const alive: string[] = [];
    for (const row of REMEMBERED.keys()) {
      const name = row.split(" → ")[1] as string;
      if (names.has(name)) alive.push(row);
    }
    // A remembered name that exists again is a paragraph describing a world
    // two files deep in the past, and the exception is now hiding the drift it
    // was written to excuse.
    expect(alive).toEqual([]);
  });

  it("remembers only comments that are still there to remember", () => {
    const stale: string[] = [];
    for (const row of REMEMBERED.keys()) {
      const [file, name] = row.split(" → ") as [string, string];
      const source = readFileSync(join(ROOT, file), "utf8");
      if (!ownSubjectClaims(file, source).includes(name)) stale.push(row);
    }
    // A row for a comment that has since been rewritten is dead weight, and the
    // next reader has no way to tell it from a live one.
    expect(stale).toEqual([]);
  });
});
