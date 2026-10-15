import { describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG, startWave } from "../src/index.js";
import { purge } from "../src/pod-effects.js";
import { NO_SHELL } from "../src/shell.js";

/**
 * **A purge spares a boss's own body** (`pod-effects.ts`). It used to take
 * the queen with everything else, and her fight went on holding the wave with
 * nothing left to finish, so the wave never ended. The owner, 15 October 2026:
 * the purge spares the boss and clears everything else.
 */

describe("a purge on a boss wave", () => {
  it("clears her torch and leaves the queen standing", () => {
    const world = createWorld(DEFAULT_CONFIG, 1);
    startWave(world, 0, [], [], { kind: "queen", col: 5, petals: 9 });
    const queen = world.creatures.find((c) => c.kind === "queen");
    expect(queen).toBeDefined();
    world.creatures.push({
      id: world.nextId++,
      kind: "torch",
      col: 2,
      row: 6,
      fromRow: 6,
      color: null,
      holes: 0,
      petals: 0,
      dragMilli: 0,
      shell: NO_SHELL,
    });
    purge(world);
    expect(world.creatures.map((c) => c.kind)).toEqual(["queen"]);
    expect(world.events.some((e) => e.type === "hole" && e.kind === "torch")).toBe(true);
  });
});
