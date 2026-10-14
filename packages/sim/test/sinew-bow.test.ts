import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  type SinewState,
  sinewBoss,
  sinewHeld,
  startWave,
  step,
  type TimedCommand,
  type World,
} from "../src/index.js";
import { PULL_STRAY_MILLI } from "../src/pull-path.js";
import { sinewBowFromMilli, sinewBowPoint, sinewBowShare } from "../src/sinew-bow.js";

/**
 * **THE SINEW's handles bow** (`sinew-bow.ts`): each one's way down is a
 * half-wave out away from the mass, the depth is still the straight distance
 * down, and a thumb a tile across from the bow at its depth drops the handle
 * until it lifts.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true, sinewEnterBeats: 0 };
const REACH = CFG.sinewReachMilli;

function install(): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "sinew" });
  return world;
}

function sinew(world: World): SinewState {
  const s = sinewBoss(world);
  if (s === null) throw new Error("the wave installed no sinew");
  return s;
}

const drag = (player: 1 | 2, on: boolean, x: number, y: number): TimedCommand => ({
  tick: 0,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "sinewLeft" : "sinewRight",
    on,
    fromMilli: x,
    fromYMilli: y,
  },
});

/** One tick with these commands, and the event types it said. */
function tick(world: World, ...cmds: TimedCommand[]): string[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return world.events.map((e) => e.type);
}

describe("the bow", () => {
  it("splays the two handles apart, widest halfway, and comes back under the rest", () => {
    expect(sinewBowPoint(CFG, 1, REACH / 2).x).toBe(-CFG.sinewBowMilli);
    expect(sinewBowPoint(CFG, 2, REACH / 2).x).toBe(CFG.sinewBowMilli);
    expect(sinewBowPoint(CFG, 1, 0)).toEqual({ x: 0, y: 0 });
    expect(sinewBowPoint(CFG, 2, REACH)).toEqual({ x: 0, y: REACH });
  });

  it("is bent further than a thumb may stray, so straight down is off it", () => {
    expect(CFG.sinewBowMilli).toBeGreaterThan(PULL_STRAY_MILLI);
  });

  it("fills its channel by the bow's own length, which runs ahead of the depth mid-bow", () => {
    expect(sinewBowShare(CFG, 1, 0)).toBe(0);
    expect(sinewBowShare(CFG, 1, REACH)).toBeCloseTo(1, 2);
    expect(sinewBowShare(CFG, 2, REACH / 4)).toBeGreaterThan(0.25);
  });
});

describe("a hand on the bow", () => {
  it("is held at its depth, the straight distance down, as before", () => {
    const world = install();
    tick(world, drag(1, true, 0, 0), drag(2, true, 0, 0));
    const at = sinewBowFromMilli(CFG, 1, 1800);
    tick(world, drag(1, true, at.fromMilli, at.fromYMilli));
    expect(sinew(world).pullP1Milli).toBe(1800);
    expect(sinew(world).swayP1Milli).toBe(0);
  });

  it("pulled straight down instead, strays: said, dropped, and deaf until it lifts", () => {
    const world = install();
    tick(world, drag(1, true, 0, 0));
    const said = tick(world, drag(1, true, 0, REACH / 2));
    expect(said).toContain("pullStray");
    expect(said).toContain("sinewRelease");
    expect(sinewHeld(sinew(world), 1)).toBe(false);
    // Back on the bow without lifting takes nothing.
    const back = sinewBowFromMilli(CFG, 1, 600);
    tick(world, drag(1, true, back.fromMilli, back.fromYMilli));
    expect(sinewHeld(sinew(world), 1)).toBe(false);
    // A lift and a fresh press does.
    tick(world, drag(1, false, 0, 0));
    tick(world, drag(1, true, 0, 0));
    expect(sinewHeld(sinew(world), 1)).toBe(true);
  });

  it("carried on past the reach is still on its handle, not off the end", () => {
    const world = install();
    tick(world, drag(2, true, 0, 0));
    expect(tick(world, drag(2, true, 0, REACH + 2000))).not.toContain("pullStray");
    expect(sinew(world).pullP2Milli).toBe(REACH);
  });

  it("goes into the fingerprint when it has strayed", () => {
    const a = install();
    const b = install();
    for (const w of [a, b]) tick(w, drag(1, true, 0, 0));
    tick(a, drag(1, true, 0, REACH / 2));
    tick(b, drag(1, false, 0, 0));
    expect(sinewHeld(sinew(a), 1)).toBe(sinewHeld(sinew(b), 1));
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });

  it("is not asked of the fall, where across is the sway", () => {
    const world = install();
    sinew(world).fallBeat = world.beat;
    sinew(world).fibres = 0;
    tick(world, drag(1, true, 0, 0));
    expect(tick(world, drag(1, true, 0, REACH / 2))).not.toContain("pullStray");
  });
});
