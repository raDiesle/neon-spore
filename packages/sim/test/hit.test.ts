import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hullRow,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const shoot = (tick: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color: "red" },
});

/** Fire a single matching shot at `fireTick`; true when the creature bursts. */
function shootAt(fireTick: number, col = 3): boolean {
  const world = createWorld({ ...CFG }, 0, [slick(col)]);
  const cmds: TimedCommand[] = [aim(fireTick, col), shoot(fireTick)];
  let destroyed = false;
  for (let t = 0; t < TPB * (HULL + 1); t++) {
    step(
      world,
      cmds.filter((c) => c.tick === t),
    );
    if (world.events.some((e) => e.type === "destroy")) destroyed = true;
  }
  return destroyed;
}

describe("a shot that meets a creature", () => {
  /**
   * The old collision compared whole rows once per tile the bullet entered. A
   * creature that dropped a row in the same tick the bullet left it swapped
   * places with the shot, and roughly one firing moment in fifteen went
   * straight through a creature the eye had already seen it hit.
   */
  it("never passes through it, whatever the moment inside the beat", () => {
    const missed: number[] = [];
    for (let t = TPB * 2; t < TPB * 6; t++) if (!shootAt(t)) missed.push(t);
    expect(missed).toEqual([]);
  });

  it("leaves a creature in the neighbouring column alone", () => {
    const world = createWorld({ ...CFG }, 0, [slick(4)]);
    const cmds: TimedCommand[] = [aim(TPB * 2, 3), shoot(TPB * 2)];
    for (let t = 0; t < TPB * (HULL + 1); t++) {
      step(
        world,
        cmds.filter((c) => c.tick === t),
      );
      expect(world.events.some((e) => e.type === "destroy")).toBe(false);
    }
  });
});
