#!/usr/bin/env bun

/**
 * The last thing before Claude hands the turn back: does the repo still
 * typecheck and pass? Only when something was actually changed, and never twice
 * in a row — `stop_hook_active` guards the loop.
 *
 * Moved off bash with the other three. As `bash .claude/hooks/check-on-stop.sh`
 * it did not run in a shell without `bash`, which is the worst possible hook to
 * lose quietly: the turn ends looking verified and nothing was verified.
 *
 * The scope is now imported rather than spawned. The bash version ran `bun run
 * tools/hooks/scope.ts` and split its stdout on spaces, which could not tell an
 * empty answer from a broken scoper — hence the comment there about falling
 * back to the full suite. Calling `scopeFor` directly keeps that rule and makes
 * it structural: anything but a list of directories is a full run.
 */

import { readPayload, stopHookActive } from "./payload.ts";
import { changedPaths, scopeFor } from "./scope.ts";

/** What one of the two commands this hook runs had to say when it failed. */
export interface Failure {
  readonly what: string;
  readonly tail: string;
}

/**
 * Which test directories a change can possibly have touched — see `scope.ts`
 * for the table and the argument for each row.
 *
 * An empty list means the whole suite, and so does a throw: a scope failure
 * must never read as "nothing to test".
 */
export function testScope(): string[] {
  try {
    return scopeFor(changedPaths());
  } catch {
    return [];
  }
}

/** The last `lines` lines of a command's output, which is the part worth reading. */
export function tailOf(text: string, lines: number): string {
  return text.split("\n").slice(-lines).join("\n");
}

async function run(args: string[]): Promise<{ ok: boolean; output: string }> {
  const proc = Bun.spawn([process.execPath, ...args], { stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { ok: code === 0, output: `${out}${err}` };
}

async function main(): Promise<void> {
  const payload = await readPayload();
  if (stopHookActive(payload)) process.exit(0);

  // Nothing edited this turn means nothing to verify.
  const dirty = Bun.spawnSync(["git", "status", "--porcelain"]).stdout.toString().trim();
  if (dirty === "") process.exit(0);

  const typecheck = await run(["run", "typecheck"]);
  if (!typecheck.ok) {
    process.stderr.write(
      `typecheck fails — fix before finishing:\n${tailOf(typecheck.output, 30)}\n`,
    );
    process.exit(2);
  }

  const scope = testScope();
  process.stderr.write(
    scope.length > 0
      ? `check-on-stop: scoped run — ${scope.join(" ")}\n`
      : "check-on-stop: full run\n",
  );

  const tests = await run(["test", ...scope]);
  if (!tests.ok) {
    process.stderr.write(`bun test fails — fix before finishing:\n${tailOf(tests.output, 40)}\n`);
    process.exit(2);
  }
  process.exit(0);
}

if (import.meta.main) await main();
