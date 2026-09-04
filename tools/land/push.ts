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
 */

import { git, gitOrDie } from "./git.js";

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
const short = await git(["rev-parse", "--short", TRUNK], root);

if (ahead === 0) {
  console.log(`✓ origin/${TRUNK} is already at ${short}`);
  process.exit(0);
}

try {
  await gitOrDie(["push", "origin", `${TRUNK}:${TRUNK}`], root);
} catch (error) {
  console.log(`✗ origin was not updated: ${(error as Error).message.split("\n")[0]}`);
  process.exit(1);
}

const many = ahead === 1 ? "commit" : "commits";
console.log(`✓ pushed origin/${TRUNK} → ${short} (${ahead} ${many})`);
