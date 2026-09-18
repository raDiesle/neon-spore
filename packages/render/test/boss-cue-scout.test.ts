import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type ScoutState,
  scoutHome,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { scoutAt } from "../src/scout-draw.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SCOUT, and the one word the field may say about it**
 * (`render/src/boss-cue-read-h.ts`).
 *
 * The seats are SNAKE's the other way round — the one who can see holds a
 * thumb and the one who can fly is blind — so the load-bearing case is the
 * last: the pilot is told nothing, wherever the ship is and whatever it is
 * carrying. Every word the field could write over his crank is a direction,
 * and the direction is hers to say (`decisions.md` #34, *never the answer*).
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; s: ScoutState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("scout");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const s = world.boss;
  if (s === null || s.kind !== "scout") throw new Error("the scout's wave installed no scout");
  // Straight into the flight: the lead is two screens being read.
  s.phase = "play";
  s.mawTick = -1;
  return { world, s };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/** The little ship standing on the mother ship's mouth. */
function home(world: World, s: ScoutState): void {
  const at = scoutHome(world.cfg.cols, world.cfg.rows);
  s.colMilli = at.colMilli;
  s.rowMilli = at.rowMilli;
}

describe("THE SCOUT", () => {
  it("says nothing while the little ship is out in the dark", () => {
    const { world, s } = opened();
    s.colMilli = 1000;
    s.rowMilli = 1000;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("asks the navigator to OPEN once the ship is standing on the mouth", () => {
    const { world, s } = opened();
    home(world, s);
    const c = cue(world, "p2");
    expect(c?.word).toBe("OPEN");
    expect(c?.kind).toBe("PRESS");
    expect(c?.seat).toBe(2);
    // On the mouth, in the column it is drawn in.
    const at = scoutAt(LAYOUT.p2, scoutHome(world.cfg.cols, world.cfg.rows));
    expect(c?.x).toBeCloseTo(at.x, 6);
    // Above the mouth, and clear of the ring: the verb hangs under the frame,
    // and the home ring is the widest thing in the round to be drawn over.
    if (c === null) throw new Error("the navigator was owed a word and got none");
    const ring = (world.cfg.scoutHomeRadiusMilli * LAYOUT.p2.tile) / 1000;
    expect(at.y - (c.y + c.halfH)).toBeGreaterThan(ring);
  });

  // The pilot cannot see one mote or one hazard, so the only word the field
  // could put on a crank is which way to turn it — the answer, and hers.
  it("tells the pilot nothing, at home or away, carrying or empty", () => {
    const { world, s } = opened();
    home(world, s);
    expect(cue(world, "p1")).toBeNull();
    s.carrying = [0];
    expect(cue(world, "p1")).toBeNull();
    s.colMilli = 2000;
    expect(cue(world, "p1")).toBeNull();
  });

  it("goes while the mouth stands open, and comes back when it shuts", () => {
    const { world, s } = opened();
    home(world, s);
    s.mawTick = world.tick;
    expect(cue(world, "p2")).toBeNull();
    s.mawTick = world.tick - world.cfg.scoutMawTicks;
    expect(cue(world, "p2")?.word).toBe("OPEN");
  });

  // A press that banks nothing costs nothing, and a cue that came out only
  // for a loaded ship would report the pilot's half of the picture to her.
  it("asks for the press whether or not anything is aboard", () => {
    const { world, s } = opened();
    home(world, s);
    s.carrying = [];
    expect(cue(world, "p2")?.word).toBe("OPEN");
    s.carrying = [0];
    expect(cue(world, "p2")?.word).toBe("OPEN");
  });

  it("says nothing once the round is over, on either screen", () => {
    const { world, s } = opened();
    home(world, s);
    s.phase = "verdict";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });
});
