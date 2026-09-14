/**
 * Where a server that took an OS-assigned port writes the number down
 *
 * `bun run port` can work out the port a server *will* take, because it is
 * derived from the tree's path — and that is true of every server here except
 * the ones started with `0`. `bun run dev:once` and `bun run preview:once` ask
 * the operating system for any free port on purpose, so nothing predicts them,
 * and the number is printed exactly once, on the supervisor's own stdout. A
 * session that pipes the command into `| head -30` to read that line without
 * hanging on a server gets nothing at all, and then reaches for the base port
 * `bun run port` named — three `curl: (7)`s in a row, and the conclusion that
 * the server failed to start. It had not; it was answering on 58200.
 *
 * So a server on a port nobody can derive writes it here instead, beside its
 * own pid, and `bun run port` reports what is *running* rather than only what
 * would be tried. `.claude/tmp/` is git-ignored and is swept with the tree.
 *
 * The pid is the whole liveness story. A server killed outright leaves its file
 * behind, so a reader that trusted the file would name a port nothing answers
 * on — which is the failure this exists to end, arriving from the other side.
 * Asking the operating system whether that process is still there costs
 * nothing and cannot be stale.
 *
 * **Which is why announcing does not handle signals, and used to.** It caught
 * SIGINT and SIGTERM to remove its file on the way out — and a listener on a
 * signal turns off the death that signal would otherwise be, so it had to
 * `process.exit(0)` itself. That exit ran first and took the process with it,
 * before any handler registered later could do anything: the supervisor's
 * `bun run dev:once` announces a pinned port and then arranges to take its
 * server down with it, and the arrangement never ran once. The server was
 * reparented to init and went on holding the port `stop()` had just reported
 * free (`tools/dev/supervise.ts`).
 *
 * Tidying a file is not worth owning the process's death. A killed server
 * leaves its file, `alive()` above reads it as nothing, and that is the case
 * this module was built around from the first line.
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** What a running server wrote about itself. */
export interface Running {
  port: number;
  pid: number;
}

/** One file per pinnable server, named by the variable that pins it. */
export function runningFile(root: string, env: string): string {
  return join(root, ".claude", "tmp", `${env.toLowerCase()}.json`);
}

/** Say what this process took, and arrange for it to stop saying so. */
export function announce(root: string, env: string, port: number): void {
  const file = runningFile(root, env);
  mkdirSync(join(root, ".claude", "tmp"), { recursive: true });
  writeFileSync(file, JSON.stringify({ port, pid: process.pid }));
  const forget = () => rmSync(file, { force: true });
  process.on("exit", forget);
}

/** Whether a pid is still a process. Never throws — an unknown answer is "no". */
export function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM is a process this user may not signal, which is still a process.
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** The parse and the liveness check, apart from the disk so both can be tested. */
export function readRunning(text: string, isAlive: (pid: number) => boolean): Running | undefined {
  try {
    const parsed = JSON.parse(text) as Partial<Running>;
    if (typeof parsed.port !== "number" || typeof parsed.pid !== "number") return undefined;
    if (!isAlive(parsed.pid)) return undefined;
    return { port: parsed.port, pid: parsed.pid };
  } catch {
    return undefined;
  }
}

/** What is answering from this tree on an un-derivable port, if anything is. */
export function running(root: string, env: string): Running | undefined {
  let text = "";
  try {
    text = readFileSync(runningFile(root, env), "utf8");
  } catch {
    return undefined;
  }
  return readRunning(text, alive);
}
