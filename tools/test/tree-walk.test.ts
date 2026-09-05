import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";

/**
 * **A worktree is a full copy of the repository sitting inside the
 * repository**, and anything that walks the tree by recursing into
 * directories has to know it.
 *
 * The owner keeps every open lane under `.claude/worktrees/`, so a walk that
 * descends there sees each lane's whole checkout: `tools/test/build-stamp.test.ts`
 * reported the same four allowed files over and over as offenders, from paths
 * its `ALLOWED` set could not match because they were relative to the outer
 * root. About a hundred of them, on the owner's machine. **In a fresh clone
 * there are no worktrees, so it landed green** — which is the whole reason a
 * rule like this needs holding rather than remembering.
 *
 * `packages/sim/test/copies.test.ts` had the same hole from the other side: it
 * tested absolute paths, and every file in a lane's own checkout failed the
 * `includes` that was supposed to exclude them, so the guard passed vacuously
 * in exactly the copy work is done in.
 *
 * So this is the rule, held over the repository's own source: **a file that
 * recurses into subdirectories names `.claude`.** Reading one directory is
 * not walking a tree and is left alone — three of the director's tests do
 * exactly that over a folder of drafts.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * The string literal, quotes and all, rather than the bare word.
 *
 * Biome writes double quotes, so this is what naming the directory in code
 * looks like — and it is deliberately not what naming it in a *comment* looks
 * like. The first draft of this test looked for the bare word and passed a
 * file whose skip list had lost `.claude` while its paragraph explaining the
 * skip was still sitting above it, which is the exact failure a prose-shaped
 * guard is for.
 */
const SKIPS_IT = '".claude"';

/** Files that walk a tree: they read a directory *and* go into the ones they
 * find. The second half is what a single `readdirSync` of one folder has not. */
export function recursesIntoDirectories(source: string): boolean {
  return source.includes("readdirSync") && /isDirectory\s*\(/.test(source);
}

describe("a walk of the repository", () => {
  const files = [...new Glob("{packages,apps,tools}/**/*.ts").scanSync(ROOT)].filter(
    (f) => !f.includes("node_modules") && !f.includes("dist"),
  );

  it("finds source to look at, so a moved glob cannot pass this vacuously", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("skips `.claude`, wherever it recurses into directories", async () => {
    const blind: string[] = [];
    for (const file of files) {
      const source = await Bun.file(join(ROOT, file)).text();
      if (recursesIntoDirectories(source) && !source.includes(SKIPS_IT)) blind.push(file);
    }
    expect(
      blind,
      `these walk into every directory they find and would descend into a lane's own checkout under .claude/worktrees. Naming it in a comment is not skipping it — put ${SKIPS_IT} in the skip list: ${blind.join(", ")}`,
    ).toEqual([]);
  });
});

describe("recursesIntoDirectories", () => {
  it("is true for a walk that goes into what it finds", () => {
    expect(
      recursesIntoDirectories(
        "for (const e of readdirSync(d)) if (statSync(x).isDirectory()) go();",
      ),
    ).toBe(true);
  });

  /** Three of the director's tests read one folder of drafts and stop, which
   * is not a walk and has nothing to skip. */
  it("is false for reading a single directory", () => {
    expect(
      recursesIntoDirectories("const FILES = readdirSync(DIR).filter(f => f.endsWith('.ts'));"),
    ).toBe(false);
  });
});
