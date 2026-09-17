import { describe, expect, it } from "bun:test";
import { bossAnswerCol } from "../src/boss-answer.js";
import { DEFAULT_CONFIG, midCol, type SimConfig, ticksPerBeat } from "../src/config.js";
import { diastoleChamberCol } from "../src/diastole.js";
import { diastoleBoss } from "../src/diastole-step.js";
import { step } from "../src/step.js";
import { undertowBoss } from "../src/undertow.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **Where the cannon has to stand**, asked of the boss rather than authored —
 * the one answer a rehearsal's strip marked `atBoss` is aimed by
 * (`scene-aim.ts`). Each boss with a line in `boss-answer.ts` is asked here at
 * the phase that changes its answer, and a boss with no line answers nothing.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function open(boss: Parameters<typeof startWave>[4], seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, 9, [], [], boss);
  return world;
}

function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

describe("the column a boss is answered from", () => {
  it("is nothing with no boss, and nothing for a boss whose column an author can write", () => {
    expect(bossAnswerCol(open(null))).toBeNull();
    expect(bossAnswerCol(open({ kind: "baton" }))).toBeNull();
  });

  it("is THE DIASTOLE's left chamber while it beats alone, then the bridge", () => {
    const world = open({ kind: "diastole" });
    expect(bossAnswerCol(world)).toBe(diastoleChamberCol(CFG, -1));
    const b = diastoleBoss(world);
    if (b === null) throw new Error("no twin lobe");
    // The right wakes off the left's second hit; the phase turns on the beat.
    b.leftHits = 1;
    beats(world, 1);
    expect(b.phase).toBe("two");
    expect(bossAnswerCol(world)).toBe(midCol(CFG));
    b.leftHits = 0;
    b.rightHits = 0;
    beats(world, 1);
    expect(b.phase).toBe("burst");
    expect(bossAnswerCol(world)).toBeNull();
  });

  it("is THE UNDERTOW's first breach, whichever column the rng chose", () => {
    const world = open({ kind: "undertow" });
    expect(bossAnswerCol(world)).toBeNull();
    for (let i = 0; i < 40 * TPB && bossAnswerCol(world) === null; i++) step(world, []);
    const u = undertowBoss(world);
    if (u === null) throw new Error("no floor");
    expect(u.breaches).toHaveLength(1);
    expect(bossAnswerCol(world)).toBe(u.breaches[0]?.col ?? -1);
    // And none under the cannon's own seat: the answer there is to leave.
    u.phase = "seat";
    expect(bossAnswerCol(world)).toBeNull();
  });
});
