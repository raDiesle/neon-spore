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
const KNOWN_LONG: Record<string, number> = {
  "apps/game/src/input.ts": 257,
};

function sourceFiles(): string[] {
  const glob = new Glob("{packages,apps,tools}/*/src/**/*.ts");
  return [...glob.scanSync(ROOT)]
    .map((f) => join(ROOT, f))
    .filter((f) => !f.includes("node_modules") && !f.includes("dist") && !f.endsWith(".test.ts"));
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
