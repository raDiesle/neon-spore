import { describe, expect, it } from "bun:test";
import {
  BEARING_TURN,
  createWorld,
  DEFAULT_CONFIG,
  type GimbalMark,
  type GimbalState,
  gimbalBoss,
  INNER,
  NO_BEARING,
  OUTER,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE GIMBAL's hands, let go of while the drum shears.
 *
 * The third page of the gimbal's receipts, because `gimbal.test.ts` sits at
 * the length ceiling. Until 26 September 2026 a hand was heard only while the
 * marks were lit, so a thumb lifted during the shear's beats was never heard
 * at all: the ring kept its bearing, and when the next marks lit it neither
 * drifted home nor drew unheld, with nobody's finger on it. THE GIMBAL's film
 * stepped around it by lifting after the marks relit (`sim/gimbal-hand.ts`).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const FIRST: GimbalMark = { outerMilli: 250, innerMilli: 250, creepMilli: 0 };
const MARKS: GimbalMark[] = [FIRST, { outerMilli: 600, innerMilli: 400, creepMilli: 0 }];

function gimbal(world: World): GimbalState {
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the wave installed no gimbal");
  return s;
}

/** A thumb on a rim, at `at` thousandths of a turn on that seat's face. */
const grip = (tick: number, player: 1 | 2, at: number, on = true): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "gimbalOuter" : "gimbalInner",
    on,
    fromMilli: at,
    fromYMilli: 0,
  },
});

function runTo(world: World, tick: number, cmds: TimedCommand[] = []): void {
  while (world.tick < tick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
  }
}

/** Both rings carried onto the first marks and held until the drum shears. */
function shearing(): World {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "gimbal", marks: MARKS });
  runTo(world, TPB * (CFG.gimbalStillBeats + 1));
  const t = world.tick;
  runTo(world, t + 4, [
    grip(t, 1, 0),
    grip(t + 1, 1, FIRST.outerMilli),
    grip(t + 2, 2, 0),
    grip(t + 3, 2, BEARING_TURN - FIRST.innerMilli),
  ]);
  for (let i = 0; i < 20 && gimbal(world).phase !== "shear"; i++) runTo(world, world.tick + TPB);
  expect(gimbal(world).phase).toBe("shear");
  return world;
}

describe("a hand let go of while THE GIMBAL shears", () => {
  it("is off its ring at once, and the ring drifts on the first turning beat", () => {
    const world = shearing();
    const t = world.tick;
    runTo(world, t + 1, [grip(t, 1, 0, false)]);
    const s = gimbal(world);
    expect(s.phase).toBe("shear");
    expect(s.handMilli[OUTER]).toBe(NO_BEARING);
    // The navigator's hand never left, so her ring keeps its bearing.
    expect(s.handMilli[INNER]).not.toBe(NO_BEARING);
    while (s.phase === "shear") runTo(world, world.tick + 1);
    const before = s.atMilli[OUTER];
    const held = s.atMilli[INNER];
    runTo(world, world.tick + TPB);
    expect(s.atMilli[OUTER]).toBe(before - CFG.gimbalDriftMilli);
    expect(s.atMilli[INNER]).toBe(held);
  });

  it("but does not turn a ring while the drum shears", () => {
    const world = shearing();
    const at = gimbal(world).atMilli[OUTER];
    const t = world.tick;
    runTo(world, t + 1, [grip(t, 1, FIRST.outerMilli + 100)]);
    expect(gimbal(world).atMilli[OUTER]).toBe(at);
  });
});
