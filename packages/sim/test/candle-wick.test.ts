import { describe, expect, it } from "bun:test";
import { candleStruck } from "../src/candle-step.js";
import {
  type CandleState,
  candleBoss,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * **The last step of THE CANDLE, which is not the trigger's.** Above it the
 * fight is one gesture played four times — find the column in the dark and
 * fire up it. At the last glow no shot counts at all: the pilot pulls the
 * flame down off the wick with his thumb, and the navigator has
 * `candleSmokeBeats` to stand the beam in that column before it lights again
 * a step brighter (`candle-hand.ts`, `.claude/skills/new-boss` §6.2).
 *
 * What is checked here is the whole of that: the trigger going quiet, the
 * pull and the half-pull, the seat it belongs to, the beam and the bolt in
 * the smoke, and the count that gives the pair something to lose.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function glow(world: World): CandleState {
  const c = candleBoss(world);
  if (c === null) throw new Error("no glow installed");
  return c;
}

function beats(world: World, n: number, commands: TimedCommand[] = []): void {
  for (let i = 0; i < n * TPB; i++) step(world, commands);
}

/** Run `n` beats and keep every event that went by: the queue is a tick long. */
function watch(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** A world at the last glow: the light out, and every step but one struck off. */
function last(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "candle" });
  beats(world, CFG.candleDarkBeats + 1);
  for (let i = 0; i < CFG.candleGlowSteps - CFG.candleLastSteps; i++) {
    candleStruck(world, shot(world, glow(world).col));
  }
  if (glow(world).phase !== "last") throw new Error("not at the last glow");
  return world;
}

/** The pilot's thumb, `milli` down from where it grabbed the flame. */
function pull(world: World, milli: number, player: 1 | 2 = 1, on = true): TimedCommand {
  return {
    tick: world.tick,
    player,
    command: { kind: "drag", target: "candleWick", on, fromMilli: 0, fromYMilli: milli },
  };
}

describe("the trigger goes quiet at the last glow", () => {
  it("takes no bolt and no beam: the step is not a shot's to take", () => {
    const world = last();
    // One tick first, so the queue holds this test's events and not the
    // four hits that brought the glow down to its last step.
    step(world, []);
    const c = glow(world);
    candleStruck(world, shot(world, c.col));
    candleStruck(world, shot(world, c.col, "cyan", true));
    expect(glow(world).glow).toBe(CFG.candleLastSteps);
    expect(glow(world).phase).toBe("last");
    expect(world.events.some((e) => e.type === "candleDim")).toBe(false);
  });
});

describe("the pull", () => {
  it("carries the flame down and leaves it there while the thumb is on it", () => {
    const world = last();
    step(world, [pull(world, 400)]);
    expect(glow(world).pinchMilli).toBe(400);
    expect(glow(world).phase).toBe("last");
    step(world, [pull(world, 900)]);
    expect(glow(world).pinchMilli).toBe(900);
    expect(glow(world).phase).toBe("last");
  });

  it("springs back when the thumb lifts short of the bottom", () => {
    const world = last();
    step(world, [pull(world, CFG.candlePinchMilli - 1)]);
    step(world, [pull(world, 0, 1, false)]);
    expect(glow(world).pinchMilli).toBe(0);
    expect(glow(world).phase).toBe("last");
  });

  it("is no pull upward, and never goes past the bottom", () => {
    const world = last();
    step(world, [pull(world, -5000)]);
    expect(glow(world).pinchMilli).toBe(0);
    expect(glow(world).phase).toBe("last");
  });

  it("takes the flame off the wick at the bottom, and says so with the column", () => {
    const world = last();
    const col = glow(world).col;
    step(world, [pull(world, CFG.candlePinchMilli)]);
    expect(glow(world).phase).toBe("smoking");
    expect(world.events.some((e) => e.type === "candleSmoke" && e.col === col)).toBe(true);
    // Nothing is left for the picture to draw a half-pulled flame from.
    expect(glow(world).pinchMilli).toBe(0);
  });

  it("is the pilot's: the navigator's thumb on it is dropped without a sound", () => {
    const world = last();
    step(world, [pull(world, CFG.candlePinchMilli, 2)]);
    expect(glow(world).phase).toBe("last");
    expect(glow(world).pinchMilli).toBe(0);
  });

  it("does nothing on any phase but the last, however deep", () => {
    const world = createWorld(CFG, 3);
    startWave(world, WAVE, [], [], { kind: "candle" });
    beats(world, CFG.candleDarkBeats + 1);
    expect(glow(world).phase).toBe("full");
    step(world, [pull(world, CFG.candlePinchMilli * 4)]);
    expect(glow(world).phase).toBe("full");
    expect(glow(world).pinchMilli).toBe(0);
  });
});

describe("the smoking wick", () => {
  function smoking(seed = 3): World {
    const world = last(seed);
    step(world, [pull(world, CFG.candlePinchMilli)]);
    return world;
  }

  it("puts the boss out on the beam, whatever the glow said", () => {
    const world = smoking();
    const col = glow(world).col;
    candleStruck(world, shot(world, col, "cyan", true));
    expect(glow(world).phase).toBe("out");
    expect(glow(world).glow).toBe(0);
    expect(world.events.some((e) => e.type === "candleDim" && e.left === 0)).toBe(true);
    expect(world.events.some((e) => e.type === "candleOut")).toBe(true);
    expect(world.balance.colorHits).toBeGreaterThan(0);
  });

  it("lets a bolt straight past: there is no flame left for one to reach", () => {
    const world = smoking();
    candleStruck(world, shot(world, glow(world).col));
    expect(glow(world).phase).toBe("smoking");
  });

  it("takes the beam up its own column alone", () => {
    const world = smoking();
    const c = glow(world);
    candleStruck(world, shot(world, c.col === 0 ? 1 : c.col - 1, "red", true));
    expect(glow(world).phase).toBe("smoking");
  });

  it("lights again a step brighter when the beam is late, and goes back to eating", () => {
    const world = smoking();
    const col = glow(world).col;
    beats(world, CFG.candleSmokeBeats - 1);
    expect(glow(world).phase).toBe("smoking");
    const seen = watch(world, 2);
    expect(seen.has("candleLit")).toBe(true);
    expect(glow(world).glow).toBe(CFG.candleLastSteps + 1);
    // Back to eating, which is the whole of what the pull had to lose: it
    // drifts and swallows flashes again, and the pair has to find it twice.
    expect(glow(world).phase).toBe("eating");
    expect(col).toBe(glow(world).col);
  });

  it("stands still while it smokes: the column the beam was told is the column it is in", () => {
    const world = smoking();
    const col = glow(world).col;
    beats(world, CFG.candleSmokeBeats - 1);
    expect(glow(world).col).toBe(col);
  });
});

describe("the thumb's depth is in the fingerprint", () => {
  it("two devices that disagree about the pull hash apart", () => {
    const a = last(7);
    const b = last(7);
    expect(hashWorld(a)).toBe(hashWorld(b));
    step(a, [pull(a, 600)]);
    step(b, []);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
