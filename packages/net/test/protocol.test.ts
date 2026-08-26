import { describe, expect, it } from "bun:test";
import {
  type ClientMessage,
  decodeClient,
  decodeServer,
  encode,
  HashLedger,
  isRoomCode,
  normalizeRoomCode,
  ROOM_ALPHABET,
  ROOM_CODE_LENGTH,
  roomCodeFromBytes,
} from "../src/index.js";

describe("protocol", () => {
  it("survives a round trip", () => {
    const message: ClientMessage = { t: "input", tick: 42, commands: [{ kind: "guard" }] };
    expect(decodeClient(encode(message))).toEqual(message);
  });

  it("refuses a frame it does not fully understand", () => {
    expect(decodeClient("not json")).toBeNull();
    expect(decodeClient(encode({ t: "input", tick: -1, commands: [] } as never))).toBeNull();
    expect(decodeClient('{"t":"input","tick":3}')).toBeNull();
    expect(decodeServer('{"t":"welcome","player":3,"room":"ACDE","startMs":1}')).toBeNull();
    expect(decodeServer('{"t":"nonsense"}')).toBeNull();
  });

  it("reads a tick of zero, which is the one that matters most", () => {
    expect(decodeClient('{"t":"confirm","tick":0}')).toEqual({ t: "confirm", tick: 0 });
  });
});

describe("room code", () => {
  it("carries no character that has a lookalike", () => {
    for (const ch of "OI0125SBZ") expect(ROOM_ALPHABET).not.toInclude(ch);
  });

  it("reads back what a person types", () => {
    expect(normalizeRoomCode("ac de")).toBe("ACDE");
    expect(normalizeRoomCode("a-c-d-e-f")).toBe("ACDE");
    expect(normalizeRoomCode("ab")).toBe("A");
  });

  it("accepts only a whole code", () => {
    expect(isRoomCode("ACDE")).toBe(true);
    expect(isRoomCode("acde")).toBe(false);
    expect(isRoomCode("ACD")).toBe(false);
  });

  it("makes a code of the right shape from any bytes", () => {
    const code = roomCodeFromBytes([0, 255, 128, 7, 9]);
    expect(code.length).toBe(ROOM_CODE_LENGTH);
    expect(isRoomCode(code)).toBe(true);
  });
});

describe("desync ledger", () => {
  it("says nothing until both sides have reported a tick", () => {
    const ledger = new HashLedger();
    expect(ledger.record(0, 123)).toBe("pending");
    expect(ledger.observe(0, 123)).toBe("match");
    expect(ledger.desyncTick).toBeNull();
  });

  it("names the tick the two worlds parted, whichever side reports first", () => {
    const ledger = new HashLedger();
    ledger.record(0, 1);
    ledger.observe(0, 1);
    expect(ledger.observe(300, 9)).toBe("pending");
    expect(ledger.record(300, 8)).toBe("mismatch");
    expect(ledger.desyncTick).toBe(300);
    expect(ledger.agreements).toBe(1);
  });

  it("keeps the earliest parting, not the latest", () => {
    const ledger = new HashLedger();
    for (const tick of [600, 300]) {
      ledger.record(tick, 1);
      ledger.observe(tick, 2);
    }
    expect(ledger.desyncTick).toBe(300);
  });
});
