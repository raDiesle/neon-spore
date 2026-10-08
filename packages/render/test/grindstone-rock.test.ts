import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GrindstoneState,
  grindstoneBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { grindstonePadPlaced } from "../src/grindstone-caliper.js";
import { grindstoneStanding } from "../src/grindstone-grip.js";
import { GRINDSTONE_ROCK, grindstoneRock } from "../src/grindstone-rock.js";
import { computeLayout } from "../src/layout.js";
import { NO_SPAN } from "../src/slow-hush.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GRINDSTONE's caliper (`grindstone-rock.ts`): a slack caliper rocks on
 * the axle so its jaw tips travel more than half a tile each way, never past
 * the cap; a bitten one is still; THE SLOW hushes it; and the jaw a thumb is
 * taken at goes with the drawing.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);
const at = (q: number) => ({ beat: Math.floor(q / 4), phase: (q % 4) / 4 });

function stood(): { world: World; s: GrindstoneState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("grindstone");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * (CFG.grindstoneStillBeats + 1); i++) step(world, []);
  const s = grindstoneBoss(world);
  if (s === null) throw new Error("the grindstone wave stood no wheel");
  s.phase = "rest";
  s.padsDown = [0, 0];
  s.locked = false;
  return { world, s };
}

/** How far jaw `side`'s tip pad stands from where it would unrocked, in tiles, signed by the turn. */
function tipTravel(shut: number, q: number): number {
  const { beat, phase } = at(q);
  const rock = grindstoneRock(NO_SPAN, CFG, shut, beat, phase);
  const a = grindstonePadPlaced(L, 0, 0, shut, 0);
  const b = grindstonePadPlaced(L, 0, 0, shut, rock);
  return (Math.sign(rock) * Math.hypot(b.x - a.x, b.y - a.y)) / L.tile;
}

describe("THE GRINDSTONE's caliper rocks on its axle", () => {
  it("moves a slack jaw's tip by more than half a tile each way, and never past its cap", () => {
    const travel = QUARTERS.map((q) => tipTravel(0, q));
    expect(Math.max(...travel)).toBeGreaterThan(0.5);
    expect(Math.min(...travel)).toBeLessThan(-0.5);
    const rocks = QUARTERS.map((q) =>
      Math.abs(grindstoneRock(NO_SPAN, CFG, 0, at(q).beat, at(q).phase)),
    );
    expect(Math.max(...rocks)).toBeLessThanOrEqual(GRINDSTONE_ROCK);
  });

  it("dies with the gap: half shut rocks half as far, and bitten home it is still", () => {
    for (const q of QUARTERS.slice(0, 80)) {
      const { beat, phase } = at(q);
      const open = grindstoneRock(NO_SPAN, CFG, 0, beat, phase);
      expect(grindstoneRock(NO_SPAN, CFG, 0.5, beat, phase)).toBeCloseTo(open / 2, 9);
      expect(grindstoneRock(NO_SPAN, CFG, 1, beat, phase)).toBe(0);
    }
  });

  it("hushes inside THE SLOW", () => {
    const slow = { slowFromBeat: 0, slowToBeat: 1000 };
    for (const q of QUARTERS.slice(40, 120)) {
      const { beat, phase } = at(q);
      const open = grindstoneRock(NO_SPAN, CFG, 0, beat, phase);
      expect(Math.abs(grindstoneRock(slow, CFG, 0, beat, phase))).toBeLessThanOrEqual(
        Math.abs(open) * 0.1 + 1e-9,
      );
    }
  });

  it("takes a thumb on the jaw where the rock has carried it", () => {
    const { world, s } = stood();
    const when = QUARTERS.map((q) => ({ beat: world.beat + at(q).beat, phase: at(q).phase }));
    const rockAt = (w: { beat: number; phase: number }) =>
      grindstoneRock(world, CFG, 0, w.beat, w.phase);
    const jawMid = (rock: number) => {
      const a = grindstonePadPlaced(L, 0, 0, 0, rock);
      const b = grindstonePadPlaced(L, 0, 1, 0, rock);
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };
    const ranked = [...when].sort((p, q) => rockAt(p) - rockAt(q));
    const lo = ranked[0];
    const hi = ranked[ranked.length - 1];
    if (lo === undefined || hi === undefined) throw new Error("no quarters");
    const taken = (w: { beat: number; phase: number }) =>
      grindstoneStanding(L, CFG, s, "grindJawLeft", w.beat, w.phase, world);
    const drawn = {
      x: jawMid(rockAt(hi)).x - jawMid(rockAt(lo)).x,
      y: jawMid(rockAt(hi)).y - jawMid(rockAt(lo)).y,
    };
    const took = { x: taken(hi).x - taken(lo).x, y: taken(hi).y - taken(lo).y };
    expect(Math.hypot(drawn.x, drawn.y)).toBeGreaterThan(L.tile * 0.5);
    expect(took.x).toBeCloseTo(drawn.x, 6);
    expect(took.y).toBeCloseTo(drawn.y, 6);
  });
});
