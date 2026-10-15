import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { holdDropR } from "../src/cue-helper.js";
import { computeLayout } from "../src/layout.js";
import { queenMarkCenter } from "../src/queen-figure.js";
import { queenRingReach } from "../src/queen-grip.js";
import { queenTurn } from "../src/queen-surface.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE QUEEN's SCREAM drop keeps out of her marks' rings.** Until a thumb
 * lands the `HOLD` cue's drop waits in the gap between her two marks
 * (`boss-cue-read.ts`), and at the cue frame's size it reached over the
 * inner edge of both rings on a 390-wide phone — the rings round the marks
 * player 1 reads to say what is coming. Asked on the narrow phone, at every
 * turn of her shell across a run of beats.
 */

beforeAll(installCanvasGlobals);

const PHONE = computeLayout({ width: 390, height: 844, dpr: 3 }, CFG, "p1");

function screaming(): { world: World; her: Creature } {
  const world = createWorld(CFG, 5);
  const index = waveWith("queen");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG); i++) step(world, []);
  world.creatures = world.creatures.filter((c) => c.kind !== "torch");
  const her = world.creatures.find((c) => c.kind === "queen");
  const q = world.boss;
  if (her === undefined || q === null || q.kind !== "queen")
    throw new Error("no queen on the field");
  q.phase = 2;
  q.holdSide = 0;
  her.color = null;
  return { world, her };
}

describe("THE QUEEN's gap drop", () => {
  it("stands clear of both mark rings on a 390-wide phone", () => {
    const { world, her } = screaming();
    const q = world.boss;
    if (q === null || q.kind !== "queen") throw new Error("no queen");
    const start = world.beat;
    let asked = 0;
    for (let beat = start; beat < start + 48; beat++) {
      world.beat = beat;
      q.openBeat = beat + 1;
      const cue = bossCue(PHONE, world, 0, () => PHONE.hullY);
      expect(cue?.kind).toBe("HOLD");
      if (cue === null || cue.ownDrop === true) continue;
      const r = holdDropR(cue);
      expect(r).toBeGreaterThan(0);
      const turn = queenTurn(world.cfg, beat, 0);
      for (const side of [-1, 1] as const) {
        const mark = queenMarkCenter(PHONE, her, side, turn);
        const apart = Math.hypot(mark.x - cue.x, mark.y - cue.y);
        expect(apart - queenRingReach(mark)).toBeGreaterThanOrEqual(r);
      }
      asked++;
    }
    expect(asked).toBeGreaterThan(0);
  });

  it("is smaller there than the frame's drop, which reached over them", () => {
    const { world } = screaming();
    const q = world.boss;
    if (q === null || q.kind !== "queen") throw new Error("no queen");
    q.openBeat = world.beat + 1;
    const cue = bossCue(PHONE, world, 0, () => PHONE.hullY);
    if (cue === null) throw new Error("no cue");
    expect(holdDropR(cue)).toBeLessThan(holdDropR({ halfW: cue.halfW, halfH: cue.halfH }));
  });
});
