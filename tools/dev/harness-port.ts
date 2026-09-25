/**
 * The port the desktop harness chose for a `.claude/launch.json` entry, if it
 * chose one.
 *
 * An entry with `"autoPort": true` is started with `PORT` set to a port the
 * harness picked itself, and the harness opens its tab there. `director-here`,
 * `director-once` and `game-here` asked the OS for a free port instead, so on
 * 25 September 2026 the director answered on 56239 while the tab opened on
 * `http://localhost:3000`, where nothing did — and `navigate` to the real port
 * was refused, because the pane only trusts the port it started. Taking the
 * harness's number is the only way the two agree: the entry cannot name a
 * worktree's derived port (`tools/ports.ts`), since which tree it serves is
 * decided after it starts (`here.ts`).
 *
 * Outside the harness `PORT` is unset and the caller falls back to a free
 * port, as before.
 */
export function harnessPort(env: Record<string, string | undefined>): number | undefined {
  const port = Number(env.PORT);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : undefined;
}
