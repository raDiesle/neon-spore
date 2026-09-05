import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss } from "@neon-spore/content";
import {
  createWorld,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { creatureAt, creatureCenter } from "../src/creature-place.js";
import { drawGrips, gripLabel } from "../src/grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { stubCanvas } from "./canvas-stub.js";
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
 * **A hand on a ghost is not drawn on the screen the ghost is not.**
 *
 * A falling ghost is grippable, and player 1 is not shown its body at all —
 * that seat gets a band across the row and nothing about the column, because
 * anything varying across the width of the field *is* the column, given away.
 * A beam from the hull, a ring and a label are three such things, so a pilot
 * who swept a thumb along the row and found the body used to be handed a
 * marker sitting exactly in the lane the creature exists to keep from them.
 *
 * Two runs per seat rather than one seat against the other: the two screens
 * draw different pictures of a ghost anyway, so only *the same seat with and
 * without the hand* says whether the marker was added. Player 2 is the control
 * — a gate that hid the picture from both would be the mechanic thrown away
 * rather than fixed, and this is what notices.
 */
describe("a grip on a ghost", () => {
  const TPB = ticksPerBeat(CFG);

  /** One world, a ghost in it, held by player 2 from the first beat. */
  function gripped(): World {
    const world = createWorld(CFG, 5, [{ beat: 0, col: 5, kind: "ghost", color: "cyan" }]);
    for (let tick = 0; tick <= TPB * 2; tick++) {
      step(world, tick === TPB ? [{ tick, player: 2, command: { kind: "grip", id: 1 } }] : []);
    }
    return world;
  }

  /** What `drawGrips` alone puts on one screen, out of that same world. */
  function marks(world: World, role: ViewRole): number {
    const { ctx } = stubCanvas();
    drawGrips(
      ctx as unknown as CanvasRenderingContext2D,
      computeLayout(VIEWPORT, CFG, role),
      world,
      0.5,
      1,
    );
    return ctx.calls;
  }

  it("really is held, or neither reading proves anything", () => {
    expect(gripped().gripP2).toBeGreaterThan(0);
  });

  it("puts nothing on player 1's screen", () => {
    expect(marks(gripped(), "p1")).toBe(0);
  });

  it("is still drawn for player 2, who can see the body", () => {
    expect(marks(gripped(), "p2")).toBeGreaterThan(0);
  });

  /** The rig is both halves at once on one screen, so it sees everything. */
  it("is drawn on the rig", () => {
    expect(marks(gripped(), "test")).toBeGreaterThan(0);
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
