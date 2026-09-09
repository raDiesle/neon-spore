/**
 * A shallow clone, which is what a cloud session lands from
 *
 * A session started from a phone clones `origin` with a depth, and that one
 * fact breaks the trunk guard in a way whose symptom points nowhere near it.
 * `git fetch origin main` brings a **second** shallow segment down rather than
 * joining the first, so `main` and `origin/main` have no ancestor git can see
 * between them: `git merge-base` answers nothing at all, and
 * `git rev-list --count` reports each as ahead of the other by the depth of the
 * graft. Fifty and fifty, in the session that found this, on a branch whose own
 * base *was* `origin/main`.
 *
 * `land` then reads that as `origin/main has 50 commits main has not` and
 * refuses — and its own advice cannot fix it, because there is no fast-forward
 * to take. The two segments are not one history.
 *
 * `git fetch --unshallow origin` joins them, and after it the same two counts
 * were 89 behind and 0 ahead, the fast-forward went through and so did the
 * landing. So the clone is deepened before anything is compared, and if that
 * fails the landing says *that* rather than a count nobody can act on.
 * `CLAUDE.md` tells a cloud session to land every turn, so every one of them
 * walks into this on the way.
 */

/** What a `git` call has to look like for this to be testable without one. */
export type Run = (args: string[]) => Promise<{ ok: boolean; out: string }>;

export interface Deepened {
  /** Whether the clone was shallow when this ran. */
  was: boolean;
  /** Whether it is a whole history now. A shallow clone with no network stays shallow. */
  ok: boolean;
}

/**
 * Join a shallow clone's segments before any count is taken.
 *
 * Cheap and silent on an ordinary checkout: one `rev-parse` that answers
 * `false`, and nothing else runs.
 */
export async function deepen(run: Run): Promise<Deepened> {
  const asked = await run(["rev-parse", "--is-shallow-repository"]);
  if (!asked.ok || asked.out.trim() !== "true") return { was: false, ok: true };
  const fetched = await run(["fetch", "--unshallow", "origin"]);
  return { was: true, ok: fetched.ok };
}

/** One line for the caller to print, or "" when there is nothing to say. */
export function deepenedLine(deepened: Deepened, trunk: string): string {
  if (!deepened.was) return "";
  if (deepened.ok) return "  deepened this clone was shallow; its history is joined up now";
  return (
    `  ⚑ this clone is shallow and could not be deepened — every count against ` +
    `origin/${trunk} below is the depth of the graft rather than real work`
  );
}
