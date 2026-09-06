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
 * and it draws text, arcs, arrows and a beam that none of the field's other
 * frames reach. One hand, two hands and every role, so the whole picture goes
 * past a canvas that refuses what a real one refuses.
 *
 * **Both kinds of hand, because they are two different pictures now.** A hand
 * on a rock is a brake and wears a beam from the hull and two carry arrows; a
 * hand on a living body is an aim and wears neither (`sim/hand.ts`).
 */

beforeAll(installCanvasGlobals);

function gripFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 2, kind: "slick", color: "red" },
    { beat: 0, col: 6, kind: "meteor", color: null },
  ];
  const tpb = ticksPerBeat(CFG);
  return runFrames(createWorld(CFG, 5, queue), role, ticks, {
    onTick: (tick, w) => {
      // Beat one has both creatures on the field: the pilot aims at the slick,
      // the navigator pulls the rock.
      const grips =
        tick === tpb
          ? [
              { tick, player: 1 as const, command: { kind: "grip" as const, id: 1 } },
              { tick, player: 2 as const, command: { kind: "grip" as const, id: 2 } },
            ]
          : [];
      step(w, grips);
      // And then both hands on the rock, which is the only body two of them
      // can be on: an aim is the pilot's alone.
      if (tick === tpb * 3) {
        step(w, [{ tick, player: 1, command: { kind: "grip", id: 2 } }]);
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

  it("names the hand from the screen it is on, and says what it is doing", () => {
    expect(gripLabel("p1", "brake", true, false)).toBe("YOU PULL");
    expect(gripLabel("p2", "brake", true, false)).toBe("P1 PULLS");
    expect(gripLabel("p2", "brake", false, true)).toBe("YOU PULL");
    expect(gripLabel("test", "brake", false, true)).toBe("P2 PULLS");
    expect(gripLabel("p1", "brake", true, true)).toBe("BOTH PULL");
  });

  it("says AIM for the hand that is not slowing anything", () => {
    expect(gripLabel("p1", "aim", true, false)).toBe("YOU AIM");
    expect(gripLabel("p2", "aim", true, false)).toBe("P1 AIMS");
  });
});

/**
 * **A pull is drawn louder than an aim**, and that is the whole of the visual
 * half of the split.
 *
 * The beam from the hull and the two carry arrows belong to the brake: one says
 * *this body is being dragged at*, the other says *and it can be walked a lane*.
 * Neither is true of a hand on a slick, which slows nothing and moves nothing —
 * so the same gesture on the two bodies has to put visibly less on the screen
 * for the aim, or the partner reads a beat they were never given.
 *
 * Counted rather than looked at, because what is being pinned is *fewer marks*,
 * not a particular arc: a test that named the beam would pass the day somebody
 * drew it in a different call.
 */
describe("what each hand puts on the field", () => {
  const TPB = ticksPerBeat(CFG);

  function heldBy(kind: SpawnEntry["kind"], player: 1 | 2): number {
    const world = createWorld(CFG, 5, [
      { beat: 0, col: 4, kind, color: kind === "slick" ? "red" : null },
    ]);
    for (let tick = 0; tick <= TPB * 2; tick++) {
      step(world, tick === TPB ? [{ tick, player, command: { kind: "grip", id: 1 } }] : []);
    }
    expect(world.gripP1 + world.gripP2).toBeGreaterThan(0);
    return marks(world, "test");
  }

  it("draws more for a rock than for a body the same hand is only aiming at", () => {
    expect(heldBy("meteor", 1)).toBeGreaterThan(heldBy("slick", 1));
  });
});

/**
 * **A hand on a ghost is refused outright**, so there is nothing to hide.
 *
 * This used to be a gate in `drawGrips`: a falling ghost was grippable, player
 * 1 is not drawn its body at all, and a beam, a ring and a label at the body's
 * centre were three marks sitting exactly in the lane the creature exists to
 * keep from that seat. The brake is a rock's now and the aim is refused on a
 * ghost for its own reason, which leaves a hand with nothing whatever to do to
 * one — so it is refused by kind (`sim/grippable.ts`) and the gate went with
 * it. What is checked here is that the refusal really is the simulation's, not
 * a picture quietly declining to draw a hand that is down.
 */
describe("a grip on a ghost", () => {
  const TPB = ticksPerBeat(CFG);

  function pressed(player: 1 | 2): World {
    const world = createWorld(CFG, 5, [{ beat: 0, col: 5, kind: "ghost", color: "cyan" }]);
    for (let tick = 0; tick <= TPB * 2; tick++) {
      step(world, tick === TPB ? [{ tick, player, command: { kind: "grip", id: 1 } }] : []);
    }
    return world;
  }

  it("is never taken, by either seat", () => {
    expect(pressed(1).gripP1).toBe(0);
    expect(pressed(2).gripP2).toBe(0);
  });

  it("puts nothing on either screen", () => {
    for (const role of ROLES) expect(marks(pressed(2), role)).toBe(0);
  });
});

/** What `drawGrips` alone puts on one screen, out of one world. */
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
      expect(creatureAt(L, world.creatures, at.x, at.y, 0.5, 1)?.id).toBe(c.id);
    }
  });

  it("finds nothing in empty sky", () => {
    const c = world.creatures[0];
    if (!c) throw new Error("the field is empty");
    const at = creatureCenter(L, c, 0.5);
    expect(creatureAt(L, world.creatures, at.x, at.y - L.tile * 3, 0.5, 1)).toBeNull();
  });

  /**
   * The navigator has no aim, so the body they would only be aiming at is not
   * under their thumb at all. A press answered here and then refused by
   * `setGrip` is a control that looks live and does nothing, which is the one
   * outcome the refusal exists to prevent.
   */
  it("offers a living body to the pilot and not to the navigator", () => {
    const slick = world.creatures.find((c) => c.kind === "slick");
    if (!slick) throw new Error("no slick");
    const at = creatureCenter(L, slick, 0.5);
    expect(creatureAt(L, world.creatures, at.x, at.y, 0.5, 1)?.id).toBe(slick.id);
    expect(creatureAt(L, world.creatures, at.x, at.y, 0.5, 2)).toBeNull();
  });

  it("offers a rock to both seats", () => {
    const rock = world.creatures.find((c) => c.kind === "torch");
    if (!rock) throw new Error("no torch");
    const at = creatureCenter(L, rock, 0.5);
    for (const seat of [1, 2] as const) {
      expect(creatureAt(L, world.creatures, at.x, at.y, 0.5, seat)?.id).toBe(rock.id);
    }
  });

  it("never offers the queen, who cannot be gripped", () => {
    const index = waveWith("queen");
    const boss = createWorld(CFG, 4, []);
    startWave(boss, index, [], [], buildBoss(index, CFG.cols));
    const queen = boss.creatures.find((c) => c.kind === "queen");
    if (!queen) throw new Error("no queen");
    const at = creatureCenter(L, queen, 0);
    expect(creatureAt(L, boss.creatures, at.x, at.y, 0, 1)).toBeNull();
  });
});
