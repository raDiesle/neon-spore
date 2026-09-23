/**
 * Where the repository is, from inside this directory.
 *
 * Its own file so that `bun run versus index` can run when the registry is
 * broken — which is exactly when somebody wants to regenerate it. Everything
 * else here reaches the candidates through `candidates/index.js`, and a module
 * that imports that cannot be the one that repairs it.
 */

import { join } from "node:path";

export const ROOT = Bun.fileURLToPath(new URL("../../", import.meta.url));
/** Where the candidates are under a repository — this one, or a test's. */
export function candidatesUnder(root: string): string {
  return join(root, "tools", "versus", "candidates");
}

export const CANDIDATES = candidatesUnder(ROOT);
