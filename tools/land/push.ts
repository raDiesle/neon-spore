#!/usr/bin/env bun

/**
 * `bun run push` — put the trunk on `origin`, because somebody asked.
 *
 * The other half of `pushNow`. A landing sends `main` only when its sweep
 * cleared a lane away, so between those the trunk collects commits `origin`
 * has never seen; this is the command that sends them, from any worktree,
 * without landing anything or moving a ref.
 *
 * It refreshes `origin/main` before counting. The remote-tracking ref is
 * whatever the last fetch left behind, and a count taken against a stale one
 * reports work as unpushed that somebody else already pushed — a number that
 * is wrong in the reassuring direction is worse than no number.
 *
 * **A trunk that is behind is reconciled rather than reported.** Two sessions
 * pushing is ordinary here, and until 16 September 2026 this printed the
 * refusal and left a person to run `git rebase origin/main main` by hand and
 * resolve four records that one tool wrote both sides of. That is `land`'s
 * replay pointed at the other pair of branches, so it is now the same code:
 * `reconcile.ts`. It refuses on anything that is a real disagreement, and the
 * trunk is left where it was when it does.
 *
 * **A refusal is printed in full**, along with how the trunk stands, because
 * the alternative is running the push again by hand to find out — and the
 * repository's own guard hook refuses that. `refusal.ts` has the wording.
 */

import { git, gitOrDie } from "./git.js";
import { reconcile } from "./reconcile.js";
import { refusalLines } from "./refusal.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const TRUNK = "main";

if ((await git(["remote", "get-url", "origin"], root)) === "") {
  console.log("✗ there is no origin here — nothing to push to");
  process.exit(1);
}

const local = await git(["rev-parse", TRUNK], root);
if (local === "") {
  console.log(`✗ there is no ${TRUNK} in this repository`);
  process.exit(1);
}

/** How the trunk stands against `origin`'s, counted after a fresh fetch. */
async function stand(): Promise<{ ahead: number; behind: number; short: string }> {
  await git(["fetch", "--quiet", "origin", TRUNK], root);
  const [ahead, behind, short] = await Promise.all([
    git(["rev-list", "--count", `origin/${TRUNK}..${TRUNK}`], root),
    // Counted beside `ahead` and read twice: it is what says whether there is
    // anything to reconcile, and — when the send is refused anyway — the
    // difference between "origin was not updated" and "origin has work yours
    // has not". See `refusal.ts`.
    git(["rev-list", "--count", `${TRUNK}..origin/${TRUNK}`], root),
    git(["rev-parse", "--short", TRUNK], root),
  ]);
  return { ahead: Number(ahead) || 0, behind: Number(behind) || 0, short };
}

/** Bring the trunk onto `origin`'s, printing what it settled. Exits on a refusal. */
async function catchUp(behind: number): Promise<void> {
  const theirs = `${behind} ${behind === 1 ? "commit" : "commits"}`;
  console.log(`  behind   origin/${TRUNK} has ${theirs} this trunk has not`);
  const done = await reconcile(root, TRUNK);
  for (const line of done.lines) console.log(line);
  if (!done.ok) process.exit(1);
}

let { ahead, behind, short } = await stand();

if (ahead === 0 && behind === 0) {
  console.log(`✓ origin/${TRUNK} is already at ${short}`);
  process.exit(0);
}
if (behind > 0) {
  await catchUp(behind);
  ({ ahead, behind, short } = await stand());
}
if (ahead === 0) {
  console.log(`✓ origin/${TRUNK} is already at ${short}`);
  process.exit(0);
}

async function send(): Promise<string> {
  try {
    await gitOrDie(["push", "origin", `${TRUNK}:${TRUNK}`], root);
    return "";
  } catch (error) {
    return (error as Error).message;
  }
}

let failed = await send();
if (failed !== "") {
  // Somebody pushed between the fetch and the send. One more pass, because
  // that is a race rather than a disagreement, and a session told to run the
  // push again cannot: the guard hook refuses a bare retry.
  const again = await stand();
  if (again.behind > 0) {
    await catchUp(again.behind);
    ({ ahead, behind, short } = await stand());
    failed = ahead === 0 ? "" : await send();
  } else {
    ({ ahead, behind } = again);
  }
}

if (failed !== "") {
  // The whole of git's complaint, not its first line — that line is the
  // remote's URL, and it was the only thing this ever printed.
  for (const line of refusalLines(failed, { ahead, behind, trunk: TRUNK })) console.log(line);
  process.exit(1);
}

const many = ahead === 1 ? "commit" : "commits";
console.log(`✓ pushed origin/${TRUNK} → ${short} (${ahead} ${many})`);
