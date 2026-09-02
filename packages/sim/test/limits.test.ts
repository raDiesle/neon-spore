import { describe, expect, it } from "bun:test";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";

/**
 * A session reads less when files are small. The 250-line limit keeps source
 * files scannable in one pass — a reviewer or a maintainer can hold the whole
 * shape of a file in their head, and a language model can read it without
 * truncating it.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LIMIT = 250;
/**
 * `waves.ts` used to be the one file here that could not be split by the lane
 * that fills it: the director rewrote the `WAVES` array in place, and
 * `serialize.ts` found `export const WAVES: Wave[] = [` and regenerated
 * everything after it, so an array spread across two files would have been
 * flattened back into one the next time anybody saved a wave in the editor.
 *
 * It is split now, by act, into `packages/content/src/waves/act-*.ts` —
 * `act-1.ts` is the tutorial arc, `act-2.ts` is the first five bosses,
 * `act-3.ts` is everything after them. `waves.ts` itself is only the barrel
 * that concatenates the three, so it stays short no matter how many waves the
 * acts hold; `tools/director/src/serialize.ts` regenerates one act file at a
 * time. There is currently nothing left in `KNOWN_LONG` — an act file that
 * fills up in its own turn gets a fourth act beside it, not an entry here.
 */
/**
 * Files over the limit that the ratchet did not use to reach, at the length
 * they had when it started reaching them. They may shrink and never grow.
 *
 * Every one is a tool's *entry point* — the file a session opens first when it
 * lands a lane, judges a versus pair or takes a picture — which is exactly the
 * class the old glob missed, because it only looked inside `src/` and a tool's
 * entry point sits above one. They are seeded rather than split here: five
 * splits in a lane that owns none of the five would be five seams nobody chose.
 */
const KNOWN_LONG: Record<string, number> = {
  "tools/versus/prompt.ts": 509,
  "tools/director/server.ts": 260,
  "tools/land/worktree.ts": 315,
};
function sourceFiles(): string[] {
  // `**` rather than `*/src/**`: a file outside a `src/` directory is still a
  // file somebody has to read, and the four longest in the repository were all
  // outside one — `tools/versus/prompt.ts` at 509 lines went over the limit,
  // and past twice the limit, without this test ever looking at it.
  const glob = new Glob("{packages,apps,tools}/**/*.ts");
  return [...glob.scanSync(ROOT)]
    .map((f) => join(ROOT, f))
    .filter(
      (f) =>
        !f.includes("node_modules") &&
        !f.includes("dist") &&
        !f.endsWith(".test.ts") &&
        // Test helpers are read the way tests are — a fixture that lists one of
        // everything is long because the thing it lists is long, and splitting
        // it would only hide that.
        !f.replaceAll("\\", "/").includes("/test/"),
    );
}

/**
 * Lines as `wc -l` and every editor count them: a trailing newline ends the
 * last line, it does not begin an empty one.
 */
async function lineCount(file: string): Promise<number> {
  const text = await Bun.file(file).text();
  return text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
}

describe("file size limits", () => {
  const files = sourceFiles();

  it("keeps source files under the limit", async () => {
    for (const file of files) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (rel in KNOWN_LONG) continue;
      const lines = await lineCount(file);
      expect(lines, `${rel} has ${lines} lines, limit is ${LIMIT}`).toBeLessThanOrEqual(LIMIT);
    }
  });

  it("does not let a known long file grow", async () => {
    for (const file of files) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (!(rel in KNOWN_LONG)) continue;
      const lines = await lineCount(file);
      const max = KNOWN_LONG[rel]!;
      expect(lines, `${rel} has ${lines} lines, known max is ${max}`).toBeLessThanOrEqual(max);
    }
  });

  it("drops a known long file once it is short enough", async () => {
    for (const [rel] of Object.entries(KNOWN_LONG)) {
      const file = join(ROOT, ...rel.split("/"));
      const lines = await lineCount(file);
      expect(lines, `${rel} is now ${lines} lines — delete it from KNOWN_LONG`).toBeGreaterThan(
        LIMIT,
      );
    }
  });
});
