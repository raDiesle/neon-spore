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
 *   bun tools/dev/supervise.ts [--here] [--pin=ENV_VAR] <command> [args…]
 *
 * `--here` binds to the tree `bun run here` last named rather than to the one
 * this file lives in — the route for looking at a worktree's director from a
 * session the harness opened in the main checkout (`here.ts`).
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
import { announce } from "../running.js";
import { harnessPort } from "./harness-port.js";
import { hereRoot } from "./here.js";
import { gitDirOf, isTreeMove, locked, lockStamp } from "./tree-moves.js";

const argv = process.argv.slice(2);

/**
 * Which tree the child serves. This file's own by default; with `--here`, the
 * one the pointer names (or the directory this was started in, when there is
 * no pointer). The child is spawned *in* that tree, so a relative command like
 * `bun --hot tools/director/server.ts` resolves to that tree's server — which
 * then names it on its `editing` line, the check the lane skill asks for.
 */
const here = argv[0] === "--here" && argv.shift() !== undefined;
const root = here ? hereRoot(process.cwd()) : Bun.fileURLToPath(new URL("../../", import.meta.url));

/**
 * `--pin=NAME`: an environment variable holding `0`, meaning "any free port",
 * is settled to a real one here and handed to every child — the harness's own
 * pick when it made one (`harness-port.ts`). Without it a
 * restart would move a throwaway server to an address the open tab has never
 * heard of, which is a worse way to lose a page than the one this file fixes.
 */
const env = { ...process.env };
if (argv[0]?.startsWith("--pin=")) {
  const name = argv.shift()!.slice("--pin=".length);
  if (env[name] === "0" || env[name] === undefined) {
    env[name] = String(harnessPort(env) ?? (await freePort()));
  }
  // A port nobody can derive is a port nobody can find, and it is printed once
  // — on a stdout a session reading it with `| head` never sees. Written down
  // so `bun run port` can report what is running (`tools/running.ts`).
  announce(root, name, Number(env[name]));
}

if (argv.length === 0) {
  console.error("usage: bun tools/dev/supervise.ts [--here] [--pin=ENV_VAR] <command> [args…]");
  process.exit(1);
}
console.log(`supervising ${root}`);

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

/** Set only when the watcher is the reason the child is going away. */
let restarting = false;
/** The supervised process, absent only between the handlers above and the
 * first spawn below. */
let child: Bun.Subprocess | undefined;

/**
 * **A signal has to take the child with it, and it did not.**
 *
 * This was `child.kill(); process.exit(0)`, and the second line ran before the
 * kernel had delivered the first. The supervisor went, the server it was
 * supervising did not: it was reparented to init and went on holding its port
 * until its own idle exit two and a half minutes later. Nothing said so —
 * `stop()` had returned, so every caller believed the port was free.
 *
 * It is the two tools that start a server of their own that pay for it
 * (`tools/frames/director-serve.ts`): `bun run shot --serve` and
 * `bun run versus:shot` both kill one process and wait for it, which is the
 * only honest thing to do from outside. A person's Ctrl-C never showed it,
 * because a terminal signals the whole foreground group and the server is in
 * it — so the case that leaked is exactly the case nobody was watching.
 *
 * So: send the signal, and leave when the child has actually gone. A child
 * that will not go is taken after `GOODBYE_MS` rather than waited on forever,
 * because a supervisor that outlives its own stop is the same fault the other
 * way round.
 *
 * **And it is installed before the first child is spawned**, which is the
 * second half of the same bug and cost a day to find. It used to be registered
 * below the watcher, twenty lines and a `watch()` after `spawn()`, so a signal
 * arriving in between met the default disposition: the supervisor died on the
 * spot, its child was orphaned, and nothing caught it. The window is a few
 * milliseconds on an idle machine and as long as the scheduler likes under
 * load, which is why `supervise-stop.test.ts` went red under a 67-shard run
 * and green on its own. Widened to 300 ms by hand it orphans the child ten
 * times out of ten; with the handler first, never.
 */
const GOODBYE_MS = 2000;

/** Set once a signal has started the goodbye, so a second Ctrl-C is not a
 * second one landing on a child that is already on its way out. */
let leaving = false;

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    if (leaving) return;
    leaving = true;
    // Not a restart: if the loop below wins the race to the child's exit, it
    // should let this process end rather than spawn a replacement.
    restarting = false;
    // Nothing spawned yet: the signal arrived inside the window this ordering
    // exists to close, and there is no child to take.
    const going = child;
    if (going === undefined) process.exit(0);
    going.kill();
    const taken = setTimeout(() => going.kill("SIGKILL"), GOODBYE_MS);
    void going.exited.then(() => {
      clearTimeout(taken);
      process.exit(0);
    });
  });
}

child = spawn();

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
    child?.kill();
  };

  watch(gitDir, (_event, name) => {
    if (name === null || !isTreeMove(String(name))) return;
    moved = Date.now();
    if (waiting) return;
    waiting = true;
    setTimeout(settle, QUIET_MS);
  });
}

while (child !== undefined) {
  const code = await child.exited;
  // The child stopped for its own reasons — an idle exit, a crash, or the
  // human's Ctrl-C reaching it first. The supervisor has nothing to add.
  if (!restarting) process.exit(code);
  restarting = false;
  await reinstall();
  child = spawn();
}
