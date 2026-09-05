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

/**
 * Where `origin` has the trunk, asked before anything else is measured.
 *
 * Returns how many commits `origin/<trunk>` has that the local one has not, and
 * whether the fetch that answered it actually reached the remote. **Both halves
 * are needed and neither is an error.** A landing has to work with no network,
 * so an unreachable `origin` measures against the ref already here and the
 * caller says so; a trunk that is genuinely behind is the refusal
 * (`LandState.trunkStale`, and `docs/git-and-landing.md` on the afternoon that
 * bought it).
 */
export async function trunkAgainstOrigin(
  root: string,
  trunk: string,
  hasOrigin: boolean,
): Promise<{ stale: number; fetched: boolean }> {
  if (!hasOrigin) return { stale: 0, fetched: false };
  const proc = Bun.spawn(["git", "fetch", "origin", trunk], {
    cwd: root,
    stdout: "ignore",
    stderr: "ignore",
  });
  const fetched = (await proc.exited) === 0;
  const stale = Number(await git(["rev-list", "--count", `${trunk}..origin/${trunk}`], root)) || 0;
  return { stale, fetched };
}
