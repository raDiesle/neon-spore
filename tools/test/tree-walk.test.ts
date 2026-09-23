import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import { read } from "../../packages/sim/test/source-scan.ts";
import { fileCosts } from "./figure.js";

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

/**
 * **What this file is allowed to take**, scaled to how busy the machine is
 * (`tools/test/repo-time.ts`), for the whole file the way the frame tests do
 * it — every case here reads off the same disk, so one number covers them.
 *
 * It ran on bun's flat five-second default and went red once inside `bun run
 * check`, where eight to thirteen shards read the one disk at once, and green
 * on the re-run with nothing changed. The heaviest case is the walk below:
 * eighteen hundred files opened sixty-four at a time, 40 ms alone with the
 * page cache warm and 90 ms with it dropped, on the cloud image on 18
 * September 2026. The cold figure is the one written down — the claim has to
 * hold on a machine that has not read these files yet.
 *
 * Under an idle machine this is still five seconds, because `loadedTimeout`
 * floors there and may only ever give a test *more* time. What it buys is the
 * loaded case, which is the only one that ever failed.
 */
fileCosts(120);

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

/**
 * How many of the eighteen hundred files are open at once.
 *
 * **They were read one at a time until 16 September 2026**, an `await` per file
 * inside a `for`, which is 350 ms alone and crossed the 5000 ms cap inside
 * `bun run check` — thirteen shards reading the one disk — and took a landing
 * red. The next run was green with nothing changed, which is the worst shape a
 * red check has: it teaches the next session to re-run rather than to read.
 *
 * Sixty-four at a time rather than all of them, because a `Promise.all` over
 * the whole list opens eighteen hundred descriptors at once and the point is to
 * stop being the thing that falls over under load. Raising the cap was the
 * other way and is the second choice for the reason `FRAME_TIMEOUT_MS` in
 * `packages/render/test/frame-harness.ts` already gives: a cap raised to cover
 * contention hides whatever gets slow next.
 */
const AT_ONCE = 64;

/** Every file's text, in the order it was asked for. */
async function sources(paths: readonly string[]): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < paths.length; i += AT_ONCE) {
    const chunk = paths.slice(i, i + AT_ONCE);
    out.push(...(await Promise.all(chunk.map((f) => Bun.file(join(ROOT, f)).text()))));
  }
  return out;
}

describe("a walk of the repository", () => {
  // The same list every other walk over this tree asks, rather than a fourth
  // copy of it: `node_modules`, `dist`, `.claude` and the probe's scratch
  // directory (`packages/sim/test/source-scan.ts` says why the last one).
  const files = [...new Glob("{packages,apps,tools}/**/*.ts").scanSync(ROOT)].filter(read);

  it("finds source to look at, so a moved glob cannot pass this vacuously", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("skips `.claude`, wherever it recurses into directories", async () => {
    const read = await sources(files);
    const blind = files.filter((_, i) => {
      const source = read[i] as string;
      return recursesIntoDirectories(source) && !source.includes(SKIPS_IT);
    });
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

describe("sources", () => {
  it("hands back a text per path, in the order asked for", async () => {
    const here = "tools/test/tree-walk.test.ts";
    const two = await sources([here, "package.json"]);
    expect(two).toHaveLength(2);
    // Read in chunks and gathered, so the order is the caller's and not the
    // order the disk answered in — the walk above indexes one against the other.
    expect(two[0]).toContain("AT_ONCE");
    expect(two[1]).toContain('"name"');
  });

  it("reads more files than fit in one chunk", async () => {
    const files = [...new Glob("packages/sim/src/*.ts").scanSync(ROOT)];
    expect(files.length, "no sim source to read").toBeGreaterThan(AT_ONCE);
    expect(await sources(files)).toHaveLength(files.length);
  });
});
