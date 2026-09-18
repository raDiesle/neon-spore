import { describe, expect, it } from "bun:test";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import { counted, KNOWN_LONG, LIMIT, lineCount } from "../../../tools/hooks/file-size.ts";
import { loadedTimeout } from "../../../tools/test/repo-time.js";

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
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function sourceFiles(): string[] {
  // `**` rather than `*/src/**`: a file outside a `src/` directory is still a
  // file somebody has to read, and the four longest in the repository were all
  // outside one — `tools/versus/prompt.ts` at 509 lines went over the limit,
  // and past twice the limit, without this test ever looking at it.
  //
  // Filtered while the paths are still the glob's own relative ones, which is
  // what `counted` answers about: an absolute path under a checkout that
  // happens to live in a directory called `apps` is not an `apps/` file.
  const glob = new Glob("{packages,apps,tools}/**/*.ts");
  return [...glob.scanSync(ROOT)]
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

  it(
    "keeps source files under the limit",
    async () => {
      for (const file of files) {
        const rel = relative(ROOT, file).replaceAll("\\", "/");
        if (rel in KNOWN_LONG) continue;
        const lines = await linesIn(file);
        expect(lines, `${rel} has ${lines} lines, limit is ${LIMIT}`).toBeLessThanOrEqual(LIMIT);
      }
      // Fifteen hundred files read in one case, and what that costs is the
      // machine rather than the work: 145 ms alone on the cloud image on 18
      // September 2026, and past five seconds under `bun run check`'s eight
      // shards on 12 September 2026. So the budget scales with the load
      // (`tools/test/repo-time.ts`) instead of being a flat number that is right
      // for one machine under one load and for no other.
    },
    loadedTimeout(150),
  );

  it("does not let a known long file grow", async () => {
    for (const file of files) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (!(rel in KNOWN_LONG)) continue;
      const lines = await linesIn(file);
      const max = KNOWN_LONG[rel]!;
      expect(lines, `${rel} has ${lines} lines, known max is ${max}`).toBeLessThanOrEqual(max);
    }
  });

  it("drops a known long file once it is short enough", async () => {
    for (const [rel] of Object.entries(KNOWN_LONG)) {
      const file = join(ROOT, ...rel.split("/"));
      const lines = await linesIn(file);
      expect(lines, `${rel} is now ${lines} lines — delete it from KNOWN_LONG`).toBeGreaterThan(
        LIMIT,
      );
    }
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

  it(
    "has no control byte but tab, LF and CR in any of them",
    async () => {
      for (const file of files) {
        const bytes = new Uint8Array(await Bun.file(file).arrayBuffer());
        const at = bytes.findIndex((b) => b < 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d);
        const rel = relative(ROOT, file).replaceAll(sep, "/");
        expect(at, `${rel} has byte 0x${bytes[at]?.toString(16)} at offset ${at}`).toBe(-1);
      }
      // The same fifteen hundred files, read as bytes rather than as text: 253 ms
      // alone on the cloud image, 18 September 2026, and on the same load curve
      // as everything else that walks the tree (`tools/test/repo-time.ts`).
    },
    loadedTimeout(260),
  );
});
