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
 * **A refusal is printed in full**, along with how the trunk stands, because
 * the alternative is running the push again by hand to find out — and the
 * repository's own guard hook refuses that. `refusal.ts` has the wording.
 */

import { git, gitOrDie } from "./git.js";
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

await git(["fetch", "--quiet", "origin", TRUNK], root);
const ahead = Number(await git(["rev-list", "--count", `origin/${TRUNK}..${TRUNK}`], root)) || 0;
// Counted beside `ahead` and only read when the push is refused: it is one
// more `rev-list` and it is the difference between "origin was not updated"
// and "origin has work yours has not". See `refusal.ts`.
const behind = Number(await git(["rev-list", "--count", `${TRUNK}..origin/${TRUNK}`], root)) || 0;
const short = await git(["rev-parse", "--short", TRUNK], root);

if (ahead === 0) {
  console.log(`✓ origin/${TRUNK} is already at ${short}`);
  process.exit(0);
}

try {
  await gitOrDie(["push", "origin", `${TRUNK}:${TRUNK}`], root);
} catch (error) {
  // The whole of git's complaint, not its first line — that line is the
  // remote's URL, and it was the only thing this ever printed.
  for (const line of refusalLines((error as Error).message, { ahead, behind, trunk: TRUNK })) {
    console.log(line);
  }
  process.exit(1);
}

const many = ahead === 1 ? "commit" : "commits";
console.log(`✓ pushed origin/${TRUNK} → ${short} (${ahead} ${many})`);
