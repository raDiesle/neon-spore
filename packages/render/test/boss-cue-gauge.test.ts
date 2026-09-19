import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GaugeState,
  gaugeSeated,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { gaugeBandMid, gaugeNeedleTip } from "../src/gauge.js";
import { gaugeDial } from "../src/gauge-round.js";
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
 * **THE GAUGE, and the three words the field may say about it**
 * (`render/src/boss-cue-read-w.ts`).
 *
 * The round is the sharpest knowledge split in the game — she has the marks
 * and he has the valve — so most of this file is about what is *not* said.
 * While the valve answers, the pilot gets nothing on any beat in any state: a
 * lane that made the round clearer by writing a direction over his valve
 * would fail that case, and it would be handing him the sentence she exists
 * to say (`docs/decisions.md` #34). The one word he does get is about his own
 * half having stopped working, which she cannot see and he cannot act on
 * until the field says so.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; g: GaugeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const g = world.boss;
  if (g === null || g.kind !== "gauge") throw new Error("the gauge's wave installed no gauge");
  return { world, g };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/** The needle on the band, and the call armed: the one moment there is a word. */
function seat(world: World, g: GaugeState): void {
  g.phase = "play";
  g.needleMilli = g.markMilli;
  g.calledBeat = world.beat - world.cfg.gaugeCallRestBeats;
  if (!gaugeSeated(world, g)) throw new Error("the needle on the mark is not seated");
}

describe("THE GAUGE", () => {
  it("asks her to CALL, on the end of the needle, when it is standing between the marks", () => {
    const { world, g } = opened();
    seat(world, g);
    const c = cue(world, "p2");
    expect(c?.word).toBe("CALL");
    expect(c?.kind).toBe("PRESS");
    expect(c?.seat).toBe(2);
    const tip = gaugeNeedleTip(gaugeDial(LAYOUT.p2), g);
    expect(c?.x).toBeCloseTo(tip.x, 6);
    expect(c?.y).toBeCloseTo(tip.y, 6);
  });

  it("says nothing to the pilot while the valve answers, on any beat of any phase", () => {
    const { world, g } = opened();
    expect(g.jamBeat).toBe(-1);
    for (const phase of ["lead", "play", "verdict", "spent"] as const) {
      g.phase = phase;
      for (const needle of [0, g.markMilli, 100_000]) {
        g.needleMilli = needle;
        for (const valve of [-1, 0, 1]) {
          g.valve = valve;
          expect(cue(world, "p1"), `${phase} ${needle} ${valve}`).toBeNull();
        }
      }
    }
  });

  it("is silent off the band: the needle's place is her read and never the field's", () => {
    const { world, g } = opened();
    seat(world, g);
    expect(cue(world, "p2")?.word).toBe("CALL");
    g.needleMilli = 0;
    expect(gaugeSeated(world, g)).toBe(false);
    expect(cue(world, "p2")).toBeNull();
  });

  it("goes out while the call is resting, and comes back when it is armed", () => {
    const { world, g } = opened();
    seat(world, g);
    g.calledBeat = world.beat;
    expect(cue(world, "p2")).toBeNull();
    g.calledBeat = world.beat - world.cfg.gaugeCallRestBeats;
    expect(cue(world, "p2")?.word).toBe("CALL");
  });

  it("says nothing outside the play", () => {
    const { world, g } = opened();
    seat(world, g);
    for (const phase of ["lead", "verdict", "spent"] as const) {
      g.phase = phase;
      expect(cue(world, "p2"), phase).toBeNull();
    }
  });

  it("gives him TURN over the needle once the valve has jammed, and takes it back under his hand", () => {
    const { world, g } = opened();
    g.phase = "play";
    g.jamBeat = world.beat;
    const c = cue(world, "p1");
    expect(c?.word).toBe("TURN");
    expect(c?.kind).toBe("TURN");
    expect(c?.seat).toBe(1);
    const tip = gaugeNeedleTip(gaugeDial(LAYOUT.p1), g);
    expect(c?.x).toBeCloseTo(tip.x, 6);
    // And gone while he is swinging it: a word over a needle already under a
    // thumb is the field narrating him.
    g.handOn = true;
    expect(cue(world, "p1")).toBeNull();
  });

  it("asks her to OPEN the band, on its middle, while it is wound and her thumb is off", () => {
    const { world, g } = opened();
    g.phase = "play";
    g.boundBeat = world.beat;
    g.needleMilli = 0;
    const c = cue(world, "p2");
    expect(c?.word).toBe("OPEN");
    expect(c?.kind).toBe("HOLD");
    const mid = gaugeBandMid(gaugeDial(LAYOUT.p2), g);
    expect(c?.x).toBeCloseTo(mid.x, 6);
    expect(c?.y).toBeCloseTo(mid.y, 6);
    // Her thumb is the answer to it, so it goes the moment she gives it.
    g.openThumb = true;
    expect(cue(world, "p2")?.word).not.toBe("OPEN");
  });

  it("puts the call above the band: a needle seated in the tight window is a mark she can take", () => {
    const { world, g } = opened();
    seat(world, g);
    g.boundBeat = world.beat;
    expect(gaugeSeated(world, g)).toBe(true);
    expect(cue(world, "p2")?.word).toBe("CALL");
  });

  it("holds the call while it would be refused: under her own thumb, and under a settling needle", () => {
    const { world, g } = opened();
    seat(world, g);
    g.boundBeat = world.beat;
    g.openThumb = true;
    expect(cue(world, "p2")?.word).not.toBe("CALL");
    g.openThumb = false;
    g.boundBeat = -1;
    expect(cue(world, "p2")?.word).toBe("CALL");
    // The settle a hand-swung needle costs, from the beat it was lifted.
    g.liftBeat = world.beat;
    expect(cue(world, "p2")).toBeNull();
    g.liftBeat = world.beat - world.cfg.gaugeSettleBeats;
    expect(cue(world, "p2")?.word).toBe("CALL");
  });

  it("reaches the play by being played, and the round has a word in it", () => {
    const { world, g } = opened();
    let guard = 0;
    while (g.phase === "lead" && guard++ < 60 * TPB) step(world, []);
    expect(g.phase).toBe("play");
    seat(world, g);
    expect(cue(world, "p2")?.word).toBe("CALL");
  });
});
