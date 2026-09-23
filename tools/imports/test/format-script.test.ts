import { describe, expect, it } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileCosts } from "../../test/figure.js";

// What this file is allowed to take, scaled to how busy the machine is
// (`tools/test/repo-time.ts`), because bun's five-second default is a flat number and
// these cases are not. Three `biome` child processes, one per case — running the real
// binary the script runs is the whole point of them. 130 ms alone.
fileCosts(150);

/**
 * `bun run format` writes, and the one thing it must not write is a sort.
 *
 * A sort is a *move*, and a doc comment written above an import does not move
 * with the statement: after one, the comment can sit above a blank line
 * attached to nothing, or above somebody else's import, reading as if it had
 * been written about that. It is the harm `tools/hooks/guard.ts` blocks
 * `--unsafe` for, and until 14 September 2026 it arrived through the command
 * the guard sends a session to instead — silently, inside a lane, between
 * adding an import and the next format, where nobody reads the diff.
 *
 * So the sort is a command of its own, `bun run imports:sort`, and `bun run
 * lint` is still what asks for it. This holds the two apart by running both.
 */

const root = join(import.meta.dir, "..", "..", "..");
const biome = join(root, "node_modules", ".bin", "biome");
const scripts = (
  JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts: Record<string, string>;
  }
).scripts;

const UNSORTED = [
  "/** The tick counter is the only clock the simulation has. */",
  'import { zebra } from "./z.ts";',
  "/** Kept for the hull decision of 3 September. */",
  'import { alpha } from "./a.ts";',
  "",
  "console.log(zebra, alpha);",
  "",
].join("\n");

/**
 * Runs a root script's biome invocation over one file, in a directory outside
 * the repository: the run then answers for the script's flags alone, and not
 * for whether `biome.json`'s file list happens to reach a fixture.
 */
function run(script: string, source: string): string {
  const dir = mkdtempSync(join(tmpdir(), "neon-spore-format-"));
  try {
    const file = join(dir, "demo.ts");
    writeFileSync(file, source);
    const args = script.split(" ").slice(1);
    expect(args.at(-1)).toBe(".");
    const child = Bun.spawnSync([biome, ...args.slice(0, -1), file], {
      cwd: dir,
      stdout: "ignore",
      stderr: "ignore",
    });
    expect(child.exitCode).toBe(0);
    return readFileSync(file, "utf8");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("bun run format", () => {
  it("leaves every doc comment on the statement it was written above", () => {
    expect(run(scripts.format ?? "", UNSORTED)).toBe(UNSORTED);
  });

  it("still formats, and still takes the safe lint fix", () => {
    const written = run(scripts.format ?? "", "let kept = 1;\nconsole.log( kept );\n");
    expect(written).toBe("const kept = 1;\nconsole.log(kept);\n");
  });
});

describe("bun run imports:sort", () => {
  it("is the step that sorts, and it is why the sort is named", () => {
    const written = run(scripts["imports:sort"] ?? "", UNSORTED);
    const lines = written.split("\n");
    expect(lines[2]).toBe("/** Kept for the hull decision of 3 September. */");
    expect(lines[3]).toBe('import { alpha } from "./a.ts";');
    expect(lines[4]).toBe('import { zebra } from "./z.ts";');
    // The comment about the tick counter now stands over a blank line, and the
    // one about the hull decision reads as if it were about `alpha`. Both are
    // true of any sort; a session reads the diff because the step is its own.
    expect(lines[1]).toBe("");
  });
});
