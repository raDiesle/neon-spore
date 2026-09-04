import { describe, expect, it } from "bun:test";
import {
  ackBriefing,
  briefingAcked,
  briefingHolds,
  createWorld,
  DEFAULT_CONFIG,
  guideHolds,
  hashWorld,
  introHolds,
  OPENING_GUIDE,
  OPENING_PLAY,
  type PodEntry,
  readyHoldTicks,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  type World,
} from "../src/index.js";

/**
 * A wave's opening is the one thing in the game that can stop the world, so
 * the two questions here are the two that break a room: does it stop on both
 * devices, and does it start again only when both of them say so.
 *
 * The states are the guide, if the wave carries one, and then the
 * introduction (number, name, sentence — passed by a timer the app runs). Both
 * hold the field; neither is derived from anything. The guide is first because
 * the introduction names the wave the pair is about to play, which wants to be
 * the last thing before the field rather than a title card in front of a
 * tutorial (`briefing.ts`).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, briefings: true };

const SLICK: SpawnEntry[] = [{ beat: 0, col: 3, kind: "slick", color: "red" }];

function open(hasGuide: boolean, queue: SpawnEntry[] = SLICK, pods: PodEntry[] = []): World {
  const world = createWorld(CFG, 1);
  startWave(world, 0, queue, pods, null, hasGuide);
  return world;
}

/**
 * One tick's worth of a seat's thumb down. On the introduction that is an ack;
 * on the guide it is the hold, and it stays down until an `on: false` says
 * otherwise, so a caller that sends it once and then steps is a thumb left on
 * the screen (`briefing.ts`).
 */
function tap(world: World, ...players: (1 | 2)[]): TimedCommand[] {
  return players.map((player) => ({ tick: world.tick, player, command: { kind: "brief" } }));
}

/** Step until nothing is holding the wave any more, with both thumbs down. */
function holdBoth(world: World): void {
  for (let i = 0; i < 5000 && briefingHolds(world); i++) step(world, tap(world, 1, 2));
}

describe("the order a wave opens in", () => {
  it("stands on the guide first when there is one, and on the introduction when there is not", () => {
    expect(guideHolds(open(true))).toBe(true);
    expect(introHolds(open(true))).toBe(false);
    expect(introHolds(open(false))).toBe(true);
  });

  it("goes guide, introduction, field when the wave carries one", () => {
    const world = open(true);
    // The guide does not pass on a press: both circles have to fill first.
    step(world, tap(world, 1, 2));
    expect(world.brief.phase).toBe(OPENING_GUIDE);
    holdBoth(world);
    expect(world.brief.phase).toBe(OPENING_PLAY);
  });

  it("goes introduction, field when it does not", () => {
    const world = open(false);
    step(world, tap(world, 1, 2));
    expect(world.brief.phase).toBe(OPENING_PLAY);
    expect(briefingHolds(world)).toBe(false);
  });

  it("opens on nothing at all when briefings are off", () => {
    const world = createWorld({ ...DEFAULT_CONFIG, briefings: false }, 1);
    startWave(world, 0, SLICK, [], null, true);
    expect(world.brief.phase).toBe(OPENING_PLAY);
    expect(world.brief.guide).toBe(false);
  });
});

describe("both seats, or neither", () => {
  it("keeps the guide up while only one circle is full", () => {
    const world = open(true);
    expect(guideHolds(world)).toBe(true);
    const full = readyHoldTicks(CFG);
    for (let i = 0; i < full; i++) step(world, tap(world, 1));
    expect(guideHolds(world)).toBe(true);
    expect(briefingAcked(world, 1)).toBe(true);
    expect(briefingAcked(world, 2)).toBe(false);
    // Player 1's circle stays full with no thumb on it — READY latches — so
    // player 2 filling theirs alone is what starts the wave.
    for (let i = 0; i < full; i++) step(world, tap(world, 2));
    expect(guideHolds(world)).toBe(false);
  });

  it("does not carry one seat's hold from the guide into the introduction", () => {
    const world = open(true);
    holdBoth(world);
    // The wave has one state left. Both fills were spent crossing the gate;
    // the introduction starts clean, or a fast device would put away a screen
    // its player never looked at.
    expect(introHolds(world)).toBe(false);
    expect(briefingHolds(world)).toBe(false);
  });

  it("takes the same ack twice as one", () => {
    const world = open(false);
    ackBriefing(world, 1);
    ackBriefing(world, 1);
    expect(introHolds(world)).toBe(true);
  });

  it("ignores an ack once the field is playing", () => {
    const world = open(false);
    step(world, tap(world, 1, 2));
    ackBriefing(world, 1);
    expect(world.brief.ack).toBe(0);
    expect(world.brief.phase).toBe(OPENING_PLAY);
  });
});

describe("the field behind it", () => {
  it("spawns nothing and ticks the clock anyway", () => {
    const world = open(true);
    const before = world.tick;
    for (let i = 0; i < 200; i++) step(world, []);
    expect(world.creatures).toHaveLength(0);
    expect(world.beat).toBe(0);
    // The clock has to keep counting: a press is scheduled ticks ahead on both
    // devices, so a frozen counter would be waiting for an ack it arranged
    // never to reach itself.
    expect(world.tick).toBeGreaterThan(before);
  });

  it("takes nothing but the ack while it holds", () => {
    const world = open(true);
    const col = world.cannonCol;
    step(world, [{ tick: world.tick, player: 1, command: { kind: "cannonCol", col: col + 2 } }]);
    expect(world.cannonCol).toBe(col);
  });

  it("starts the field once the last state has passed", () => {
    const world = open(false);
    step(world, tap(world, 1, 2));
    for (let i = 0; i < 400; i++) step(world, []);
    expect(world.creatures.length).toBeGreaterThan(0);
  });
});

describe("the opening in the fingerprint", () => {
  it("hashes differently in each of the three states", () => {
    const world = open(true);
    const atGuide = hashWorld(world);
    // Exactly across the gate and no further: a tap on the tick after it lands
    // on the introduction, and two of those would take the wave with them.
    ackBriefing(world, 1);
    ackBriefing(world, 2);
    expect(introHolds(world)).toBe(true);
    const atIntro = hashWorld(world);
    holdBoth(world);
    const playing = hashWorld(world);
    expect(new Set([atGuide, atIntro, playing]).size).toBe(3);
  });

  it("hashes differently when only one seat has acked", () => {
    const a = open(false);
    const b = open(false);
    ackBriefing(a, 1);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});

describe("no memory", () => {
  it("shows the opening again every time the same wave starts", () => {
    const world = open(true);
    holdBoth(world);
    expect(briefingHolds(world)).toBe(false);
    // The met set is gone with the subjects it was over. A wave carries its
    // own help, and the director restarts a wave twenty times an afternoon.
    startWave(world, 0, SLICK, [], null, true);
    expect(world.brief.phase).toBe(OPENING_GUIDE);
    expect(world.brief.guide).toBe(true);
  });

  it("starts a fresh world playing nothing", () => {
    const world = createWorld(CFG, 1);
    expect(world.brief).toEqual({
      phase: OPENING_PLAY,
      guide: false,
      ack: 0,
      steps: 0,
      stepP1: 0,
      stepP2: 0,
      fillP1: 0,
      fillP2: 0,
      holdP1: false,
      holdP2: false,
    });
  });

  it("leaves no guide behind when the next wave has none", () => {
    const world = open(true);
    startWave(world, 1, SLICK, [], null, false);
    step(world, tap(world, 1, 2));
    expect(briefingHolds(world)).toBe(false);
  });
});
