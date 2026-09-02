import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ACT_FILES,
  readWaves,
  STALE_MESSAGE,
  saveWaves,
  type WavesView,
  wavesState,
  wavesToken,
} from "../src/waves-api.js";

/**
 * The director's save used to be last-write-wins over the whole wave list: the
 * page sent the array it had loaded, and anything added to an act file since
 * was overwritten without a word. These hold the guard that replaced it.
 */

/** The three act files exactly as they are, to prove a refusal wrote nothing. */
async function actTexts(): Promise<string[]> {
  return await Promise.all(ACT_FILES.map((act) => Bun.file(act.file).text()));
}

function put(body: unknown): Request {
  return new Request("http://director/api/waves", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("the token follows the act files' contents", async () => {
  const dir = await mkdtemp(join(tmpdir(), "neon-spore-token-"));
  try {
    const acts = ["a", "b", "c"].map((name) => ({
      file: new URL(`file://${join(dir, `${name}.ts`)}`),
      rel: `${name}.ts`,
      exportName: `WAVES_${name.toUpperCase()}`,
    }));
    for (const act of acts) await Bun.write(act.file, "export const X = [];\n");

    const first = await wavesToken(acts);
    expect(await wavesToken(acts)).toBe(first);

    await Bun.write(acts[2]!.file, "export const X = [1];\n");
    expect(await wavesToken(acts)).not.toBe(first);

    // A wave moved from the end of one act to the start of the next changes no
    // byte of the concatenation — the per-file length is what separates them.
    await Bun.write(acts[0]!.file, "ab");
    await Bun.write(acts[1]!.file, "c");
    const split = await wavesToken(acts);
    await Bun.write(acts[0]!.file, "a");
    await Bun.write(acts[1]!.file, "bc");
    expect(await wavesToken(acts)).not.toBe(split);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("GET answers with the waves and the revision they came off", async () => {
  const view = (await (await wavesState()).json()) as WavesView;
  expect(view.waves.length).toBeGreaterThan(0);
  expect(view.token).toBe(await wavesToken());
});

test("a save whose token is stale is refused, and writes nothing", async () => {
  const before = await actTexts();
  const waves = await readWaves();

  const res = await saveWaves(put({ waves: waves.slice(0, 1), token: "not-the-token" }));

  expect(res.status).toBe(409);
  expect(((await res.json()) as { error: string }).error).toBe(STALE_MESSAGE);
  // The refusal is the whole point: had it written, the acts would now hold one
  // wave between them and every other one would be gone.
  expect(await actTexts()).toEqual(before);
});

test("a save with no token at all is refused the same way", async () => {
  const before = await actTexts();
  const res = await saveWaves(put({ waves: await readWaves() }));
  expect(res.status).toBe(409);
  expect(await actTexts()).toEqual(before);
});

test("a body that is not a wave list is refused before the token is even read", async () => {
  const before = await actTexts();
  const res = await saveWaves(put({ token: await wavesToken() }));
  expect(res.status).toBe(400);
  expect(await actTexts()).toEqual(before);
});

test("a save against unchanged files still writes, and hands back the new token", async () => {
  const before = await actTexts();
  const waves = await readWaves();

  const res = await saveWaves(put({ waves, token: await wavesToken() }));
  const body = (await res.json()) as { ok?: boolean; token?: string; error?: string };

  expect(body.error).toBeUndefined();
  expect(res.status).toBe(200);
  expect(body.ok).toBe(true);
  // Round-tripping the waves it just read is a no-op on disk (`serialize.test.ts`
  // holds the serializer to that), so the token is unchanged — but it is the
  // *rehashed* one, which is what lets a page save twice without reloading.
  expect(body.token).toBe(await wavesToken());
  expect(await actTexts()).toEqual(before);
});
