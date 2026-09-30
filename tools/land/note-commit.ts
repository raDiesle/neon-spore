/**
 * The files a landing writes at the moment `main` moves, and the one commit
 * that carries them: `docs/release-notes.md` always, `docs/time-log.md` when
 * the landing's own commits wrote an entry in it. What `--unverified` names is
 * printed, never written (`unverified.ts`).
 *
 * Split out of `sweep.ts` because that file is the cleanup — the branch, the
 * worktrees, the spent specs — and this is bookkeeping about the landing
 * itself. `notes.ts`, `stamp.ts` and `unverified.ts` are the pure halves that
 * decide what each file should say; everything here talks to git.
 */

import { join } from "node:path";
import { git, gitOrDie } from "./git.js";
import type { LandState } from "./land.js";
import { branchMade, claimTimes } from "./lane-start.js";
import { type Landed, prepend } from "./notes.js";
import { laneStart, minutesBetween, stampInto } from "./stamp.js";
import { parseUnverified } from "./unverified.js";

/**
 * The release note, written where the fact is known.
 *
 * It is a second commit on the trunk rather than an amendment to the lane's
 * own, and deliberately so: the tree `bun run check` went green on is the tree
 * that just landed, and editing a file into it afterwards would make the green
 * result a result about something else. A docs-only commit is the cheap half of
 * that trade.
 *
 * `git commit --only` names the path rather than `git add` + `git commit`,
 * so this touches exactly the file it wrote and nothing the trunk's own index
 * was already holding — an owner mid-`git add` on the trunk worktree does not
 * get their staged files swept into a commit they never asked for.
 *
 * Nothing is asked of the reader and nothing is asked of the session — the
 * entry is derived from the commit subject and its first paragraph, which the
 * commit already had to carry.
 *
 * **A clone with no worktrees is written the same way.** It used to print
 * `no release note — nothing has main checked out` and move on, which is the
 * shape every session started from a phone runs in (`docs/cloud-session.md`) —
 * so every landing that reached `origin/main` from one was a landing the notes
 * never heard about, and the commit message turned into a note is the only part
 * of a landing anybody sees twice. There is no *second* checkout to write into
 * there, but the session's own is the trunk's content already: `moveTrunk` has
 * just forced the trunk ref onto this HEAD. So the note is written here,
 * committed here, and the trunk is brought up to the commit that carries it.
 */
export async function writeNotes(
  state: LandState,
  landed: Landed[],
  TRUNK: string,
  root: string,
  argv: readonly string[] = [],
): Promise<void> {
  if (landed.length === 0) return;
  const tree = state.trunkTree || root;
  const path = join(tree, "docs/release-notes.md");
  const file = Bun.file(path);
  const existing = (await file.exists()) ? await file.text() : "";
  await Bun.write(path, prepend(existing, landed));
  const what = landed.length === 1 ? "one landing" : `${landed.length} landings`;
  const paths = ["docs/release-notes.md"];
  if (await stampTimeLog(tree, landed, state.branch, TRUNK)) paths.push("docs/time-log.md");
  const unverified = parseUnverified(argv);
  // A bare `--unverified`, or one followed by the next flag, is a session that
  // meant to say something and said nothing. Landing silently there is the
  // failure this whole flag exists to stop, so it is said out loud.
  if (argv.includes("--unverified") && unverified.length === 0) {
    console.log("  ⚑ --unverified needs what went unchecked, in quotes — nothing was said");
  }
  for (const item of unverified) {
    console.log(`  left     for the owner's regression pass — ${item}`);
  }
  await gitOrDie(["commit", "--only", ...paths, "-q", "-m", `Release notes for ${what}`], tree);
  // Only in a clone: the commit just made is on whatever this checkout is
  // standing on, and the trunk is a ref beside it rather than the branch that
  // moved. Where a worktree holds the trunk, that commit *was* the trunk's.
  if (!state.trunkTree) await gitOrDie(["branch", "--force", TRUNK, "HEAD"], root);
  console.log(`  noted    docs/release-notes.md — ${what}`);
}

/**
 * The measured minutes, stamped under the entry the session just wrote.
 *
 * **Only when the landing's own commits touched the file**, and that guard is
 * what makes "the last `##` block" mean "this lane's entry" rather than
 * whoever wrote last. A lane that logged nothing is stamped nothing: a
 * measurement attached to somebody else's rows would be worse than none, and
 * `docs/time-log.md` is a record — `stamp.ts` never rewrites what is there.
 *
 * The span runs to now, the moment the trunk moved, from the lane's start as
 * `stamp.ts`'s `laneStart` picks it: the queue claim on the trunk that names
 * this branch, the branch's own creation in its reflog, or the **author** date
 * of its first commit — author rather than commit date because a rebase
 * rewrites the second and the lane's own clock is what is being measured.
 */
async function stampTimeLog(
  tree: string,
  landed: Landed[],
  branch: string,
  trunk: string,
): Promise<boolean> {
  const oldest = landed[0]?.full ?? "";
  const newest = landed.at(-1)?.full ?? "";
  if (!oldest || !newest) return false;
  const touched = await git(["diff", "--name-only", `${oldest}^`, newest], tree);
  if (!touched.split(/\r?\n/).some((line) => line.trim() === "docs/time-log.md")) return false;

  const first = Number((await git(["log", "-1", "--format=%at", oldest], tree)).trim());
  if (!Number.isFinite(first) || first <= 0) return false;
  const start = laneStart(
    first,
    await claimTimes(tree, branch, trunk),
    await branchMade(tree, branch),
  );
  const minutes = minutesBetween(start.at, Math.floor(Date.now() / 1000));

  const path = join(tree, "docs/time-log.md");
  const file = Bun.file(path);
  if (!(await file.exists())) return false;
  const existing = await file.text();
  const stampedText = stampInto(existing, minutes, start.from);
  if (stampedText === existing) return false;
  await Bun.write(path, stampedText);
  console.log(`  measured docs/time-log.md — ${minutes} min, ${start.from} to trunk`);
  return true;
}
