import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  type SimConfig,
  type StareState,
  stareBoss,
  stareLooking,
  stareTellLeft,
  stareTurning,
  stareWatches,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE STARE, and the sentence it is built to make true: **when it is looking
 * at you, you may not touch anything**.
 *
 * The owner's rule, in his own words: *when the boss looks at you, you are not
 * allowed to shoot or move or use shield… when enemies do actions during he
 * looks, it damages hull and wave must be repeated.* So what is checked here
 * is the cycle that makes it fair, the press that makes it cost, and the fact
 * that the *other* seat is untouched — which is the half that keeps it a wave
 * rather than a pause.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "stare" });
  return world;
}

function eye(world: World): StareState {
  const boss = stareBoss(world);
  if (boss === null) throw new Error("no eye installed");
  return boss;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/** Beats, in ticks, with nobody pressing anything. */
function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** Run until the eye reaches a phase, or give up. Returns the beats it took. */
function until(world: World, phase: StareState["phase"], cap = 60): number {
  const from = world.beat;
  for (let i = 0; i < cap * TPB; i++) {
    if (eye(world).phase === phase) return world.beat - from;
    step(world, []);
  }
  throw new Error(`the eye never reached ${phase}`);
}

describe("THE STARE", () => {
  it("opens turned away, with nobody chosen and nothing forbidden", () => {
    const world = open();
    expect(eye(world).phase).toBe("away");
    // Nobody is watched while it is away, which is what the picture needs as
    // much as the simulation: an eye that already knew would have to draw it.
    expect(eye(world).watching).toBe(0);
    expect(stareWatches(eye(world), 1)).toBe(false);
    expect(stareWatches(eye(world), 2)).toBe(false);
    step(world, [cmd(world, 1, { kind: "cannonCol", col: 4 })]);
    expect(world.cannonCol).toBe(4);
    expect(failHolds(world)).toBe(false);
  });

  it("warns before it looks, and the warning counts down in beats", () => {
    const world = open();
    until(world, "turning");
    expect(stareTurning(eye(world))).toBe(true);
    // Chosen at the top of the turn and not at the look: the whole of the
    // warning is knowing who.
    expect(eye(world).watching === 1 || eye(world).watching === 2).toBe(true);
    expect(stareTellLeft(eye(world), world.beat, CFG.stareTellBeats)).toBe(CFG.stareTellBeats);
    beats(world, 2);
    expect(stareTellLeft(eye(world), world.beat, CFG.stareTellBeats)).toBe(CFG.stareTellBeats - 2);
    // And the warning is the length the dial says, to the beat.
    expect(until(world, "looking")).toBe(CFG.stareTellBeats - 2);
  });

  it("stays away for as long as the working window says", () => {
    const world = open();
    expect(until(world, "turning")).toBe(CFG.stareAwayBeats);
  });

  it("costs the hull when the watched seat presses anything, and loses the wave", () => {
    const world = open();
    until(world, "looking");
    const watched = eye(world).watching as 1 | 2;
    expect(stareLooking(eye(world))).toBe(true);
    // Column 1 and not the middle: the cannon opens a wave in the middle, so a
    // test that asked for that column would pass whether or not it moved.
    step(world, [cmd(world, watched, { kind: "cannonCol", col: 1 })]);
    // Refused *and* charged for: the press does not move the ship, and the
    // hull is broken, which is the wave lost (`wave-fail.ts`).
    expect(world.cannonCol).not.toBe(1);
    expect(eye(world).caughtTick).toBeGreaterThanOrEqual(0);
    expect(eye(world).caughtPlayer).toBe(watched);
    expect(failHolds(world)).toBe(true);
  });

  it("leaves the other seat playing, which is what makes it a wave and not a pause", () => {
    const world = open();
    until(world, "looking");
    const free = eye(world).watching === 1 ? 2 : 1;
    step(world, [cmd(world, free, { kind: free === 1 ? "cannonCol" : "shieldCol", col: 1 })]);
    expect(free === 1 ? world.cannonCol : world.shieldCol).toBe(1);
    expect(failHolds(world)).toBe(false);
    expect(eye(world).caughtTick).toBe(-1);
  });

  it("lets a watched seat leave the run, because a frozen pair is not a trapped one", () => {
    const world = open();
    until(world, "looking");
    const watched = eye(world).watching as 1 | 2;
    step(world, [cmd(world, watched, { kind: "restart" })]);
    expect(failHolds(world)).toBe(false);
    expect(world.events.some((e) => e.type === "needWave")).toBe(true);
  });

  it("looks longer every time, to a ceiling", () => {
    const world = open();
    until(world, "looking");
    const first = eye(world).lookBeats;
    expect(first).toBe(CFG.stareLookBeats);
    until(world, "away");
    expect(eye(world).lookBeats).toBe(first + CFG.stareLookGrowBeats);
    expect(eye(world).looks).toBe(1);
    // And the look that just ended was as long as it said it would be.
    for (let i = 0; i < 40; i++) {
      until(world, "looking");
      until(world, "away");
      if (eye(world).lookBeats >= CFG.stareLookMaxBeats) break;
    }
    expect(eye(world).lookBeats).toBe(CFG.stareLookMaxBeats);
  });

  it("forgets who it was watching the moment it looks away", () => {
    const world = open();
    until(world, "looking");
    until(world, "back");
    expect(eye(world).watching).toBe(0);
    expect(stareWatches(eye(world), 1)).toBe(false);
    expect(stareWatches(eye(world), 2)).toBe(false);
  });

  it("chooses the same seat on two devices", () => {
    // The worst desync this boss could have: one pair member frozen on their
    // screen and playing on the other's (`stare-hash.ts`).
    const a = open();
    const b = open();
    for (const world of [a, b]) until(world, "looking");
    expect(eye(a).watching).toBe(eye(b).watching);
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
