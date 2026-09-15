import { expect, test } from "bun:test";
import type { PlayerId } from "@neon-spore/net";
import {
  arrivalTags,
  HOST_TAG,
  hostOf,
  nameFromTags,
  namesOf,
  nameTag,
  seatTag,
  tagFor,
} from "../src/seat.ts";

/**
 * The tag half of a seat, without a Durable Object.
 *
 * `seat.ts` is a worker file — `DurableObjectState`, `WebSocketPair`,
 * `serializeAttachment` — and half of what is in it is a pure rule about
 * strings: which chair an arrival is tagged with, what a name looks like as a
 * tag, which seat the host holds. This file imports it directly, which is the
 * thing the package's own `tsconfig` now allows: `apps/server` is checked once,
 * by itself, with workerd's types over `src` *and* `test`, so a test may reach
 * any file in the package. It used to be checked twice — the root config took
 * the tests without the worker's globals — and the price was a rule nobody
 * wrote down, that a file a test imports must not import `seat.ts`.
 */

const url = (name?: string) =>
  `https://relay.example/room/HEAA${name === undefined ? "" : `?n=${encodeURIComponent(name)}`}`;

const asking = (player: PlayerId, host: boolean) => ({ player, host });

test("the first phone in is player 1 and hosts; the second is player 2 and does not", () => {
  const first = arrivalTags([], false, url("ada"));
  expect(first.player).toBe(1);
  expect(first.tags).toEqual([seatTag(1), nameTag("ada"), HOST_TAG]);

  const second = arrivalTags([asking(1, true)], false, url("ben"));
  expect(second.player).toBe(2);
  expect(second.tags).toEqual([seatTag(2), nameTag("ben")]);
});

test("a swapped room tags the arrival with the chair, not the seat", () => {
  // The seat is what the room reads through its one swap bit; the tag is the
  // chair, and it cannot be changed once the socket is accepted.
  expect(arrivalTags([], true, url("ada")).tags[0]).toBe(seatTag(2));
  expect(tagFor(1, true)).toBe(seatTag(2));
  expect(tagFor(1, false)).toBe(seatTag(1));
});

test("a room nobody hosts gives the host tag to whoever walks in", () => {
  // Which is how a host that drops and comes back is the host again.
  expect(arrivalTags([asking(1, false)], false, url("ben")).tags).toContain(HOST_TAG);
});

test("a name that is not one arrives as the empty string", () => {
  expect(arrivalTags([], false, url("a~b")).tags[1]).toBe(nameTag(""));
  expect(arrivalTags([], false, url()).tags[1]).toBe(nameTag(""));
  expect(nameFromTags([seatTag(1), nameTag("ada")])).toBe("ada");
  expect(nameFromTags([seatTag(1)])).toBe("");
});

const seat = (player: PlayerId, name: string, host: boolean) => ({
  socket: null as unknown as WebSocket,
  player,
  name,
  host,
});

test("the names go out in seat order, and an empty seat is called nothing", () => {
  expect(namesOf([seat(2, "ben", false), seat(1, "ada", true)])).toEqual(["ada", "ben"]);
  expect(namesOf([seat(2, "ben", true)])).toEqual(["", "ben"]);
});

test("the host's seat is 0 when nobody in the room opened it", () => {
  expect(hostOf([seat(1, "ada", false), seat(2, "ben", true)])).toBe(2);
  expect(hostOf([seat(1, "ada", false)])).toBe(0);
});
