import { describe, expect, it } from "bun:test";
import {
  buildBoss,
  buildPods,
  buildQueue,
  controlSetForWave,
  placedFaults,
  setLance,
  WAVES,
} from "@neon-spore/content";
import { autopilotHand } from "@neon-spore/hands";
import { createWorld, DEFAULT_CONFIG, startWave, step, type World } from "@neon-spore/sim";
import { parseAuto } from "../auto.js";
import { parseFrameSpec } from "../flags.js";
import { DEFAULT_UNTIL_TICKS } from "../until-flags.js";

/**
 * **`--auto`: the game's own AUTO plays while the run is stepped** (`auto.ts`).
 *
 * The flag exists so a boss's receipt can be photographed without knowing the
 * ticks of every correct press before it. What it promises is that THE VISE,
 * played by the hands the phone's AUTO plays with, flashes its kernel inside
 * the look `--until` takes by default — so `--wave "THE VISE" --auto both
 * --until viseHit` needs no `--until-ticks` to find it. The browser half, that
 * the page's `advance` presses what AUTO would, is `apps/game/src/handle.ts`.
 */

const waves = [{ name: "THE DRIFT" }, { name: "THE VISE" }];

describe("--auto", () => {
  it("names the seats AUTO plays", () => {
    for (const seats of ["both", "p1", "p2"] as const) {
      const { spec } = parseFrameSpec(["<sha>", "--wave", "1", "--auto", seats], waves);
      expect(spec.auto).toBe(seats);
    }
  });

  it("is absent from every capture that does not write it", () => {
    const { spec } = parseFrameSpec(["<sha>", "--wave", "1"], waves);
    expect("auto" in spec).toBe(false);
  });

  it("refuses a seat it cannot play, and a flag with nothing after it", () => {
    expect(() => parseAuto("p3")).toThrow(/--auto p3: one of both, p1, p2/);
    expect(() => parseAuto("off")).toThrow(/one of both, p1, p2/);
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--auto"], waves)).toThrow(
      /--auto \(nothing\)/,
    );
  });
});

/** THE VISE as `startWave` leaves it in the game (`apps/game/src/waves.ts`),
 * past its guide — which is where `--auto` switches on (`page.ts`). */
function viseWorld(): World {
  const index = WAVES.findIndex((w) => w.boss?.kind === "vise");
  expect(index).toBeGreaterThan(-1);
  const world = createWorld(DEFAULT_CONFIG, 1, []);
  const cols = world.cfg.cols;
  startWave(
    world,
    index,
    buildQueue(index, cols),
    buildPods(index, cols),
    buildBoss(index, cols),
    false,
    0,
    placedFaults(WAVES[index]?.faults),
    setLance(controlSetForWave(index)),
  );
  return world;
}

describe("--auto both on THE VISE", () => {
  it("reaches the first viseHit inside --until's default look", () => {
    const world = viseWorld();
    let hit: number | null = null;
    for (let i = 0; i < DEFAULT_UNTIL_TICKS && hit === null; i++) {
      const hand = autopilotHand(world);
      expect(hand).not.toBeNull();
      // Stamped on this tick, as the page's buffer stamps a push.
      step(world, hand ? hand(world).map((c) => ({ ...c, tick: world.tick })) : []);
      if (world.events.some((e) => e.type === "viseHit")) hit = i + 1;
    }
    expect(hit).not.toBeNull();
  });
});
