import { describe, expect, it } from "bun:test";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import { counted, KNOWN_LONG, LIMIT, lineCount } from "../../../tools/hooks/file-size.ts";
import { itCosts } from "../../../tools/test/figure.js";

/**
 * A session reads less when files are small. The 250-line limit keeps source
 * files scannable in one pass — a reviewer or a maintainer can hold the whole
 * shape of a file in their head, and a language model can read it without
 * truncating it.
 *
 * The limit, the exempt list and which paths the two of them reach are
 * `tools/hooks/file-size.ts`, because `after-edit-size.ts` says a file is
 * filling up at the moment it is written and has to mean the same thing by it.
 * This file is still the rule — the hook only ever warns.
 *
 * **Every case here reports all of its offenders, not the first.** An `expect`
 * inside the loop throws on the first file over, and everything after it goes
 * unlooked-at — so a lane that added one row to several lists at once met four
 * full pages one at a time, re-reading 560 files between each. Four runs at
 * two and a half minutes, for four facts the first run already had in hand.
 * So each loop collects and the assertion comes after it: one `expect`, one
 * budget, and a failure that names every file and its count at once.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function sourceFiles(): string[] {
  // `**` rather than `*/src/**`: a file outside a `src/` directory is still a
  // file somebody has to read, and the four longest in the repository were all
  // outside one — `tools/versus/prompt.ts` at 509 lines went over the limit,
  // and past twice the limit, without this test ever looking at it.
  //
  // A second glob for the one `.md` `counted` also reaches: a skill's own
  // `SKILL.md`, held to the same ceiling since 19 September 2026 for the same
  // reason `.ts` source is (`docs/queue.md`).
  //
  // Filtered while the paths are still the glob's own relative ones, which is
  // what `counted` answers about: an absolute path under a checkout that
  // happens to live in a directory called `apps` is not an `apps/` file.
  const ts = [...new Glob("{packages,apps,tools}/**/*.ts").scanSync(ROOT)];
  const skills = [...new Glob(".claude/skills/**/*.md").scanSync(ROOT)];
  return [...ts, ...skills]
    .map((f) => f.replaceAll("\\", "/"))
    .filter(counted)
    .map((f) => join(ROOT, f));
}

/** The markdown beside the code: read by tools (`tools/queue`), so held to the same bytes. */
function docFiles(): string[] {
  return [...new Glob("docs/**/*.md").scanSync(ROOT)].map((f) => join(ROOT, f));
}

/** The file's own count, by the same rule the hook applies to what it is handed. */
async function linesIn(file: string): Promise<number> {
  return lineCount(await Bun.file(file).text());
}

describe("file size limits", () => {
  const files = sourceFiles();

  itCosts(400, "keeps source files under the limit", async () => {
    const over: string[] = [];
    for (const file of files) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (rel in KNOWN_LONG) continue;
      const lines = await linesIn(file);
      if (lines > LIMIT) over.push(`${rel} has ${lines} lines, limit is ${LIMIT}`);
    }
    expect(over).toEqual([]);
    // Fifteen hundred files read in one case, and what that costs is the
    // machine rather than the work: 145 ms alone on the cloud image on 18
    // September 2026, and past five seconds under `bun run check`'s eight
    // shards on 12 September 2026. So the budget scales with the load
    // (`tools/test/repo-time.ts`) instead of being a flat number that is right
    // for one machine under one load and for no other.
  });

  it("does not let a known long file grow", async () => {
    const grown: string[] = [];
    for (const file of files) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (!(rel in KNOWN_LONG)) continue;
      const lines = await linesIn(file);
      const max = KNOWN_LONG[rel]!;
      if (lines > max) grown.push(`${rel} has ${lines} lines, known max is ${max}`);
    }
    expect(grown).toEqual([]);
  });

  it("drops a known long file once it is short enough", async () => {
    const shrunk: string[] = [];
    for (const [rel] of Object.entries(KNOWN_LONG)) {
      const file = join(ROOT, ...rel.split("/"));
      const lines = await linesIn(file);
      if (lines <= LIMIT) shrunk.push(`${rel} is now ${lines} lines — delete it from KNOWN_LONG`);
    }
    expect(shrunk).toEqual([]);
  });
});

/**
 * A source file is text, to git as much as to a reader. `waves-api.ts` carried
 * two raw NUL bytes for twelve days — the separator in `wavesToken`, typed as
 * the byte rather than the escape — and git classed the file as binary for
 * all of them: every `diff --stat` said `Bin`, `git show` printed no hunk,
 * `grep` skipped it, and a rebase conflict in it could not have been resolved
 * by hand. No check said a word, because a line count is blind to what the
 * line holds. Found 14 September 2026.
 */
describe("source files are text", () => {
  const files = [...sourceFiles(), ...docFiles()];

  itCosts(450, "has no control byte but tab, LF and CR in any of them", async () => {
    const binary: string[] = [];
    for (const file of files) {
      const bytes = new Uint8Array(await Bun.file(file).arrayBuffer());
      const at = bytes.findIndex((b) => b < 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d);
      if (at === -1) continue;
      const rel = relative(ROOT, file).replaceAll(sep, "/");
      binary.push(`${rel} has byte 0x${bytes[at]?.toString(16)} at offset ${at}`);
    }
    expect(binary).toEqual([]);
    // The same fifteen hundred files, read as bytes rather than as text: 253 ms
    // alone on the cloud image, 18 September 2026, and on the same load curve
    // as everything else that walks the tree (`tools/test/repo-time.ts`).
  });
});
