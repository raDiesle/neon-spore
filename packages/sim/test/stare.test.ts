import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  type SimConfig,
  type StareState,
  stareBoss,
  stareLidFree,
  stareLooking,
  stareOpening,
  stareShut,
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

/** The free seat's thumb on the lid, `depth` thousandths of a tile down. */
function lid(world: World, player: 1 | 2, depth: number): TimedCommand {
  return cmd(world, player, {
    kind: "drag",
    target: "stareLid",
    on: true,
    fromMilli: 0,
    fromYMilli: depth,
  });
}

/** The same thumb lifted. */
function lift(world: World, player: 1 | 2): TimedCommand {
  return cmd(world, player, { kind: "drag", target: "stareLid", on: false, fromMilli: 0 });
}

/** Run to a look, and say who is watched and who is free. */
function looked(world: World): { watched: 1 | 2; free: 1 | 2 } {
  until(world, "looking");
  const watched = eye(world).watching as 1 | 2;
  return { watched, free: watched === 1 ? 2 : 1 };
}

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

  describe("the lid", () => {
    it("belongs to the seat the eye is not looking at, and only while it looks", () => {
      const world = open();
      expect(stareLidFree(eye(world), 1)).toBe(false);
      expect(stareLidFree(eye(world), 2)).toBe(false);
      until(world, "turning");
      expect(stareLidFree(eye(world), 1)).toBe(false);
      const { watched, free } = looked(world);
      expect(stareLidFree(eye(world), free)).toBe(true);
      expect(stareLidFree(eye(world), watched)).toBe(false);
    });

    it("shuts at the bottom of the pull and frees the watched seat that tick", () => {
      const world = open();
      const { watched, free } = looked(world);
      step(world, [lid(world, free, CFG.stareLidPullMilli - 1)]);
      // Short of the bottom: the lid is on its way and nothing has happened.
      expect(eye(world).lidSeat).toBe(free);
      expect(eye(world).lidMilli).toBe(CFG.stareLidPullMilli - 1);
      expect(stareShut(eye(world))).toBe(false);
      step(world, [lid(world, free, CFG.stareLidPullMilli + 400)]);
      expect(stareShut(eye(world))).toBe(true);
      expect(eye(world).lidMilli).toBe(CFG.stareLidPullMilli);
      expect(world.events.some((e) => e.type === "stareShut" && e.player === free)).toBe(true);
      // And the watched seat may press again, on the same tick's successor,
      // without the hull paying for it.
      expect(stareWatches(eye(world), watched)).toBe(false);
      step(world, [
        cmd(world, watched, { kind: watched === 1 ? "cannonCol" : "shieldCol", col: 1 }),
      ]);
      expect(watched === 1 ? world.cannonCol : world.shieldCol).toBe(1);
      expect(failHolds(world)).toBe(false);
    });

    it("is nothing under the watched seat's thumb — not a pull, and not a catch", () => {
      const world = open();
      const { watched } = looked(world);
      step(world, [lid(world, watched, CFG.stareLidPullMilli)]);
      expect(stareShut(eye(world))).toBe(false);
      expect(eye(world).lidSeat).toBe(0);
      expect(failHolds(world)).toBe(false);
      expect(eye(world).caughtTick).toBe(-1);
    });

    it("springs back when a half-pull is let go", () => {
      const world = open();
      const { free } = looked(world);
      step(world, [lid(world, free, 200)]);
      step(world, [lift(world, free)]);
      expect(eye(world).lidSeat).toBe(0);
      expect(eye(world).lidMilli).toBe(0);
      expect(stareLooking(eye(world))).toBe(true);
    });

    it("opens when the thumb lifts, and the eye looks at whoever pulled it", () => {
      const world = open();
      const { watched, free } = looked(world);
      step(world, [lid(world, free, CFG.stareLidPullMilli)]);
      step(world, [lift(world, free)]);
      expect(stareOpening(eye(world))).toBe(true);
      // Known from the moment the lid moves, and it is the puller, not a roll.
      expect(eye(world).watching).toBe(free);
      expect(
        world.events.some((e) => e.type === "stareOpen" && e.player === free && !e.forced),
      ).toBe(true);
      // Nobody is watched while it rises: the puller has the rise to get off
      // the glass, and the seat it was looking at is still free.
      expect(stareWatches(eye(world), free)).toBe(false);
      expect(stareWatches(eye(world), watched)).toBe(false);
      expect(until(world, "looking")).toBe(CFG.stareReopenBeats);
      expect(stareWatches(eye(world), free)).toBe(true);
      expect(stareWatches(eye(world), watched)).toBe(false);
    });

    it("is forced up by the eye after the hold, and looks at the puller anyway", () => {
      const world = open();
      const { free } = looked(world);
      step(world, [lid(world, free, CFG.stareLidPullMilli)]);
      const shutAt = world.beat;
      until(world, "opening");
      expect(world.beat - shutAt).toBe(CFG.stareLidHoldBeats);
      expect(world.events.some((e) => e.type === "stareOpen" && e.forced)).toBe(true);
      expect(eye(world).watching).toBe(free);
      // The thumb still on the lid when the eye comes back is not a press.
      until(world, "looking");
      step(world, [lid(world, free, CFG.stareLidPullMilli)]);
      expect(failHolds(world)).toBe(false);
      // And the reopened look is a whole look, the same length, and it counts
      // as the one that landed — the shut one never did.
      expect(eye(world).lookBeats).toBe(CFG.stareLookBeats);
      expect(eye(world).looks).toBe(0);
      expect(until(world, "back")).toBe(CFG.stareLookBeats);
      expect(eye(world).looks).toBe(1);
      expect(eye(world).lidSeat).toBe(0);
    });

    it("cannot be pulled again while it is shut or rising", () => {
      const world = open();
      const { watched, free } = looked(world);
      step(world, [lid(world, free, CFG.stareLidPullMilli)]);
      // The watched seat, free now, has nothing to pull: the lid is down.
      step(world, [lid(world, watched, CFG.stareLidPullMilli)]);
      expect(eye(world).lidSeat).toBe(free);
      step(world, [lift(world, free)]);
      expect(stareOpening(eye(world))).toBe(true);
      step(world, [lid(world, watched, CFG.stareLidPullMilli)]);
      expect(stareOpening(eye(world))).toBe(true);
      expect(eye(world).lidSeat).toBe(free);
    });

    it("shuts the same lid on two devices", () => {
      const a = open();
      const b = open();
      for (const world of [a, b]) {
        const { free } = looked(world);
        step(world, [lid(world, free, CFG.stareLidPullMilli)]);
        step(world, [lift(world, free)]);
      }
      expect(hashWorld(a)).toBe(hashWorld(b));
    });
  });
});
