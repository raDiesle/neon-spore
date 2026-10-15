import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { filesHolding } from "../grep-files.js";
import { importersOf } from "../importers.js";

/**
 * **Who still imports a slot, asked of `git grep` first** (`grep-files.ts`):
 * `drop` read every source of a fresh worktree to answer this and waited
 * minutes on the disk (15 October 2026). The same tree is built twice — once a
 * git checkout, once not — and both must find the same importers and never
 * the copy a package's `node_modules` holds.
 */

const IMPORTER = `import { look } from "../../tools/versus/candidates/creature-torch/a.js";\n`;
const NAMER = `export const SLOT = "creature:torch";\n`;

function tree(git: boolean): string {
  const root = mkdtempSync(join(tmpdir(), "versus-importers-"));
  const put = (f: string, text: string) => {
    mkdirSync(dirname(join(root, f)), { recursive: true });
    writeFileSync(join(root, f), text);
  };
  put("tools/versus/candidates/creature-torch/a.ts", "export const look = 1;\n");
  put("tools/versus/candidates/creature-torch/b.ts", IMPORTER);
  put("packages/render/src/torch-sheet.ts", IMPORTER);
  put("packages/render/test/torch.test.ts", NAMER);
  put("packages/render/node_modules/@x/y/index.ts", IMPORTER);
  put("packages/render/src/plain.ts", "export const plain = 0;\n");
  if (git) {
    put(".gitignore", "node_modules\n");
    const run = (...args: string[]) => spawnSync("git", args, { cwd: root });
    run("init", "-q");
    run("add", "tools", "packages/render/src", ".gitignore");
    run("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "tree");
  }
  return root;
}

const roots: string[] = [];
beforeAll(() => {
  roots.push(tree(true), tree(false));
});
afterAll(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});

describe("who still imports a slot", () => {
  it("is the same answer from git as from the walk, and never inside node_modules", () => {
    const want = ["packages/render/src/torch-sheet.ts", "packages/render/test/torch.test.ts"];
    for (const root of roots) expect(importersOf("creature:torch", root)).toEqual(want);
  });

  it("asks git, which names an untracked file and leaves node_modules alone", () => {
    const found = filesHolding(roots[0] as string, ["packages", "tools"], ["creature-torch/"]);
    expect(found).not.toBeNull();
    expect(found?.some((f) => f.includes("node_modules"))).toBe(false);
    // The test file was never added: a lane's importer before its commit.
    expect(filesHolding(roots[0] as string, ["packages"], ["creature:torch"])).toEqual([
      "packages/render/test/torch.test.ts",
    ]);
  });

  it("says git cannot answer outside a checkout, so the caller walks", () => {
    expect(filesHolding(roots[1] as string, ["packages"], ["creature:torch"])).toBeNull();
  });
});
