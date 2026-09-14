import { afterAll, beforeAll, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  REAL_FILES,
  readWaves,
  STALE_MESSAGE,
  saveWaves,
  type WaveFiles,
  type WavesView,
  wavesState,
  wavesToken,
} from "../src/waves-api.js";

/**
 * A real save commits what it wrote (`waves-commit.ts`). A test is not an
 * afternoon of authoring, and a suite that leaves commits behind is a suite
 * nobody can run twice — so the commit is off for every test here.
 *
 * Before each one rather than once at the top: `bun test` runs every file in
 * one process, and `waves-commit.test.ts` needs the same variable *unset* to
 * prove the commit happens at all. Neither file may depend on which of them
 * loaded first.
 */
beforeEach(() => {
  process.env.DIRECTOR_NO_COMMIT = "1";
});

/**
 * The director's save used to be last-write-wins over the whole wave list: the
 * page sent the array it had loaded, and anything added to an act file since
 * was overwritten without a word. These hold the guard that replaced it.
 */

/**
 * Every save here goes into a copy of the act files, never the checked-in
 * ones. `tools/check/shard.ts` runs the suite as eight processes on the
 * premise that every writer takes a `mkdtemp` of its own, and this file was
 * the one writer that did not: on 14 September 2026 `waves-memo.test.ts`, in
 * another shard, hashed the real act files between two of this file's
 * writes and read the barrel a second time for a token that had moved.
 *
 * The copy carries the repository's `biome.json` — minus its `vcs` section,
 * which wants a git root the copy has not got — so the formatter pass a save
 * ends with runs under the same rules and finds nothing to fix.
 */
let dir = "";
let copy: WaveFiles;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "neon-spore-save-"));
  const copied = async (from: URL, rel: string) => {
    const at = join(dir, rel);
    await mkdir(dirname(at), { recursive: true });
    await Bun.write(at, Bun.file(from));
    return pathToFileURL(at);
  };
  const acts = [];
  for (const act of REAL_FILES.acts) acts.push({ ...act, file: await copied(act.file, act.rel) });
  const boards = {
    ...REAL_FILES.boards,
    file: await copied(REAL_FILES.boards.file, REAL_FILES.boards.rel),
  };
  const biome = (await Bun.file(join(REAL_FILES.root, "biome.json")).json()) as Record<
    string,
    unknown
  >;
  delete biome.vcs;
  await Bun.write(join(dir, "biome.json"), JSON.stringify(biome));
  copy = { root: dir, acts, boards };
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

/**
 * Every source file a save may write, exactly as it is, to prove a refusal
 * wrote nothing and an unchanged save changed nothing.
 *
 * PINBALL's boards are in here beside the acts because they are the one piece
 * of authored boss content that lives outside them — and because leaving them
 * out cost a real regression once: the board file was silently rewritten by
 * this very test, losing the comments beside each table, and every assertion
 * here still passed.
 */
async function actTexts(files: WaveFiles): Promise<string[]> {
  const all = [...files.acts.map((act) => act.file), files.boards.file];
  return await Promise.all(all.map((file) => Bun.file(file).text()));
}

function put(body: unknown): Request {
  return new Request("http://director/api/waves", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("the token follows the act files' contents", async () => {
  const at = await mkdtemp(join(tmpdir(), "neon-spore-token-"));
  try {
    const acts = ["a", "b", "c"].map((name) => ({
      file: pathToFileURL(join(at, `${name}.ts`)),
      rel: `${name}.ts`,
      exportName: `WAVES_${name.toUpperCase()}`,
    }));
    for (const act of acts) await Bun.write(act.file, "export const X = [];\n");
    const files: WaveFiles = { root: at, acts, boards: copy.boards };

    const first = await wavesToken(files);
    expect(await wavesToken(files)).toBe(first);

    await Bun.write(acts[2]!.file, "export const X = [1];\n");
    expect(await wavesToken(files)).not.toBe(first);

    // A wave moved from the end of one act to the start of the next changes no
    // byte of the concatenation — the per-file length is what separates them.
    await Bun.write(acts[0]!.file, "ab");
    await Bun.write(acts[1]!.file, "c");
    const split = await wavesToken(files);
    await Bun.write(acts[0]!.file, "a");
    await Bun.write(acts[1]!.file, "bc");
    expect(await wavesToken(files)).not.toBe(split);
  } finally {
    await rm(at, { recursive: true, force: true });
  }
});

test("GET answers with the waves and the revision they came off", async () => {
  const view = (await (await wavesState()).json()) as WavesView;
  expect(view.waves.length).toBeGreaterThan(0);
  expect(view.token).toBe(await wavesToken());
});

test("a save whose token is stale is refused, and writes nothing", async () => {
  const before = await actTexts(copy);
  const waves = await readWaves();

  const res = await saveWaves(put({ waves: waves.slice(0, 1), token: "not-the-token" }), copy);

  expect(res.status).toBe(409);
  expect(((await res.json()) as { error: string }).error).toBe(STALE_MESSAGE);
  // The refusal is the whole point: had it written, the acts would now hold one
  // wave between them and every other one would be gone.
  expect(await actTexts(copy)).toEqual(before);
});

test("a board file changed under the page is refused like an act", async () => {
  // `waves-acts.ts` said the board file was "read into the token" from the
  // day a save began writing it, and it was not: a board edited on disk while
  // a page was open went under that page's next save. The token hashes it now.
  const token = await wavesToken(copy);
  const boards = Bun.file(copy.boards.file);
  const was = await boards.text();
  try {
    await Bun.write(boards, `${was}// a board edited on disk, after the page loaded\n`);
    const before = await actTexts(copy);

    const res = await saveWaves(put({ waves: await readWaves(), token }), copy);

    expect(res.status).toBe(409);
    expect(await actTexts(copy)).toEqual(before);
  } finally {
    await Bun.write(boards, was);
  }
});

test("a save with no token at all is refused the same way", async () => {
  const before = await actTexts(copy);
  const res = await saveWaves(put({ waves: await readWaves() }), copy);
  expect(res.status).toBe(409);
  expect(await actTexts(copy)).toEqual(before);
});

test("a body that is not a wave list is refused before the token is even read", async () => {
  const before = await actTexts(copy);
  const res = await saveWaves(put({ token: await wavesToken(copy) }), copy);
  expect(res.status).toBe(400);
  expect(await actTexts(copy)).toEqual(before);
});

test("a save against unchanged files still writes, and hands back the new token", async () => {
  const before = await actTexts(copy);
  const waves = await readWaves();

  const res = await saveWaves(put({ waves, token: await wavesToken(copy) }), copy);
  const body = (await res.json()) as { ok?: boolean; token?: string; error?: string };

  expect(body.error).toBeUndefined();
  expect(res.status).toBe(200);
  expect(body.ok).toBe(true);
  // Round-tripping the waves it just read is a no-op on disk (`serialize.test.ts`
  // holds the serializer to that), so the token is unchanged — but it is the
  // *rehashed* one, which is what lets a page save twice without reloading.
  expect(body.token).toBe(await wavesToken(copy));
  expect(await actTexts(copy)).toEqual(before);
});

test("a save into the copy leaves the checked-in files untouched, to the mtime", async () => {
  // Bytes would not show it: the round trip writes the same ones back. What a
  // shard reading the real tree would notice is the write itself, and a write
  // of identical bytes still moves the modification time.
  const real = [...REAL_FILES.acts.map((act) => act.file), REAL_FILES.boards.file];
  const before = real.map((file) => Bun.file(file).lastModified);
  const waves = await readWaves();

  const res = await saveWaves(put({ waves, token: await wavesToken(copy) }), copy);

  expect(res.status).toBe(200);
  expect(real.map((file) => Bun.file(file).lastModified)).toEqual(before);
});
