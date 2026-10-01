import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, type SimEvent, startWave, step, type World } from "@neon-spore/sim";
import { computeLayout, tileCX } from "../src/layout.js";
import { RoundHit } from "../src/round-hit.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A whole-picture round's own hit, drawn by the round** (`round-hit.ts`):
 * the round's frame returns before the field ingests anything, so the rock a
 * run-out window brings down was never drawn — the scar and its crack popped
 * in with nothing falling. Here the rock falls, the crack waits for it, the
 * sparks fly when it lands, and THE PULSE's own frame shows it.
 */

beforeAll(installCanvasGlobals);

const l = computeLayout(VIEWPORT, CFG, "p1");
const COL = 5;
const BEAT = 40;

const struck = (round?: "pulse"): SimEvent => ({
  type: "breach",
  col: COL,
  weight: "heavy",
  span: 1,
  kind: "meteorFastest",
  fromRow: 0,
  seed: 0,
  holes: 0,
  color: null,
  beat: BEAT,
  ...(round === undefined ? {} : { round }),
});

/** Advance and draw `hit` for `seconds`, in sixtieths: the rock lands in its draw. */
function run(hit: RoundHit, seconds: number): void {
  const { ctx } = stubCanvas();
  for (let t = 0; t < seconds * 60; t++) {
    hit.update(1 / 60, l);
    hit.draw(ctx as unknown as CanvasRenderingContext2D, l, t / 60, () => l.hullY);
  }
}

describe("a round's own hit", () => {
  it("holds the crack and the crater back until the rock is down", () => {
    const hit = new RoundHit();
    hit.ingest([struck("pulse")], l, 0, CFG);
    run(hit, 0.2);
    expect(hit.crackShown()(COL, BEAT)).toBe(false);
    expect(hit.craterShown(l)(tileCX(l, COL))).toBe(false);
    run(hit, 2.5);
    expect(hit.crackShown()(COL, BEAT)).toBe(true);
    expect(hit.craterShown(l)(tileCX(l, COL))).toBe(true);
  });

  it("never holds back a crack from before the round", () => {
    const hit = new RoundHit();
    hit.ingest([struck("pulse")], l, 0, CFG);
    expect(hit.crackShown()(COL, BEAT - 3)).toBe(true);
    expect(hit.crackShown()(COL + 2, BEAT)).toBe(true);
  });

  it("takes no breach that is not a round's", () => {
    const hit = new RoundHit();
    hit.ingest([struck()], l, 0, CFG);
    expect(hit.pending.has(COL, BEAT)).toBe(false);
  });

  it("forgets everything on clear", () => {
    const hit = new RoundHit();
    hit.ingest([struck("pulse")], l, 0, CFG);
    run(hit, 2.5);
    hit.clear();
    expect(hit.pending.has(COL, BEAT)).toBe(false);
    expect(hit.arrivals.has(COL, BEAT)).toBe(false);
  });
});

/** A spark is the one 3×3 square anything draws (`sparks.ts`). */
const sparks = (log: string[]) => log.filter((c) => /^fillRect\(.*, 3, 3\)$/.test(c)).length;

/** THE PULSE played to its window: `drain` empties the meter the first tick of play. */
function pulseSparks(drain: boolean): number {
  const world = createWorld(CFG, 5);
  const index = waveWith("pulse");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const log: string[] = [];
  let drained = false;
  let struckAt = -1;
  runFrames(world, "p1", 60 * 14, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w: World) => {
      const p = w.boss?.kind === "pulse" ? w.boss : null;
      if (drain && !drained && p?.phase === "play") {
        p.meter = 0;
        drained = true;
      }
      step(w, []);
      if (w.events.some((e) => e.type === "breach" && e.round === "pulse")) struckAt = tick;
    },
  });
  if (drain) expect(struckAt).toBeGreaterThan(0);
  return sparks(log);
}

describe("THE PULSE's run-out window", () => {
  it("lands its rock on the round's own picture", () => {
    expect(pulseSparks(true)).toBeGreaterThan(pulseSparks(false));
  });
});
