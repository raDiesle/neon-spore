import { mkdir, readdir, readFile, symlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { root } from "./exec.js";
import { withScratchTree } from "./scratch.js";

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
 * lists. `waves.ts` reaches `@neon-spore/sim` through `maze-rounds.ts`, and
 * that import only resolves once the workspace link exists in this checkout's
 * own `node_modules` — which is all it needs, so `linkWorkspaces` makes the
 * links and nothing else.
 */
export async function waveNamesAt(rev: string): Promise<WaveName[]> {
  return withScratchTree(rev, async (scratch) => {
    await linkWorkspaces(scratch);
    const url = pathToFileURL(join(scratch, "packages/content/src/waves.ts")).href;
    const mod = (await import(url)) as { WAVES: readonly WaveName[] };
    return mod.WAVES.map((w) => ({ name: w.name }));
  });
}

/**
 * The links `bun install` would make for the workspace's own packages, and
 * none of the rest of what it does.
 *
 * Until 30 September 2026 this ran `bun install`, and the answer cost what
 * installing and then deleting wrangler, TypeScript and Biome cost: on a busy
 * Mac 1 s to check out, 6 s to install, 2 s to import and 18 s to take the
 * `node_modules` off disk again, which timed out `test/wave.test.ts` under
 * three lanes' checks. `WAVES` reaches only workspace packages, and a link is
 * what a workspace package is in `node_modules`. The link is a junction, which
 * Windows makes without an administrator and every other system ignores.
 */
export async function linkWorkspaces(scratch: string): Promise<void> {
  const manifest = JSON.parse(await readFile(join(scratch, "package.json"), "utf8")) as {
    workspaces?: string[];
  };
  for (const glob of manifest.workspaces ?? []) {
    const parent = glob.replace(/\/\*$/, "");
    for (const dir of await readdir(join(scratch, parent)).catch(() => [])) {
      const pkg = join(scratch, parent, dir);
      const text = await readFile(join(pkg, "package.json"), "utf8").catch(() => "");
      const name = text === "" ? undefined : (JSON.parse(text) as { name?: string }).name;
      if (name === undefined) continue;
      const link = join(scratch, "node_modules", name);
      await mkdir(dirname(link), { recursive: true });
      await symlink(pkg, link, "junction");
    }
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
