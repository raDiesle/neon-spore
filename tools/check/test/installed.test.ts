import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type Member, refusal, unlinked } from "../installed.js";

/**
 * The preflight that replaces `tsc`'s answer with the true one when a
 * worktree's install has gone stale.
 *
 * The last test is the one that matters and it asks the real checkout: every
 * workspace edge in this tree has a link behind it. It is what the preflight
 * itself runs, so a green suite here is a tree the typecheck can be believed
 * about.
 */

const ROOT = join(import.meta.dirname, "..", "..", "..");

const GAME: Member = {
  dir: "apps/game",
  name: "@neon-spore/game",
  deps: ["@neon-spore/sim", "@neon-spore/render"],
};
const SIM: Member = { dir: "packages/sim", name: "@neon-spore/sim", deps: [] };
const RENDER: Member = {
  dir: "packages/render",
  name: "@neon-spore/render",
  deps: ["@neon-spore/sim"],
};

describe("workspace links", () => {
  const all = [GAME, SIM, RENDER];
  const linked = (path: string) =>
    [
      "apps/game/node_modules/@neon-spore/sim",
      "apps/game/node_modules/@neon-spore/render",
      "packages/render/node_modules/@neon-spore/sim",
    ].includes(path);

  test("a complete install has nothing to say", () => {
    expect(unlinked(all, linked)).toEqual([]);
  });

  test("the consumer is named, not the package that moved", () => {
    const missing = unlinked(all, (p) => linked(p) && !p.startsWith("apps/game/"));
    expect(missing).toEqual([
      { dir: "apps/game", dep: "@neon-spore/sim" },
      { dir: "apps/game", dep: "@neon-spore/render" },
    ]);
  });

  test("a dependency outside the workspace is not guessed at", () => {
    const withExternal = [{ ...GAME, deps: [...GAME.deps, "wrangler"] }, SIM, RENDER];
    expect(unlinked(withExternal, linked)).toEqual([]);
  });

  test("the refusal says which package needs what, and why tsc would have lied", () => {
    const lines = refusal([{ dir: "tools/probe", dep: "@neon-spore/sim" }]);
    expect(lines[0]).toContain("1 workspace link is missing");
    // A plain `bun install` in a stale worktree says "no changes" and writes
    // nothing; the refusal must name the command that actually works.
    expect(lines[0]).toContain("bun install --force");
    expect(lines[1]).toBe("  tools/probe needs @neon-spore/sim");
    expect(lines[2]).toContain("--force");
    expect(lines[3]).toContain("Cannot find module");
  });
});

describe("this checkout", () => {
  test("every workspace edge has a link behind it", () => {
    const root = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      workspaces?: string[];
    };
    const members: Member[] = [];
    for (const glob of root.workspaces ?? []) {
      const base = glob.endsWith("/*") ? glob.slice(0, -2) : glob;
      if (!existsSync(join(ROOT, base))) continue;
      // `.claude` skipped for the reason `tools/test/tree-walk.test.ts` gives.
      const dirs = glob.endsWith("/*")
        ? readdirSync(join(ROOT, base), { withFileTypes: true })
            .filter((e) => e.isDirectory() && e.name !== ".claude" && e.name !== "node_modules")
            .map((e) => `${base}/${e.name}`)
        : [base];
      for (const dir of dirs) {
        const file = join(ROOT, dir, "package.json");
        if (!existsSync(file)) continue;
        const pkg = JSON.parse(readFileSync(file, "utf8")) as {
          name?: string;
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };
        if (!pkg.name) continue;
        members.push({
          dir,
          name: pkg.name,
          deps: [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})],
        });
      }
    }
    expect(members.length).toBeGreaterThan(0);
    expect(unlinked(members, (path) => existsSync(join(ROOT, path)))).toEqual([]);
  });
});
