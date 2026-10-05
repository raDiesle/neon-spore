import { describe, expect, it } from "bun:test";
import { antiphonBoss } from "../src/antiphon.js";
import { bossAnswerCol } from "../src/boss-answer.js";
import { DEFAULT_CONFIG, midCol, type SimConfig, ticksPerBeat } from "../src/config.js";
import { leadBoss, leadLead } from "../src/lead.js";
import { ledgerBoss } from "../src/ledger.js";
import { scuttleBoss, scuttleSocketCol } from "../src/scuttle.js";
import { step } from "../src/step.js";
import { tasterBoss } from "../src/taster.js";
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

  it("is THE UNDERTOW's first lobe, whichever column the rng chose", () => {
    const world = open({ kind: "undertow" });
    expect(bossAnswerCol(world)).toBeNull();
    for (let i = 0; i < 40 * TPB && bossAnswerCol(world) === null; i++) step(world, []);
    const u = undertowBoss(world);
    if (u === null) throw new Error("no floor");
    expect(u.lobes).toHaveLength(1);
    expect(bossAnswerCol(world)).toBe(u.lobes[0]?.col ?? -1);
  });

  it("is THE TASTER's first blade once its edge has set, and nothing while it grows or once the fan closes", () => {
    const world = open({ kind: "taster" });
    const t = tasterBoss(world);
    if (t === null) throw new Error("no fan");
    // The middle blade is out of the crest and growing: a shot at it is spent.
    expect(bossAnswerCol(world)).toBeNull();
    beats(world, CFG.tasterGrowBeats + 1);
    expect(t.blades[5]?.setBeat).toBeGreaterThanOrEqual(0);
    expect(bossAnswerCol(world)).toBe(t.col + 5);
    // Struck off, the answer is the next one the fan opened — over column 6,
    // which no authored column reaches, and the reason the line exists.
    const k = t.blades[5];
    if (k === undefined) throw new Error("no blade");
    k.shorn = true;
    t.shorn = 1;
    beats(world, CFG.tasterGrowBeats + 1);
    expect(bossAnswerCol(world)).toBe(t.col + 6);
    // Closed over the body: every column is the interlock, the beam the answer.
    t.shorn = t.blades.length - CFG.tasterClosedBlades;
    expect(bossAnswerCol(world)).toBeNull();
  });

  it("is THE LEDGER's socket wherever it has walked to, and nothing under the last return or once the cord is out", () => {
    const world = open({ kind: "ledger" });
    const g = ledgerBoss(world);
    if (g === null) throw new Error("no cord");
    // The plate's column, from the first beat: the socket is where the cord
    // roots and the first return lands there.
    expect(bossAnswerCol(world)).toBe(g.socket);
    g.socket = 6;
    expect(bossAnswerCol(world)).toBe(6);
    // The last return is the one to let land: no column is the answer.
    g.beads.push({ beat: world.beat + 2, span: 2, last: true, pulled: false });
    expect(bossAnswerCol(world)).toBeNull();
    g.beads = [];
    g.outBeat = world.beat;
    expect(bossAnswerCol(world)).toBeNull();
  });

  it("is where THE LEAD will be two beats on, and nothing while it stands dead still or passes", () => {
    const world = open({ kind: "lead" });
    const l = leadBoss(world);
    if (l === null) throw new Error("no body");
    // Installed in the middle facing right at a walk: two columns on, which
    // is the sum the pair says — the column, plus the lean, twice.
    expect(bossAnswerCol(world)).toBe(midCol(CFG) + 2);
    expect(bossAnswerCol(world)).toBe(leadLead(l, CFG));
    // At the run it is four, and a wall turns the sum round inside it.
    l.segments = CFG.leadFastSegments;
    expect(bossAnswerCol(world)).toBe(midCol(CFG) + 4);
    l.col = CFG.cols - 2;
    expect(bossAnswerCol(world)).toBe(CFG.cols - 3);
    // Stopped dead with the last segment: no shot touches it, the beam does.
    l.segments = 1;
    l.stillBeat = world.beat;
    expect(bossAnswerCol(world)).toBeNull();
    l.stillBeat = -1;
    l.passBeat = world.beat;
    expect(bossAnswerCol(world)).toBeNull();
  });

  it("is the column THE SCUTTLE's live part hangs over, through the wind-up, and nothing while it looks or once it is down", () => {
    const world = open({ kind: "scuttle" });
    const s = scuttleBoss(world);
    if (s === null) throw new Error("no frame");
    // Looking: nothing hangs, so nothing is answered.
    expect(bossAnswerCol(world)).toBeNull();
    beats(world, CFG.scuttleLookBeats);
    expect(s.live).toBeGreaterThanOrEqual(0);
    expect(bossAnswerCol(world)).toBe(scuttleSocketCol(CFG, s.live));
    // The wind-up keeps the last part's column; down, it answers nothing.
    s.windBeat = world.beat;
    expect(bossAnswerCol(world)).toBe(scuttleSocketCol(CFG, s.live));
    s.downBeat = world.beat;
    expect(bossAnswerCol(world)).toBeNull();
  });

  it("is nothing under THE ANTIPHON, whose answer is carried rather than shot", () => {
    const world = open({ kind: "antiphon" });
    expect(bossAnswerCol(world)).toBeNull();
    beats(world, CFG.antiphonRestBeats + CFG.antiphonGrowBeats);
    expect(antiphonBoss(world)?.organ).not.toBeNull();
    expect(bossAnswerCol(world)).toBeNull();
  });
});
