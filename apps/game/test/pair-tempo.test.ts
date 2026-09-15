import { describe, expect, it } from "bun:test";
import type { ClientMessage, LinkStatus, ServerMessage } from "@neon-spore/net";
import { createWorld, DEFAULT_CONFIG, type Difficulty } from "@neon-spore/sim";
import { createLink } from "../src/link.js";
import type { RoomSocket, RoomSocketHandlers } from "../src/link-socket.js";
import { afterPlayingWith, newPartner, type Partner } from "../src/partners.js";

/**
 * **A game's tempo is fixed once it is made**, and NEW GAME is the way to
 * another.
 *
 * The owner, 15 September 2026. It is picked once, by the host, on the room
 * screen while the game is being made (`join-room-step.ts`), and after that the
 * only way to a different one is to start over — which overrides the game these
 * two had, wave and all. What that took away is a page: the gear on a partner's
 * row and the three tempi behind it, and the wish a join used to carry into a
 * room with it. This file holds both halves of what is left — what a record
 * keeps, and what a join says.
 */

const ada: Partner = { name: "Ada", furthest: 6, level: "medium" };

describe("a partner's record", () => {
  it("keeps the wave the two of them reached, when they carry on", () => {
    const next = afterPlayingWith([ada, newPartner("David")], "Ada", "medium");
    expect(next[0]).toEqual({ name: "Ada", furthest: 6, level: "medium" });
  });

  it("starts the wave again on a new game, at the tempo the new room settled on", () => {
    // The whole of the owner's rule in one line: a wave cleared at one tempo
    // was not cleared at another, so a new game takes both or neither.
    const next = afterPlayingWith([ada], "Ada", "hard", true);
    expect(next[0]).toEqual({ name: "Ada", furthest: 0, level: "hard" });
  });

  it("starts a new game at the tempo they had, when the new room says nothing yet", () => {
    const next = afterPlayingWith([ada], "Ada", null, true);
    expect(next[0]).toEqual({ name: "Ada", furthest: 0, level: "medium" });
  });

  it("reads a name the way the rest of the store does, so a phone's capitals do not matter", () => {
    expect(afterPlayingWith([ada], "ADA", "hard", true)[0]?.furthest).toBe(0);
    expect(afterPlayingWith([ada], " ada ", "hard", true)[0]?.level).toBe("hard");
  });

  it("leaves everybody else where they were", () => {
    const kept = [newPartner("David"), ada];
    const next = afterPlayingWith(kept, "Ada", "hard", true);
    expect(next.map((one) => one.name)).toEqual(["Ada", "David"]);
    expect(next[1]).toEqual(newPartner("David"));
  });
});

/** A socket that keeps what was sent, which is the whole of what is asked here. */
function fakeSocket() {
  let handlers: RoomSocketHandlers | null = null;
  const sent: ClientMessage[] = [];
  const socket: RoomSocket = {
    send: (message) => {
      sent.push(message);
    },
    close: () => {},
    frame: () => {},
    rearm: () => {},
    surrender: () => {},
    present: true,
    awayMs: 0,
  };
  return {
    sent,
    open: (_room: string, on: RoomSocketHandlers): RoomSocket => {
      handlers = on;
      return socket;
    },
    say: (message: ServerMessage) => handlers?.message(message),
  };
}

function linked() {
  const wire = fakeSocket();
  const seen: LinkStatus[] = [];
  const link = createLink({
    cfg: DEFAULT_CONFIG,
    world: createWorld(DEFAULT_CONFIG, 1),
    buffer: { drain: () => [] },
    onStart: () => {},
    onStatus: (status) => seen.push(status),
    now: () => 0,
    openSocket: wire.open,
  });
  return { link, wire, seen };
}

const welcome = (level: Difficulty | null): ServerMessage => ({
  t: "welcome",
  player: 1,
  room: "ACDE",
  startMs: 0,
  peers: 1,
  names: ["", ""],
  best: null,
  level,
  host: 1,
});

/** Every tempo this device asked the room for, in the order it asked. */
const levels = (sent: ClientMessage[]): (Difficulty | undefined)[] =>
  sent.filter((m) => m.t === "level").map((m) => (m.t === "level" ? m.level : undefined));

describe("a join", () => {
  it("carries no tempo into the room, whatever the room holds", () => {
    // Every door into a room — a partner's row, a code typed on the room
    // screen, a link, BACK INTO THE GAME — takes the room's own answer. The
    // only device that may set one is the host, on the room screen, before beat
    // zero (`join-room.ts` `mayShape`, `apps/server/src/room-acts.ts`).
    const { link, wire } = linked();
    link.join("ACDE");
    wire.say(welcome("easy"));
    expect(levels(wire.sent)).toEqual([]);
  });

  it("says nothing to a room that holds no tempo either", () => {
    const { link, wire } = linked();
    link.join("ACDE");
    wire.say(welcome(null));
    expect(levels(wire.sent)).toEqual([]);
  });

  it("still reports the room's tempo to whoever asks the link", () => {
    // Taking it is the point: two phones at two tempi never reach the same
    // tick, so the room's one answer is what both of them play at.
    const { link, wire, seen } = linked();
    link.join("ACDE");
    wire.say(welcome("hard"));
    expect(seen.at(-1)?.level).toBe("hard");
  });
});
