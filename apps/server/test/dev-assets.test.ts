import { expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureAssets } from "../dev.js";

/**
 * Wrangler refuses to start when `assets.directory` is missing, and a fresh
 * worktree has no `apps/game/dist` until something builds one. `dev.ts` makes
 * it before spawning wrangler, so `room-shot` and `relay:check:all` do not
 * depend on the order they happen to start their two servers in.
 */
test("dev.ts makes the assets directory wrangler insists on", () => {
  const tree = mkdtempSync(join(tmpdir(), "neon-spore-dev-assets-"));
  try {
    const dir = ensureAssets(tree);
    expect(dir).toBe(join(tree, "apps", "game", "dist"));
    expect(statSync(dir).isDirectory()).toBe(true);
    // And leaves one that is there alone.
    expect(ensureAssets(tree)).toBe(dir);
    expect(existsSync(dir)).toBe(true);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});
