import { afterAll, expect, test } from "bun:test";
import { TAKEN_MESSAGE } from "@neon-spore/net";
import { relay } from "../../server/test/relay.ts";
import { signer } from "../../server/test/signed.ts";
import { openHello } from "../src/hello.ts";
import { hasName, readName, syncName, takeName } from "../src/nickname.ts";
import { offerStandIn, signedIn, signedInAs, signInWithGoogle, signOut } from "../src/sign-in.ts";
import { standInAllowed } from "../src/sign-in-standin.ts";
import { installDom } from "./fake-dom.ts";

/**
 * **A sign-in, and the name arriving in the field.**
 *
 * The server half of the registry has been proved against a forged Firebase
 * since it was written — `signed.ts` mints a key pair, the worker trusts it,
 * `names.test.ts` drives real claims through a real Durable Object. The client
 * half had nothing of the kind: `idToken()` asks the Firebase SDK for a
 * signed-in user, so `syncName`, the field it fills and the settings row above
 * it were read off the source and had never run. Signing in by hand needs a
 * Google account and a mailbox, which is not something a session has.
 *
 * So the one thing stood in for is Google's chooser
 * (`sign-in-standin.ts`), and everything else here is the shipped code: the
 * worker that deploys, in a real workerd; the browser's own `fetch` to it; the
 * game's `takeName` and `syncName`; `openHello` building the screen a
 * first-timer meets; and a press on the button that screen draws.
 *
 * What it holds is the whole point of the optional half — **a second phone,
 * with nothing stored, is told what its owner is called rather than asked.**
 */

const signed = await signer();
const mf = relay(signed.vars);
const origin = (await mf.ready).origin;

// Disposed, because `bun test` runs every file in one process and a workerd
// this file left running is one the next file's own has to share a machine
// with — `names.test.ts` and `room.test.ts` do the same.
afterAll(() => {
  dom.restore();
  mf.dispose();
});

/** A phone's storage. Cleared to get a *new* phone, which is what this proves. */
const held = new Map<string, string>();
const global = globalThis as { location?: unknown; localStorage?: unknown };
global.location = { href: `${origin}/`, origin, protocol: "http:", pathname: "/", search: "" };
global.localStorage = {
  getItem: (key: string) => held.get(key) ?? null,
  setItem: (key: string, value: string) => held.set(key, value),
  removeItem: (key: string) => held.delete(key),
};
const dom = installDom();

/** The account Google's chooser hands back, with a token the worker will verify. */
const PERSON = "google-oauth2|first-meeting";
const offered = { email: "someone@example.com", token: () => signed.token(PERSON) };

test("a stand-in is refused anywhere but a relay on this machine", () => {
  // The guard that keeps this out of a deployed game, asked of the address
  // this whole file then runs against.
  expect(standInAllowed()).toBe(true);
  global.location = { href: "https://neon-spore.dev/", origin: "https://neon-spore.dev" };
  expect(standInAllowed()).toBe(false);
  expect(offerStandIn(offered)).toBe(false);
  global.location = { href: `${origin}/`, origin, protocol: "http:", pathname: "/", search: "" };
  // Offered before anything else asks: with one in play Firebase is never
  // made, and nothing in this runner could make it.
  expect(offerStandIn(offered)).toBe(true);
});

test("the first phone claims a name anonymously, then a sign-in binds it", async () => {
  expect(await takeName("DAVID")).toBe("");
  expect(readName()).toBe("DAVID");
  // Nobody is signed in yet: the claim that just went out carried no token,
  // and `syncName` has nothing to reconcile.
  expect(signedIn()).toBe(false);
  await syncName();

  expect(await signInWithGoogle()).toBe("");
  expect(signedIn()).toBe(true);
  expect(signedInAs()).toBe(offered.email);
  // This is the call that binds DAVID to the person rather than the handset:
  // the registry has no name for them yet, so the one this phone holds is
  // claimed again, now signed.
  await syncName();
});

test("a second phone is told the name in the field, not asked for one", async () => {
  await signOut();
  held.clear();
  expect(hasName()).toBe(false);

  let world = true;
  let menu = false;
  openHello(
    (on) => {
      world = on;
    },
    () => {
      menu = true;
    },
  );
  // The screen is up, the world is held behind it, and the menu is waiting.
  expect(world).toBe(true);
  expect(menu).toBe(false);
  const field = dom.byId("helloName");
  expect(field.value).toBe("");
  expect(dom.labelled("THAT IS ME").disabled).toBe(true);

  dom.labelled("LOG IN WITH GOOGLE").click();
  await settled(() => field.value !== "");

  expect(field.value).toBe("DAVID");
  expect(readName()).toBe("DAVID");
  // And the press is still theirs: the name landed in the field, not past it.
  expect(menu).toBe(false);
  expect(dom.labelled("THAT IS ME").disabled).toBe(false);
  dom.labelled("THAT IS ME").click();
  await settled(() => menu);
  expect(menu).toBe(true);
  expect(world).toBe(false);
  expect(dom.body.children).toHaveLength(0);
});

test("somebody else's sign-in is given nothing, and cannot take the name", async () => {
  // The other half of what binding a name to a person means. Without this the
  // registry could hand every signed-in phone the same name and this file
  // would still be green, because everything above it is one person.
  await signOut();
  held.clear();
  expect(
    offerStandIn({ email: "other@example.com", token: () => signed.token(`${PERSON}-2`) }),
  ).toBe(true);
  expect(await signInWithGoogle()).toBe("");
  await syncName();
  expect(readName()).toBe("");
  // And DAVID reads as taken, which is the one sentence a name that is
  // somebody else's is ever answered with.
  expect(await takeName("DAVID")).toBe(TAKEN_MESSAGE);
});

/**
 * Wait for what a press set going.
 *
 * The screen's listeners are `void`ed promises — a press returns before the
 * registry has answered — so there is nothing to await but the thing itself.
 */
async function settled(done: () => boolean, ms = 5000): Promise<void> {
  const end = Date.now() + ms;
  while (!done() && Date.now() < end) await Bun.sleep(10);
}
