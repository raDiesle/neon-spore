import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commonGitDir, HERE_FILE, hereRoot, writeHere } from "../here.js";

const repoRoot = Bun.fileURLToPath(new URL("../../../", import.meta.url));

/**
 * A main checkout and one worktree of it, the way git lays them out: the
 * worktree's `.git` is a file naming its own git directory under the main
 * one, and that directory's `commondir` points back up.
 */
function fakeRepo(): { main: string; wt: string } {
  const base = mkdtempSync(join(tmpdir(), "ns-here-")).replaceAll("\\", "/");
  const main = `${base}/main`;
  const wt = `${base}/wt`;
  mkdirSync(`${main}/.git/worktrees/wt`, { recursive: true });
  mkdirSync(wt, { recursive: true });
  writeFileSync(`${main}/package.json`, "{}");
  writeFileSync(`${wt}/package.json`, "{}");
  writeFileSync(`${wt}/.git`, `gitdir: ${main}/.git/worktrees/wt\n`);
  writeFileSync(`${main}/.git/worktrees/wt/commondir`, "../..\n");
  return { main, wt };
}

describe("the pointer both trees share", () => {
  test("a worktree and its main checkout name the same git directory", () => {
    const { main, wt } = fakeRepo();
    expect(commonGitDir(main)).toBe(`${main}/.git`);
    expect(commonGitDir(wt)).toBe(`${main}/.git`);
  });

  test("with no pointer, the tree the server was started in is served", () => {
    const { main, wt } = fakeRepo();
    expect(hereRoot(main)).toBe(main);
    expect(hereRoot(wt)).toBe(wt);
  });

  test("`bun run here` in the worktree sends a main-started server to the worktree", () => {
    const { main, wt } = fakeRepo();
    expect(writeHere(wt)).toBe(`${main}/.git/${HERE_FILE}`);
    expect(hereRoot(main)).toBe(wt);
    expect(hereRoot(wt)).toBe(wt);
  });

  test("a pointer at a tree that was swept is ignored", () => {
    const { main, wt } = fakeRepo();
    writeHere(wt);
    rmSync(wt, { recursive: true });
    expect(hereRoot(main)).toBe(main);
  });

  test("a directory that is no checkout has nowhere to write", () => {
    const loose = mkdtempSync(join(tmpdir(), "ns-here-loose-"));
    expect(() => writeHere(loose)).toThrow();
    expect(hereRoot(loose)).toBe(loose);
  });
});

describe("the route a lane can name", () => {
  test("`dev:here` supervises with `--here`, `here` writes the pointer, and the harness has the entry", async () => {
    const pkg = await Bun.file(join(repoRoot, "package.json")).json();
    expect(pkg.scripts["dev:here"]).toContain("tools/dev/supervise.ts --here");
    expect(pkg.scripts["dev:here"]).toContain("tools/director/server.ts");
    expect(pkg.scripts.here).toBe("bun tools/dev/here.ts");
    const launch = await Bun.file(join(repoRoot, ".claude/launch.json")).json();
    const entry = launch.configurations.find((c: { name: string }) => c.name === "director-here");
    expect(entry?.runtimeArgs).toEqual(["run", "dev:here"]);
  });

  test("`supervise.ts --here` starts its child in the tree the pointer names", () => {
    const { main, wt } = fakeRepo();
    writeHere(wt);
    // The child stands in for the director: what it prints as its working
    // directory is the tree whose `tools/director/server.ts` a relative
    // command would have resolved to — the tree the `editing` line names.
    const run = Bun.spawnSync(
      [
        "bun",
        join(repoRoot, "tools/dev/supervise.ts"),
        "--here",
        "bun",
        "-e",
        "console.log(process.cwd())",
      ],
      { cwd: main, env: { ...process.env, NO_DEV_RESTART: "1" } },
    );
    const out = run.stdout.toString().replaceAll("\\", "/");
    expect(out).toContain(`supervising ${wt}`);
    expect(out.trim().split("\n").at(-1)).toBe(wt);
  });
});
