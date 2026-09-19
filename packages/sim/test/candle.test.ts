import { describe, expect, it } from "bun:test";
import { candleEats, candleStruck, installCandle } from "../src/candle-step.js";
import {
  type CandleState,
  candleBoss,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE CANDLE, and the sentence it is built to make true: **the only light in
 * the field is the boss and the pair's own weapons, and the fight puts the
 * boss's out.** The dark itself is render's; what is checked here is the one
 * thing in the dark that is a rule — a glow with five steps, struck from
 * below, drifting and turning on counts the pair can say, eating the flashes
 * fired from the column it faces, and standing still at the last step.
 *
 * The last step itself — the trigger going quiet, the pilot's pull on the
 * wick and the navigator's beam into the smoke — is `candle-wick.test.ts`.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "candle" });
  return world;
}

function glow(world: World): CandleState {
  const c = candleBoss(world);
  if (c === null) throw new Error("no glow installed");
  return c;
}

/** Run `n` beats, and say which of the boss's events went by. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** Past the light going out: the first beat the glow can be struck on. */
function lit(seed = 3): World {
  const world = open(seed);
  beats(world, CFG.candleDarkBeats + 1);
  return world;
}

/** A shot that has just left through the top of `col`, handed to the boss the way `bullets.ts` does. */
function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** Strike the glow's own column `n` times. */
function dim(world: World, n: number): void {
  for (let i = 0; i < n; i++) candleStruck(world, shot(world, glow(world).col));
}

function fire(world: World, color: Color = "red"): TimedCommand {
  return { tick: world.tick, player: 2, command: { kind: "fire", color } };
}

/**
 * The two gestures the last step is finished with, run end to end: the
 * pilot's thumb to the bottom of the wick, then her beam up the column.
 * Proved a piece at a time in `candle-wick.test.ts`; here it is only the way
 * the fight reaches `out`.
 */
function snuff(world: World): void {
  step(world, [
    {
      tick: world.tick,
      player: 1,
      command: {
        kind: "drag",
        target: "candleWick",
        on: true,
        fromMilli: 0,
        fromYMilli: CFG.candlePinchMilli,
      },
    },
  ]);
  candleStruck(world, shot(world, glow(world).col, "red", true));
}

describe("the light going out", () => {
  it("arrives full, dead centre, facing its own column, and says the dark is coming", () => {
    const world = open();
    const c = glow(world);
    expect(c.phase).toBe("dark");
    expect(c.glow).toBe(CFG.candleGlowSteps);
    expect(c.col).toBe(midCol(CFG));
    expect(c.faceCol).toBe(c.col);
    expect(world.events.some((e) => e.type === "candleDark")).toBe(true);
  });

  it("cannot be struck while the light is still going out, and does not move", () => {
    const world = open();
    const col = glow(world).col;
    candleStruck(world, shot(world, col));
    expect(glow(world).glow).toBe(CFG.candleGlowSteps);
    const seen = beats(world, CFG.candleDarkBeats - 1);
    expect(glow(world).col).toBe(col);
    expect(seen.has("candleMove")).toBe(false);
    expect(glow(world).phase).toBe("dark");
  });

  it("is full once the dark has arrived", () => {
    const world = lit();
    expect(glow(world).phase).toBe("full");
  });
});

describe("the glow as health", () => {
  it("dims a step for a shot up its own column, either colour, and says what is left", () => {
    const world = lit();
    const col = glow(world).col;
    candleStruck(world, shot(world, col, "cyan"));
    expect(glow(world).glow).toBe(CFG.candleGlowSteps - 1);
    const e = world.events.find((x) => x.type === "candleDim");
    expect(e).toEqual({ type: "candleDim", col, left: CFG.candleGlowSteps - 1 });
    expect(world.balance.colorHits).toBe(1);
  });

  it("is not touched by a shot up any other column", () => {
    const world = lit();
    const col = glow(world).col;
    candleStruck(world, shot(world, col === 0 ? 1 : col - 1));
    expect(glow(world).glow).toBe(CFG.candleGlowSteps);
  });

  it("drifts a column at a time on its own count, and never off the field", () => {
    const world = lit();
    const seen = new Set<number>();
    for (let i = 0; i < 12; i++) {
      const was = glow(world).col;
      beats(world, CFG.candleMoveBeats);
      const now = glow(world).col;
      expect(Math.abs(now - was)).toBe(1);
      expect(now).toBeGreaterThanOrEqual(0);
      expect(now).toBeLessThan(CFG.cols);
      seen.add(now);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("turns to face a new column on its own count", () => {
    const world = lit();
    const seen = beats(world, CFG.candleTurnBeats);
    expect(seen.has("candleTurn")).toBe(true);
  });
});

describe("eating flashes", () => {
  function eating(seed = 3): World {
    const world = lit(seed);
    dim(world, CFG.candleGlowSteps - CFG.candleEatSteps);
    expect(glow(world).phase).toBe("eating");
    return world;
  }

  it("swallows a shot fired from the column it faces: no bolt, no flash, and a step back on the glow", () => {
    const world = eating();
    const c = glow(world);
    world.cannonCol = c.faceCol;
    world.lastFireTick = -1000;
    step(world, [fire(world)]);
    expect(world.bullets.length).toBe(0);
    expect(world.events.some((e) => e.type === "fire")).toBe(false);
    expect(world.events.some((e) => e.type === "candleFed")).toBe(true);
    expect(glow(world).glow).toBe(CFG.candleEatSteps + 1);
    // Brighter than the step it eats at, so it is not eating any more: the
    // pair has bought themselves the same shot to make again.
    expect(glow(world).phase).toBe("full");
  });

  it("lets a shot fired from any other column leave the muzzle", () => {
    const world = eating();
    const c = glow(world);
    world.cannonCol = c.faceCol === 0 ? 1 : c.faceCol - 1;
    world.lastFireTick = -1000;
    step(world, [fire(world)]);
    expect(world.bullets.length).toBe(1);
    expect(glow(world).glow).toBe(CFG.candleEatSteps);
  });

  it("never eats past full", () => {
    const world = eating();
    const c = glow(world);
    for (let i = 0; i < CFG.candleGlowSteps + 2; i++) {
      c.phase = "eating";
      candleEats(world, c.faceCol);
    }
    expect(c.glow).toBe(CFG.candleGlowSteps);
  });

  it("does not eat the beam: a beam up its column dims it like any shot", () => {
    const world = eating();
    const c = glow(world);
    candleStruck(world, shot(world, c.col, "red", true));
    expect(glow(world).glow).toBe(CFG.candleEatSteps - 1);
  });

  it("does not eat before it is dim enough", () => {
    const world = lit();
    expect(candleEats(world, glow(world).faceCol)).toBe(false);
    expect(glow(world).glow).toBe(CFG.candleGlowSteps);
  });
});

describe("the last glow", () => {
  it("stops moving and stops eating at the last step, and says so", () => {
    const world = lit();
    dim(world, CFG.candleGlowSteps - CFG.candleLastSteps);
    const c = glow(world);
    expect(c.phase).toBe("last");
    expect(world.events.some((e) => e.type === "candleLast")).toBe(true);
    const col = c.col;
    const face = c.faceCol;
    const seen = beats(world, CFG.candleMoveBeats * CFG.candleTurnBeats + 1);
    expect(glow(world).col).toBe(col);
    expect(glow(world).faceCol).toBe(face);
    expect(seen.has("candleMove")).toBe(false);
    expect(seen.has("candleTurn")).toBe(false);
    expect(candleEats(world, face)).toBe(false);
  });

  it("goes out on the pull and the beam, and holds the frame black before the wave may end", () => {
    const world = lit();
    dim(world, CFG.candleGlowSteps - CFG.candleLastSteps);
    snuff(world);
    expect(glow(world).phase).toBe("out");
    expect(glow(world).glow).toBe(0);
    expect(world.events.some((e) => e.type === "candleOut")).toBe(true);
    // A shot into the dark now is nothing.
    candleStruck(world, shot(world, glow(world).col));
    expect(glow(world).glow).toBe(0);
    beats(world, CFG.candleOutBeats - 1);
    expect(world.boss).not.toBeNull();
    beats(world, 2);
    expect(world.boss).toBeNull();
  });
});

describe("the wave and the fingerprint", () => {
  it("holds the wave open while it glows, with nothing else on the field", () => {
    const world = open();
    beats(world, 12);
    expect(world.boss).not.toBeNull();
    expect(world.events.some((e) => e.type === "needWave")).toBe(false);
  });

  it("is a fixture: the wave's own arrivals are all that falls", () => {
    const world = open();
    beats(world, 12);
    expect(world.creatures.length).toBe(0);
  });

  it("fingerprints the same run the same way twice", () => {
    const run = (): number => {
      const world = lit(11);
      dim(world, 3);
      beats(world, 5);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("installs from a world with the wave's own beat", () => {
    const world = createWorld(CFG, 1);
    const c = installCandle(world);
    expect(c.phaseBeat).toBe(world.beat);
    expect(c.moveBeat).toBe(world.beat);
  });
});
