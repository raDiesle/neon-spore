import { afterAll, describe, expect, test } from "bun:test";
import {
  decodeServer,
  NAME_PARAM,
  PROTOCOL_VERSION,
  type ServerMessage,
  VERSION_PARAM,
} from "@neon-spore/net";
import { Miniflare } from "miniflare";

/**
 * The Durable Object, run.
 *
 * `packages/net` is tested against a wire the test controls, which proves the
 * scheduler and proves nothing about this: the seat handout, the `full`
 * refusal, the beat-zero stamp when the second phone lands, the version check.
 * All of that was covered only by `bun run relay:check`, which needs a human to
 * start wrangler and is listed as *unverified* by every session that has none.
 *
 * Miniflare runs the real workerd, so this is the shipped worker answering real
 * upgrades rather than a stand-in for it. The compatibility date is read from
 * `wrangler.jsonc` rather than written here twice, so a test passing on a date
 * the deploy does not use is not a thing that can happen.
 */
const ROOT = new URL("../../../", import.meta.url);

const wrangler = JSON.parse(
  // JSONC, and Bun's parser is JSON. Only whole-line comments appear in it and
  // no string in it contains `//`, so dropping those lines is enough.
  (await Bun.file(new URL("wrangler.jsonc", ROOT)).text()).replace(/^\s*\/\/.*$/gm, ""),
) as { compatibility_date: string };

const built = await Bun.build({
  entrypoints: [Bun.fileURLToPath(new URL("../src/index.ts", import.meta.url))],
  target: "browser",
  format: "esm",
});
if (!built.success) throw new AggregateError(built.logs, "could not build the worker");

const SCRIPT = await built.outputs[0]?.text();

/** The shipped worker, with whatever `vars` the case under test wants on it. */
function relay(vars: Record<string, string> = {}): Miniflare {
  return new Miniflare({
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
            ...Object.fromEntries(
              Object.entries(vars).map(([k, value]) => [k, { type: "text", value }]),
            ),
          },
          // `wrangler.jsonc` migrates `Room` as a `new_sqlite_classes` entry.
          exports: { Room: { type: "durable-object", storage: "sqlite" } },
        },
      },
    ],
    // biome-ignore lint/suspicious/noExplicitAny: miniflare's config type is not exported in a usable shape.
  } as any);
}

const mf = relay();

afterAll(() => mf.dispose());

/** A phone. Opens the socket, keeps everything the room said, and can hang up. */
async function phone(
  code: string,
  version: number | string = PROTOCOL_VERSION,
  server: Miniflare = mf,
  name = "",
) {
  const res = await server.dispatchFetch(
    `https://room.test/room/${code}?${VERSION_PARAM}=${version}&${NAME_PARAM}=${encodeURIComponent(name)}`,
    {
      headers: { Upgrade: "websocket" },
    },
  );
  const socket = res.webSocket;
  const said: ServerMessage[] = [];
  const closed: number[] = [];
  socket?.addEventListener("message", (e) => {
    const m = typeof e.data === "string" ? decodeServer(e.data) : null;
    if (m) said.push(m);
  });
  socket?.addEventListener("close", (e) => closed.push(e.code));
  socket?.accept();
  return {
    status: res.status,
    said,
    closed,
    send: (message: unknown) => socket?.send(JSON.stringify(message)),
    close: () => socket?.close(1000, "left"),
    /** Everything the room has said by the time it has had a chance to say it. */
    settle: async () => {
      await quiet();
      return said;
    },
  };
}

/** A workerd round trip is not synchronous with this loop. This is "it has landed". */
async function quiet(ms = 60): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

const of = <T extends ServerMessage["t"]>(said: ServerMessage[], t: T) =>
  said.filter((m) => m.t === t) as Extract<ServerMessage, { t: T }>[];

describe("a room hands out two seats", () => {
  test("the first phone is seat 1 and is alone", async () => {
    const one = await phone("AAAA");
    await one.settle();
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
    await one.settle();
    const two = await phone("AACC");
    await two.settle();
    await one.settle();

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
    await one.settle();
    const two = await phone("AADD");
    await two.settle();

    one.send({ t: "ready" });
    await one.settle();
    // One press is not a start: the other person has not looked up yet.
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(0);
    expect(of(one.said, "ready").at(-1)?.players).toEqual([1]);
    expect(of(two.said, "ready").at(-1)?.players).toEqual([1]);

    two.send({ t: "ready" });
    await two.settle();
    await one.settle();

    // Neither device picks its own beat zero. That is the whole reason the
    // room exists rather than a handshake between the two phones.
    const stamped = of(two.said, "welcome").at(-1)?.startMs ?? 0;
    expect(stamped).toBeGreaterThan(0);
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(stamped);
    one.close();
    two.close();
  });

  test("a press from one phone alone starts nothing at all", async () => {
    const one = await phone("AAEE");
    await one.settle();
    one.send({ t: "ready" });
    one.send({ t: "ready" });
    await one.settle();
    // Twice, from the only seat there is: a thumb that lands twice is one
    // ready seat, and one ready seat is nobody to start with.
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(0);
    one.close();
  });

  test("a seat that leaves takes its press with it", async () => {
    const one = await phone("AAFF");
    await one.settle();
    const two = await phone("AAFF");
    await two.settle();

    two.send({ t: "ready" });
    await two.settle();
    await one.settle();
    expect(of(one.said, "ready").at(-1)?.players).toEqual([2]);

    two.close();
    await one.settle();
    // The one still here must not be one thumb away from starting a game with
    // nobody in the other chair.
    expect(of(one.said, "ready").at(-1)?.players).toEqual([]);

    const three = await phone("AAFF");
    await three.settle();
    one.send({ t: "ready" });
    await one.settle();
    expect(of(one.said, "welcome").at(-1)?.startMs).toBe(0);
    one.close();
    three.close();
  });

  test("a third phone is refused through the socket, not in front of it", async () => {
    const one = await phone("ACDE");
    const two = await phone("ACDE");
    await two.settle();
    const three = await phone("ACDE");
    await three.settle();

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
    await two.settle();
    two.close();
    await one.settle();
    expect(of(one.said, "peers").at(-1)?.peers).toBe(1);
    one.close();
  });
});

describe("a room relays and answers", () => {
  test("a ping comes back as a pong carrying both server stamps", async () => {
    const one = await phone("AFGH");
    await one.settle();
    one.send({ t: "ping", c1: 1234 });
    await one.settle();
    const [pong] = of(one.said, "pong");
    expect(pong?.c1).toBe(1234);
    expect(pong?.s1).toBeGreaterThan(0);
    expect(pong?.s2).toBeGreaterThanOrEqual(pong?.s1 ?? 0);
    one.close();
  });

  test("an input reaches the peer with the sender's seat on it", async () => {
    const one = await phone("AGHJ");
    const two = await phone("AGHJ");
    await two.settle();
    one.send({ t: "input", tick: 12, commands: [{ kind: "guard" }] });
    await two.settle();
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
    await one.settle();
    const wrong = await phone("AHJK", PROTOCOL_VERSION + 98);
    await wrong.settle();
    await one.settle();

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
    await none.settle();
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
  test("a phone whose socket vanished gets its own seat back", async () => {
    // The window, shortened so the test does not have to sit still for the real
    // one. Everything else is the shipped worker.
    const brief = relay({ SEAT_SILENT_MS: "150" });
    try {
      const one = await phone("CDEF", PROTOCOL_VERSION, brief);
      const two = await phone("CDEF", PROTOCOL_VERSION, brief);
      await two.settle();
      expect(of(two.said, "welcome")[0]?.player).toBe(2);

      // Nobody says anything for longer than the window: the shape of a screen
      // locking in a pocket, where the socket is not closed, it simply stops.
      await quiet(300);

      // The phone comes back. Before the eviction it was told the room it had
      // a seat in was full — by the room holding that very seat for a socket
      // that had stopped answering.
      const back = await phone("CDEF", PROTOCOL_VERSION, brief);
      await back.settle();
      expect(of(back.said, "error")).toEqual([]);
      expect(of(back.said, "welcome")).toHaveLength(1);
      expect(of(back.said, "welcome")[0]?.room).toBe("CDEF");
      one.close();
      two.close();
      back.close();
    } finally {
      await brief.dispose();
    }
  });

  test("a seat that keeps pinging is never evicted", async () => {
    const brief = relay({ SEAT_SILENT_MS: "150" });
    try {
      const one = await phone("CFGH", PROTOCOL_VERSION, brief);
      const two = await phone("CFGH", PROTOCOL_VERSION, brief);
      await two.settle();
      // Every 700 ms in the game; faster here, because the window is.
      for (let i = 0; i < 6; i++) {
        one.send({ t: "ping", c1: i });
        two.send({ t: "ping", c1: i });
        await quiet(50);
      }
      const three = await phone("CFGH", PROTOCOL_VERSION, brief);
      await three.settle();
      expect(of(three.said, "error")[0]?.code).toBe("full");
      one.close();
      two.close();
    } finally {
      await brief.dispose();
    }
  });
});

describe("the names two people are called", () => {
  test("ride the upgrade and come back on the welcome, by seat", async () => {
    const one = await phone("ACAD", PROTOCOL_VERSION, mf, "Ada");
    await one.settle();
    const two = await phone("ACAD", PROTOCOL_VERSION, mf, "David");
    await two.settle();
    await one.settle();

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
    await one.settle();
    const two = await phone("ADAE", PROTOCOL_VERSION, mf, "<img src=x onerror=1>");
    await two.settle();
    await one.settle();

    expect(of(one.said, "welcome").at(-1)?.names).toEqual(["David", ""]);
    one.close();
    two.close();
  });

  test("leave a blank where a seat is empty, so a screen may always read both", async () => {
    const one = await phone("AEAF", PROTOCOL_VERSION, mf, "Ada");
    await one.settle();
    expect(of(one.said, "welcome").at(-1)?.names).toEqual(["Ada", ""]);
    one.close();
  });

  test("go with the seat that leaves", async () => {
    const one = await phone("AFAG", PROTOCOL_VERSION, mf, "Ada");
    await one.settle();
    const two = await phone("AFAG", PROTOCOL_VERSION, mf, "David");
    await two.settle();
    await one.settle();
    two.close();
    await one.settle();
    expect(of(one.said, "peers").at(-1)?.names).toEqual(["Ada", ""]);
    one.close();
  });
});
