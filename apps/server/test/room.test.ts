import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { PROTOCOL_VERSION, type ServerMessage } from "@neon-spore/net";
import type { Miniflare } from "miniflare";
import { OWN_RELAY_MS, of, phoneAt, quiet, until } from "./phone.ts";
import { relay } from "./relay.ts";

/**
 * The Durable Object, run.
 *
 * `packages/net` is tested against a wire the test controls, which proves the
 * scheduler and proves nothing about this: the seat handout, the `full`
 * refusal, the beat-zero stamp when the second phone lands, the version check.
 * All of that was covered only by `bun run relay:check`, which needs a human to
 * start wrangler and is listed as *unverified* by every session that has none.
 *
 * `relay.ts` raises the shipped worker in a real workerd, configured out of
 * `wrangler.jsonc` itself.
 */

/**
 * **How short a window a test may set.**
 *
 * The seats are judged silent against the wall clock, and under a full
 * `bun run check` the wall clock runs between two lines of a test as freely
 * as it runs between two pings: at 100 ms and at 150 ms, the gap between a
 * join and the press that followed it went past the window, the room hung the
 * seat up, and the test read a working relay as a broken one (11 September
 * 2026, twice, on landings that had not touched this file). Alone, the same
 * lines are microseconds apart, which is why it never showed there. 600 ms is
 * the figure that has held since; it is written once so the next shortened
 * window is not a new bet.
 */
const BRIEF_SILENT_MS = 600;

/**
 * Arrive until the room says what the test is waiting for it to say.
 *
 * Both eviction and the end of a run are judged when a phone arrives
 * (`Room.fetch`), so the honest way to ask whether a window has passed is to
 * arrive — waiting the window out and arriving once was the other half of the
 * flake, when the deadline elapsed before the room had processed the silence.
 * An arrival that comes too early is refused or handed the old stamp; it hangs
 * up, which gives back nothing (a refused socket was never a seat), and the
 * next attempt costs it nothing. `phone` sends no message, so the arrivals do
 * not move the room's clock.
 */
async function arriveUntil(
  join: () => Promise<Awaited<ReturnType<typeof phone>>>,
  ok: (said: ServerMessage[]) => boolean,
): Promise<Awaited<ReturnType<typeof phone>> | undefined> {
  for (let tries = 0; tries < 60; tries++) {
    const arrival = await join();
    // Either answer will do: a welcome, or the error a full room gives.
    await until(() => arrival.said.length > 0);
    await quiet();
    if (ok(arrival.said)) return arrival;
    arrival.close();
    await quiet(100);
  }
  return undefined;
}

const mf = relay();

// The shared workerd boots on the first request it is given, and under a full
// `bun run check` — eight shards on a CPU capped at half — a boot is not five
// seconds' work for certain, which is all a test gets by default. It is paid
// here, once, against the budget written for it, rather than by whichever
// test happens to come first.
beforeAll(() => mf.ready, OWN_RELAY_MS);

afterAll(() => mf.dispose());

/** A phone at the shared relay unless a test hands over its own (`phone.ts`). */
const phone = (
  code: string,
  version: number | string = PROTOCOL_VERSION,
  server: Miniflare = mf,
  name = "",
) => phoneAt(server, code, version, name);

describe("a room hands out two seats", () => {
  test("the first phone is seat 1 and is alone", async () => {
    const one = await phone("AAAA");
    await one.settle("welcome");
    const [welcome] = of(one.said, "welcome");
    expect(welcome?.player).toBe(1);
    expect(welcome?.peers).toBe(1);
    expect(welcome?.room).toBe("AAAA");
    // No beat zero yet: the room stamps one when it fills, not before.
    expect(welcome?.startMs).toBe(0);
    one.close();
  });

  test("the second phone is seat 2, and neither is started by arriving", async () => {
    const one = await phone("AACC");
    await one.settle("welcome");
    const two = await phone("AACC");
    await two.settle("welcome");
    await one.settle("welcome", (w) => w.peers === 2);

    const second = of(two.said, "welcome");
    expect(second[0]?.player).toBe(2);
    expect(second[0]?.peers).toBe(2);
    // A full room is not a started one. Beat zero waits on two presses — a
    // timer cannot know that two people have looked up from their screens,
    // and a pair dropped onto a field mid-sentence has lost the wave before
    // it began.
    expect(second[0]?.startMs).toBe(0);
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(0);
    one.close();
    two.close();
  });

  test("both presses stamp one beat zero, and both phones are told the same one", async () => {
    const one = await phone("AADD");
    await one.settle("welcome");
    const two = await phone("AADD");
    await two.settle("welcome");
    // Told of the second seat, by name: a welcome not counted here is one the
    // stamp waits below would take for the stamp — the race *leaves a run
    // alone* lost once under a full `bun test`.
    await one.settle("welcome");

    one.send({ t: "ready" });
    // Waited for by what it says, not by count: a full room's join sends a
    // `ready` of its own, with nobody on it, and a wait for "one more ready"
    // was satisfied by that one under a full `bun test` — the line below read
    // a list that was not there yet.
    await one.settle("ready", (r) => r.players.includes(1));
    await two.settle("ready", (r) => r.players.includes(1));
    // One press is not a start: the other person has not looked up yet.
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(0);
    expect(of(one.said, "ready").at(-1)?.players).toEqual([1]);
    expect(of(two.said, "ready").at(-1)?.players).toEqual([1]);

    two.send({ t: "ready" });
    await two.settle("welcome", (w) => w.startMs > 0);
    await one.settle("welcome", (w) => w.startMs > 0);

    // Neither device picks its own beat zero. That is the whole reason the
    // room exists rather than a handshake between the two phones.
    const stamped = of(two.said, "welcome").at(-1)?.startMs ?? 0;
    expect(stamped).toBeGreaterThan(0);
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(stamped);
    one.close();
    two.close();
  });

  test("two more presses restart a run that is already stamped", async () => {
    // The answer to two phones whose worlds have parted: both hold READY,
    // and the room stamps a *second* beat zero over the first. It used to
    // refuse a press outright once a run existed, which left a pair that had
    // gone out of step with nothing to do but leave the room
    // (`apps/server/src/room-start.ts`).
    const one = await phone("ADDA");
    await one.settle("welcome");
    const two = await phone("ADDA");
    await two.settle("welcome");
    await one.settle("welcome", (w) => w.peers === 2);

    one.send({ t: "ready" });
    await one.settle("ready", (r) => r.players.includes(1));
    two.send({ t: "ready" });
    await one.settle("welcome", (w) => w.startMs > 0);
    const first = of(one.said, "welcome").at(-1)?.startMs ?? 0;
    expect(first).toBeGreaterThan(0);

    // And again, on a room that is now mid-run. Counted rather than compared:
    // a Worker's `Date.now()` only moves at I/O, so a second stamp taken in the
    // same breath as the first is allowed to carry the same number — what is
    // being tested is that the room stamps *again* and tells both phones,
    // not that a clock ticked between the two.
    // Each phone's own count: the two of them have not been told the same
    // number of welcomes — the second to arrive missed the first one's.
    const hadOne = of(one.said, "welcome").length;
    const hadTwo = of(two.said, "welcome").length;
    one.send({ t: "ready" });
    await one.settle("ready", (r) => r.players.includes(1));
    two.send({ t: "ready" });
    await one.settle("welcome", () => of(one.said, "welcome").length > hadOne);
    await two.settle("welcome", () => of(two.said, "welcome").length > hadTwo);
    // Both phones are told the same one, which is the whole point: a restart
    // either of them picked for itself is two games again.
    const second = of(one.said, "welcome").at(-1)?.startMs ?? 0;
    expect(second).toBeGreaterThan(0);
    expect(of(two.said, "welcome").at(-1)?.startMs).toBe(second);
    one.close();
    two.close();
  });

  test("keeps the difficulty the pair chose, and hands it back on the welcome", async () => {
    // A level is a tempo, and two phones at two tempi never reach the same
    // tick — so the pair's one answer lives in the room, stored and handed
    // back the way `stats` is (`apps/server/src/room-route.ts`).
    const one = await phone("ADEF");
    await one.settle("welcome");
    expect(of(one.said, "welcome").at(-1)?.level).toBeNull();

    one.send({ t: "level", level: "hard" });
    await one.caughtUp();
    const two = await phone("ADEF");
    await two.settle("welcome");
    expect(of(two.said, "welcome").at(-1)?.level).toBe("hard");

    // And one that is not a level at all never reaches the room: it is refused
    // on the way in, so what the pair chose still stands on the next welcome —
    // which is the one beat zero sends (`protocol-decode.ts`).
    two.send({ t: "level", level: "brutal" });
    await two.caughtUp();
    one.send({ t: "ready" });
    await one.settle("ready", (r) => r.players.includes(1));
    two.send({ t: "ready" });
    await two.settle("welcome", (w) => w.startMs > 0);
    expect(of(two.said, "welcome").at(-1)?.level).toBe("hard");
    one.close();
    two.close();
  });

  test("a press from one phone alone starts nothing at all", async () => {
    const one = await phone("AAEE");
    await one.settle("welcome");
    one.send({ t: "ready" });
    one.send({ t: "ready" });
    // Twice, from the only seat there is: a thumb that lands twice is one
    // ready seat, and one ready seat is nobody to start with. The first press
    // is answered with who has pressed; the second with nothing at all, which
    // is why the fence: both have been handled before the silence is read.
    await one.settle("ready", (r) => r.players.includes(1));
    await one.caughtUp();
    expect(of(one.said, "ready")).toHaveLength(1);
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(0);
    one.close();
  });

  test("a seat that leaves takes its press with it", async () => {
    const one = await phone("AAFF");
    await one.settle("welcome");
    const two = await phone("AAFF");
    await two.settle("welcome");
    await one.settle("welcome", (w) => w.peers === 2);

    two.send({ t: "ready" });
    await two.settle("ready", (r) => r.players.includes(2));
    await one.settle("ready", (r) => r.players.includes(2));
    expect(of(one.said, "ready").at(-1)?.players).toEqual([2]);

    two.close();
    // The seat going is announced twice over — `peers`, and the presses as
    // they now stand — and the second is what the line below reads.
    await one.settle("ready", (r) => r.players.length === 0);
    // The one still here must not be one thumb away from starting a game with
    // nobody in the other chair.
    expect(of(one.said, "ready").at(-1)?.players).toEqual([]);

    const three = await phone("AAFF");
    await three.settle("welcome");
    await one.settle("welcome", (w) => w.peers === 2);
    one.send({ t: "ready" });
    // The press is answered with who has pressed and not with a stamp, so the
    // `ready` is what proves the room handled it before the welcome is read.
    await one.settle("ready", (r) => r.players.includes(1));
    expect(of(one.said, "ready").at(-1)?.players).toEqual([1]);
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(0);
    one.close();
    three.close();
  });

  test("a third phone is refused through the socket, not in front of it", async () => {
    const one = await phone("ACDE");
    const two = await phone("ACDE");
    await two.settle("welcome");
    const three = await phone("ACDE");
    await three.settle("error");
    // The close comes behind the error on the same socket, and it is a frame
    // of its own: waited for, not assumed to fit in the interval after.
    await until(() => three.closed.length > 0);

    // A 409 would reach the page as a socket that would not open, which is
    // indistinguishable from a dead line. The upgrade is completed so the
    // reason can be said in the one vocabulary the indicator reads.
    expect(three.status).toBe(101);
    expect(of(three.said, "error")[0]?.code).toBe("full");
    expect(three.closed[0]).toBe(4000);
    // And it was never a seat: the two in the room hear nothing of it.
    expect(of(two.said, "peers")).toEqual([]);
    expect(of(three.said, "welcome")).toEqual([]);
    one.close();
    two.close();
  });

  test("a seat leaving is announced to the one still there", async () => {
    const one = await phone("ADEF");
    const two = await phone("ADEF");
    await two.settle("welcome");
    two.close();
    await one.settle("peers");
    expect(of(one.said, "peers").at(-1)?.peers).toBe(1);
    one.close();
  });
});

describe("a room relays and answers", () => {
  test("a ping comes back as a pong carrying both server stamps", async () => {
    const one = await phone("AFGH");
    await one.settle("welcome");
    one.send({ t: "ping", c1: 1234 });
    await one.settle("pong");
    const [pong] = of(one.said, "pong");
    expect(pong?.c1).toBe(1234);
    expect(pong?.s1).toBeGreaterThan(0);
    expect(pong?.s2).toBeGreaterThanOrEqual(pong?.s1 ?? 0);
    one.close();
  });

  test("an input reaches the peer with the sender's seat on it", async () => {
    const one = await phone("AGHJ");
    const two = await phone("AGHJ");
    await two.settle("welcome");
    one.send({ t: "input", tick: 12, commands: [{ kind: "guard" }] });
    await two.settle("input");
    const [input] = of(two.said, "input");
    expect(input?.player).toBe(1);
    expect(input?.tick).toBe(12);
    expect(input?.commands).toEqual([{ kind: "guard" }]);
    // It never comes back to the sender: two copies of one press is a desync.
    expect(of(one.said, "input")).toEqual([]);
    one.close();
    two.close();
  });
});

describe("a room refuses what it cannot play with", () => {
  test("a wrong protocol version never reaches a seat", async () => {
    const one = await phone("AHJK");
    await one.settle("welcome");
    const wrong = await phone("AHJK", PROTOCOL_VERSION + 98);
    await wrong.settle("error");
    // The refusal happened inside the upgrade, which has returned; whatever
    // the room said to the seat while refusing is ahead of this fence.
    await one.caughtUp();

    expect(of(wrong.said, "error")[0]?.code).toBe("protocol");
    expect(of(wrong.said, "welcome")).toEqual([]);
    // The seat already in the room is undisturbed: it was never told a peer
    // arrived, and no beat zero was stamped for a run that cannot happen.
    expect(of(one.said, "peers")).toEqual([]);
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(0);
    one.close();
  });

  test("a build with no version at all is refused too", async () => {
    const none = await phone("AJKL", "");
    await none.settle("error");
    expect(of(none.said, "error")[0]?.code).toBe("protocol");
    expect(of(none.said, "welcome")).toEqual([]);
  });

  test("a malformed room path is a 400, not a 500", async () => {
    // `%E0` is not valid UTF-8, so `decodeURIComponent` throws — and an
    // unhandled `URIError` in a worker is a 500 saying nothing.
    expect((await mf.dispatchFetch("https://room.test/room/%E0")).status).toBe(400);
  });

  test("a room code that is not one is a 400, and a stray path a 404", async () => {
    expect((await mf.dispatchFetch("https://room.test/room/AB")).status).toBe(400);
    expect((await mf.dispatchFetch("https://room.test/nowhere")).status).toBe(404);
  });

  test("the health check says which server answered", async () => {
    const res = await mf.dispatchFetch("https://room.test/net/health");
    expect(await res.json()).toEqual({ app: "neon-spore-relay", ok: true });
  });
});

describe("a seat that went silent is not held against its owner", () => {
  test(
    "a phone whose socket vanished gets its own seat back",
    async () => {
      // The window, shortened so the test does not have to sit still for the real
      // one. Everything else is the shipped worker.
      const brief = relay({ SEAT_SILENT_MS: String(BRIEF_SILENT_MS) });
      try {
        const one = await phone("CDEF", PROTOCOL_VERSION, brief);
        const two = await phone("CDEF", PROTOCOL_VERSION, brief);
        await two.settle("welcome");
        expect(of(two.said, "welcome")[0]?.player).toBe(2);

        // Nobody says anything for longer than the window: the shape of a screen
        // locking in a pocket, where the socket is not closed, it simply stops.
        // The phone comes back, and keeps coming back until it is let in.
        // Before the eviction it is told the room it had a seat in is full — by
        // the room holding that very seat for a socket that had stopped
        // answering; after it, it is seated.
        const back = await arriveUntil(
          () => phone("CDEF", PROTOCOL_VERSION, brief),
          (said) => of(said, "welcome").length > 0,
        );
        expect(of(back?.said ?? [], "error")).toEqual([]);
        expect(of(back?.said ?? [], "welcome")).toHaveLength(1);
        expect(of(back?.said ?? [], "welcome")[0]?.room).toBe("CDEF");
        one.close();
        two.close();
        back?.close();
      } finally {
        await brief.dispose();
      }
    },
    OWN_RELAY_MS,
  );

  test(
    "a seat that keeps pinging is never evicted",
    async () => {
      const brief = relay({ SEAT_SILENT_MS: String(BRIEF_SILENT_MS) });
      try {
        const one = await phone("CFGH", PROTOCOL_VERSION, brief);
        const two = await phone("CFGH", PROTOCOL_VERSION, brief);
        await two.settle("welcome");
        // Every 700 ms in the game; faster here, because the window is. Each
        // ping is waited for by its pong — the room stamps the seat before it
        // answers, so a pong is proof the ping counted — and the pinging goes
        // on for twice the window, so that a seat that was going to be evicted
        // for silence has had every chance to be.
        const from = Date.now();
        for (let i = 0; Date.now() - from < 2 * BRIEF_SILENT_MS; i++) {
          one.send({ t: "ping", c1: i });
          two.send({ t: "ping", c1: i });
          await one.settle("pong");
          await two.settle("pong");
        }
        const three = await phone("CFGH", PROTOCOL_VERSION, brief);
        await three.settle("error");
        expect(of(three.said, "error")[0]?.code).toBe("full");
        one.close();
        two.close();
      } finally {
        await brief.dispose();
      }
    },
    OWN_RELAY_MS,
  );
});

describe("the names two people are called", () => {
  test("ride the upgrade and come back on the welcome, by seat", async () => {
    const one = await phone("ACAD", PROTOCOL_VERSION, mf, "Ada");
    await one.settle("welcome");
    const two = await phone("ACAD", PROTOCOL_VERSION, mf, "David");
    await two.settle("welcome");
    await one.settle("welcome", (w) => w.peers === 2);

    // `names[0]` is player 1's, whichever phone is reading it.
    expect(of(two.said, "welcome").at(-1)?.names).toEqual(["Ada", "David"]);
    expect(of(one.said, "welcome").at(-1)?.names).toEqual(["Ada", "David"]);
    one.close();
    two.close();
  });

  test("are clamped by the room, which never reads them", async () => {
    // The room carries a name; it has no opinion about one. What it will not
    // carry is something that is not a name at all — the same rule both
    // clients apply on the way out, applied again on the way in.
    const one = await phone("ADAE", PROTOCOL_VERSION, mf, "  D~a!v?i,d  ");
    await one.settle("welcome");
    const two = await phone("ADAE", PROTOCOL_VERSION, mf, "<img src=x onerror=1>");
    await two.settle("welcome");
    await one.settle("welcome", (w) => w.peers === 2);

    expect(of(one.said, "welcome").at(-1)?.names).toEqual(["David", ""]);
    one.close();
    two.close();
  });

  test("leave a blank where a seat is empty, so a screen may always read both", async () => {
    const one = await phone("AEAF", PROTOCOL_VERSION, mf, "Ada");
    await one.settle("welcome");
    expect(of(one.said, "welcome").at(-1)?.names).toEqual(["Ada", ""]);
    one.close();
  });

  test("go with the seat that leaves", async () => {
    const one = await phone("AFAG", PROTOCOL_VERSION, mf, "Ada");
    await one.settle("welcome");
    const two = await phone("AFAG", PROTOCOL_VERSION, mf, "David");
    await two.settle("welcome");
    await one.settle("welcome", (w) => w.peers === 2);
    two.close();
    await one.settle("peers");
    expect(of(one.said, "peers").at(-1)?.names).toEqual(["Ada", ""]);
    one.close();
  });
});

describe("what the pair got to, and the run that nobody came back to", () => {
  test("is kept, and handed back on the next welcome", async () => {
    const one = await phone("AGAH", PROTOCOL_VERSION, mf, "Ada");
    await one.settle("welcome");
    one.send({ t: "stats", wave: 8, seconds: 222, retries: 2 });
    // A tally is answered with nothing, so the fence is what says it is in:
    // the next arrival's welcome is built from whatever the room holds when
    // the join lands, and a join can land ahead of a message under load.
    await one.caughtUp();

    // The room stores it and never reads it: what proves it is there is that
    // it comes back, not anything the room did with it.
    const two = await phone("AGAH", PROTOCOL_VERSION, mf, "David");
    await two.settle("welcome");
    expect(of(two.said, "welcome").at(-1)?.best).toEqual({ wave: 8, seconds: 222, retries: 2 });
    one.close();
    two.close();
  });

  test("takes the further of the two seats' figures, whole", async () => {
    const one = await phone("AHAJ", PROTOCOL_VERSION, mf, "Ada");
    const two = await phone("AHAJ", PROTOCOL_VERSION, mf, "David");
    await two.settle("welcome");
    // One seat saw the furthest wave; the other dropped early, with an
    // earlier clock. The clock is read at the wave, so it travels with it.
    one.send({ t: "stats", wave: 9, seconds: 300, retries: 1 });
    two.send({ t: "stats", wave: 8, seconds: 200, retries: 0 });
    await one.caughtUp();
    await two.caughtUp();
    one.close();
    two.close();

    const back = await phone("AHAJ", PROTOCOL_VERSION, mf, "Ada");
    await back.settle("welcome");
    expect(of(back.said, "welcome").at(-1)?.best).toEqual({ wave: 9, seconds: 300, retries: 1 });
    back.close();
  });

  test("says nothing at all about a room never played in", async () => {
    const one = await phone("AJAK", PROTOCOL_VERSION, mf, "Ada");
    await one.settle("welcome");
    expect(of(one.said, "welcome").at(-1)?.best).toBeNull();
    one.close();
  });

  test(
    "ends a run nobody came back to, so the next arrival starts a fresh one",
    async () => {
      // Both windows shortened so the test does not sit still for the real ones
      // — the run's kept above the seats', the way the shipped figures are.
      const brief = relay({
        SEAT_SILENT_MS: String(BRIEF_SILENT_MS),
        RUN_OVER_MS: String(BRIEF_SILENT_MS + 300),
      });
      try {
        const one = await phone("AKAL", PROTOCOL_VERSION, brief);
        const two = await phone("AKAL", PROTOCOL_VERSION, brief);
        await two.settle("welcome");
        one.send({ t: "ready" });
        two.send({ t: "ready" });
        await two.settle("welcome", (w) => w.startMs > 0);
        expect(of(two.said, "welcome").at(-1)?.startMs).toBeGreaterThan(0);

        // Both phones stop answering — two pockets rather than one. Without the
        // silence the room keeps the stamp, and the next arrival is handed a
        // beat zero from a game that ended. The arrivals ask whether the run is
        // over (`arriveUntil`): too early, and the room is full, or hands out
        // the old stamp; late enough, and beat zero is fresh.
        const back = await arriveUntil(
          () => phone("AKAL", PROTOCOL_VERSION, brief),
          (said) => of(said, "welcome").at(-1)?.startMs === 0,
        );
        expect(of(back?.said ?? [], "welcome").at(-1)?.startMs).toBe(0);
        back?.close();
      } finally {
        await brief.dispose();
      }
    },
    OWN_RELAY_MS,
  );

  test(
    "leaves a run alone while somebody is still in the room",
    async () => {
      const brief = relay({ SEAT_SILENT_MS: "10000", RUN_OVER_MS: "100" });
      try {
        const one = await phone("ALAM", PROTOCOL_VERSION, brief);
        const two = await phone("ALAM", PROTOCOL_VERSION, brief);
        await two.settle("welcome");
        one.send({ t: "ready" });
        two.send({ t: "ready" });
        // For the *stamped* welcome, by what it says: a bare settle here read
        // the join's, `startMs` 0, under a full `bun test`.
        await two.settle("welcome", (w) => w.startMs > 0);
        const stamped = of(two.said, "welcome").at(-1)?.startMs ?? 0;
        expect(stamped).toBeGreaterThan(0);

        // Quiet for longer than the window, but the seats are still seated: one
        // seat left alone is a wait, not an ending, and its partner may be back.
        await quiet(300);
        const third = await phone("ALAM", PROTOCOL_VERSION, brief);
        await third.settle("error");
        // The room is still busy, and still holding the run it stamped.
        expect(of(third.said, "error")[0]?.code).toBe("full");
        one.close();
        two.close();
        third.close();
      } finally {
        await brief.dispose();
      }
    },
    OWN_RELAY_MS,
  );
});
