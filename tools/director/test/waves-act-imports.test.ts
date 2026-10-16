import { afterAll, beforeAll, expect } from "bun:test";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { WAVES, type Wave } from "@neon-spore/content";
import { itCosts } from "../../test/figure.js";
import { ACT_LIST, actFilesIn } from "../src/waves-act-files.js";
import { idsInAct } from "../src/waves-act-list.js";
import { REAL_FILES, repoRootPath, type WaveFiles, writeWaves } from "../src/waves-acts.js";

/**
 * **A wave dragged into another act takes its import with it** (`fixImports`
 * in `waves-act-list.ts`).
 *
 * On 14 October 2026 the owner dragged THE INSTAR up the wave editor and
 * saved, and five act files came back red: each moved wave named a constant
 * — `INSTAR_SCRIPT`, a board list, a script — that only the file it left
 * imported, and the game died on `INSTAR_SCRIPT is not defined`. So this
 * moves a scripted boss out of act one and into the act after it — THE
 * BROOD since THE INSTAR left the arc (16 October 2026) — then runs the
 * real `tsc` over the act files the save wrote, with `noUnusedLocals` so an
 * import left behind fails as surely as one not carried.
 *
 * The save writes into a copy of the whole of `packages/content/src`, the
 * shard rule `wave-save.test.ts` explains; the act files' `../` imports find
 * the copy, and `@neon-spore/*` is pointed at the real packages.
 */

const CONTENT = "packages/content/src";

let dir = "";
let copy: WaveFiles;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "neon-spore-act-imports-"));
  await cp(join(repoRootPath, CONTENT), join(dir, CONTENT), { recursive: true });
  const inCopy = (rel: string) => pathToFileURL(join(dir, rel));
  const biome = (await Bun.file(join(repoRootPath, "biome.json")).json()) as Record<
    string,
    unknown
  >;
  delete biome.vcs;
  await Bun.write(join(dir, "biome.json"), JSON.stringify(biome));
  const list = { ...ACT_LIST, file: inCopy(ACT_LIST.rel) };
  copy = {
    root: dir,
    acts: actFilesIn(list),
    list,
    boards: { ...REAL_FILES.boards, file: inCopy(REAL_FILES.boards.rel) },
    arenas: REAL_FILES.arenas.map((a) => ({ ...a, file: inCopy(a.rel) })),
  };
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

/** `tsc` over the act files alone, and what it said. */
async function typecheck(): Promise<string> {
  const tsconfig = {
    extends: join(repoRootPath, "tsconfig.json"),
    compilerOptions: {
      types: [],
      noUnusedLocals: true,
      paths: { "@neon-spore/*": [join(repoRootPath, "packages/*/src/index.ts")] },
    },
    include: [`${CONTENT}/waves/*.ts`],
  };
  await Bun.write(join(dir, "tsconfig.json"), JSON.stringify(tsconfig));
  const tsc = join(repoRootPath, "node_modules", ".bin", "tsc");
  const proc = Bun.spawn([tsc, "--noEmit", "-p", join(dir, "tsconfig.json")], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  return (await proc.exited) === 0 ? "" : out;
}

/**
 * A save, Biome over what it wrote, then `tsc` over the act files: 790 ms in
 * all, alone, on 14 October 2026, about half of it `tsc` — which, run by hand
 * on a copy with act one's import struck out, said TS2304 in 460 ms.
 */
const SAVE_AND_CHECK_MS = 800;

itCosts(SAVE_AND_CHECK_MS, "THE BROOD dragged into the next act carries BROOD_SCRIPT", async () => {
  const first = copy.acts[0];
  const next = copy.acts.find((a) => !/\/act-1(-p\d+)?\.ts$/.test(a.rel));
  if (!first || !next) throw new Error("no act one, or no act after it");
  const brood = WAVES.find((w) => w.boss?.kind === "brood");
  const landing = idsInAct(await Bun.file(next.file).text(), next.exportName)[0];
  if (!brood || !landing) throw new Error("no brood wave, or an empty second act");
  expect(await Bun.file(first.file).text()).toContain("BROOD_SCRIPT");

  // Dropped just after the next act's first wave: it joins that act.
  const rest = WAVES.filter((w) => w !== brood);
  const at = rest.findIndex((w) => w.id === landing) + 1;
  const waves: Wave[] = [...rest.slice(0, at), brood, ...rest.slice(at)];
  const { complaint } = await writeWaves(waves, copy);
  expect(complaint).toBeNull();

  expect(idsInAct(await Bun.file(next.file).text(), next.exportName)).toContain(brood.id);
  expect(await Bun.file(first.file).text()).not.toContain("BROOD_SCRIPT");
  expect(await Bun.file(next.file).text()).toContain(
    'import { BROOD_SCRIPT } from "../brood-script.js";',
  );
  expect(await typecheck()).toBe("");
});
