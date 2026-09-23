import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_CONFIG } from "../../packages/sim/src/config.js";
import { parseItems } from "../queue/queue.js";
import { existsIn } from "../queue/stale.js";
import { commentSpans, sourceFiles } from "./doc-names.js";
import {
  BY_NAME,
  docFiles,
  ignoredByGit,
  namesAFile,
  pathClaimsIn,
  ROOT,
  skillFiles,
  TREE,
} from "./doc-paths.js";
import { itCosts } from "./figure.js";

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
 * Four things here, each the same shape: a claim a document — or, for the
 * fourth, a source comment — makes that the tree settles without reading it. A
 * fifth is next door in `doc-drift-names.test.ts`, asking the same of an
 * identifier a comment names in its own file's subject.
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
 *
 * **A comment naming a neighbour by its bare file name** is not a path claim
 * at all, by `isPathClaim`'s own slash rule above — a comment writes
 * `config-boss.ts`, not `packages/content/src/config-boss.ts`. So a source
 * file was renamed or split 32 times and the sentence pointing at it never
 * moved, across about 50 sites, and nothing here saw any of them. This
 * checks every `src` comment the same way, against `BY_NAME`.
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

/**
 * Said under the drift list, because the usual cause is not a typo: a document
 * that writes down work — a queue entry, a row of the boss ledger — names the
 * files the work will create, and backticks around one of those are a claim
 * this tree already has it.
 *
 * **The skills are read the same way.** They were outside this check until
 * 19 September 2026, and `.claude/skills/new-boss-state` is the entry that
 * made the gap matter: twelve rows of *file, what it wants, the test that
 * goes red*, whose whole value is that the paths in it are the paths the
 * tree has. One claim across the twelve skills had to move for this — a
 * scratch file `delegate` proposes to create, now named without backticks,
 * which is the convention below.
 */
const UNWRITTEN =
  "a file a document proposes to create is named without backticks until it exists — " +
  "see docs/queue.md's preamble and the ledger table in docs/spec/bosses-choreographed.md";

describe("a path a document names", () => {
  itCosts(350, "is a file this repository has", () => {
    const found: { doc: string; mention: string }[] = [];
    let claims = 0;
    for (const doc of [...docFiles(), ...skillFiles()]) {
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
    // A failure here is read by a session that has just written a document,
    // and most often by one that wrote down work it has not done yet, so the
    // list says the convention rather than leaving a missing path to look
    // like a typo: the take commit `e2c4b2c7` turned `main` red with a ledger
    // row naming the scene file its own lane was about to write.
    const missing = [...new Set(drift)].sort();
    if (missing.length > 0) missing.push(UNWRITTEN);
    // A run that checked nothing would pass. It was 2,211 on the day this landed.
    expect(claims).toBeGreaterThan(1500);
    expect(missing).toEqual([]);
    // Every document read, two thousand paths asked about, and a `git
    // check-ignore` at the end of it: a third of a second alone and minutes
    // under another session's check (`tools/test/repo-time.ts`).
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

  itCosts(300, "is named in a document", () => {
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

/**
 * Whether a backticked span is a claim about a `.ts`/`.tsx` neighbour worth
 * checking. Two things are named on purpose to cover a family and neither is
 * a claim: a glob (`splice-*.ts`), and a template whose placeholder stands
 * for many bosses' own file (`effects-spark-silent-boss.ts`'s `<boss>-fx.ts`),
 * the shorthand `isPathClaim` above excludes for `<round>.ts`.
 */
function namesATsFile(mention: string): boolean {
  return !/[*<]/.test(mention) && /\.tsx?$/.test(mention);
}

describe("a comment under packages/*/src or apps/*/src", () => {
  itCosts(350, "names a source file this tree still has", () => {
    const found: { file: string; mention: string }[] = [];
    let claims = 0;
    for (const file of sourceFiles()) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const span of commentSpans(source)) {
        for (const match of span.matchAll(/`([^`\n]+)`/g)) {
          const mention = (match[1] ?? "").trim();
          if (!namesATsFile(mention)) continue;
          claims++;
          const basename = mention.split("/").pop() ?? mention;
          if (!BY_NAME.has(basename)) found.push({ file, mention });
        }
      }
    }
    const missing = [...new Set(found.map((f) => `${f.file} → ${f.mention}`))].sort();
    // A run that checked nothing would pass.
    expect(claims).toBeGreaterThan(200);
    expect(missing).toEqual([]);
  });
});
