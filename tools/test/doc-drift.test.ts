import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_CONFIG } from "../../packages/sim/src/config.js";
import { parseItems } from "../queue/queue.js";
import { existsIn } from "../queue/stale.js";
import { docFiles, ignoredByGit, namesAFile, pathClaimsIn, ROOT, TREE } from "./doc-paths.js";

/**
 * Document drift, as a test.
 *
 * `tools/index/drift.ts` already does this for one file: a row of
 * `docs/INDEX.md` may not name a thing its own file has stopped having. The
 * argument there is the whole argument here — the prose is hand-written and worth
 * keeping hand-written, so nothing regenerates over it, and the cost is that it
 * goes quietly wrong. Five INDEX rows were repaired by hand in one week and
 * nothing in the repository would have failed if they had not been. The spec is a
 * hundred times the prose and had no such check at all.
 *
 * Three things here, and each is the same shape: a claim a document makes that
 * the tree can settle without reading a word of the argument.
 *
 * **A path is either there or it is not** — 2,211 backticked paths under `docs/`
 * on the day this was written, of which seven named nothing, across five
 * documents. What counts as a path claim, and what counts as answering one, is
 * `doc-paths.ts`.
 *
 * **A tunable nobody names is a number the next session reverse-engineers** from
 * whatever reads it. When this landed, 76 of `SimConfig`'s 234 fields were named
 * in a document — exactly the ones `packages/sim/src/config.ts` declares itself —
 * and the other 158 sat on an allowlist beside this file with the question of
 * what to do about them. The owner's answer, 12 September 2026, was one sentence
 * each in the sheet that describes the thing the number is a dial for; the ones
 * that were not feel numbers had been retired by then, the list emptied and was
 * deleted, and every field of `SimConfig` is now named in a document or fails
 * here.
 *
 * **A queue entry that names a file the tree has not got** cannot be picked up by
 * the cold session it was written for. `bun run queue` says so when somebody runs
 * it, against the trunk, as a mark rather than a failure (`tools/queue/stale.ts`);
 * nothing tested it. This does, against this tree.
 */

/**
 * The three documents that are **records** rather than descriptions, and so are
 * not held to naming files that still exist.
 *
 * `release-notes.md` is written by `bun run land` out of a commit's own subject
 * and first paragraph at the moment the trunk moved, and `time-log.md` carries a
 * row per lane: both are true about the tree they landed on, and editing one to
 * match today's tree would be rewriting the record rather than fixing a document.
 * `teaching.md` says as much about itself in its first paragraph — everything
 * below its second heading is a design scored on 27 August 2026 and never built,
 * written in the present tense it was designed in, with `docs/spec/briefings.md`
 * named as right wherever the two disagree.
 */
const RECORDS = new Set(["docs/release-notes.md", "docs/time-log.md", "docs/teaching.md"]);

/**
 * A path a document names on purpose that the tree does not have. One entry, one
 * reason, and it is not a licence for a second.
 *
 * `docs/performance.md` carries the measurement tables of profiling runs — a row
 * per test file, with a before and an after. That is a record of what a run
 * measured, the way a release note is: the file was renamed away afterwards, and
 * the row is still an honest account of the 292 seconds it was part of.
 */
const KNOWN_GONE = new Set(["packages/render/test/tell-frame.test.ts"]);

describe("a path a document names", () => {
  it("is a file this repository has", () => {
    const found: { doc: string; mention: string }[] = [];
    let claims = 0;
    for (const doc of docFiles()) {
      if (RECORDS.has(doc)) continue;
      for (const mention of pathClaimsIn(doc)) {
        claims++;
        if (!namesAFile(mention) && !KNOWN_GONE.has(mention)) found.push({ doc, mention });
      }
    }
    // A build output a document names is not drift: `docs/skins.md` says of one
    // of these, in the same sentence, that it is gitignored.
    const ignored = ignoredByGit([...new Set(found.map((f) => f.mention))]);
    const drift = found
      .filter((f) => !ignored.has(f.mention))
      .map((f) => `${f.doc} → ${f.mention}`);
    // A run that checked nothing would pass. It was 2,211 on the day this landed.
    expect(claims).toBeGreaterThan(1500);
    expect([...new Set(drift)].sort()).toEqual([]);
  });
});

describe("a field of SimConfig", () => {
  /**
   * Where the game is specified: `docs/spec/` and the top level, less the five
   * files that are not descriptions of it.
   *
   * The three records are out for the reason they are out of the path check above.
   * `queue.md` and `parked.md` are out for a sharper one: they are lists of work,
   * and an entry quoting a field name in order to say that nobody has written
   * about it would otherwise count as having written about it — this lane's own
   * queue entry named six of them and turned all six green.
   */
  const NOT_SPEC = new Set([...RECORDS, "docs/queue.md", "docs/parked.md"]);
  const specText = docFiles()
    .filter((doc) => doc.startsWith("docs/spec/") || /^docs\/[^/]+\.md$/.test(doc))
    .filter((doc) => !NOT_SPEC.has(doc))
    .map((doc) => readFileSync(join(ROOT, doc), "utf8"))
    .join("\n");

  it("is named in a document", () => {
    const unnamed = Object.keys(DEFAULT_CONFIG).filter(
      (field) => !new RegExp(`\\b${field}\\b`).test(specText),
    );
    expect(unnamed).toEqual([]);
  });
});

describe("a queue entry", () => {
  for (const source of ["queue", "parked"] as const) {
    it(`in docs/${source}.md names only files the tree has`, () => {
      // `existsIn` is the queue tool's own rule, called rather than written out
      // again: a `Files:` path may be a file, a directory or a glob.
      const md = readFileSync(join(ROOT, "docs", `${source}.md`), "utf8");
      const gone: string[] = [];
      for (const item of parseItems(md, source)) {
        for (const file of item.files) {
          if (!existsIn(TREE, file)) gone.push(`"${item.title}" → ${file}`);
        }
      }
      expect(gone).toEqual([]);
    });
  }
});
