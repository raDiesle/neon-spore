/**
 * **A merge commit on the trunk is refused before `bun run push` sends it.**
 *
 * History on `main` is linear (CLAUDE.md, `docs/git-and-landing.md`), and
 * `land` keeps it so by rebasing every lane. On 26 September 2026 `origin/main`
 * took `11f25490a` anyway — *Merge branch 'main' into claude/queue-the-ratchets-
 * picture-has-never-been-drawn* — a lane brought up by `git merge` and put on
 * the trunk by hand. It cannot come back out without a force-push; the next
 * one is stopped here, as the last gate, beside the index's (`push.ts`).
 *
 * Only what this send would add is asked about (`origin/main..main`): the one
 * already on `origin` is history now, and refusing every push for it would
 * stop the trunk for good.
 */

import { git } from "./git.js";

/** The refusal to print, or `null` when nothing this send carries is a merge. */
export async function mergesSaid(root: string, trunk: string): Promise<string | null> {
  const listed = await git(
    ["log", "--merges", "--format=%h %s", `origin/${trunk}..${trunk}`],
    root,
  );
  if (listed === "") return null;
  const merges = listed.split("\n");
  const which = merges.length === 1 ? "a merge commit" : `${merges.length} merge commits`;
  return [
    `${trunk} carries ${which} origin/${trunk} has not, and history on ${trunk} is linear:`,
    ...merges.map((m) => `  ${m}`),
    `take ${trunk} back to origin/${trunk} and land the work again with bun run land, which rebases it`,
  ].join("\n");
}
