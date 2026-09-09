/**
 * The replay, and the two conflicts it settles on its own
 *
 * `git rebase` is run here rather than in `run.ts` because it is no longer a
 * single call. Two files conflict on landing after landing and neither
 * disagreement is one anybody authored:
 *
 * - **`docs/queue.md`**, on every landing that drained an item — `bun run queue
 *   take` wrote the `Taken:` line on the trunk and `bun run queue done` removed
 *   the whole entry in the lane. One tool, both sides. It is merged entry by
 *   entry (`queue-merge.ts`).
 * - **`docs/INDEX.md`**, on nearly every landing that added or split a file,
 *   because every lane writes a row into it. It is generated, so the rule is
 *   the one `CLAUDE.md` already states — resolve a generated file by running
 *   its command — with the lane's own row text put back afterwards
 *   (`index-merge.ts`).
 *
 * Anything else stops the landing exactly as before, and so does either of
 * those two when the sides genuinely disagree: both resolvers refuse rather
 * than guess. The guard that catches a finished queue entry coming back still
 * runs after the replay, so this is a shortcut through a known agreement rather
 * than a new way to lose work.
 */

import { join as joinPath } from "node:path";
import { regenerate } from "../index/generate.js";
import { git } from "./git.js";
import { keepLaneRows } from "./index-merge.js";
import { QUEUE_FILES } from "./queue-guard.js";
import { mergeQueue } from "./queue-merge.js";

export interface Replay {
  ok: boolean;
  /** Files whose conflict stopped the replay; empty when git failed some other way. */
  conflicted: string[];
  /** Files this settled by itself, in the order they came up. */
  resolved: string[];
  /** git's own first line, when there was no conflict to name. */
  said: string;
}

/** The generated file map, resolved by running the command that writes it. */
const INDEX_FILE = "docs/INDEX.md";

/** What a resolver is handed: the three sides git staged, and where the tree is. */
interface Sides {
  root: string;
  file: string;
  base: string;
  trunk: string;
  lane: string;
}

/** The whole file's settled content, or `null` to refuse and let the landing stop. */
type Resolver = (sides: Sides) => Promise<string | null>;

const RESOLVERS: Record<string, Resolver> = {};
for (const file of QUEUE_FILES) {
  RESOLVERS[file] = async ({ base, trunk, lane }) => mergeQueue(base, trunk, lane);
}
RESOLVERS[INDEX_FILE] = async ({ root, file, base, trunk, lane }) => {
  // The trunk's copy is what the generator is run over: it carries every row
  // the trunk added, and the tree it reads is already this commit's, so the
  // lane's own files get theirs in the same pass.
  await Bun.write(joinPath(root, file), trunk);
  const generated = regenerate(root).text;
  return keepLaneRows(base, trunk, lane, generated);
};

/** One stage of a conflicted path — "" when that side has no version of it. */
async function stage(root: string, n: number, file: string): Promise<string> {
  const proc = Bun.spawn(["git", "show", `:${n}:${file}`], {
    cwd: root,
    stdout: "pipe",
    stderr: "ignore",
  });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out : "";
}

async function run(args: string[], root: string): Promise<{ code: number; err: string }> {
  const proc = Bun.spawn(["git", ...args], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, GIT_EDITOR: "true" },
  });
  const [err, code] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
  return { code, err };
}

/**
 * Replay this lane onto `trunk`, settling the two known conflicts and stopping
 * on everything else. A failed replay is left aborted, so the worktree is on
 * the lane's own commits either way.
 */
export async function replay(root: string, trunk: string): Promise<Replay> {
  const resolved: string[] = [];
  let step = await run(["rebase", trunk], root);
  // One pass per commit that stops the replay; the rebase itself is what ends
  // the loop, and a commit that cannot be settled leaves through a `return`.
  while (step.code !== 0) {
    const listed = await git(["diff", "--name-only", "--diff-filter=U"], root);
    const conflicted = listed ? listed.split("\n") : [];
    const stop = async (): Promise<Replay> => {
      await run(["rebase", "--abort"], root);
      return { ok: false, conflicted, resolved, said: step.err.trim().split("\n")[0] ?? "" };
    };
    if (conflicted.length === 0 || conflicted.some((file) => RESOLVERS[file] === undefined)) {
      return stop();
    }
    for (const file of conflicted) {
      const settle = RESOLVERS[file];
      if (settle === undefined) return stop();
      const merged = await settle({
        root,
        file,
        base: await stage(root, 1, file),
        trunk: await stage(root, 2, file),
        lane: await stage(root, 3, file),
      });
      if (merged === null) return stop();
      await Bun.write(joinPath(root, file), merged);
      await run(["add", "--", file], root);
      resolved.push(file);
    }
    step = await run(["rebase", "--continue"], root);
  }
  return { ok: true, conflicted: [], resolved, said: "" };
}
