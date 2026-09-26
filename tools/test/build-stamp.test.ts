import { describe, expect, it } from "bun:test";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * `__BUILD_DATE__` is a name that exists only inside a finished bundle.
 *
 * The two build scripts substitute it and nothing else does, so under a dev
 * server — `bun run dev:game`, or the director's own `/game` door — the
 * identifier is simply absent, and reading it is a `ReferenceError` rather
 * than a missing date. That is what happened: the settings page read the raw
 * name, and the main menu opened from the director died before it drew, with
 * a stack that pointed at the menu and not at the build.
 *
 * `tools/build-stamp.ts` is the answer, and its `typeof` guard is the whole
 * reason it exists — a date in a bundle, `dev` under a server. This holds
 * everybody to it: the raw identifier belongs to the two scripts that define
 * it and to the one module that guards it.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Where the name is allowed, and why: it is defined, or it is guarded. */
const ALLOWED = new Set([
  join("apps", "game", "build.ts"),
  join("tools", "director", "build.ts"),
  join("tools", "build-stamp.ts"),
  join("tools", "test", "build-stamp.test.ts"),
]);

/**
 * **The files are the ones `git` names, and `git grep` reads them.** This
 * used to walk the disk itself and hand every `.ts` file to `Bun.file`, and
 * it passed its 5-second timeout twice under a contended check: on
 * 16 September 2026 with the reads in turn, and on 26 September with them all
 * at once. Alone, one `git grep` reads the same files in about 150 ms, and it
 * needs no list of what to skip. A worktree under `.claude/worktrees/` is a
 * repository of its own, which `git grep` never descends into, and
 * `node_modules`, `dist` and a wrangler's `.wrangler/tmp` — written while
 * this runs, by the relay's own shard — are all in `.gitignore`.
 * `--untracked` keeps a file a lane has added and not committed yet in reach.
 * `legacy/` is left out by name: reference only, never built.
 */
function mentions(name: string): string[] {
  const out = Bun.spawnSync(
    ["git", "grep", "-l", "--untracked", "-F", name, "--", "*.ts", ":!legacy"],
    { cwd: root },
  );
  // 1 is `git grep` finding nothing, which is an answer; anything else is not.
  if (out.exitCode !== 0 && out.exitCode !== 1) throw new Error(out.stderr.toString());
  return out.stdout.toString().split("\n").filter(Boolean);
}

describe("the build stamp", () => {
  it("is read through BUILD_STAMP, never through the raw identifier", () => {
    const offenders = mentions("__BUILD_DATE__").filter(
      (file) => !ALLOWED.has(file.split("/").join(sep)),
    );
    expect(offenders).toEqual([]);
  });

  it("says something a person can read under a dev server", async () => {
    const { BUILD_STAMP, buildStampText } = await import("../build-stamp.js");
    expect(BUILD_STAMP).toBe("dev");
    expect(buildStampText()).toBe("DEV BUILD");
  });
});
