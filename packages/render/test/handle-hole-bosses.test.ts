import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SnakeState,
  startWave,
  type ThroatState,
  type VaneState,
  vanePhase,
  type World,
} from "@neon-spore/sim";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, waveWith } from "./frame-harness.js";
import { added } from "./handle-hole-count.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Three more bosses under the rule `handle-hole.test.ts` holds**: SNAKE, THE
 * THROAT and THE VANE. THE TASTER's are counted in `taster-grip-frame.test.ts`
 * instead, because that stage fills discs of its own and every count there has
 * to be netted against them.
 *
 * A ring fills a flat disc in `PALETTE.background` before anything else so it
 * reads over whatever the fight has drawn behind it, and until 22 September
 * 2026 it did so for both seats — so the seat that may *not* press one was
 * sold the same hole under a 0.18-alpha wash it cannot see. On these three it
 * came out as a piece missing from the boss itself: a bite out of the snake, a
 * gap in the gullet, a bore through the mechanism.
 *
 * **Counted as a difference from a state with no ring in it**, not against
 * nought: each of these stages is free to fill a disc of its own, so a count
 * that starts at nought is a claim about the whole stage rather than about a
 * handle. A difference says only what the ring did. The counting itself is
 * `handle-hole-count.ts`, shared with `handle-hole-rulings.test.ts`.
 */

beforeAll(installCanvasGlobals);

function snake(tiles: number): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("snake");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = world.boss as SnakeState | null;
  if (s === null || s.kind !== "snake") throw new Error("SNAKE's wave installed no round");
  s.phase = "play";
  s.dirCol = 0;
  s.dirRow = -1;
  s.body = Array.from({ length: tiles }, (_, i) => ({ col: 4, row: 3 + i }));
  s.stepTick = world.tick;
  s.mawTick = world.tick - CFG.snakeMawRestTicks;
  return world;
}

function throat(set: (b: ThroatState) => void): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("throat");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss as ThroatState | null;
  if (b === null || b.kind !== "throat") throw new Error("THE THROAT's wave grew no gullet");
  b.phase = "sucks";
  b.slack = 0;
  set(b);
  return world;
}

function pinsFor(name: string): number {
  for (let pins = 0; pins <= 12; pins++) if (vanePhase(pins).name === name) return pins;
  throw new Error(`no pin count leaves the bearing in ${name}`);
}

function vane(phase: string, pinned = false): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss as VaneState | null;
  if (b === null || b.kind !== "vane") throw new Error("THE VANE's wave installed no vane");
  b.pins = pinsFor(phase);
  b.pinBeat = pinned ? world.beat : -1;
  return world;
}

describe("SNAKE, which has no ring on its body", () => {
  it("punches nothing on any screen, however long the body grows", () => {
    // The pilot's ring on the neck went on 10 October 2026, the owner. A long
    // body is the one that used to grow it, so it is the one that must not.
    const { p1, p2, test } = added(snake(6), snake(16));
    expect(p1).toBe(0);
    expect(p2).toBe(0);
    expect(test).toBe(0);
  });
});

describe("THE THROAT's two rings, on the mouth and beside the root", () => {
  it("punches one for the seat that may press it, and none for the other", () => {
    // Both are on offer for the whole of `sucks` and neither once the tube
    // everts: hers on the mouth, his on the pump. A hole in hers is a bite out
    // of the lip and the body standing in it.
    const { p1, p2, test } = added(
      throat((b) => {
        b.phase = "everts";
      }),
      throat(() => {}),
    );
    expect(p1).toBe(1);
    expect(p2).toBe(1);
    expect(test).toBe(2);
  });
});

describe("THE VANE's two rings, on the mechanism", () => {
  it("punches the arm's disc on his screen and not on hers", () => {
    const { p1, p2, test } = added(vane("SWING"), vane("VEER"));
    expect(p1).toBe(1);
    expect(p2).toBe(0);
    expect(test).toBe(1);
  });

  it("punches the housing's on hers once the pin is standing", () => {
    const { p1, p2, test } = added(vane("SWING"), vane("SEIZE", true));
    expect(p1).toBe(1);
    expect(p2).toBe(1);
    expect(test).toBe(2);
  });
});
