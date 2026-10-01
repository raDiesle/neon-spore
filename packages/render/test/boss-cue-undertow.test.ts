import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type UndertowLobe,
  type UndertowState,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE UNDERTOW, and the word each lobe says** (`render/src/boss-cue-read-j.ts`).
 *
 * Rewritten for the rework of 1 October 2026. A lobe's colour is its answer:
 * a yellow one is the maw's, with the cannon under it; a shield-coloured one
 * is the shield's, raised under it; a tall one is either seat's tap. What is
 * checked is the column as much as the verb — a word asking for a press that
 * would do nothing from where the carriage stands is the fight lying, so
 * almost every case is a pair: under it, and away from it.
 *
 * The states are set rather than played into: every clock under them is
 * proved in `sim/test/undertow.test.ts`.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

const HULL = (l: Layout) => () => l.hullY;

function opened(): { world: World; u: UndertowState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("undertow");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow's wave installed no boss");
  return { world, u };
}

/** A column away from wherever the carriages are parked, which is the middle. */
function elsewhere(world: World): number {
  return world.cannonCol === 0 ? 1 : 0;
}

function lobe(world: World, col: number, over: Partial<UndertowLobe> = {}): UndertowLobe {
  return { col, stage: "standing", stageBeat: world.beat, answer: "maw", ...over };
}

/** The word this seat is given, or nothing. */
function word(world: World, role: ViewRole): string | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, HULL(l))?.word ?? null;
}

/** The whole cue this seat is given. */
function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, HULL(l));
}

describe("a yellow lobe", () => {
  it("asks the pilot for SUCK with the cannon under it, and her for nothing", () => {
    const { world, u } = opened();
    u.lobes.push(lobe(world, world.cannonCol));
    expect(word(world, "p1")).toBe("SUCK");
    expect(cue(world, "p1")?.kind).toBe("HOLD");
    expect(word(world, "p2")).toBeNull();
  });

  it("asks him to move the cannon when it is away, and marks the cannon", () => {
    const { world, u } = opened();
    const col = elsewhere(world);
    u.lobes.push(lobe(world, col));
    expect(word(world, "p1")).toBe("MOVE");
    const c = cue(world, "p1");
    expect(c?.kind).toBe("CARRY");
    const l = LAYOUT.p1;
    // On the carriage and never on the lobe: the pair say the column (#34).
    expect(Math.abs((c?.x ?? 0) - tileCX(l, world.cannonCol))).toBeLessThan(1);
    expect(Math.abs((c?.x ?? 0) - tileCX(l, col))).toBeGreaterThan(l.tile / 2);
    expect(word(world, "p2")).toBeNull();
  });
});

describe("a shield-coloured lobe", () => {
  it("asks the pilot to raise the shield when it is under it", () => {
    const { world, u } = opened();
    u.lobes.push(lobe(world, world.shieldCol, { answer: "shield" }));
    expect(word(world, "p1")).toBe("SHIELD");
    expect(cue(world, "p1")?.kind).toBe("PRESS");
    expect(word(world, "p2")).toBeNull();
  });

  it("asks the navigator to move the shield when it is away", () => {
    const { world, u } = opened();
    world.shieldCol = elsewhere(world);
    u.lobes.push(lobe(world, world.cannonCol, { answer: "shield" }));
    expect(word(world, "p2")).toBe("MOVE");
    expect(cue(world, "p2")?.kind).toBe("CARRY");
    expect(word(world, "p1")).toBeNull();
  });
});

describe("a tall lobe", () => {
  it("asks both seats to tap it, whatever its colour and wherever they stand", () => {
    for (const answer of ["maw", "shield"] as const) {
      const { world, u } = opened();
      u.lobes.push(lobe(world, elsewhere(world), { stage: "tall", answer }));
      expect(word(world, "p1")).toBe("TAP");
      expect(word(world, "p2")).toBe("TAP");
      expect(cue(world, "p2")?.kind).toBe("PRESS");
    }
  });

  it("comes before a standing lobe, because it is the one about to burst", () => {
    const { world, u } = opened();
    u.lobes.push(lobe(world, world.cannonCol));
    u.lobes.push(lobe(world, elsewhere(world), { stage: "tall" }));
    expect(word(world, "p1")).toBe("TAP");
  });
});

describe("nothing to say", () => {
  it("is quiet over a plate still bowing", () => {
    const { world, u } = opened();
    u.lobes.push(lobe(world, world.cannonCol, { stage: "bowing" }));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("is quiet while the level's ebb draws the lobes back", () => {
    const { world, u } = opened();
    u.ebbBeat = world.beat;
    u.lobes.push(lobe(world, world.cannonCol, { stage: "tall" }));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});
