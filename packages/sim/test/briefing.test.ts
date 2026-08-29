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
  OPENING_INTRO,
  OPENING_PLAY,
  type PodEntry,
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
 * The states are the introduction (number, name, sentence — passed by a timer
 * the app runs) and then the guide, if the wave carries one. Both hold the
 * field; neither is derived from anything.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, briefings: true };

const SLICK: SpawnEntry[] = [{ beat: 0, col: 3, kind: "slick", color: "red" }];

function open(hasGuide: boolean, queue: SpawnEntry[] = SLICK, pods: PodEntry[] = []): World {
  const world = createWorld(CFG, 1);
  startWave(world, 0, queue, pods, null, hasGuide);
  return world;
}

/** One tick's worth of a seat saying it is done with what is on its screen. */
function tap(world: World, ...players: (1 | 2)[]): TimedCommand[] {
  return players.map((player) => ({ tick: world.tick, player, command: { kind: "brief" } }));
}

describe("the order a wave opens in", () => {
  it("stands on its introduction first, whether or not it has a guide", () => {
    expect(introHolds(open(false))).toBe(true);
    expect(introHolds(open(true))).toBe(true);
    expect(guideHolds(open(true))).toBe(false);
  });

  it("goes introduction, guide, field when the wave carries one", () => {
    const world = open(true);
    step(world, tap(world, 1, 2));
    expect(world.brief.phase).toBe(OPENING_GUIDE);
    step(world, tap(world, 1, 2));
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
  it("keeps the guide up while only one has acked", () => {
    const world = open(true);
    step(world, tap(world, 1, 2));
    expect(guideHolds(world)).toBe(true);
    step(world, tap(world, 1));
    expect(guideHolds(world)).toBe(true);
    expect(briefingAcked(world, 1)).toBe(true);
    expect(briefingAcked(world, 2)).toBe(false);
    step(world, tap(world, 2));
    expect(guideHolds(world)).toBe(false);
  });

  it("does not carry one seat's ack from the introduction into the guide", () => {
    const world = open(true);
    step(world, tap(world, 1));
    step(world, tap(world, 2));
    expect(guideHolds(world)).toBe(true);
    // Both bits were spent getting past the introduction; the guide starts
    // clean, or player 1 would put away a screen they never looked at.
    expect(briefingAcked(world, 1)).toBe(false);
    expect(briefingAcked(world, 2)).toBe(false);
  });

  it("takes the same ack twice as one", () => {
    const world = open(true);
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
    const atIntro = hashWorld(world);
    step(world, tap(world, 1, 2));
    const atGuide = hashWorld(world);
    step(world, tap(world, 1, 2));
    const playing = hashWorld(world);
    expect(new Set([atIntro, atGuide, playing]).size).toBe(3);
  });

  it("hashes differently when only one seat has acked", () => {
    const a = open(true);
    const b = open(true);
    ackBriefing(a, 1);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});

describe("no memory", () => {
  it("shows the opening again every time the same wave starts", () => {
    const world = open(true);
    step(world, tap(world, 1, 2));
    step(world, tap(world, 1, 2));
    expect(briefingHolds(world)).toBe(false);
    // The met set is gone with the subjects it was over. A wave carries its
    // own help, and the director restarts a wave twenty times an afternoon.
    startWave(world, 0, SLICK, [], null, true);
    expect(world.brief.phase).toBe(OPENING_INTRO);
    expect(world.brief.guide).toBe(true);
  });

  it("starts a fresh world playing nothing", () => {
    const world = createWorld(CFG, 1);
    expect(world.brief).toEqual({ phase: OPENING_PLAY, guide: false, ack: 0 });
  });

  it("leaves no guide behind when the next wave has none", () => {
    const world = open(true);
    startWave(world, 1, SLICK, [], null, false);
    step(world, tap(world, 1, 2));
    expect(briefingHolds(world)).toBe(false);
  });
});
