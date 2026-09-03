import { beforeAll, describe, expect, it } from "bun:test";
import {
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  GYRE_RADIUS,
  gyreRestCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { creatureCenter } from "../src/creature-place.js";
import { drawGyres } from "../src/gyre.js";
import { gyreCenter, gyreCorners, mountPlace } from "../src/gyre-place.js";
import { drawGyreWind } from "../src/gyre-wind.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE GYRE's wheel turns rather than slides, and the one thing that costs is a
 * body drawn somewhere the simulation does not have it.
 *
 * The whole vocabulary of this game is a colour in a column on a beat, so the
 * promise `gyre-place.ts` makes is the only one worth a test: **on every beat
 * boundary a mount is exactly where `creatureCenter` would have put it**, maw
 * open or shut, however far the wheel has accelerated. What happens in between
 * is a picture and is judged by eye — except for the one fact that makes it a
 * wheel at all, which is that the six keep their distance from the hub as they
 * cross. A chord does not, and that was the defect.
 */

const cfg: SimConfig = { ...DEFAULT_CONFIG, briefings: false };
const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, cfg, "test");

beforeAll(installCanvasGlobals);

/** A world with one wheel and nothing else, `beats` beats after it entered.
 * Driven through `step` rather than `onBeat`, because that is the door the game
 * itself goes through and the only one `@neon-spore/sim` opens. */
function withGyre(beats: number, open = false): World {
  const world = createWorld(cfg, 1);
  startWave(world, 0, [{ beat: 0, col: gyreRestCol(cfg), kind: "gyre", color: null }]);
  const ticks = (beats + 1) * ticksPerBeat(cfg);
  for (let tick = 0; tick < ticks; tick++) {
    const maw: TimedCommand[] =
      open && tick === ticks - 1 ? [{ tick, player: 1, command: { kind: "intake" } }] : [];
    step(world, maw);
  }
  return world;
}

const hub = (w: World): Creature => w.creatures.find((c) => c.kind === "gyre")!;
const mounts = (w: World): Creature[] => w.creatures.filter((c) => c.kind === "mount");

describe("a body on a rim", () => {
  it("lands on its own tile at both ends of every beat", () => {
    // Far enough in that the wheel has left the fall behind, is walking the
    // diamond and has picked up speed — the three things that move it at once.
    for (const beats of [0, 1, 7, 12, 20, 31]) {
      const world = withGyre(beats);
      for (const phase of [0, 1]) {
        for (const m of mounts(world)) {
          const want = creatureCenter(l, m, phase);
          const got = mountPlace(l, world, m, phase, 4.2);
          expect(got).not.toBeNull();
          expect(got?.x).toBeCloseTo(want.x, 6);
          expect(got?.y).toBeCloseTo(want.y, 6);
        }
      }
    }
  });

  it("lands on its own tile with the maw open, jam and all", () => {
    const world = withGyre(18, true);
    for (const time of [0, 0.31, 1.7, 9.05]) {
      for (const m of mounts(world)) {
        const want = creatureCenter(l, m, 1);
        const got = mountPlace(l, world, m, 1, time);
        expect(got?.x).toBeCloseTo(want.x, 6);
        expect(got?.y).toBeCloseTo(want.y, 6);
      }
    }
  });

  it("keeps its distance from the hub as it crosses, which a chord does not", () => {
    // A beat the wheel actually turns on: the mount ends the beat somewhere it
    // did not start it.
    const world = withGyre(24);
    const moving = mounts(world).find((m) => m.col !== (m.fromCol ?? m.col) || m.row !== m.fromRow);
    expect(moving).toBeDefined();
    const reach = l.tile * GYRE_RADIUS;
    for (const phase of [0.25, 0.5, 0.75]) {
      const at = mountPlace(l, world, moving!, phase, 0)!;
      const mid = gyreCenter(l, hub(world), phase);
      const r = Math.hypot(at.x - mid.x, at.y - mid.y);
      // Two tiles or `sqrt(5)`, never the short way across between them.
      expect(r).toBeGreaterThan(reach * 0.97);
      expect(r).toBeLessThan(reach * 1.15);
    }
  });

  it("is nothing to a body that rides no wheel", () => {
    const world = withGyre(6);
    expect(mountPlace(l, world, hub(world), 0.5, 0)).toBeNull();
  });
});

describe("the rim itself", () => {
  it("holds a corner for a slot whose body has been shot", () => {
    const world = withGyre(24);
    const lost = mounts(world)[2]!;
    world.creatures = world.creatures.filter((c) => c.id !== lost.id);
    const carried = world.creatures.filter((c) => c.gyreId === hub(world).id);
    const at = gyreCorners(l, world, hub(world), carried, 0.4, 1.1);
    expect(at).toHaveLength(6);
    for (const p of at) expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
  });

  it("draws, wind and all, with the maw shut and open", () => {
    const { ctx } = stubCanvas();
    for (const open of [false, true]) {
      const world = withGyre(20, open);
      for (const phase of [0, 0.37, 0.99]) {
        drawGyreWind(ctx as unknown as CanvasRenderingContext2D, l, world, phase, phase * 3);
        drawGyres(ctx as unknown as CanvasRenderingContext2D, l, world, phase, phase * 3);
      }
    }
  });
});
