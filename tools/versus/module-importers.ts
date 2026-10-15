import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { filesHolding } from "./grep-files.js";
import { resolveSpec } from "./take-function.js";

/**
 * **Who imports a module**, for `adopt`'s function take (`take-function-fs.ts`):
 * a module the winner's record pointed at is deleted only when nothing else
 * reads it. Its own file since 15 October 2026, when the search learned to ask
 * `git grep` first (`grep-files.ts`) and `take-function-fs.ts` reached its
 * ceiling.
 */

/** Every source file under `packages`, `apps` and `tools` that imports
 * `file`, other than `except` — repo-relative, forward slashes. A relative
 * specifier ends in the file's own name, so only the files `git grep` finds
 * holding it are read (`grep-files.ts`); the walk is for a tree git cannot
 * answer for. */
export function importersOf(root: string, file: string, except: string): string[] {
  const name = posix.basename(file).replace(/\.tsx?$/, "");
  const listed = filesHolding(root, ["packages", "apps", "tools"], [`/${name}`]);
  if (listed === null) {
    const hits: string[] = [];
    for (const top of ["packages", "apps", "tools"])
      walk(join(root, top), root, file, except, hits);
    return hits;
  }
  return listed
    .filter((rel) => rel.endsWith(".ts") && rel !== except)
    .filter((rel) => imports(rel, readFileSync(join(root, rel), "utf8"), file))
    .sort();
}

/** Whether `src`, the text of `rel`, imports `file` by a relative specifier. */
function imports(rel: string, src: string, file: string): boolean {
  for (const m of src.matchAll(/from\s*"(\.[^"]+)"/g)) {
    if (resolveSpec(rel, m[1] ?? "") === file) return true;
  }
  return false;
}

function walk(dir: string, root: string, file: string, except: string, hits: string[]): void {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    // `.claude` by name as well as by its dot: a lane's own checkout lives
    // under `.claude/worktrees`, and a walk that descended into it would
    // count another tree's readers as this one's.
    if (name === "node_modules" || name === "dist" || name === ".claude") continue;
    if (name.startsWith(".")) continue;
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      walk(abs, root, file, except, hits);
      continue;
    }
    if (!name.endsWith(".ts")) continue;
    const rel = posix.normalize(abs.slice(root.length).replace(/\\/g, "/").replace(/^\//, ""));
    if (rel === except) continue;
    if (imports(rel, readFileSync(abs, "utf8"), file)) hits.push(rel);
  }
}
