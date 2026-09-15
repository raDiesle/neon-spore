import {
  decodeServer,
  NAME_PARAM,
  PROTOCOL_VERSION,
  type ServerMessage,
  VERSION_PARAM,
} from "@neon-spore/net";
import type { Miniflare } from "miniflare";

/**
 * A phone against a relay under test, and the waits that go with one.
 *
 * Written in `room.test.ts` and moved out on 15 September 2026 when the seat
 * swap got a file of its own (`room-seat.test.ts`): the phone is the same
 * phone, and a second copy of `settle`'s reasoning would be a second place for
 * its flake to come back. Everything here is about a socket and the workerd
 * behind it, nothing about what a room should say.
 */

/**
 * **What a test that raises its own relay is allowed to take.**
 *
 * Most cases here share the one `mf` below and cost milliseconds. A handful
 * stand up a *second* workerd of their own, so that `SEAT_SILENT_MS` and
 * `RUN_OVER_MS` can be shortened and the test does not have to sit still for
 * the real windows — and those pay for a worker boot, three socket handshakes
 * and several hundred milliseconds of wall clock it then waits out on purpose.
 * On an idle machine that is comfortably inside bun's five-second default; a
 * workerd starting under load is not. "ends a run nobody came back to" lost
 * that race at 5000.30 ms with three copies of the suite running at once, and
 * the three tests beside it were the same race waiting to be lost.
 *
 * So the budget is written down once, here, next to the windows it is a budget
 * for, rather than as a longer number in whichever test failed first. It is
 * generous because it is not a deadline anybody is trying to meet: a case that
 * genuinely hangs still fails, and one that is merely starved still passes.
 * Pass it to `test` as the third argument whenever `relay(...)` is called for
 * a relay of the test's own.
 */
export const OWN_RELAY_MS = 20_000;

/** A phone. Opens the socket, keeps everything the room said, and can hang up. */
export async function phoneAt(
  server: Miniflare,
  code: string,
  version: number | string = PROTOCOL_VERSION,
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
  /** How many of each kind this phone had already been settled on. */
  const seen = new Map<ServerMessage["t"], number>();
  socket?.addEventListener("message", (e) => {
    const m = typeof e.data === "string" ? decodeServer(e.data) : null;
    if (m) said.push(m);
  });
  socket?.addEventListener("close", (e) => closed.push(e.code));
  socket?.accept();
  const send = (message: unknown) => socket?.send(JSON.stringify(message));
  /**
   * Everything the room has said by the time it has had a chance to say it.
   *
   * **Name what you are waiting for.** `settle()` on its own is one quiet
   * interval and nothing more — a race for anything read afterwards: a workerd
   * round trip is not synchronous with this loop, and under a full `bun run
   * check` — eight shards on a CPU capped at half — one interval is not
   * always enough for a reply to come back. That is the flake this file lost
   * once in 60851 tests and then twice more on landings that had not touched
   * it, each a full check to find out the line meant nothing.
   *
   * `settle("pong")` polls until **one more** message of that kind has landed
   * than the last time this phone was settled on it, then takes one quiet
   * interval on top so anything following it is in `said` too. Counting from
   * the last settle rather than from zero is what makes it right for the
   * `.at(-1)` reads below, where a second welcome carrying a new stamp is the
   * whole point of the wait.
   *
   * `settle("welcome", (w) => w.startMs > 0)` waits until the **last** message
   * of that kind is the one the line below is about to read. It is the form to
   * use wherever the count is not obvious — a join sends a `welcome` *and* a
   * `ready` to a full room, and a wait that had not counted the join's `ready`
   * was satisfied by it and read a list that was not there yet. A wait on the
   * message itself cannot be off by one.
   *
   * On an idle machine either returns in the same 60 ms a bare settle always
   * took; on a loaded one it waits, and if the reply never comes the assertion
   * below it fails on the message that is missing rather than on a timeout that
   * says nothing about which.
   */
  async function settle<T extends ServerMessage["t"]>(
    waitFor?: T,
    where?: (last: Extract<ServerMessage, { t: T }>) => boolean,
  ): Promise<ServerMessage[]> {
    if (waitFor !== undefined) {
      const had = seen.get(waitFor) ?? 0;
      await until(() => {
        const all = of(said, waitFor);
        if (where) {
          const last = all.at(-1);
          return last !== undefined && where(last);
        }
        return all.length > had;
      });
      seen.set(waitFor, of(said, waitFor).length);
    }
    await quiet();
    return said;
  }
  let fences = 0;
  return {
    status: res.status,
    said,
    closed,
    send,
    close: () => socket?.close(1000, "left"),
    settle,
    /**
     * Everything sent on this socket before now has been handled by the room —
     * the fence for a line that asserts *nothing* arrived. A socket's messages
     * are handled in the order they were sent, so the pong to a ping sent
     * behind them is proof the room has seen them and said whatever it was
     * going to. A bare `settle()` in that place was a bet that 60 ms would do.
     */
    caughtUp: async () => {
      send({ t: "ping", c1: 1_000_000 + fences++ });
      await settle("pong");
    },
  };
}

/** A workerd round trip is not synchronous with this loop. This is "it has landed". */
export async function quiet(ms = 60): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Poll until it is true, or give up after `OWN_RELAY_MS` — the same budget the
 * relays get, for the same reason: it is not a deadline anybody is trying to
 * meet, it is the point past which a starved machine and a genuine hang stop
 * being worth telling apart.
 */
export async function until(ok: () => boolean, ms = OWN_RELAY_MS): Promise<void> {
  const deadline = Date.now() + ms;
  while (!ok() && Date.now() < deadline) await quiet(10);
}

export const of = <T extends ServerMessage["t"]>(said: ServerMessage[], t: T) =>
  said.filter((m) => m.t === t) as Extract<ServerMessage, { t: T }>[];
