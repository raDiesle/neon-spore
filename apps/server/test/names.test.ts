import { afterAll, expect, test } from "bun:test";
import { TAKEN_MESSAGE } from "@neon-spore/net";
import { Miniflare } from "miniflare";

/**
 * The name registry, run.
 *
 * A claim never touches lockstep — it happens once, before a room exists, over
 * a plain HTTP route — so unlike the room, the whole of this is provable
 * without a relay. Miniflare runs the real workerd, so what answers here is
 * the shipped worker.
 */
const ROOT = new URL("../../../", import.meta.url);

const wrangler = JSON.parse(
  (await Bun.file(new URL("wrangler.jsonc", ROOT)).text()).replace(/^\s*\/\/.*$/gm, ""),
) as { compatibility_date: string };

const built = await Bun.build({
  entrypoints: [Bun.fileURLToPath(new URL("../src/index.ts", import.meta.url))],
  target: "browser",
  format: "esm",
});
if (!built.success) throw new AggregateError(built.logs, "could not build the worker");
const SCRIPT = await built.outputs[0]?.text();

const mf = new Miniflare({
  workers: [
    {
      config: {
        type: "worker",
        name: "relay",
        compatibilityDate: wrangler.compatibility_date,
        manifest: {
          mainModule: "index.mjs",
          modulesRoot: Bun.fileURLToPath(ROOT),
          modules: { "index.mjs": { type: "esm", contents: SCRIPT } },
        },
        env: {
          ROOMS: { type: "durable-object", worker: "relay", exportName: "Room" },
          NAMES: { type: "durable-object", worker: "relay", exportName: "Names" },
        },
        exports: {
          Room: { type: "durable-object", storage: "sqlite" },
          Names: { type: "durable-object", storage: "sqlite" },
        },
      },
    },
  ],
  // biome-ignore lint/suspicious/noExplicitAny: miniflare's config type is not exported in a usable shape.
} as any);

// Disposed, because `bun test` runs every file in one process and a workerd
// this file left running is one the next file's own has to share a machine
// with. `room.test.ts` does the same for the same reason.
afterAll(() => mf.dispose());

interface Answer {
  ok: boolean;
  name?: string;
  code?: string;
  why?: string;
}

async function claim(name: string, token: string, code = ""): Promise<Answer> {
  const res = await mf.dispatchFetch("https://room.test/net/name", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, token, code }),
  });
  return (await res.json()) as Answer;
}

test("a free name is given to whoever asks, with a code to keep", async () => {
  const answer = await claim("Ada", "token-ada");
  expect(answer.ok).toBe(true);
  expect(answer.name).toBe("Ada");
  // Minted inside the object and sent exactly once, here.
  expect(answer.code).toMatch(/^[ACDEFGHJKLMNPQRTUVWXY3479]{4}$/);
});

test("the same device asking again keeps its name, and is told no new code", async () => {
  // The second visit must not lock a player out of the name they chose — and
  // a fresh code would quietly invalidate whatever they wrote down.
  const first = await claim("Grace", "token-grace");
  const again = await claim("Grace", "token-grace");
  expect(again.ok).toBe(true);
  expect(again.name).toBe("Grace");
  expect(again.code).toBeUndefined();
  expect(first.code).toBeDefined();
});

test("another device asking for the same name is refused", async () => {
  await claim("Alan", "token-alan");
  const other = await claim("Alan", "token-someone-else");
  expect(other.ok).toBe(false);
  expect(other.why).toBe(TAKEN_MESSAGE);
});

test("a name is one name however it is capitalised", async () => {
  // Two people called DAVID in one room is the thing this exists to prevent,
  // and "David" against "DAVID" would not prevent it.
  await claim("David", "token-david");
  const shouty = await claim("DAVID", "token-impostor");
  expect(shouty.ok).toBe(false);
});

test("the right recovery code moves the name to the new device", async () => {
  const first = await claim("Katherine", "token-old-phone");
  const moved = await claim("Katherine", "token-new-phone", first.code ?? "");
  expect(moved.ok).toBe(true);
  expect(moved.name).toBe("Katherine");

  // And it really moved: the old device is now the one being refused.
  const old = await claim("Katherine", "token-old-phone");
  expect(old.ok).toBe(false);
});

test("a recovery code is not case-sensitive, because it is read off a screen", async () => {
  const first = await claim("Margaret", "token-margaret");
  const moved = await claim("Margaret", "token-margaret-2", (first.code ?? "").toLowerCase());
  expect(moved.ok).toBe(true);
});

test("a wrong recovery code is refused in the words a taken name is refused in", async () => {
  // The whole point: otherwise this route is a way to ask which names exist,
  // one guess at a time, and a guesser could tell "wrong code" from "not a
  // name anybody holds".
  await claim("Barbara", "token-barbara");
  const guessed = await claim("Barbara", "token-guesser", "XXXX");
  const taken = await claim("Barbara", "token-guesser");
  const free = await claim("Someone", "token-guesser");

  expect(guessed.ok).toBe(false);
  expect(taken.ok).toBe(false);
  expect(guessed).toEqual(taken);
  // A name nobody holds answers differently, which is the only thing a guesser
  // may learn — and it is the thing they were about to learn by claiming it.
  expect(free.ok).toBe(true);
});

test("a name that is not one is refused before anything is stored", async () => {
  const res = await mf.dispatchFetch("https://room.test/net/name", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Jo", token: "token-jo" }),
  });
  expect(res.status).toBe(400);
});

test("a claim with no device to hold it is refused", async () => {
  const res = await mf.dispatchFetch("https://room.test/net/name", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Nobody", token: "" }),
  });
  expect(res.status).toBe(400);
});

test("the route answers nothing but POST", async () => {
  const res = await mf.dispatchFetch("https://room.test/net/name");
  expect(res.status).toBe(405);
});
