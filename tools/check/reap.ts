import type { Subprocess } from "bun";

/**
 * **A runner's children go when it does.**
 *
 * A `check:fast` sent SIGTERM on 23 September 2026 left its `bun test` shard
 * running, reparented to launchd, still growing and still holding its memory;
 * nothing reaped it but its own end. That shard was the 13 GB one, so an
 * interrupted check left the worst process of the run behind it. A signal
 * kills the process it is sent to and nothing under it: a Ctrl-C at a
 * terminal reaches the whole group, but a `kill` from a hook, a timeout or
 * another session reaches only the runner.
 *
 * So both runners — `fast.ts` over `shard.ts`, and `shard.ts` over its
 * `bun test` processes — `track` what they spawn, and `reapOnSignal` sends the
 * signal each of them received on to every child still running before the
 * runner exits with the code a shell expects of that signal.
 */

const live = new Set<Subprocess>();

/** Remember a child until it exits, so a signal can be passed on to it. */
export function track<P extends Subprocess>(proc: P): P {
  live.add(proc);
  void proc.exited.finally(() => live.delete(proc));
  return proc;
}

/** The signals a runner is stopped by, and the exit code a shell gives each. */
const STOPS = { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 } as const;

/** Pass SIGINT, SIGTERM and SIGHUP on to every tracked child, then exit. */
export function reapOnSignal(): void {
  for (const [signal, code] of Object.entries(STOPS)) {
    process.on(signal, () => {
      for (const proc of live) proc.kill(signal as NodeJS.Signals);
      process.exit(code);
    });
  }
}
