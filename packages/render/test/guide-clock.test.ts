import { beforeAll, describe, expect, it } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, type World } from "@neon-spore/sim";
import { GuideStage } from "../src/guide-scene.js";
import { installCanvasGlobals } from "./canvas-stub.js";

/**
 * A REHEARSAL'S CLOCK, WHICH IS THE FRAME CLOCK AND NOT THE WORLD'S.
 *
 * A page of film is a run of the simulation, drawn off `dt` — one tick per
 * `dt * tickHz` — and it plays **once**, then stands on its last frame until a
 * thumb presses REPLAY. Both halves are load-bearing for a camera and neither
 * is visible to one: `tools/frames --opening guide` settled sixty frames before
 * its first photograph, which is a whole second of film, and then took four
 * pictures of whatever the page had ended on. The strip that came back was the
 * moment a film is *about* being the one moment nobody could send the owner.
 *
 * So this holds the two things the tool now asks the page: that the clock moves
 * with the `dt` it is given, and that `replay` takes a page that has played out
 * back to a running one.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
/** One painted frame worth exactly one tick of film — what a capture paints. */
const TICK = 1 / CFG.tickHz;
const SCENED = WAVES.map((w, i) => (w.guide?.scene ? i : -1)).filter((i) => i >= 0);

beforeAll(installCanvasGlobals);

function guided(waveIndex: number): World {
  const world = createWorld(CFG, 3);
  startWave(world, waveIndex, [], [], null, true, waveGuideSteps(waveIndex));
  return world;
}

/** Paints `n` frames of `dt` each and answers how many it took to play out. */
function play(stage: GuideStage, world: World, n: number, dt = TICK): number {
  for (let i = 0; i < n; i++) {
    stage.update(world, dt, "p1");
    if (stage.finished) return i + 1;
  }
  return n;
}

describe("a rehearsal's clock", () => {
  it("has a wave with a film in it to ask about", () => {
    expect(SCENED.length).toBeGreaterThan(0);
  });

  it("plays out, and says so", () => {
    const wave = SCENED[0] ?? 0;
    const stage = new GuideStage();
    const world = guided(wave);
    stage.update(world, TICK, "p1");
    expect(stage.finished, "a page is not over on its first frame").toBe(false);
    // Generous: the point is that it ends at all, not where.
    play(stage, world, 4000);
    expect(stage.finished, "a page never reached its last frame").toBe(true);
  });

  it("moves with the time it is given, so a caller can say how far", () => {
    const wave = SCENED[0] ?? 0;
    const fine = new GuideStage();
    const coarse = new GuideStage();
    const oneTick = play(fine, guided(wave), 4000, TICK);
    const eight = play(coarse, guided(wave), 4000, 8 * TICK);
    // Eight ticks a frame reaches the end in fewer frames than one a frame.
    // Not exactly an eighth: `MAX_CATCH_UP` caps a single frame's catch-up,
    // which is the point of painting a tick at a time rather than a second.
    expect(eight).toBeLessThan(oneTick);
    expect(eight).toBeGreaterThan(0);
  });

  it("holds on its last frame, and nothing on the clock moves it", () => {
    const wave = SCENED[0] ?? 0;
    const stage = new GuideStage();
    const world = guided(wave);
    play(stage, world, 4000);
    expect(stage.finished).toBe(true);
    // This is the failure the capture walked into: more frames, same picture.
    play(stage, world, 600);
    expect(stage.finished).toBe(true);
  });

  it("is running again after REPLAY, which is the only way back", () => {
    const wave = SCENED[0] ?? 0;
    const stage = new GuideStage();
    const world = guided(wave);
    play(stage, world, 4000);
    expect(stage.finished).toBe(true);
    stage.replay();
    expect(stage.finished, "REPLAY left the page standing on its last frame").toBe(false);
    // And it is a whole page again, not a few ticks of one.
    expect(play(stage, world, 4000)).toBeGreaterThan(1);
  });
});
