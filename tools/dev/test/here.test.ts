import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileCosts } from "../../test/figure.js";
import { commonGitDir, HERE_FILE, hereRoot, writeHere } from "../here.js";

// What this file is allowed to take, scaled to how busy the machine is
// (`tools/test/repo-time.ts`), because bun's five-second default is a flat number and
// these cases are not. One `bun` running the route script end to end. 270 ms alone.
fileCosts(300);

const repoRoot = Bun.fileURLToPath(new URL("../../../", import.meta.url));

/**
 * A main checkout and one worktree of it, the way git lays them out: the
 * worktree's `.git` is a file naming its own git directory under the main
 * one, and that directory's `commondir` points back up.
 *
 * `realpathSync` because the last case spawns a child and reads its own
 * `process.cwd()` back out: on macOS `tmpdir()` answers `/var/folders/…`, the
 * child stands in the `/private/var/folders/…` that symlink points at, and
 * the two are the same directory without being the same string.
 */
function fakeRepo(): { main: string; wt: string } {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "ns-here-"))).replaceAll("\\", "/");
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
