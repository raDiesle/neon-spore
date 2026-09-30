import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type VaneState,
  vaneColor,
  vaneOpening,
  vaneWeakCol,
  type World,
} from "../src/index.js";
import { NO_SHELL } from "../src/shell.js";

/**
 * **Where a shot meets THE VANE's bearing** since the arm came down to
 * `cfg.vaneArmRow` (`vane.ts`, `vaneMouthAlong`): on the arm's row, in the
 * split column, rather than at the top edge. What that changes is which bodies
 * are in the way — the two rows of sky above the arm are behind the bearing,
 * so a body still coming in there does not shield it, and one on the arm or
 * below it does, as it always did. `vane.test.ts` has the rest of the knock.
 */

const CFG = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const ARM = CFG.vaneArmRow;

/** The bearing full, one beat in, so the housing is split at the first stop. */
function open(): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "vane" });
  for (let t = 0; t < TPB; t++) step(world, []);
  return world;
}

const vane = (world: World): VaneState => {
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("no vane on the field");
  return b;
};

/** A rock standing still in `col` on `row`, as though it had arrived there. */
function rock(world: World, col: number, row: number): void {
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    col,
    row,
    fromRow: row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
}

/** A shot of the opening's colour up the split, and every event it raised. */
function shoot(world: World): SimEvent[] {
  const col = vaneWeakCol(CFG, world.waveBeat);
  const color = vaneColor(CFG, vaneOpening(world.waveBeat));
  const at = world.tick;
  const inputs: TimedCommand[] = [
    { tick: at, player: 1, command: { kind: "cannonCol", col } },
    { tick: at + 2, player: 2, command: { kind: "fire", color } },
  ];
  const out: SimEvent[] = [];
  for (let t = 0; t < TPB; t++) {
    step(
      world,
      inputs.filter((i) => i.tick === world.tick),
    );
    out.push(...world.events);
  }
  return out;
}

describe("the bearing, on the arm's row", () => {
  it("takes the pin on the arm's row, not at the top edge", () => {
    const world = open();
    const events = shoot(world);
    expect(vane(world).pins).toBe(CFG.vanePins - 1);
    expect(events.some((e) => e.type === "vaneKnock")).toBe(true);
  });

  it("is not shielded by a body still above the arm", () => {
    // Row 0 is behind the bearing: the shot meets the arm two rows short of it.
    const world = open();
    rock(world, vaneWeakCol(CFG, world.waveBeat), 0);
    shoot(world);
    expect(vane(world).pins).toBe(CFG.vanePins - 1);
    expect(world.creatures).toHaveLength(1);
  });

  it("is shielded by a body standing on the arm's own row", () => {
    const world = open();
    rock(world, vaneWeakCol(CFG, world.waveBeat), ARM);
    shoot(world);
    expect(vane(world).pins).toBe(CFG.vanePins);
  });

  it("says a wrong colour on the arm's row, where the shot stopped", () => {
    const world = open();
    const col = vaneWeakCol(CFG, world.waveBeat);
    const wrong = vaneColor(CFG, vaneOpening(world.waveBeat)) === "red" ? "cyan" : "red";
    const at = world.tick;
    const events: SimEvent[] = [];
    for (let t = 0; t < TPB; t++) {
      step(
        world,
        [
          { tick: at, player: 1, command: { kind: "cannonCol", col } },
          { tick: at + 2, player: 2, command: { kind: "fire", color: wrong } },
        ].filter((i) => i.tick === world.tick) as TimedCommand[],
      );
      events.push(...world.events);
    }
    expect(events.filter((e) => e.type === "reject")).toEqual([{ type: "reject", col, row: ARM }]);
  });
});
