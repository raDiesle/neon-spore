/**
 * Where a landing meets the bun it runs on rather than the tree it lands.
 *
 * Two places: the pin, asked before anything moves, and the frozen install
 * after the replay.
 *
 * Out of `run.ts` so that file stays the straight line it is, and because
 * both are about the same thing — a bun below `.bun-version` cannot read
 * `bun.lock`, and the install is where that used to come out, after the
 * rebase, as *Unknown lockfile version* with no name on it (`bun-pin.ts`).
 */

import { pinRefusal, WANTED } from "../hooks/bun-pin.js";

/**
 * The lines a landing prints and stops on when the running bun is below the
 * pin, or `null` when it is fine. A `--sweep` installs nothing and passes:
 * its work reached the trunk under an earlier landing that had already been
 * through this. `bun run check` asks the same question of itself, off the
 * same comparison (`pinRefusal`, `tools/check/run.ts`).
 */
export function oldBunRefusal(running: string, sweepOnly: boolean): string[] | null {
  if (sweepOnly) return null;
  return pinRefusal(running, WANTED, "moved");
}

/**
 * `bun install --frozen-lockfile` at `root`; its stderr on failure, `null`
 * when it passed.
 *
 * A replay can bring a workspace package the lane never had — `tools/orphans`
 * arrived that way — and `node_modules` is then stale between the rebase and
 * the check. What the check reports is `Cannot find module '@neon-spore/…'` in
 * a file the lane never opened, which reads as a rebase disaster and is
 * thirteen milliseconds of work. Cheap, idempotent, and it runs after the
 * replay rather than before it, which is the whole point.
 *
 * `--frozen-lockfile` because a silent lockfile drift here is a landing
 * problem, not a `bun run check` problem — the check would report it as a
 * mysterious dependency failure with no mention of the lockfile at all.
 */
export async function installFrozen(root: string): Promise<string | null> {
  const install = Bun.spawn(["bun", "install", "--frozen-lockfile"], {
    cwd: root,
    stdout: "ignore",
    stderr: "pipe",
  });
  const [err, code] = await Promise.all([new Response(install.stderr).text(), install.exited]);
  return code === 0 ? null : err.trim();
}
