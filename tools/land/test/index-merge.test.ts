import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { keepLaneRows } from "../index-merge.js";
import { replay } from "../replay.js";

/**
 * The `docs/INDEX.md` conflict two lanes cause by both adding a file, settled
 * by regenerating the table and putting the lane's own words back over it.
 *
 * The end-to-end half makes a repository the generator can actually walk — the
 * three source roots, a `## Code` heading and the two markers — because the
 * whole claim is about what `bun run index` writes when it is run in the middle
 * of a rebase, and nothing short of a rebase asks it that.
 */

function indexFile(...rows: string[]): string {
  return `# Context map

One line per file.

## Code

<!-- index:code:start -->

### tools

| Path | One line |
|---|---|
${rows.join("\n")}

<!-- index:code:end -->
`;
}

const ONE = "| `tools/one.ts` | The first tool |";
const TWO = "| `tools/two.ts` | The second tool |";

describe("keeping a lane's own rows", () => {
  test("a row the lane wrote survives the regeneration", () => {
    const base = indexFile(ONE);
    const trunk = indexFile(ONE, TWO);
    const mine = "| `tools/three.ts` | Words only this lane knows |";
    const lane = indexFile(ONE, mine);
    const generated = indexFile(ONE, TWO, "| `tools/three.ts` | A derived first sentence |");
    expect(keepLaneRows(base, trunk, lane, generated)).toBe(indexFile(ONE, TWO, mine));
  });

  test("a row the lane never touched keeps the generated text", () => {
    const base = indexFile(ONE);
    const trunk = indexFile(ONE, TWO);
    expect(keepLaneRows(base, trunk, indexFile(ONE), indexFile(ONE, TWO))).toBe(
      indexFile(ONE, TWO),
    );
  });

  test("both sides rewriting one row is not merged", () => {
    const base = indexFile(ONE);
    const trunk = indexFile("| `tools/one.ts` | The trunk's words |");
    const lane = indexFile("| `tools/one.ts` | The lane's words |");
    expect(keepLaneRows(base, trunk, lane, trunk)).toBeNull();
  });
});

describe("replaying two lanes that each added a file", () => {
  let root = "";

  async function run(args: string[]): Promise<void> {
    const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
    const [err, code] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
    if (code !== 0) throw new Error(`git ${args.join(" ")}: ${err.trim()}`);
  }

  test("the landing goes through with the table regenerated", async () => {
    root = await mkdtemp(join(tmpdir(), "index-merge-"));
    try {
      await mkdir(join(root, "tools"), { recursive: true });
      await mkdir(join(root, "docs"), { recursive: true });
      await writeFile(
        join(root, "tools", "one.ts"),
        "/** The first tool */\nexport const a = 1;\n",
      );
      await writeFile(join(root, "docs", "INDEX.md"), indexFile(ONE));
      await run(["init", "-b", "main"]);
      await run(["config", "user.email", "t@t"]);
      await run(["config", "user.name", "t"]);
      await run(["add", "-A"]);
      await run(["commit", "-m", "one tool"]);

      // The lane adds a file and writes its own line for it.
      await run(["checkout", "-b", "lane"]);
      const mine = "| `tools/three.ts` | Words only this lane knows |";
      await writeFile(join(root, "tools", "three.ts"), "/** Derived. */\nexport const c = 3;\n");
      await writeFile(join(root, "docs", "INDEX.md"), indexFile(ONE, mine));
      await run(["add", "-A"]);
      await run(["commit", "-m", "a third tool"]);

      // The trunk adds one of its own in the same place.
      await run(["checkout", "main"]);
      await writeFile(
        join(root, "tools", "two.ts"),
        "/** The second tool */\nexport const b = 2;\n",
      );
      await writeFile(join(root, "docs", "INDEX.md"), indexFile(ONE, TWO));
      await run(["add", "-A"]);
      await run(["commit", "-m", "a second tool"]);

      await run(["checkout", "lane"]);
      const out = await replay(root, "main");
      expect(out.ok).toBe(true);
      expect(out.resolved).toEqual(["docs/INDEX.md"]);
      const landed = await Bun.file(join(root, "docs", "INDEX.md")).text();
      expect(landed).toContain(TWO);
      expect(landed).toContain(mine);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 20_000);
});
