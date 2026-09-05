import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { git, root, run } from "./serve.js";

/**
 * **Which wave `--wave` names**, answered against the right list.
 *
 * Cut out of `run.ts` when photographing the working tree took that file past
 * its 250-line limit, along the seam its own tests already read on
 * (`test/wave.test.ts`): everything here answers one question — name or number
 * to the 0-based index `jumpToWave` takes — and none of it opens a browser or
 * knows what a frame is.
 */

/**
 * One entry of `WAVES`, reduced to the two things a `where` field can name a
 * wave by. Kept narrow so `resolveWaveText` and its tests do not need the
 * whole `Wave` shape from `@neon-spore/content`.
 */
export interface WaveName {
  name: string;
}

/**
 * The wave list as it stood at `rev`, read out of *that* commit's own
 * `packages/content/src/waves.ts` — not the working tree's copy.
 *
 * The ask this answers — "FRAMES PUTS THE WRONG WAVE IN THE PICTURE, AND SAYS
 * THE RIGHT NAME WHILE IT DOES": a name only lived at the index it held in the
 * tree that named it. `captureAt` already makes a scratch worktree and runs
 * `bun install` in it to build the game at a historical commit; this makes
 * the same kind of checkout to answer the name → index question inside it,
 * so the answer and the build it feeds are never talking about two different
 * lists. `bun install` is needed because `waves.ts` reaches `@neon-spore/sim`
 * through `maze-rounds.ts`, and that import only resolves once the workspace
 * link exists in this checkout's own `node_modules`.
 */
export async function waveNamesAt(rev: string): Promise<WaveName[]> {
  const scratch = await mkdtemp(join(tmpdir(), "neon-spore-frames-waves-"));
  await rm(scratch, { recursive: true, force: true }); // `worktree add` wants the path free
  await git(["worktree", "add", "--detach", scratch, rev]);
  try {
    await run(["bun", "install"], scratch);
    const url = pathToFileURL(join(scratch, "packages/content/src/waves.ts")).href;
    const mod = (await import(url)) as { WAVES: readonly WaveName[] };
    return mod.WAVES.map((w) => ({ name: w.name }));
  } finally {
    await git(["worktree", "remove", "--force", scratch]).catch(() => {});
    await rm(scratch, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * The wave list of the working tree, for a capture of the working tree.
 *
 * The same read as `waveNamesAt` without the checkout: there is no commit to
 * stand in, and asking a scratch worktree about a list that is sitting right
 * here would answer a different question.
 */
export async function waveNamesHere(): Promise<WaveName[]> {
  const url = pathToFileURL(join(root, "packages/content/src/waves.ts")).href;
  const mod = (await import(url)) as { WAVES: readonly WaveName[] };
  return mod.WAVES.map((w) => ({ name: w.name }));
}

/** `--wave` on the command line: the HUD's own number (`21` is `W21`) or a
 * wave's own name, either converted to the 0-based index `jumpToWave` takes. */
export function resolveWaveFlag(value: string, waves: readonly WaveName[]): number {
  const asNumber = Number(value);
  if (Number.isInteger(asNumber)) {
    if (asNumber < 1) {
      throw new Error(`--wave ${value}: wave numbers start at 1, matching the HUD's W1`);
    }
    return asNumber - 1;
  }
  const index = waves.findIndex((w) => w.name.toLowerCase() === value.toLowerCase());
  if (index === -1) {
    throw new Error(
      `--wave "${value}": no wave with that name. Known names: ${waves.map((w) => w.name).join(", ")}`,
    );
  }
  return index;
}
