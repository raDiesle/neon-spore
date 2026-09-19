#!/usr/bin/env bun

/**
 * `bun run reconcile` — bring the local trunk up to `origin/main` by itself,
 * the way `bun run push` already does before it sends.
 *
 * `land`'s refusal when the trunk is stale used to leave a session to
 * `git rebase origin/main main` by hand and resolve the four files one tool
 * writes both sides of — `docs/queue.md`, `docs/INDEX.md`, `docs/time-log.md`
 * and `docs/release-notes.md` — which is exactly what `reconcile.ts` already
 * does for `push.ts`. The only thing missing was a way to call it without
 * also sending the trunk to `origin`, for a session that hit the refusal and
 * has no lane finished yet to land. This is that call, unchanged underneath.
 */

import { git } from "./git.js";
import { reconcile } from "./reconcile.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const TRUNK = "main";

if ((await git(["remote", "get-url", "origin"], root)) === "") {
  console.log("✗ there is no origin here — nothing to reconcile against");
  process.exit(1);
}

const local = await git(["rev-parse", TRUNK], root);
if (local === "") {
  console.log(`✗ there is no ${TRUNK} in this repository`);
  process.exit(1);
}

await git(["fetch", "--quiet", "origin", TRUNK], root);
const behind = Number(await git(["rev-list", "--count", `${TRUNK}..origin/${TRUNK}`], root)) || 0;

if (behind === 0) {
  console.log(`✓ ${TRUNK} is already even with origin/${TRUNK}`);
  process.exit(0);
}

const many = behind === 1 ? "commit" : "commits";
console.log(`  behind   origin/${TRUNK} has ${behind} ${many} ${TRUNK} has not`);
const done = await reconcile(root, TRUNK);
for (const line of done.lines) console.log(line);
process.exit(done.ok ? 0 : 1);
