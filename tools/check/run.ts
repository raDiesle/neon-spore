#!/usr/bin/env bun

/**
 * The preflight `bun run check` runs before the typecheck
 *
 * It reads the workspace globs out of the root `package.json`, finds every
 * member that declares a name, and asks whether `node_modules` has a link for
 * it. One line per missing package and a non-zero exit, which is what stops the
 * typecheck from answering the question wrongly (`installed.ts` says why).
 *
 * It is silent when the install is good, because it runs before every check and
 * a line nobody reads is a line that trains people not to read the next one.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type Member, refusal, unlinked } from "./installed.js";

const ROOT = join(import.meta.dirname, "..", "..");

/**
 * A `packages/*` glob, expanded — one level, which is every glob this repo uses.
 *
 * `.claude` is skipped for the reason `tools/test/tree-walk.test.ts` gives: a
 * worktree is a full copy of the repository sitting inside the repository. No
 * glob here reaches it today; the skip is so that adding one is not also a
 * silent change to what is scanned.
 */
function expand(glob: string): string[] {
  if (!glob.endsWith("/*")) return [glob];
  const base = glob.slice(0, -2);
  const dir = join(ROOT, base);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== ".claude" && e.name !== "node_modules")
    .map((e) => `${base}/${e.name}`);
}

function read(relPath: string): Record<string, unknown> | undefined {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) return undefined;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

/** Both dependency blocks a workspace member can name another member in. */
function dependencies(pkg: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const field of ["dependencies", "devDependencies"]) {
    const block = pkg[field];
    if (block && typeof block === "object") out.push(...Object.keys(block));
  }
  return out;
}

const root = read("package.json") ?? {};
const globs = Array.isArray(root.workspaces) ? (root.workspaces as string[]) : [];
const members: Member[] = [];
for (const glob of globs) {
  for (const dir of expand(glob)) {
    const pkg = read(`${dir}/package.json`);
    const name = typeof pkg?.name === "string" ? pkg.name : "";
    if (name && pkg) members.push({ dir, name, deps: dependencies(pkg) });
  }
}

const missing = unlinked(members, (path) => existsSync(join(ROOT, path)));
if (missing.length > 0) {
  for (const line of refusal(missing)) console.error(line);
  process.exit(1);
}
