import { afterAll, expect, test } from "bun:test";
import { TAKEN_MESSAGE } from "@neon-spore/net";
import { relay } from "./relay.ts";
import { signer } from "./signed.ts";

/**
 * The name registry, run.
 *
 * A claim never touches lockstep — it happens once, before a room exists, over
 * a plain HTTP route — so unlike the room, the whole of this is provable
 * without a relay. `relay.ts` raises the shipped worker in a real workerd, so
 * what answers here is the worker that ships, trusting the key pair
 * `signed.ts` made rather than Google's.
 */
const signed = await signer();
const mf = relay(signed.vars);

// Disposed, because `bun test` runs every file in one process and a workerd
// this file left running is one the next file's own has to share a machine
// with. `room.test.ts` does the same for the same reason.
afterAll(() => mf.dispose());

interface Answer {
  ok: boolean;
  name?: string;
  why?: string;
}

/** Miniflare's own `Response`, which is not quite the platform's to `tsc`. */
type Answered = Awaited<ReturnType<typeof mf.dispatchFetch>>;

async function post(path: string, body: unknown): Promise<Answered> {
  return mf.dispatchFetch(`https://room.test${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function claim(name: string, token: string, idToken = ""): Promise<Answer> {
  return (await post("/net/name", { name, token, idToken })).json() as Promise<Answer>;
}

async function mine(token: string, idToken: string): Promise<Answer> {
  return (await post("/net/name/mine", { token, idToken })).json() as Promise<Answer>;
}

test("a free name is given to whoever asks", async () => {
  const answer = await claim("Ada", "token-ada");
  expect(answer).toEqual({ ok: true, name: "Ada" });
});

test("the same device asking again keeps its name", async () => {
  // The second visit must not lock a player out of the name they chose.
  await claim("Grace", "token-grace");
  const again = await claim("Grace", "token-grace");
  expect(again).toEqual({ ok: true, name: "Grace" });
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

test("a signed-in person is given their name back on a new phone", async () => {
  const kate = await signed.token("uid-kate");
  await claim("Katherine", "token-old-phone", kate);
  // The new phone does not remember the name; it asks.
  const back = await mine("token-new-phone", kate);
  expect(back).toEqual({ ok: true, name: "Katherine" });
  // And it really moved: the old device is now the one being refused, which
  // is what a stolen phone needs.
  const old = await claim("Katherine", "token-old-phone");
  expect(old.ok).toBe(false);
  const fresh = await claim("Katherine", "token-new-phone");
  expect(fresh.ok).toBe(true);
});

test("signing in later binds the name the device already had", async () => {
  // Anonymous first: the name was claimed by the token alone, and the sign-in
  // arrives on a later visit. From then on the person owns it.
  await claim("Margaret", "token-margaret");
  const margaret = await signed.token("uid-margaret");
  await claim("Margaret", "token-margaret", margaret);
  const elsewhere = await mine("token-margaret-2", margaret);
  expect(elsewhere.name).toBe("Margaret");
});

test("a person has one name: taking a new one releases the old", async () => {
  const dot = await signed.token("uid-dorothy");
  await claim("Dorothy", "token-dot", dot);
  await claim("Dot", "token-dot", dot);
  expect((await mine("token-dot", dot)).name).toBe("Dot");
  // Dorothy is free again, for anybody.
  expect((await claim("Dorothy", "token-other")).ok).toBe(true);
});

test("the wrong sign-in is refused in the words a taken name is refused in", async () => {
  // The whole point: otherwise this route is a way to ask which names are
  // bound to a sign-in, one guess at a time.
  const barbara = await signed.token("uid-barbara");
  const guesser = await signed.token("uid-guesser");
  await claim("Barbara", "token-barbara", barbara);
  const signedGuess = await claim("Barbara", "token-guesser", guesser);
  const taken = await claim("Barbara", "token-guesser");
  const free = await claim("Someone", "token-guesser");

  expect(signedGuess.ok).toBe(false);
  expect(taken.ok).toBe(false);
  expect(signedGuess).toEqual(taken);
  // A name nobody holds answers differently, which is the only thing a guesser
  // may learn — and it is the thing they were about to learn by claiming it.
  expect(free.ok).toBe(true);
});

test("a token that is not Google's is an anonymous claim", async () => {
  // Forged, expired, for another project, or plain nonsense: every one of
  // them is "not signed in", and a claim under it is the token's alone.
  const ann = await signed.token("uid-ann");
  await claim("Ann-Marie", "token-ann", ann);
  const wrongs = [
    "not.a.token",
    `${ann}x`,
    await signed.token("uid-ann", { exp: Math.floor(Date.now() / 1000) - 600 }),
    await signed.token("uid-ann", { aud: "someone-elses-project" }),
    await signed.token("uid-ann", { iss: "https://securetoken.google.com/other" }),
    await signed.token("uid-ann", { sub: "" }),
    await signed.token("uid-ann", { kid: "not-a-published-key" }),
  ];
  for (const wrong of wrongs) {
    const back = await post("/net/name/mine", { token: "token-thief", idToken: wrong });
    expect(back.status, wrong).toBe(401);
    const moved = await claim("Ann-Marie", "token-thief", wrong);
    expect(moved.ok, wrong).toBe(false);
  }
});

test("a signed-in person with no name yet is told so", async () => {
  const nobody = await signed.token("uid-new");
  expect((await mine("token-new", nobody)).ok).toBe(false);
});

test("a name that is not one is refused before anything is stored", async () => {
  const res = await post("/net/name", { name: "Jo", token: "token-jo" });
  expect(res.status).toBe(400);
});

test("a claim with no device to hold it is refused", async () => {
  const res = await post("/net/name", { name: "Nobody", token: "" });
  expect(res.status).toBe(400);
});

test("the route answers nothing but POST", async () => {
  const res = await mf.dispatchFetch("https://room.test/net/name");
  expect(res.status).toBe(405);
});
