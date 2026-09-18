import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PinballState,
  pinCannonMilli,
  pinHeightMilli,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { pinTable } from "../src/pinball-table.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **PINBALL, and the one word the field may say about it**
 * (`render/src/boss-cue-read-h.ts`).
 *
 * This round already writes a sentence at the top of the table, addressed, on
 * both screens, every tick (`pinball-round.ts`'s `waiting`), so the cases here
 * are mostly about **silence**: nothing in `aim`, nothing in `power`, nothing
 * to the navigator ever, and nothing to the pilot in the one flight state the
 * sentence and the cue would agree about — the cannon already under it.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; b: PinballState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const b = world.boss;
  if (b === null || b.kind !== "pinball") throw new Error("the pinball wave installed no table");
  // Straight into the round: the table coming up is a picture and says nothing.
  b.phase = "play";
  return { world, b };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/** A ball in the air, `cols` columns away from the cannon it was fired from. */
function flying(world: World, b: PinballState, away: number): void {
  b.shot = "flight";
  world.cannonCol = 2;
  b.ball.xMilli = pinCannonMilli(world.cfg, world.cannonCol + away);
  b.ball.yMilli = Math.floor(pinHeightMilli(world.cfg) / 2);
}

describe("PINBALL", () => {
  it("says nothing to either seat while the needle is sweeping", () => {
    const { world, b } = opened();
    expect(b.shot).toBe("aim");
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  // Her whole seat is one press, and the header names it in a sentence
  // addressed to her for every tick of the phase it is owed in. A box round
  // the bar would say nothing the round has not already said out loud, and it
  // could not say *when*, because when is the answer.
  it("says nothing on the bar, which is the navigator's whole seat", () => {
    const { world, b } = opened();
    b.shot = "power";
    b.powerMilli = 600;
    expect(cue(world, "p2")).toBeNull();
    expect(cue(world, "p1")).toBeNull();
  });

  it("asks the pilot to MOVE while the ball is coming down somewhere else", () => {
    const { world, b } = opened();
    flying(world, b, 4);
    const c = cue(world, "p1");
    expect(c?.word).toBe("MOVE");
    expect(c?.kind).toBe("CARRY");
    expect(c?.seat).toBe(1);
    // On the cannon — the thing his thumb moves — and not on the ball.
    const t = pinTable(LAYOUT.p1, world.cfg);
    const mouth = t.x + (pinCannonMilli(world.cfg, world.cannonCol) * t.tile) / 1000;
    expect(c?.x).toBeCloseTo(mouth, 6);
    // And never on her screen: she has nothing that reaches a ball in the air.
    expect(cue(world, "p2")).toBeNull();
  });

  it("goes the moment the cannon is under it, without waiting for the floor", () => {
    const { world, b } = opened();
    flying(world, b, 0);
    expect(cue(world, "p1")).toBeNull();
  });

  // The verb, never the answer: the mark stands where the cannon is, so it
  // cannot be read as a place to go, and it is the same word whichever side of
  // the cannon the ball is falling on.
  it("says the same word on either side, and never which way to go", () => {
    const { world, b } = opened();
    flying(world, b, -2);
    const left = cue(world, "p1");
    flying(world, b, 3);
    const right = cue(world, "p1");
    expect(left?.word).toBe("MOVE");
    expect(right?.word).toBe("MOVE");
    expect(left?.x).toBeCloseTo(right?.x ?? -1, 6);
  });

  it("keeps the word clear of the plating, so the verb can be read at all", () => {
    const { world, b } = opened();
    flying(world, b, 4);
    const c = cue(world, "p1");
    if (c === null) throw new Error("the pilot was owed a word and got none");
    const l = LAYOUT.p1;
    expect(c.y + c.halfH).toBeLessThan(l.hullY);
    expect(l.hullY - (c.y + c.halfH)).toBeGreaterThan(l.tile * 0.5);
  });

  it("says nothing once the round is over, on either screen", () => {
    const { world, b } = opened();
    flying(world, b, 4);
    b.phase = "verdict";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });
});
