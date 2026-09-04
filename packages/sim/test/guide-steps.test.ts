import { describe, expect, it } from "bun:test";
import {
  ackBriefing,
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  guideHolds,
  guidePage,
  guidePages,
  guideStepped,
  introHolds,
  OPENING_PLAY,
  onReadyPage,
  readyFill,
  seatReady,
  startWave,
  step,
  type World,
} from "../src/index.js";

/**
 * A guide the pair turns the pages of, one seat at a time.
 *
 * The rules under test are all consequences of one instruction of the owner's —
 * *every player has their own time to go through the tutorial, and just at the
 * end both need to say they are ready* — and every one of them is a rule two
 * devices have to agree about, because the cursors are in the fingerprint and
 * they decide when a seat may hold the gate at all.
 *
 * Everything here goes in through `step` and a `Command`, the way a thumb does.
 * The functions underneath are reachable and it would be shorter to call them,
 * but a page turned by calling `guideStepHeard` is a page turned by a route no
 * player has: what is being tested is that the *command* reaches the cursor.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };

/** A wave held on a guide with `steps` pages of film in front of its gate. */
function open(steps: number): World {
  const world = createWorld(CFG, 1);
  startWave(world, 0, [], [], null, true, steps);
  return world;
}

function send(world: World, player: 1 | 2, command: Command): void {
  step(world, [{ tick: world.tick, player, command }]);
}

/** One page forward, or back. */
function turn(world: World, player: 1 | 2, back = false): void {
  send(world, player, { kind: "guideStep", back });
}

/** To the gate from wherever this seat is standing. */
function toGate(world: World, player: 1 | 2): void {
  for (let i = 0; i < guidePages(world); i++) turn(world, player);
}

/**
 * One seat's thumb down, and the ticks that fill its circle behind it. It stops
 * the moment the circle is full so a test that crosses the gate does not go on
 * to play the wave behind it.
 */
function hold(world: World, player: 1 | 2, ticks = 400): void {
  send(world, player, { kind: "brief", on: true });
  for (let i = 0; i < ticks && !seatReady(world, player) && guideHolds(world); i++) {
    step(world, []);
  }
}

describe("a guide with pages", () => {
  it("opens on its first page, with the gate one past the last of them", () => {
    const world = open(5);
    expect(guideStepped(world)).toBe(true);
    expect(guidePages(world)).toBe(6);
    expect(guidePage(world, 1)).toBe(0);
    expect(onReadyPage(world, 1)).toBe(false);
  });

  it("lets each seat read at its own speed", () => {
    const world = open(5);
    turn(world, 1);
    turn(world, 1);
    turn(world, 2);
    expect(guidePage(world, 1)).toBe(2);
    expect(guidePage(world, 2)).toBe(1);
  });

  it("clamps at both ends rather than falling off one", () => {
    const world = open(3);
    turn(world, 1, true);
    expect(guidePage(world, 1)).toBe(0);
    for (let i = 0; i < 12; i++) turn(world, 1);
    expect(guidePage(world, 1)).toBe(3);
    expect(onReadyPage(world, 1)).toBe(true);
  });

  it("refuses a hold from a seat that is still turning pages", () => {
    // The gate is the only page with a circle on it. A hold that filled from
    // three pages back would be the pair skipping the reading the pages buy.
    const world = open(3);
    hold(world, 1, 200);
    expect(readyFill(world, 1)).toBe(0);
    expect(seatReady(world, 1)).toBe(false);
    expect(guideHolds(world)).toBe(true);
  });

  it("takes a hold once the seat has reached the gate", () => {
    const world = open(3);
    toGate(world, 1);
    hold(world, 1);
    expect(seatReady(world, 1)).toBe(true);
    // And the wave still waits: the other seat has not answered.
    expect(guideHolds(world)).toBe(true);
  });

  it("empties a circle that pages back off the gate before it filled", () => {
    const world = open(2);
    toGate(world, 1);
    hold(world, 1, 5);
    expect(readyFill(world, 1)).toBeGreaterThan(0);
    turn(world, 1, true);
    expect(readyFill(world, 1)).toBe(0);
  });

  it("will not let a seat page away from a circle it has already filled", () => {
    const world = open(2);
    toGate(world, 1);
    hold(world, 1);
    turn(world, 1, true);
    expect(guidePage(world, 1)).toBe(2);
    expect(seatReady(world, 1)).toBe(true);
  });

  it("starts the wave outright, because the last page was the introduction", () => {
    const world = open(2);
    for (const seat of [1, 2] as const) {
      toGate(world, seat);
      hold(world, seat);
    }
    expect(world.brief.phase).toBe(OPENING_PLAY);
    expect(introHolds(world)).toBe(false);
  });

  it("stands a guide nobody counted at its gate rather than nowhere", () => {
    // Every guide has pages — `content/waves.ts` counts them — so a 0 here is a
    // caller that forgot. The degenerate case is the gate, which is a screen
    // the pair can get past, rather than a page index that does not exist.
    const world = open(0);
    expect(guideStepped(world)).toBe(false);
    expect(onReadyPage(world, 1)).toBe(true);
    hold(world, 1);
    hold(world, 2);
    expect(introHolds(world)).toBe(true);
  });

  it("sends a caller with no thumbs to the gate before filling its circle", () => {
    const world = open(4);
    ackBriefing(world, 1);
    expect(guidePage(world, 1)).toBe(4);
    expect(seatReady(world, 1)).toBe(true);
  });

  it("puts both cursors back when the next wave opens", () => {
    const world = open(3);
    turn(world, 1);
    turn(world, 1);
    startWave(world, 1, [], [], null, true, 3);
    expect(guidePage(world, 1)).toBe(0);
    expect(guidePage(world, 2)).toBe(0);
  });
});
