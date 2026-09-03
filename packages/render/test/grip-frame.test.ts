import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss } from "@neon-spore/content";
import { createWorld, type SpawnEntry, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import { creatureAt, creatureCenter } from "../src/creature-place.js";
import { gripLabel } from "../src/grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

/**
 * THE GRIP is the only thing drawn from world state rather than from events,
 * and it draws text, arcs and a beam that none of the field's other frames
 * reach. One hand, two hands and every role, so the whole picture goes past a
 * canvas that refuses what a real one refuses.
 */

beforeAll(installCanvasGlobals);

function gripFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 2, kind: "slick", color: "red" },
    { beat: 0, col: 6, kind: "torch", color: null },
  ];
  const tpb = ticksPerBeat(CFG);
  return runFrames(createWorld(CFG, 5, queue), role, ticks, {
    onTick: (tick, w) => {
      // Beat one has both creatures on the field: the slick is held by both
      // players at once, the torch by one.
      const grips =
        tick === tpb
          ? [
              { tick, player: 1 as const, command: { kind: "grip" as const, id: 1 } },
              { tick, player: 2 as const, command: { kind: "grip" as const, id: 2 } },
            ]
          : [];
      step(w, grips);
      if (tick === tpb * 3) {
        step(w, [{ tick, player: 2, command: { kind: "grip", id: 1 } }]);
      }
    },
  });
}

describe("a grip", () => {
  for (const role of ROLES) {
    it(`draws one hand and two for ${role} without the canvas refusing a value`, () => {
      const { world, ctx } = gripFrames(role, ticksPerBeat(CFG) * 6);
      // It really was held while those frames were drawn.
      expect(world.gripP1 + world.gripP2).toBeGreaterThan(0);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("names the hand from the screen it is on", () => {
    expect(gripLabel("p1", true, false)).toBe("YOU PULL");
    expect(gripLabel("p2", true, false)).toBe("P1 PULLS");
    expect(gripLabel("p2", false, true)).toBe("YOU PULL");
    expect(gripLabel("test", false, true)).toBe("P2 PULLS");
    expect(gripLabel("p1", true, true)).toBe("BOTH PULL");
  });
});

/**
 * The other half of the grip: a finger has to land on the creature the player
 * can see, which is the one `creatureCenter` draws — mid-glide, not where it
 * stood on the last beat. The two agreeing is the whole of the hit-test.
 */
describe("a finger on the field", () => {
  const L = computeLayout(VIEWPORT, CFG, "test");
  const world = createWorld(CFG, 4, [
    { beat: 0, col: 2, kind: "slick", color: "red" },
    { beat: 0, col: 8, kind: "torch", color: null },
  ]);
  step(world, []);
  for (let i = 0; i < ticksPerBeat(CFG) * 2; i++) step(world, []);

  it("finds what it is pointing at, mid-glide", () => {
    for (const c of world.creatures) {
      const at = creatureCenter(L, c, 0.5);
      expect(creatureAt(L, world.creatures, at.x, at.y, 0.5)?.id).toBe(c.id);
    }
  });

  it("finds nothing in empty sky", () => {
    const c = world.creatures[0];
    if (!c) throw new Error("the field is empty");
    const at = creatureCenter(L, c, 0.5);
    expect(creatureAt(L, world.creatures, at.x, at.y - L.tile * 3, 0.5)).toBeNull();
  });

  it("never offers the queen, who cannot be gripped", () => {
    const index = waveWith("queen");
    const boss = createWorld(CFG, 4, []);
    startWave(boss, index, [], [], buildBoss(index, CFG.cols));
    const queen = boss.creatures.find((c) => c.kind === "queen");
    if (!queen) throw new Error("no queen");
    const at = creatureCenter(L, queen, 0);
    expect(creatureAt(L, boss.creatures, at.x, at.y, 0)).toBeNull();
  });
});
