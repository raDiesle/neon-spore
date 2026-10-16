import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { checkoutOf, touchedFiles } from "../after-edit-size.ts";

/**
 * **The size hook measures the copy the shell edited.** A session whose
 * project is the main checkout and whose shell works in a worktree was told
 * *frame-ship.ts is 244 lines* after a `sed -i` in the worktree, where the
 * file was 227: the relative path was read against the hook's own checkout
 * (`docs/queue.md`, 16 October 2026). Here a main checkout and a worktree
 * inside it, as the owner keeps them, each with its own copy of one file.
 */

const REL = "packages/render/src/frame-ship.ts";
const HOOK = join(import.meta.dirname, "..", "after-edit-size.ts");
let main = "";
let tree = "";

const lines = (n: number) => `${Array.from({ length: n }, (_, i) => `// ${i}`).join("\n")}\n`;

beforeAll(async () => {
  main = await mkdtemp(join(tmpdir(), "neon-spore-size-"));
  tree = join(main, ".claude", "worktrees", "lane");
  await mkdir(join(main, ".git"), { recursive: true });
  await mkdir(tree, { recursive: true });
  await Bun.write(join(tree, ".git"), "gitdir: ../../../.git/worktrees/lane\n");
  for (const [root, n] of [
    [main, 10],
    [tree, 245],
  ] as const) {
    await mkdir(dirname(join(root, REL)), { recursive: true });
    await Bun.write(join(root, REL), lines(n));
  }
});

afterAll(async () => {
  await rm(main, { recursive: true, force: true });
});

const sed = `sed -i '' 's/a/b/' ${REL}`;

describe("a file a worktree edited", () => {
  it("is found in the worktree, by the payload's cwd or a leading cd", () => {
    const want = [{ rel: REL, file: join(tree, REL) }];
    expect(touchedFiles(main, { cwd: tree, tool_input: { command: sed } })).toEqual(want);
    expect(
      touchedFiles(main, { cwd: main, tool_input: { command: `cd ${tree} && ${sed}` } }),
    ).toEqual(want);
    expect(touchedFiles(main, { cwd: main, tool_input: { command: sed } })).toEqual([
      { rel: REL, file: join(main, REL) },
    ]);
  });

  it("belongs to the nearest checkout above it", () => {
    expect(checkoutOf(join(tree, REL), "/elsewhere")).toBe(tree);
    expect(checkoutOf(join(main, REL), "/elsewhere")).toBe(main);
  });

  it("is measured there: the worktree's own line count, not the trunk's", async () => {
    const run = Bun.spawn(["bun", HOOK], { stdin: "pipe", stderr: "pipe", stdout: "pipe" });
    run.stdin.write(JSON.stringify({ tool_name: "Bash", cwd: tree, tool_input: { command: sed } }));
    run.stdin.end();
    const said = await new Response(run.stderr).text();
    expect(await run.exited).toBe(2);
    expect(said).toContain("245");
  });
});
