/**
 * A save in the wave editor is a commit.
 *
 * `PUT /api/waves` writes source files, and until now it left them dirty in
 * the tree — which meant the author's afternoon of authoring arrived as one
 * shapeless diff, and any session that came along in between saw uncommitted
 * work it had to step around. A wave placed in the editor is a finished piece
 * of authoring at the moment the save returns, so it is committed at that
 * moment.
 *
 * **By path, and only the paths this save wrote.** `git commit -- <paths>`
 * commits the working-tree content of those files whatever else is staged, so
 * a save can never pick up another lane's half-finished edit — the same rule
 * the repository holds a session to, for the same reason.
 *
 * It is best-effort and never fails the save: the files are already written,
 * and a 500 over a commit that did not happen would say the authoring was
 * lost when it was not. A refusal is logged and that is all. `DIRECTOR_NO_COMMIT=1`
 * turns it off for a session that would rather commit by hand.
 */

/** The subject and first paragraph become the release note — see `land`. */
export function commitMessage(waves: number, rels: readonly string[]): string {
  const files = rels.length === 1 ? "one file" : `${rels.length} files`;
  return [
    "The wave list as the director saved it",
    "",
    `Saved from the wave editor: ${waves} waves across ${files}.`,
    "",
    ...rels.map((rel) => `- ${rel}`),
  ].join("\n");
}

async function run(args: string[], cwd: string): Promise<{ code: number; err: string }> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [code, err] = await Promise.all([proc.exited, new Response(proc.stderr).text()]);
  return { code, err };
}

/**
 * Commit the files a save just wrote, if any of them actually moved. Returns
 * what went wrong, or null when there was nothing to do or it worked.
 */
export async function commitWaves(
  rels: readonly string[],
  waves: number,
  root: string,
): Promise<string | null> {
  if (process.env.DIRECTOR_NO_COMMIT) return null;
  if (rels.length === 0) return null;

  // Biome may have put every byte back where it found it, and a save that
  // changed nothing is not a commit.
  const changed = await run(["diff", "--quiet", "HEAD", "--", ...rels], root);
  if (changed.code === 0) return null;
  if (changed.code !== 1) return changed.err.trim() || "git diff failed";

  const done = await run(["commit", "-m", commitMessage(waves, rels), "--", ...rels], root);
  if (done.code !== 0) return done.err.trim() || "git commit failed";
  return null;
}
