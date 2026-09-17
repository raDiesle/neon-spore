import { describe, expect, it } from "bun:test";
import {
  type AntiphonState,
  antiphonBoss,
  antiphonHeld,
  antiphonTurnMilli,
} from "../src/antiphon.js";
import {
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

/**
 * THE ANTIPHON's one gesture: a thumb resting on the organ turns it, and
 * lifting stops it (`antiphon-hand.ts`). The receipts are the design's
 * sentence taken apart — *turns slowly in place*, *stops when the hand
 * lifts*, *a rotation, not a rate* — and the two things the rule has to
 * hold beside it: a turn is a fact both devices hash, and nothing about
 * the fight moves for it.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, 6, [], [], { kind: "antiphon" });
  return world;
}

function body(world: World): AntiphonState {
  const s = antiphonBoss(world);
  if (s === null) throw new Error("no body installed");
  return s;
}

function thumb(world: World, player: 1 | 2, on: boolean): TimedCommand {
  return {
    tick: world.tick,
    player,
    command: { kind: "drag", target: "antiphonOrgan", on, fromMilli: 0, fromYMilli: 0 },
  };
}

function ticks(world: World, n: number, commands: TimedCommand[] = []): void {
  step(world, commands);
  for (let i = 1; i < n; i++) step(world, []);
}

/** Run until an organ stands. */
function standing(world: World): AntiphonState {
  const s = body(world);
  for (let n = 0; n < 40 * TPB && s.organs.length === 0; n++) step(world, []);
  if (s.organs.length === 0) throw new Error("nothing grew");
  return s;
}

describe("a thumb on the organ", () => {
  it("turns it a tick at a time while it rests, from either seat", () => {
    for (const player of [1, 2] as const) {
      const world = open();
      const s = standing(world);
      ticks(world, 5, [thumb(world, player, true)]);
      expect(antiphonHeld(s, player)).toBe(true);
      expect(s.turnTicks).toBe(5);
    }
  });

  it("stops where it is when the thumb lifts, and does not fall back", () => {
    const world = open();
    const s = standing(world);
    ticks(world, 4, [thumb(world, 1, true)]);
    ticks(world, 6, [thumb(world, 1, false)]);
    expect(antiphonHeld(s, 1)).toBe(false);
    expect(s.turnTicks).toBe(4);
  });

  it("is a whole turn in antiphonTurnBeats, read in thousandths", () => {
    const world = open();
    const s = standing(world);
    expect(antiphonTurnMilli(s, CFG)).toBe(0);
    ticks(world, (TPB * CFG.antiphonTurnBeats) / 2, [thumb(world, 1, true)]);
    expect(antiphonTurnMilli(s, CFG)).toBe(500);
    ticks(world, (TPB * CFG.antiphonTurnBeats) / 2);
    expect(antiphonTurnMilli(s, CFG)).toBe(0);
    expect(s.turnTicks).toBe(TPB * CFG.antiphonTurnBeats);
  });

  it("does nothing between cycles, and the next organ starts upright under a hand kept on", () => {
    const world = open();
    const s = body(world);
    ticks(world, 3, [thumb(world, 1, true)]);
    expect(antiphonHeld(s, 1)).toBe(true);
    expect(s.turnTicks).toBe(0);
    standing(world);
    // The organ grew on the beat, after this tick's turn was read; the hand
    // still resting turns it from the next tick on.
    expect(s.turnTicks).toBe(0);
    step(world, []);
    expect(s.turnTicks).toBe(1);
  });

  it("changes nothing about the fight: the window, the rail and the pits are what they were", () => {
    const a = open();
    const b = open();
    standing(a);
    standing(b);
    ticks(a, TPB * 3, [thumb(a, 1, true)]);
    ticks(b, TPB * 3);
    const sa = body(a);
    const sb = body(b);
    expect(sa.rail).toEqual(sb.rail);
    expect(sa.organs).toEqual(sb.organs);
    expect(sa.pits).toEqual(sb.pits);
    expect(sa.cycleBeat).toBe(sb.cycleBeat);
    expect(a.events.length).toBe(b.events.length);
  });

  it("is in the hash: a turned organ and one at rest are two worlds", () => {
    const a = open();
    const b = open();
    standing(a);
    standing(b);
    ticks(a, 2, [thumb(a, 1, true)]);
    ticks(b, 2);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
    // And a thumb resting with nothing turned yet is a fact of its own.
    const c = open();
    const d = open();
    step(c, [thumb(c, 2, true)]);
    step(d, []);
    expect(hashWorld(c)).not.toBe(hashWorld(d));
  });
});
