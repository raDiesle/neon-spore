import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type BatonState,
  batonBoss,
  batonLaunchable,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { beadPoint } from "../src/baton-bead-draw.js";
import { batonBeadUnder } from "../src/baton-tap.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { touchDown } from "../src/touch.js";
import type { Field } from "../src/touch-field.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Player 1's thumb on the bead is the trigger** (`baton-tap.ts`). The field
 * writes `TAP` on the bead, and a phone that answered nothing there was the
 * owner's report of 2 October 2026: *when I tap as player 1, it does nothing.*
 */

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

/** The arm unfolded and the bead sitting in the top socket. */
function sitting(): { world: World; b: BatonState } {
  const world = createWorld(CFG, 3);
  const index = waveWith("baton");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < (CFG.batonSockets + 1) * TPB; i++) step(world, []);
  const b = batonBoss(world);
  if (b === null || b.stage !== "passing") throw new Error("the bead never sat");
  return { world, b };
}

function fieldWith(seat: 1 | 2, world: World, boss: BatonState): Field {
  return {
    creatures: [],
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: DEFAULT_CONFIG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

function beadAt(world: World, b: BatonState, role: ViewRole): { x: number; y: number } {
  const bead = batonLaunchable(CFG, b);
  if (bead === null) throw new Error("no bead to send");
  return beadPoint(layout(role), CFG, b, bead, world.tick);
}

describe("the bead under player 1's thumb", () => {
  it("is the trigger: a press there is his guard, from the top of the hit chain", () => {
    const { world, b } = sitting();
    const l = layout("p1");
    const at = beadAt(world, b, "p1");
    expect(touchDown(l, at.x, at.y, fieldWith(1, world, b))).toEqual({
      player: 1,
      command: { kind: "guard" },
      hold: null,
    });
  });

  it("launches the bead when the simulation is handed it", () => {
    const { world, b } = sitting();
    const at = beadAt(world, b, "p1");
    const touch = touchDown(layout("p1"), at.x, at.y, fieldWith(1, world, b));
    if (touch?.command == null) throw new Error("the tap sent nothing");
    step(world, [{ tick: world.tick, player: touch.player, command: touch.command }]);
    expect(b.beads[0]?.flying).toBe(true);
  });

  it("is player 2's too, signed as hers, and nobody's once the bead is in the air", () => {
    const { world, b } = sitting();
    const at = beadAt(world, b, "p2");
    const hers = batonBeadUnder(layout("p2"), at.x, at.y, fieldWith(2, world, b));
    expect(hers?.player).toBe(2);
    expect(hers?.command).toEqual({ kind: "guard" });
    const p1 = beadAt(world, b, "p1");
    step(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]);
    expect(batonBeadUnder(layout("p1"), p1.x, p1.y, fieldWith(1, world, b))).toBeNull();
  });

  it("is a circle round the bead and not the whole arm", () => {
    const { world, b } = sitting();
    const l = layout("p1");
    const at = beadAt(world, b, "p1");
    expect(batonBeadUnder(l, at.x, at.y + l.tile * 4, fieldWith(1, world, b))).toBeNull();
  });
});
