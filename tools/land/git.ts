/**
 * The two ways `land` talks to git — one that swallows failure into `""`
 * for questions where "unknown" and "empty" read the same way, one that
 * throws for anything the tool must not silently get wrong.
 *
 * Kept in one place so `LAND_DEBUG=1` has one place to echo from: every git
 * command `land` runs, printed to stderr before it runs, so a landing stuck
 * on a git call that never returns is diagnosable from its log rather than
 * guessed at.
 */

const LAND_DEBUG = process.env.LAND_DEBUG === "1";

export function logGit(args: string[]): void {
  if (LAND_DEBUG) console.error(`git> git ${args.join(" ")}`);
}

/** "" on any failure — for reads where "could not tell" and "nothing there" are the same answer. */
export async function git(args: string[], cwd: string): Promise<string> {
  logGit(args);
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out.trim() : "";
}

/** Throws with git's own stderr — for writes and anything the caller must not get wrong quietly. */
export async function gitOrDie(args: string[], cwd: string): Promise<string> {
  logGit(args);
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`${err.trim() || out.trim()}`);
  return out.trim();
}
