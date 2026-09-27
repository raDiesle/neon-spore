import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  type Command,
  capstanBoss,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { LEAN_BOSSES, leanAsked, leanBob, leanReader, leanTarget } from "../src/lean.js";

/**
 * **THE CAPSTAN's cradle rocks off a real phone's lean** (§11.54): the drum
 * is on the lean table, so both phones are read while it stands and iOS is
 * asked for the sensor on its wave; both seats send the one `capstanLean`,
 * because which of them steers is the lit step's; and a lean past the mark
 * from the steering seat, through the reader and into the simulation, rocks
 * the cradle over.
 */

const CFG = DEFAULT_CONFIG;

function capstanUp(): World {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "capstan");
  if (index === -1) throw new Error("no wave carries the capstan");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  if (capstanBoss(world)?.phase !== "lit") throw new Error("the capstan wave lit no step");
  return world;
}

describe("THE CAPSTAN's lean", () => {
  it("is read, and asked for, while the drum stands and not before", () => {
    expect(LEAN_BOSSES).toContain("capstan");
    expect(leanAsked(createWorld(CFG, 5))).toBe(false);
    expect(leanAsked(capstanUp())).toBe(true);
  });

  it("goes out as the one target from either seat", () => {
    expect(leanTarget("capstan", 1)).toBe("capstanLean");
    expect(leanTarget("capstan", 2)).toBe("capstanLean");
  });

  it("past the mark from the pilot rocks the cradle to the left face", () => {
    const world = capstanUp();
    const sent: { player: 1 | 2; command: Command }[] = [];
    const r = leanReader(
      (player, command) => sent.push({ player, command }),
      () => 1,
      () => leanBob(world, "capstan"),
      (p) => leanTarget("capstan", p),
    );
    r.read(-(CFG.capstanLeanMilli / 1000 + 4));
    expect(sent).toHaveLength(1);
    step(
      world,
      sent.map((s) => ({ tick: world.tick, ...s })),
    );
    expect(world.events.some((e) => e.type === "capstanRock" && e.side === 0)).toBe(true);
  });
});
