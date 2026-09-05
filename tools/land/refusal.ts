/**
 * **Why a push was refused, said in full.**
 *
 * `bun run push` used to print `error.message.split("\n")[0]`, and git's first
 * line on a refused push is the remote URL — so a session that had just landed
 * was told `✗ origin was not updated: To https://github.com/…` and nothing
 * else. The reason lives on the lines after it (`! [rejected] main -> main
 * (non-fast-forward)`, and a hint under that), and a session with no reason in
 * hand has to run the push again by hand to find out, which the repository's
 * own guard hook refuses. It happened on the eyelid landing with local `main`
 * 19 ahead and 36 behind, and the output said none of that.
 *
 * Two things are needed and neither is a guess: git's own words, and where the
 * trunk actually stands. The second is what turns a dead end into an
 * instruction — a trunk that is *behind* is refused for a reason the session
 * can act on, and one that is not is refused for some other reason entirely
 * and should not be told to rebase.
 *
 * Pure, so `test/refusal.test.ts` can hold the wording without a remote.
 */

/** How the local trunk stands against `origin`'s, both counted at the refusal. */
export interface Standing {
  /** Commits the local trunk has that origin's has not. */
  ahead: number;
  /** Commits origin's trunk has that the local one has not. */
  behind: number;
  trunk: string;
}

/**
 * git's stderr with the banner dropped.
 *
 * `To <url>` is the line that says where the push was going, which the session
 * already knows, and it is the only line that was ever printed. Everything
 * else is kept in order and verbatim: the `!` line names the refusal and the
 * hint under it is often the whole answer.
 */
export function reason(stderr: string): string[] {
  return stderr
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0 && !/^To\s/.test(line.trim()));
}

/**
 * The whole refusal as the lines to print, the first already carrying the ✗.
 *
 * The standing goes **last**, where a reader who has just read git's own
 * complaint finds what to do about it.
 */
export function refusalLines(stderr: string, standing: Standing): string[] {
  const { ahead, behind, trunk } = standing;
  const said = reason(stderr);
  const out = [`✗ origin/${trunk} was not updated`];
  for (const line of said) out.push(`  ${line}`);
  if (said.length === 0) out.push("  git said nothing about why");
  out.push(`  ${standingLine(ahead, behind, trunk)}`);
  return out;
}

/** Where the trunk stands, and what that means for the next command. */
function standingLine(ahead: number, behind: number, trunk: string): string {
  const yours = `${ahead} ${ahead === 1 ? "commit" : "commits"}`;
  if (behind === 0) {
    return `${trunk} is ${yours} ahead and behind by none, so this is not a fast-forward problem`;
  }
  const theirs = `${behind} ${behind === 1 ? "commit" : "commits"}`;
  return `origin/${trunk} has ${theirs} yours has not, and you have ${yours} it has not — reconcile the trunk before sending it`;
}
