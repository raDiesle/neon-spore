import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
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
 * Directories this never descends into. **`.claude` is here because a
 * worktree is a full copy of the repository sitting inside the repository**:
 * the owner keeps every open lane under `.claude/worktrees/`, and without
 * this the scan reports each lane's own `build.ts` and `build-stamp.ts` as
 * offenders — the same allowed files over and over, from a path `ALLOWED`
 * cannot match because it is relative to the outer root. In a fresh clone
 * there are no worktrees, which is why the hole was invisible.
 */
const SKIP = new Set([".claude", "node_modules", "dist", ".git", "legacy", "assets"]);

function sources(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) sources(full, found);
    else if (entry.name.endsWith(".ts")) found.push(full);
  }
  return found;
}

describe("the build stamp", () => {
  it("is read through BUILD_STAMP, never through the raw identifier", () => {
    const offenders = sources(root)
      .filter((file) => readFileSync(file, "utf8").includes("__BUILD_DATE__"))
      .map((file) => relative(root, file))
      .filter((file) => !ALLOWED.has(file.split("/").join(sep)));
    expect(offenders).toEqual([]);
  });

  it("says something a person can read under a dev server", async () => {
    const { BUILD_STAMP, buildStampText } = await import("../build-stamp.js");
    expect(BUILD_STAMP).toBe("dev");
    expect(buildStampText()).toBe("DEV BUILD");
  });
});
