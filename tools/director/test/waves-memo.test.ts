import { expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { countWaveArray } from "../src/serialize.js";
import {
  ACT_FILES,
  readWaves,
  wavesImportCount,
  wavesState,
  wavesToken,
} from "../src/waves-api.js";

/**
 * `GET /api/waves` reads the wave list with a dynamic `import()`, and Bun keeps
 * one module record per distinct URL for the life of the process. With
 * `Date.now()` in the query that was a record per request, in a server a
 * beating tab holds up all afternoon — and two requests inside one millisecond
 * shared a record, so one of them could answer with a list from before a save.
 *
 * The key is the act files' own token now. These hold both halves of that:
 * unchanged files are answered from memory, and a different token is a
 * different read.
 */

test("unchanged act files are read once, however many times they are asked for", async () => {
  // After a first call rather than from zero: `bun test` runs every file in one
  // process, and another may have read the waves already.
  await wavesState();
  const once = wavesImportCount();
  await wavesState();
  await wavesState();
  await readWaves();
  await readWaves(await wavesToken());
  expect(wavesImportCount()).toBe(once);
});

test("a token the loader has not seen is a fresh read", async () => {
  const before = wavesImportCount();
  await readWaves("no-file-hashes-to-this");
  expect(wavesImportCount()).toBe(before + 1);
  // ...and only one, because the memo is keyed on the token it was given.
  await readWaves("no-file-hashes-to-this");
  expect(wavesImportCount()).toBe(before + 1);
  // Back to the real one, which the bogus key evicted.
  await readWaves(await wavesToken());
  expect(wavesImportCount()).toBe(before + 2);
});

test("an act's length counted in its source is the length it imports with", async () => {
  // The save cuts the flat list at each act's current length, and used to get
  // that by importing the act file. `countWaveArray` reads it off the source
  // instead, so this is the seam where the two could disagree.
  for (const act of ACT_FILES) {
    const source = await Bun.file(act.file).text();
    const mod = (await import(act.file.href)) as Record<string, unknown[]>;
    expect(countWaveArray(source, act.exportName)).toBe(mod[act.exportName]?.length ?? -1);
  }
});

test("every act file on disk is in ACT_FILES", async () => {
  // The count above proves nothing about an act nobody listed. `waves.ts` is
  // the barrel and not an act, so the directory is the list to compare with.
  const dir = Bun.fileURLToPath(new URL("../../../packages/content/src/waves/", import.meta.url));
  const onDisk = (await readdir(dir)).filter((n) => n.startsWith("act-")).sort();
  const listed = ACT_FILES.map((a) => a.rel.slice(a.rel.lastIndexOf("/") + 1)).sort();
  expect(listed).toEqual(onDisk);
});
