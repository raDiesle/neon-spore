#!/usr/bin/env bun

/**
 * `bun run dev` — a hot server, and a hand on its shoulder.
 *
 * `bun --hot` reloads a module when its file changes, and that is exactly what
 * a person editing one file wants. It is not what a person wants after `git
 * pull`, `git rebase`, `bun run land` or a checkout: the tree is rewritten
 * over a second or two, the bundler starts on the first file and finishes
 * against a tree that has moved underneath it, and the incremental graph it
 * keeps is half of each revision. The page reloads and throws on a name its
 * neighbour no longer exports; every edit after that rebuilds the same
 * poisoned graph. Restarting was the only cure, and finding that out cost a
 * confused minute every time.
 *
 * This runs the hot server as a child, watches the checkout's git directory,
 * and when the tree stops moving gives the child a fresh start. One restart
 * per git operation, none at all for ordinary editing — hot reload is
 * untouched for the case it is good at. The open page comes back on its own:
 * the dev client reconnects to the new server and reloads itself.
 *
 *   bun tools/dev/supervise.ts <command> [args…]
 *
 * A git operation that also rewrote `bun.lock` brought dependencies with it,
 * so the restart is preceded by `bun install`: without it the fresh server
 * bundles a correct import against the `node_modules` of the revision before
 * and reports it as unresolvable.
 *
 * Set `NO_DEV_RESTART=1` to run the child bare, with the watcher off.
 */

import { watch } from "node:fs";
import { freePort } from "../ports.js";
import { gitDirOf, isTreeMove, locked, lockStamp } from "./tree-moves.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const argv = process.argv.slice(2);

/**
 * `--pin=NAME`: an environment variable holding `0`, meaning "any free port",
 * is settled to a real one here and handed to every child. Without it a
 * restart would move a throwaway server to an address the open tab has never
 * heard of, which is a worse way to lose a page than the one this file fixes.
 */
const env = { ...process.env };
if (argv[0]?.startsWith("--pin=")) {
  const name = argv.shift()!.slice("--pin=".length);
  if (env[name] === "0" || env[name] === undefined) env[name] = String(await freePort());
}

if (argv.length === 0) {
  console.error("usage: bun tools/dev/supervise.ts [--pin=ENV_VAR] <command> [args…]");
  process.exit(1);
}

/**
 * How long the tree must hold still before the child is restarted. Long enough
 * that a rebase replaying several commits is one restart rather than one per
 * commit, short enough that nobody sits looking at a stale page.
 */
const QUIET_MS = Number(process.env.DEV_RESTART_QUIET_MS ?? 800);

function spawn(): Bun.Subprocess {
  return Bun.spawn(argv, { cwd: root, env, stdio: ["inherit", "inherit", "inherit"] });
}

/** What `bun.lock` looked like the last time the tree was known to be installed. */
let installed = lockStamp(root);

/**
 * Bring `node_modules` up to the lockfile, when and only when the lockfile has
 * moved since the last time this asked. An install that has nothing to do is
 * quick, but it is not free, and a person editing one file should never see
 * one.
 */
async function reinstall(): Promise<void> {
  const stamp = lockStamp(root);
  if (stamp === undefined || stamp === installed) return;
  console.log("the lockfile moved — installing, so the bundle is not built against the old tree");
  const install = Bun.spawn(["bun", "install"], {
    cwd: root,
    env,
    stdio: ["inherit", "inherit", "inherit"],
  });
  await install.exited;
  installed = lockStamp(root);
}

let child = spawn();
/** Set only when the watcher is the reason the child is going away. */
let restarting = false;

const gitDir = process.env.NO_DEV_RESTART ? undefined : gitDirOf(root);
if (gitDir === undefined) {
  if (!process.env.NO_DEV_RESTART) console.log("no git directory found — restarts are off");
} else {
  let moved = 0;
  /** One timer for a whole operation, however many files it writes. */
  let waiting = false;

  const settle = (): void => {
    // Still arriving, or git still holds the index: this is the middle of the
    // operation rather than the end of it. Ask again rather than restarting
    // into a tree that is about to change once more.
    if (Date.now() - moved < QUIET_MS || locked(gitDir)) {
      setTimeout(settle, QUIET_MS);
      return;
    }
    waiting = false;
    console.log("the tree moved — restarting, so the bundle is not half of each revision");
    restarting = true;
    child.kill();
  };

  watch(gitDir, (_event, name) => {
    if (name === null || !isTreeMove(String(name))) return;
    moved = Date.now();
    if (waiting) return;
    waiting = true;
    setTimeout(settle, QUIET_MS);
  });
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    child.kill();
    process.exit(0);
  });
}

while (true) {
  const code = await child.exited;
  // The child stopped for its own reasons — an idle exit, a crash, or the
  // human's Ctrl-C reaching it first. The supervisor has nothing to add.
  if (!restarting) process.exit(code);
  restarting = false;
  await reinstall();
  child = spawn();
}
