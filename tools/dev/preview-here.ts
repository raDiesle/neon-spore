#!/usr/bin/env bun

/**
 * `bun run preview:here` — the built game, from the tree `bun run here` last
 * named: the `game-here` launch entry, `director-here`'s twin (`here.ts`).
 *
 * The harness starts a launch entry in the directory the session opened in,
 * so a session that opened in the main checkout and then made itself a
 * worktree got *main*'s game from the `game` entry, and the only way round
 * it was an entry of its own written into `.claude/launch.json` with
 * `--cwd <worktree>` and reverted afterwards — which the boot check for the
 * `main.ts` split did on 23 September 2026, and every lane checking the built
 * game in a browser would have done again.
 *
 * **One process, not a supervised one.** The director's route runs its server
 * under `supervise.ts --here`, which spawns one command; the preview is two —
 * a build and then the server — and a supervisor that kills `bun run preview`
 * kills the `bun run` and leaves the server it started holding its port until
 * the idle exit, ten minutes later. So this builds the tree first and then
 * imports *that tree's* `apps/game/preview.ts`: the server runs in this
 * process, a stop takes it, and the tree it names on `/__preview` is the one
 * its own file sits in, which is the tree the pointer named. A built preview
 * is a snapshot on purpose, so nothing here watches for a rebase either.
 *
 * On a free port (`PREVIEW_PORT=0`) unless one is given, because the harness
 * entry cannot know a worktree's derived port; `preview.ts` writes it down for
 * `bun run port`.
 */

import { hereRoot } from "./here.js";

const tree = hereRoot(process.cwd());
console.log(`previewing ${tree}`);

const build = Bun.spawnSync(["bun", "run", "build"], {
  cwd: `${tree}/apps/game`,
  stdio: ["inherit", "inherit", "inherit"],
});
if (build.exitCode !== 0) process.exit(build.exitCode ?? 1);

process.env.PREVIEW_PORT ??= "0";
await import(Bun.pathToFileURL(`${tree}/apps/game/preview.ts`).href);
