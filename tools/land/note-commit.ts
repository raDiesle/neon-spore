/**
 * The two files a landing writes at the moment `main` moves, and the one
 * commit that carries them: `docs/release-notes.md` always, and
 * `docs/queue.md` when the session named something with `--unverified`.
 *
 * Split out of `sweep.ts` because that file is the cleanup — the branch, the
 * worktrees, the spent specs — and this is bookkeeping about the landing
 * itself. `notes.ts` and `unverified.ts` are the pure halves that decide what
 * either file should say; everything here talks to git.
 */

import { join } from "node:path";
import { git, gitOrDie } from "./git.js";
import type { LandState } from "./land.js";
import { type Landed, prepend } from "./notes.js";
import { appendEntry, parseUnverified, renderUnverified } from "./unverified.js";

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
  // The queue entry rides in the same commit as the note. Two commits would be
  // two things to explain in `docs/release-notes.md` — and the note's own entry
  // is derived from the landing, not from this commit, so the pair is one
  // bookkeeping step rather than one of each.
  const paths = ["docs/release-notes.md"];
  const unverified = parseUnverified(argv);
  // A bare `--unverified`, or one followed by the next flag, is a session that
  // meant to say something and said nothing. Landing silently there is the
  // failure this whole flag exists to stop, so it is said out loud.
  if (argv.includes("--unverified") && unverified.length === 0) {
    console.log("  ⚑ --unverified needs what went unchecked, in quotes — nothing was queued");
  }
  const queued = await writeUnverified(tree, state, landed, unverified);
  if (queued) paths.push("docs/queue.md");
  await gitOrDie(["commit", "--only", ...paths, "-q", "-m", `Release notes for ${what}`], tree);
  // Only in a clone: the commit just made is on whatever this checkout is
  // standing on, and the trunk is a ref beside it rather than the branch that
  // moved. Where a worktree holds the trunk, that commit *was* the trunk's.
  if (!state.trunkTree) await gitOrDie(["branch", "--force", TRUNK, "HEAD"], root);
  console.log(`  noted    docs/release-notes.md — ${what}`);
}

/**
 * `--unverified` — one queue entry for what this landing could not check.
 *
 * Written into the trunk's own `docs/queue.md`, beside the technical findings,
 * because it is the same kind of thing: work nobody has started, waiting for a
 * session that can do it. `unverified.ts` carries why that is a reversal of
 * what `notes.ts` argues, and why it is a narrow one.
 *
 * The paths come from the landing rather than from the session, so an entry
 * cannot name files the commits did not touch — `git diff --name-only` over
 * exactly the commits that landed.
 */
async function writeUnverified(
  tree: string,
  state: LandState,
  landed: Landed[],
  unverified: readonly string[],
): Promise<boolean> {
  if (unverified.length === 0) return false;
  const oldest = landed[0]?.full ?? "";
  const newest = landed.at(-1);
  if (!newest) return false;
  const diff = await git(["diff", "--name-only", `${oldest}^`, newest.full], tree);
  const files = diff
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const path = join(tree, "docs/queue.md");
  const file = Bun.file(path);
  const existing = (await file.exists()) ? await file.text() : "";
  const entry = renderUnverified({
    branch: state.branch,
    date: newest.date,
    sha: newest.sha,
    items: unverified,
    files,
    subjects: landed.map((c) => c.subject),
  });
  await Bun.write(path, appendEntry(existing, entry));
  const what = unverified.length === 1 ? "one thing" : `${unverified.length} things`;
  console.log(`  queued   docs/queue.md — ${what} this landing could not check`);
  return true;
}
