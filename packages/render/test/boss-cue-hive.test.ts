import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HiveState,
  hiveOpen,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { hiveSite } from "../src/hive-shape.js";
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
 * **THE HIVE's two words** (`render/src/boss-cue-read-v.ts`), and the reason
 * it gets both when THE WELL, drawn on the same clock face, gets neither: an
 * open breach stands in the same column on both screens, only its colour
 * split between them (`hive-shape.ts`, `hive-draw.ts`) — so *where* is never
 * the secret here, only *which colour* and *which one is next*.
 *
 * `CARRY` / `MOVE` is his, on the cannon where it stands, until the cannon
 * reaches the open breach's own column; then it is `PRESS` / `FIRE`, hers, on
 * the breach itself. Neither ever names the colour or the column out loud —
 * the mark's own place on the glass is the only thing it says, and that place
 * is one both seats already read off their own screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function installed(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("hive");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function boss(world: World): HiveState {
  const b = world.boss;
  if (b === null || b.kind !== "hive") throw new Error("the wave installed no hive");
  return b;
}

/** Stepped until at least one breach is open, or the case is a lie. */
function untilOpen(world: World, beats = 40): World {
  for (let i = 0; i < beats * TPB; i++) {
    const s = boss(world);
    for (let j = 0; j < s.opened; j++) if (hiveOpen(s, j)) return world;
    step(world, []);
  }
  throw new Error("no breach ever opened");
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

describe("THE HIVE", () => {
  it("says nothing before any breach has opened", () => {
    const world = installed();
    const s = boss(world);
    expect(s.opened).toBe(0);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("asks the pilot to carry the cannon to an open breach", () => {
    const world = untilOpen(installed());
    const s = boss(world);
    let target = -1;
    for (let i = 0; i < s.opened; i++) {
      if (hiveOpen(s, i)) {
        target = i;
        break;
      }
    }
    world.cannonCol = (s.cols[target] ?? 0) === 0 ? 1 : 0;

    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    expect(his?.seat).toBe(1);
    // On his own strip, at the hull — never at the breach he has not reached.
    expect(his?.x).toBe(tileCX(LAYOUT.p1, world.cannonCol));
    expect(his?.y).toBe(LAYOUT.p1.hullY);
  });

  it("switches to the navigator's press once the cannon is under the breach", () => {
    const world = untilOpen(installed());
    const s = boss(world);
    let target = -1;
    for (let i = 0; i < s.opened; i++) {
      if (hiveOpen(s, i)) {
        target = i;
        break;
      }
    }
    const col = s.cols[target] ?? 0;
    world.cannonCol = col;

    expect(word(world, "p1")).toBeNull();
    const hers = cue(world, "p2");
    expect(hers?.word).toBe("FIRE");
    expect(hers?.kind).toBe("PRESS");
    expect(hers?.seat).toBe(2);
    const c = hiveSite(LAYOUT.p2, s, target);
    expect(hers?.x).toBe(c.x);
    expect(hers?.y).toBe(c.y);
  });

  it("never says a colour or a column, whichever way the seed rolled it", () => {
    const world = untilOpen(installed());
    for (const w of [word(world, "p1") ?? "", word(world, "p2") ?? ""]) {
      expect(w).not.toContain("RED");
      expect(w).not.toContain("CYAN");
      for (let col = 0; col < CFG.cols; col++) expect(w).not.toBe(String(col));
    }
  });
});
