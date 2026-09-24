import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  midCol,
  type SimConfig,
  type SinewState,
  sinewBoss,
  sinewZone,
  slowing,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE SINEW doubled (`docs/spec/choreographed-windows.md`, 24 September
 * 2026): the fall eight beats and the walk four columns — and **THE SLOW
 * moved to the ask**, which is the fall: opened by the last fibre for the
 * whole of it and shut the beat the mass is walked clear or lands
 * (`sinew-step.ts`). An earlier fibre's part keeps its own short slow, a
 * moment that asks nothing. The fight is `sinew.test.ts`.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

function sinew(world: World): SinewState {
  const s = sinewBoss(world);
  if (s === null) throw new Error("the wave installed no sinew");
  return s;
}

/** One hand on its handle, `depth` down and `sway` across, in thousandths. */
const pull = (tick: number, player: 1 | 2, depth: number, sway = 0): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "sinewLeft" : "sinewRight",
    on: true,
    fromMilli: sway,
    fromYMilli: depth,
  },
});

/** Both hands in the middle of the zone, tick by tick, until the last fibre parts. */
function falling(): { world: World; s: SinewState } {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "sinew" });
  const s = sinew(world);
  s.fibres = 1;
  const until = world.tick + TPB * (CFG.sinewHoldBeats + 4);
  while (s.fallBeat < 0 && world.tick < until) {
    const z = sinewZone(s, CFG);
    const d = Math.floor((z.low + z.high) / 4) + Math.floor(s.slackMilli / 2);
    step(world, [pull(world.tick, 1, d), pull(world.tick, 2, d)]);
  }
  if (s.fallBeat < 0) throw new Error("the last fibre did not part");
  return { world, s };
}

/** Both hands swayed `sway` the same way, one tick at a time, while `go` holds. */
function sway(world: World, sway: number, go: () => boolean): void {
  while (go()) step(world, [pull(world.tick, 1, 500, sway), pull(world.tick, 2, 500, sway)]);
}

describe("THE SINEW, doubled", () => {
  it("slows the whole fall from the beat the last fibre parts", () => {
    const { world, s } = falling();
    expect(slowing(world)).toBe(true);
    expect(world.slowToBeat).toBe(s.fallBeat + CFG.sinewFallBeats);
  });

  it("shuts THE SLOW the beat the mass is walked clear, and lands it at the wall", () => {
    const { world, s } = falling();
    const clear = () => Math.abs(s.massCol - midCol(CFG)) < CFG.sinewClearCols;
    sway(world, CFG.sinewSwayMilli, clear);
    expect(s.outBeat).toBe(-1);
    expect(slowing(world)).toBe(false);
    sway(world, CFG.sinewSwayMilli, () => s.outBeat < 0);
    expect(Math.abs(s.massCol - midCol(CFG))).toBe(CFG.sinewClearCols);
  });

  it("shuts THE SLOW with a mass that lands on the hull unwalked", () => {
    const { world, s } = falling();
    sway(world, 0, () => s.outBeat < 0);
    expect(world.events.some((e) => e.type === "sinewCrush")).toBe(true);
    expect(slowing(world)).toBe(false);
  });
});
