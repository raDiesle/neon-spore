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
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **PINBALL, and why the field says nothing about it**
 * (`render/src/boss-cue-read-h.ts`).
 *
 * The cases are all **silence**: nothing in `aim`, nothing in `power`, nothing
 * through a flight, nothing in a verdict. The pilot's MOVE went on 1 October
 * 2026, when the owner asked for the cannon itself to say *bring it home* by
 * turning into a funnel while the ball is up (`pinball-mouth.ts`).
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

  // The owner, 1 October 2026: *the "move" helper is stupid*. The cannon
  // turns into a funnel for the flight instead (`pinball-mouth.ts`), and the
  // word it used to carry is gone on every side of it.
  it("says nothing in flight, on either seat, wherever the ball is coming down", () => {
    const { world, b } = opened();
    for (const away of [-2, 0, 3, 4]) {
      flying(world, b, away);
      expect(cue(world, "p1")).toBeNull();
      expect(cue(world, "p2")).toBeNull();
    }
  });

  it("says nothing once the round is over, on either screen", () => {
    const { world, b } = opened();
    flying(world, b, 4);
    b.phase = "verdict";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });
});
