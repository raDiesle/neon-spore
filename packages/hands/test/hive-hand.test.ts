import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { hiveHand } from "../src/boss-hand-hive.js";

/**
 * **AUTO plays THE HIVE past its first breach, to its fall**
 * (`boss-hand-hive.ts`). `bun run frames --wave "THE HIVE" --auto both` once
 * fired one swell, one opening and one seal on a wall's cocoon and then
 * nothing for four thousand ticks, so no frame could show a breach on the
 * underside (`docs/queue.md`, 9 October 2026). The openings run on the clock
 * (`hive-step.ts`) and nothing a hand does holds them; this keeps it so, and
 * keeps the hand sealing every site the clock opens, the underside's and the
 * walls' alike.
 */

function played(seed: number): SimEvent[] {
  const cfg = DEFAULT_CONFIG;
  const world = createWorld(cfg, seed);
  startWave(world, 0, [], [], { kind: "hive" });
  const heard: SimEvent[] = [];
  const stop = 200 * ticksPerBeat(cfg);
  while (world.tick < stop && world.boss !== null) {
    step(
      world,
      hiveHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE HIVE, played by AUTO", () => {
  it.each([1, 2, 3])(
    "opens every site, the underside's too, and seals them all (seed %i)",
    (seed) => {
      const heard = played(seed);
      const opens = heard.filter((e) => e.type === "hiveOpen");
      const sites = DEFAULT_CONFIG.hiveSites;
      expect(opens.length).toBeGreaterThan(1);
      // An underside breach carries no row; a wall's cocoon carries its own.
      expect(opens.filter((e) => !("row" in e) || e.row === undefined).length).toBe(sites);
      expect(heard.filter((e) => e.type === "hiveSeal").length).toBe(opens.length);
      expect(heard.some((e) => e.type === "hiveOut")).toBe(true);
    },
  );
});
