import { describe, expect, it } from "bun:test";
import type { Command, DragTarget } from "@neon-spore/sim";
import { decodeCommand, decodeCommands } from "../src/command-codec.js";

const ACCEPTED: Command[] = [
  { kind: "cannonCol", col: 3 },
  { kind: "shieldCol", col: 0 },
  { kind: "fire", color: "red" },
  { kind: "guard" },
  { kind: "intake" },
  { kind: "grip", id: 12 },
  { kind: "prime", on: true },
  { kind: "brief" },
  { kind: "brief", on: false },
  { kind: "valve", on: true, dir: 1 },
  { kind: "call" },
  { kind: "snakeTurn", dir: "left" },
  { kind: "snakeFire" },
  { kind: "snakeMaw" },
  { kind: "drag", target: "mazeString", on: true, fromMilli: 1500 },
  { kind: "drag", target: "lidString", on: true, fromMilli: -1500, id: 4 },
  { kind: "drag", target: "wardenTether", on: true, fromMilli: 0, fromYMilli: 7000 },
  { kind: "drag", target: "gripBody", on: true, fromMilli: 1000, id: 7 },
  // THE CHOIR's two arrows, and the sign is the whole of the gesture: the left
  // one counts only carried left. A codec that dropped these would leave the
  // pilot opening a membrane on their own phone and nowhere else.
  { kind: "drag", target: "choirLeft", on: true, fromMilli: -2000 },
  { kind: "drag", target: "choirRight", on: true, fromMilli: 2000 },
  { kind: "shake" },
  { kind: "restart" },
  // The four the guard below found missing from the codec altogether — THE
  // CLAW's arm and PINBALL's three. Every one of them was dropped on the wire,
  // so on two devices the arm never left the hull and the bucket never moved.
  { kind: "reach" },
  { kind: "slide", on: true, dir: -1 },
  { kind: "latch" },
  { kind: "launch" },
  // And the three that were handled and simply had no example, so the guard
  // could not have been satisfied by the switch alone.
  { kind: "guideStep", back: true },
  { kind: "aim", dcol: 1, drow: 0 },
  { kind: "salvo" },
  // THE PULSE's one verb, and the only one both seats send.
  { kind: "pulseStep", lane: "up" },
];

/**
 * **Every kind, and it is the compiler that says so.**
 *
 * `ACCEPTED` above was a hand-kept list with nothing checking it, and the hole
 * that leaves is quiet in exactly the way this file exists to prevent: a
 * command added to `sim` and not to `decodeCommand` is rejected on the wire,
 * so a press works on the phone it was made on and reaches the other device as
 * nothing at all. Both halves type-check, both halves pass their own tests, and
 * the only symptom is two devices playing different games. THE CHOIR's `shake`
 * went in that way and was caught by reading rather than by running.
 *
 * A `Record` keyed by the union is what closes it: a kind missing here is a
 * *compile* error, and the assertion below is what ties this list to the
 * examples. Same argument, same shape, for the drag targets — a new one is a
 * string inside a variant the switch already knows, which is the same hole one
 * level down.
 */
const EVERY_KIND: Record<Command["kind"], true> = {
  cannonCol: true,
  shieldCol: true,
  fire: true,
  guard: true,
  intake: true,
  reach: true,
  grip: true,
  prime: true,
  brief: true,
  guideStep: true,
  valve: true,
  call: true,
  aim: true,
  salvo: true,
  snakeTurn: true,
  pulseStep: true,
  snakeFire: true,
  snakeMaw: true,
  slide: true,
  latch: true,
  launch: true,
  drag: true,
  shake: true,
  restart: true,
};

const EVERY_TARGET: Record<DragTarget, true> = {
  mazeString: true,
  wardenTether: true,
  lidString: true,
  gripBody: true,
  choirLeft: true,
  choirRight: true,
};

describe("decodeCommand: one accepted example per variant", () => {
  for (const command of ACCEPTED) {
    it(`${command.kind}${command.kind === "drag" ? ` ${command.target}` : ""}`, () => {
      expect(decodeCommand(command)).toEqual(command);
    });
  }

  it("has an example of every kind the simulation can send", () => {
    const seen = new Set(ACCEPTED.map((c) => c.kind));
    expect([...Object.keys(EVERY_KIND)].filter((k) => !seen.has(k as Command["kind"]))).toEqual([]);
  });

  it("has an example of every target a hand can take hold of", () => {
    const seen = new Set(ACCEPTED.filter((c) => c.kind === "drag").map((c) => c.target));
    expect([...Object.keys(EVERY_TARGET)].filter((t) => !seen.has(t as DragTarget))).toEqual([]);
  });
});

describe("decodeCommand: rejections", () => {
  it("refuses a colour that is not in the set", () => {
    expect(decodeCommand({ kind: "fire", color: "purple" })).toBeNull();
  });

  it("refuses a fractional column", () => {
    expect(decodeCommand({ kind: "cannonCol", col: 3.5 })).toBeNull();
  });

  it("refuses NaN", () => {
    expect(decodeCommand({ kind: "cannonCol", col: Number.NaN })).toBeNull();
  });

  it("refuses a negative id", () => {
    expect(decodeCommand({ kind: "grip", id: -1 })).toBeNull();
  });

  it("refuses a missing required field", () => {
    expect(decodeCommand({ kind: "fire" })).toBeNull();
    expect(decodeCommand({ kind: "valve", on: true })).toBeNull();
  });

  it("refuses a wrong-typed optional field", () => {
    expect(decodeCommand({ kind: "brief", on: "yes" })).toBeNull();
  });

  it("refuses a turn that is not one of the two", () => {
    expect(decodeCommand({ kind: "snakeTurn", dir: "widdershins" })).toBeNull();
    expect(decodeCommand({ kind: "snakeTurn" })).toBeNull();
  });

  it("refuses an unknown kind", () => {
    expect(decodeCommand({ kind: "teleport" })).toBeNull();
  });

  it("accepts an object carrying keys the variant does not declare", () => {
    expect(decodeCommand({ kind: "guard", extra: "from a newer peer" })).toEqual({
      kind: "guard",
    });
  });

  it("refuses a non-object", () => {
    expect(decodeCommand("guard")).toBeNull();
    expect(decodeCommand(null)).toBeNull();
    expect(decodeCommand(undefined)).toBeNull();
  });

  /**
   * A drag reports a **displacement** from where the finger grabbed, so half of
   * every pull is negative — and a codec that took only non-negative numbers
   * dropped exactly those frames, which is a rope that worked on the device it
   * was pulled on and never crossed the wire.
   */
  it("keeps a pull to the left, which is a negative displacement", () => {
    const left = { kind: "drag", target: "wardenTether", on: true, fromMilli: -2400 };
    expect(decodeCommand(left)).toEqual(left as Command);
  });

  it("refuses a pull wider than any screen", () => {
    expect(
      decodeCommand({ kind: "drag", target: "lidString", on: true, fromMilli: -1e12 }),
    ).toBeNull();
  });

  /** The id names *which* cord, for the one drag target that is a creature.
   * Absent is legal — the two fixtures need none — and a broken one is not. */
  it("refuses a drag whose id is not a whole non-negative number", () => {
    const bad = { kind: "drag", target: "lidString", on: true, fromMilli: 0, id: -1 };
    expect(decodeCommand(bad)).toBeNull();
    expect(decodeCommand({ ...bad, id: 1.5 })).toBeNull();
  });

  it("refuses infinities", () => {
    expect(
      decodeCommand({ kind: "drag", target: "mazeString", on: true, fromMilli: Infinity }),
    ).toBeNull();
  });
});

describe("decodeCommands", () => {
  it("refuses a non-array", () => {
    expect(decodeCommands({ kind: "guard" })).toBeNull();
    expect(decodeCommands(null)).toBeNull();
  });

  it("accepts an empty array", () => {
    expect(decodeCommands([])).toEqual([]);
  });

  it("drops the whole frame when one command among good ones is bad", () => {
    const commands = [{ kind: "guard" }, { kind: "fire", color: "purple" }, { kind: "call" }];
    expect(decodeCommands(commands)).toBeNull();
  });

  it("passes through a frame where every command is good", () => {
    const commands: Command[] = [{ kind: "guard" }, { kind: "call" }];
    expect(decodeCommands(commands)).toEqual(commands);
  });
});
