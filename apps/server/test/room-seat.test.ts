import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { PROTOCOL_VERSION } from "@neon-spore/net";
import { seatSwap } from "../src/room-seat.ts";
import { OWN_RELAY_MS, of, phoneAt } from "./phone.ts";
import { relay } from "./relay.ts";

/**
 * Who holds which seat, once the pair have a say in it (`room-seat.ts`).
 *
 * The rule is pure and proved first, without a workerd. The Durable Object is
 * then proved to apply it — the tags are immutable and the swap is one bit
 * read on every seat lookup (`seat.ts`), which no unit of the rule can show.
 */

const seat = (player: 1 | 2, host: boolean) => ({ player, host });

describe("the swap rule", () => {
  test("the host asking for the other seat turns the bit, both ways", () => {
    expect(seatSwap(seat(1, true), 2, 0, false)).toBe(true);
    expect(seatSwap(seat(2, true), 1, 0, true)).toBe(false);
  });

  test("asking for the seat already held changes nothing", () => {
    expect(seatSwap(seat(1, true), 1, 0, false)).toBeNull();
  });

  test("a phone that is not the host has no say", () => {
    expect(seatSwap(seat(2, false), 1, 0, false)).toBeNull();
  });

  test("after beat zero the seats are settled", () => {
    expect(seatSwap(seat(1, true), 2, 1_000, false)).toBeNull();
  });
});

const mf = relay();
beforeAll(() => mf.ready, OWN_RELAY_MS);
afterAll(() => mf.dispose());

/** A seated phone: an upgrade the room refused is a test that would only hang. */
const phone = async (code: string, name = "") => {
  const p = await phoneAt(mf, code, PROTOCOL_VERSION, name);
  if (p.status !== 101) throw new Error(`the room answered ${p.status} to ${name} at ${code}`);
  return p;
};

describe("a room lets the host pick the seats", () => {
  test("the welcome names the host, and it is the phone that opened the room", async () => {
    const one = await phone("HEAA", "ada");
    await one.settle("welcome");
    expect(of(one.said, "welcome").at(-1)).toMatchObject({ player: 1, host: 1 });
    const two = await phone("HEAA", "ben");
    await two.settle("welcome");
    expect(of(two.said, "welcome").at(-1)).toMatchObject({ player: 2, host: 1 });
    one.close();
    two.close();
  });

  test("the host's pick swaps both seats and re-welcomes both phones", async () => {
    const one = await phone("HEAC", "ada");
    await one.settle("welcome");
    const two = await phone("HEAC", "ben");
    await two.settle("welcome");
    await one.settle("welcome");

    // A press before the swap is a press for a seat that is about to be
    // somebody else's, and goes with the swap.
    one.send({ t: "ready" });
    await two.settle("ready", (r) => r.players.includes(1));

    one.send({ t: "seat", seat: 2 });
    await one.settle("welcome", (w) => w.player === 2);
    await two.settle("welcome", (w) => w.player === 1);
    // The names follow the seats: ada holds seat 2 now, so seat 2 is "ada".
    expect(of(one.said, "welcome").at(-1)).toMatchObject({
      player: 2,
      host: 2,
      names: ["ben", "ada"],
    });
    expect(of(two.said, "welcome").at(-1)).toMatchObject({ player: 1, host: 2 });
    await one.settle("ready", (r) => r.players.length === 0);
    expect(of(two.said, "ready").at(-1)?.players).toEqual([]);

    // And a press from the swapped seat is counted under the seat it now holds.
    one.send({ t: "ready" });
    await two.settle("ready", (r) => r.players.includes(2));
    expect(of(two.said, "ready").at(-1)?.players).toEqual([2]);
    one.close();
    two.close();
  });

  test("the other phone's pick is ignored where it lands", async () => {
    const one = await phone("HEAD", "ada");
    await one.settle("welcome");
    const two = await phone("HEAD", "ben");
    await two.settle("welcome");
    await one.settle("welcome");
    const before = of(one.said, "welcome").length;

    two.send({ t: "seat", seat: 1 });
    await two.caughtUp();
    await one.caughtUp();
    expect(of(one.said, "welcome").length).toBe(before);
    expect(of(two.said, "welcome").at(-1)).toMatchObject({ player: 2, host: 1 });
    one.close();
    two.close();
  });

  test("a pick after beat zero is ignored: two people mid-run have agreed", async () => {
    const one = await phone("HEAE", "ada");
    await one.settle("welcome");
    const two = await phone("HEAE", "ben");
    await two.settle("welcome");
    await one.settle("welcome");
    one.send({ t: "ready" });
    two.send({ t: "ready" });
    await one.settle("welcome", (w) => w.startMs > 0);
    await two.settle("welcome", (w) => w.startMs > 0);
    const stamped = of(one.said, "welcome").length;

    one.send({ t: "seat", seat: 2 });
    await one.caughtUp();
    expect(of(one.said, "welcome").length).toBe(stamped);
    expect(of(one.said, "welcome").at(-1)?.player).toBe(1);
    one.close();
    two.close();
  });

  test("the host's tempo reaches the other phone on a fresh welcome", async () => {
    const one = await phone("HEAF", "ada");
    await one.settle("welcome");
    const two = await phone("HEAF", "ben");
    await two.settle("welcome");
    await one.settle("welcome");
    expect(of(two.said, "welcome").at(-1)?.level).toBeNull();

    one.send({ t: "level", level: "hard" });
    await two.settle("welcome", (w) => w.level === "hard");
    await one.settle("welcome", (w) => w.level === "hard");
    expect(of(two.said, "welcome").at(-1)).toMatchObject({ player: 2, level: "hard" });
    one.close();
    two.close();
  });

  test("a tempo after beat zero is refused: the game that exists keeps its own", async () => {
    // The owner, 15 September 2026: a game that already exists does not change
    // its difficulty. The screen refuses first (`join-room.ts` `mayShape`) and
    // this is the half that holds whatever the phone sends.
    const one = await phone("HEAH", "ada");
    await one.settle("welcome");
    const two = await phone("HEAH", "ben");
    await two.settle("welcome");
    await one.settle("welcome");

    one.send({ t: "level", level: "hard" });
    await two.settle("welcome", (w) => w.level === "hard");
    one.send({ t: "ready" });
    two.send({ t: "ready" });
    await one.settle("welcome", (w) => w.startMs > 0);
    const stamped = of(one.said, "welcome").length;

    one.send({ t: "level", level: "easy" });
    await one.caughtUp();
    expect(of(one.said, "welcome").length).toBe(stamped);
    expect(of(one.said, "welcome").at(-1)?.level).toBe("hard");
    one.close();
    two.close();
  });

  test("an empty room forgets the swap: the next pair starts as they arrive", async () => {
    const one = await phone("HEAG", "ada");
    await one.settle("welcome");
    const two = await phone("HEAG", "ben");
    await two.settle("welcome");
    await one.settle("welcome");
    one.send({ t: "seat", seat: 2 });
    await one.settle("welcome", (w) => w.player === 2);
    one.close();
    two.close();
    await two.settle();

    const three = await phone("HEAG", "cid");
    await three.settle("welcome");
    expect(of(three.said, "welcome").at(-1)).toMatchObject({ player: 1, host: 1 });
    three.close();
  });
});
