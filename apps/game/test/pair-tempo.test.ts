import { describe, expect, it } from "bun:test";
import type { ClientMessage, LinkStatus, ServerMessage } from "@neon-spore/net";
import { createWorld, DEFAULT_CONFIG, type Difficulty } from "@neon-spore/sim";
import { createLink } from "../src/link.js";
import type { RoomSocket, RoomSocketHandlers } from "../src/link-socket.js";
import { afterLevelling, newPartner, type Partner } from "../src/partners.js";

/**
 * **A pair's tempo, from the gear on their row to the room they share.**
 *
 * The owner asked for the difficulty to live on the partner's row rather than
 * on a page of its own (14 September 2026). A room keeps its own level and
 * hands it to both phones, so a choice made on the PLAY page — where there is
 * no socket — is a wish until somebody goes into the room and says it. Two
 * halves, and this is both: what a choice does to the record (`partners.ts`)
 * and what the record does to the room (`link.ts`'s `join`).
 */

const ada: Partner = { name: "Ada", furthest: 6, level: "medium" };

describe("choosing a tempo for one partner", () => {
  it("writes it against that partner and leaves the others alone", () => {
    const kept = [ada, newPartner("David")];
    const next = afterLevelling(kept, "Ada", "hard");
    expect(next[0]).toEqual({ name: "Ada", furthest: 6, level: "hard" });
    expect(next[1]).toEqual(newPartner("David"));
  });

  it("does not move them up the list, because choosing is not playing", () => {
    // `afterPlayingWith` is the one that reorders. A pair whose evening is
    // being planned must not climb over the pair who actually played last
    // night — the list is *who you last played with*, and a gear is not a game.
    const kept = [newPartner("David"), ada];
    expect(afterLevelling(kept, "Ada", "easy").map((one) => one.name)).toEqual(["David", "Ada"]);
  });

  it("reads a name the way the rest of the store does, so a phone's capitals do not matter", () => {
    expect(afterLevelling([ada], "ADA", "easy")[0]?.level).toBe("easy");
    expect(afterLevelling([ada], " ada ", "hard")[0]?.level).toBe("hard");
  });

  it("keeps the wave the two of them reached", () => {
    expect(afterLevelling([ada], "Ada", "hard")[0]?.furthest).toBe(6);
  });

  it("is nothing at all for somebody the list does not hold", () => {
    expect(afterLevelling([ada], "Nobody", "hard")).toEqual([ada]);
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

describe("the tempo a join carries into the room", () => {
  it("tells a room that holds a different one", () => {
    const { link, wire } = linked();
    link.join("ACDE", "hard");
    wire.say(welcome("easy"));
    expect(levels(wire.sent)).toEqual(["hard"]);
  });

  it("tells a room that holds none, which is a room nobody has set", () => {
    const { link, wire } = linked();
    link.join("ACDE", "hard");
    wire.say(welcome(null));
    expect(levels(wire.sent)).toEqual(["hard"]);
  });

  it("says nothing to a room already on that tempo", () => {
    // The commonest welcome by far — the pair played at this tempo last time —
    // and a message that changes nothing is a message that need not be sent.
    const { link, wire } = linked();
    link.join("ACDE", "hard");
    wire.say(welcome("hard"));
    expect(levels(wire.sent)).toEqual([]);
  });

  it("says nothing at all for a join that carried no tempo", () => {
    // Every other door into a room — the code typed on the room screen, a
    // link, BACK INTO THE GAME — takes whatever level the room holds.
    const { link, wire } = linked();
    link.join("ACDE");
    wire.say(welcome("easy"));
    expect(levels(wire.sent)).toEqual([]);
  });

  it("asks once, and not again when the same room welcomes this phone back", () => {
    // A second welcome in one room is a rejoin, and by then the room's answer
    // *is* the pair's tempo: asking again would put back a level one of them
    // has since changed on the other phone.
    const { link, wire } = linked();
    link.join("ACDE", "hard");
    wire.say(welcome("easy"));
    wire.say(welcome("easy"));
    expect(levels(wire.sent)).toEqual(["hard"]);
  });

  it("does not carry one room's tempo into the next", () => {
    const { link, wire } = linked();
    link.join("ACDE", "hard");
    link.join("BCDE");
    wire.say(welcome("easy"));
    expect(levels(wire.sent)).toEqual([]);
  });
});
