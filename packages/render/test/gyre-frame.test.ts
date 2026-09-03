import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, gyreSucked, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE GYRE, drawn: the hub, the six spokes and the rim they hold out, the six
 * bodies bolted to it, and the wind between the wheel and a ship that is
 * pulling on it.
 *
 * The wheel is the one body in the game whose picture is an armature rather
 * than a contour, and the wind is the only thing drawn from *two* places at
 * once. Neither was reached by any frame: the maw has to be open for the
 * bright half of the stream, and a run with no commands in it never opens one.
 */

beforeAll(installCanvasGlobals);

function gyreFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col: 3, kind: "gyre", color: null }];
  const tpb = ticksPerBeat(CFG);
  let sucked = 0;
  const frames = runFrames(createWorld(CFG, 5, queue), role, ticks, {
    onTick: (tick, w) => {
      // The cannon stands away from the wheel and the maw opens on the fourth
      // beat: the stream leans, which is the whole of the coupling, and it is
      // drawn faint before that and bright after.
      const commands =
        tick === 1
          ? [{ tick, player: 1 as const, command: { kind: "cannonCol" as const, col: 8 } }]
          : tick === tpb * 4
            ? [{ tick, player: 1 as const, command: { kind: "intake" as const } }]
            : [];
      step(w, commands);
      if (gyreSucked(w)) sucked += 1;
    },
  });
  return { ...frames, sucked };
}

describe("the gyre", () => {
  // Long enough for the wheel to fall to the middle of the field and walk a
  // lap of its diamond there, so the turn, the sink and the grind are drawn.
  const TICKS = ticksPerBeat(CFG) * 20;

  for (const role of ROLES) {
    it(`draws the wheel, its mounts and the wind for ${role}`, () => {
      const { ctx } = gyreFrames(role, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really carried six bodies on the rim and really pulled on them", () => {
    // Without the mounts the frames drew an empty armature; without the maw
    // they drew the faint half of the wind and never the bright one.
    const { world, sucked } = gyreFrames("test", TICKS);
    expect(world.creatures.filter((c) => c.kind === "mount").length).toBeGreaterThan(0);
    expect(sucked).toBeGreaterThan(0);
  });
});
