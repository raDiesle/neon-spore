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
  { kind: "tap", id: 12 },
  { kind: "tapTile", col: 5, row: 9 },
  { kind: "prime", on: true, color: "cyan" },
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
  // THE BALLOON's two handles, and the first pair on this wire that is one
  // gesture in two *seats*: the left is the pilot's and the right the
  // navigator's, both carrying the body's id. A codec that dropped either
  // would leave one seat pulling on their own phone and the other watching a
  // body that never gives.
  { kind: "drag", target: "balloonLeft", on: true, fromMilli: -1400, id: 4 },
  { kind: "drag", target: "balloonRight", on: true, fromMilli: 1400, id: 4 },
  // THE CLAW's crank, whose `fromMilli` is a bearing round a circle rather
  // than a distance, and whose press carries `NO_BEARING` instead of one.
  // THE SINEW's two handles, one per seat, whose pull is on the *y* and
  // whose sway is the `fromMilli` — the one drag whose depth is the number.
  { kind: "drag", target: "sinewLeft", on: true, fromMilli: -120, fromYMilli: 640 },
  { kind: "drag", target: "sinewRight", on: true, fromMilli: 90, fromYMilli: 1000 },
  // THE SURGE's bulb, one handle for both seats, whose press reports nothing
  // and whose *lift* is the command (`surge-hand.ts`).
  { kind: "drag", target: "surgeBulb", on: true, fromMilli: 0 },
  { kind: "drag", target: "surgeBulb", on: false, fromMilli: 0 },
  { kind: "drag", target: "antiphonOrgan", on: true, fromMilli: 0 },
  { kind: "drag", target: "instarMark", on: true, fromMilli: 250, fromYMilli: 800, id: 1 },
  // THE FILAMENT's trace: a displacement from the grab in both axes, no id,
  // and a lift — the grab origin is the sim's own head or tail
  // (`sim/filament-hand.ts`), so the tile is in the numbers and nothing else.
  { kind: "drag", target: "filament", on: true, fromMilli: -1000, fromYMilli: -2000 },
  { kind: "drag", target: "filament", on: false, fromMilli: 0 },
  // THE STARE's lid: a depth on the y, the way THE SINEW's are (`sim/stare-hand.ts`).
  { kind: "drag", target: "stareLid", on: true, fromMilli: 0, fromYMilli: 600 },
  { kind: "drag", target: "stareLid", on: false, fromMilli: 0 },
  // THE BULB QUEEN's marks: `id` 0 is the left, 1 the right, and what the
  // press is worth is her phase's (`sim/queen-hand.ts`).
  { kind: "drag", target: "queenMark", on: true, fromMilli: 250, fromYMilli: 400, id: 1 },
  // THE DIASTOLE's clamp: a press and a lift, no depth read, no id — one
  // chamber is left by then (`sim/diastole-hand.ts`).
  { kind: "drag", target: "diastoleChamber", on: true, fromMilli: 0 },
  { kind: "drag", target: "diastoleChamber", on: false, fromMilli: 0 },
  { kind: "drag", target: "mirrorLobe", on: false, fromMilli: -600, fromYMilli: 0, id: 0 },
  // THE GORGE's intakes: `id` is the intake, and whose thumb it is says
  // whether it is the pinch or the pry (`sim/gorge-hand.ts`).
  { kind: "drag", target: "gorgeLobe", on: true, fromMilli: 0, fromYMilli: 0, id: 3 },
  { kind: "drag", target: "gorgeLobe", on: false, fromMilli: 0, fromYMilli: 0, id: 3 },
  { kind: "drag", target: "mazeHeart", on: true, fromMilli: 0, fromYMilli: 450 },
  // A bearing, not a distance: THE GAUGE's needle stands where the finger
  // points round the dial (`sim/bearing.ts`).
  { kind: "drag", target: "gaugeNeedle", on: true, fromMilli: 812, fromYMilli: 0 },
  { kind: "drag", target: "gaugeBand", on: true, fromMilli: 0, fromYMilli: 0 },
  { kind: "drag", target: "wardenEye", on: true, fromMilli: 0, fromYMilli: 0 },
  { kind: "drag", target: "wardenHatch", on: false, fromMilli: 1500, fromYMilli: 0 },
  { kind: "drag", target: "fleetBreach", on: true, fromMilli: 0, fromYMilli: 0 },
  { kind: "drag", target: "fleetRake", on: true, fromMilli: 2000, fromYMilli: 0 },
  { kind: "drag", target: "fleetWreck", on: true, fromMilli: 0, fromYMilli: 1500 },
  // THE VANE's arm and housing: the pilot's thumb resting on the arm, which
  // stops it and with it the fold line, and the navigator's carry off the
  // seized housing (`sim/vane-hand.ts`). A codec that dropped either would
  // leave one device folding arrivals about a column the other has pinned.
  { kind: "drag", target: "vaneArm", on: true, fromMilli: 0, fromYMilli: 0 },
  { kind: "drag", target: "vaneHousing", on: false, fromMilli: 0, fromYMilli: 1500 },
  // SNAKE's two hands on its own body, and the first a round has had: player
  // 1 prising the stuck jaws, player 2's thumb lifting the tail clear of the
  // arena (`sim/snake-controls.ts`). A codec that dropped the second would
  // leave one device driving through a tail the other one is standing on.
  { kind: "drag", target: "snakeJaws", on: false, fromMilli: 0, fromYMilli: 1500 },
  { kind: "drag", target: "snakeTail", on: true, fromMilli: 0, fromYMilli: 0 },
  // PINBALL's two hands on the table: player 1 winding the plunger, player 2
  // shoving the cabinet — and the shove's `fromMilli` is the one carry in
  // this list whose **sign** is the whole of what it says, so a codec that
  // dropped it would send the ball the other way on one device.
  { kind: "drag", target: "pinPlunger", on: false, fromMilli: 0, fromYMilli: 1500 },
  { kind: "drag", target: "pinTable", on: false, fromMilli: -1200, fromYMilli: 0 },
  // THE SCOUT's two hands: player 2's line, which pulls the little ship
  // straight home and nowhere else, and player 1's carry on the ship to prime
  // a labouring thruster (`sim/scout-hand.ts`). A codec that dropped the line
  // would leave one device flying a ship the other one is hauling.
  { kind: "drag", target: "scoutLine", on: true, fromMilli: 0, fromYMilli: 0 },
  { kind: "drag", target: "scoutPrime", on: false, fromMilli: 0, fromYMilli: 1500 },
  // THE PULSE's bar, the first target both seats may hold at once: under its
  // last state only both thumbs put anything back into it, so a codec that
  // dropped one would leave the two devices disagreeing about whether the
  // stage is being saved (`sim/pulse-hand.ts`).
  { kind: "drag", target: "pulseMeter", on: true, fromMilli: 0, fromYMilli: 0 },
  { kind: "drag", target: "crank", on: true, fromMilli: 750 },
  { kind: "drag", target: "crank", on: true, fromMilli: -1 },
  // THE ORRERY's outermost unbroken ring: the same bearing, on the field
  // instead of on the panel, and carrying no id because the hand never names
  // the ring (`sim/orrery-hand.ts`). A codec that dropped it would leave the
  // pilot turning a ring on his own screen alone — which on this boss is two
  // devices firing at two different beats.
  { kind: "drag", target: "orreryRing", on: true, fromMilli: 250 },
  { kind: "drag", target: "orreryRing", on: false, fromMilli: -1 },
  { kind: "shake" },
  { kind: "restart" },
  { kind: "retry" },
  { kind: "quit" },
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
  { kind: "pulseStep", lane: "meteor" },
  // THE SCOUT's two, both held — one example of each edge, since the round
  // runs on the state and a dropped release is the failure that matters.
  { kind: "scoutTurn", on: true, dir: -1 },
  { kind: "scoutBurn", on: false },
  { kind: "scoutMaw" },
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
  tap: true,
  tapTile: true,
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
  retry: true,
  scoutTurn: true,
  scoutBurn: true,
  scoutMaw: true,
  quit: true,
};

const EVERY_TARGET: Record<DragTarget, true> = {
  mazeString: true,
  wardenTether: true,
  lidString: true,
  gripBody: true,
  choirLeft: true,
  choirRight: true,
  balloonLeft: true,
  balloonRight: true,
  sinewLeft: true,
  sinewRight: true,
  surgeBulb: true,
  antiphonOrgan: true,
  instarMark: true,
  filament: true,
  stareLid: true,
  queenMark: true,
  diastoleChamber: true,
  mirrorLobe: true,
  gorgeLobe: true,
  mazeHeart: true,
  gaugeNeedle: true,
  gaugeBand: true,
  wardenEye: true,
  wardenHatch: true,
  fleetBreach: true,
  fleetRake: true,
  fleetWreck: true,
  vaneArm: true,
  vaneHousing: true,
  snakeJaws: true,
  snakeTail: true,
  pinPlunger: true,
  pinTable: true,
  scoutLine: true,
  scoutPrime: true,
  pulseMeter: true,
  crank: true,
  orreryRing: true,
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
