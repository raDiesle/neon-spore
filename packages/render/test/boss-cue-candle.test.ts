import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CandleState,
  candleBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { candleGlowY } from "../src/candle-glow.js";
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
 * **THE CANDLE, and the column nothing was saying**
 * (`render/src/boss-cue-read-m.ts`).
 *
 * Three cases were in `boss-cue.test.ts` until 19 September 2026, and between
 * them they said the fight was `FIRE` on the light and `MOVE` off the column
 * the flame is turned to. The first half is right and stands below. The
 * second was the field reading the pilot's own cone out onto her screen by
 * the back door, and in one arrangement it told him to leave the only column
 * a shot lands from: the glow drifts, a bolt leaves the cannon's own column
 * (`fire.ts`), and `candleStruck` takes a step off the flame only for a shot
 * out of the column the glow hangs over. Where the flame is turned at its own
 * column, the old word walked him off the fight.
 *
 * So `MOVE` is a function of the **glow's** column alone — the chase, which
 * is the pilot's whole job and was the guide's first line — and the faced
 * column stays the one sentence the pair must say out loud.
 *
 * The states are set rather than played into, as in `boss-cue-orrery.test.ts`:
 * the drift and the eating clock are proved in `sim/test/candle*.test.ts`, and
 * a test that waited out `candleMoveBeats` to find a drifted glow would be
 * that suite's second copy.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(beats = 1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("candle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < beats * TPB; i++) step(world, []);
  return world;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

/** The boss this wave installed. */
function installed(world: World): CandleState {
  const c = candleBoss(world);
  if (c === null) throw new Error("the candle wave installed no candle");
  return c;
}

/** A column that is not this one, wherever in the field it sits. */
const other = (col: number): number => (col === 0 ? 1 : col - 1);

describe("THE CANDLE", () => {
  it("names the flash on the light, and only to the seat that fires", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "full";
    world.cannonCol = c.col;
    expect(word(world, "p2")).toBe("FIRE");
    expect(cue(world, "p2")?.kind).toBe("PRESS");
    expect(word(world, "p1")).toBeNull();
  });

  it("asks the pilot under the light, and only him", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "full";
    world.cannonCol = other(c.col);
    expect(word(world, "p1")).toBe("MOVE");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    // One gesture across two seats: a `FIRE` from a column the flame is not
    // over is the field asking her for a shot that takes no step off it.
    expect(word(world, "p2")).toBeNull();
  });

  it("follows the light when it drifts, rather than parking the cannon", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "full";
    world.cannonCol = c.col;
    expect(word(world, "p1")).toBeNull();
    // One tile of drift, which is what `candleMoveBeats` does to this fight
    // over and over, and the chase is on again.
    c.col = other(c.col);
    expect(word(world, "p1")).toBe("MOVE");
    expect(word(world, "p2")).toBeNull();
  });

  it("stands its ground where the flame is turned at the light's own column", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "eating";
    c.faceCol = c.col;
    world.cannonCol = c.col;
    // The shipped word walked him off the only column a shot lands from. The
    // beam is not eaten — `lance-burn.ts` goes straight to `candleStruck` —
    // so this beat wants him where he is, saying *beam*, which is his to say
    // and not the field's (`boss-cue-read-m.ts`).
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBe("FIRE");
  });

  it("keeps the flash standing while the flame eats, and never names the face", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "eating";
    c.faceCol = c.col;
    world.cannonCol = c.col;
    // The cone is on his screen alone (`showsCandleFace`). A word that went
    // quiet here would be that cone read out on hers — the one sentence this
    // fight is made of, answered by the field.
    for (const role of ["p1", "p2", "test"] as ViewRole[]) {
      const found = cue(world, role);
      if (found !== null) expect(String(c.faceCol)).not.toBe(found.word);
    }
    expect(word(world, "p2")).toBe("FIRE");
  });

  it("still moves him off the light's column while it eats", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "eating";
    c.faceCol = c.col;
    world.cannonCol = other(c.col);
    expect(word(world, "p1")).toBe("MOVE");
    expect(word(world, "p2")).toBeNull();
  });

  it("goes quiet on the flash while the lobe is already filling", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "last";
    world.cannonCol = c.col;
    world.prime = { tick: world.tick, color: "red", spent: false };
    // `gripBrakes`' rule: a word over something already being answered teaches
    // the pair to stop reading the words.
    expect(word(world, "p2")).toBeNull();
    expect(word(world, "p1")).toBeNull();
  });

  it("says nothing at all in the dark, or once the light is out", () => {
    for (const phase of ["dark", "out"] as const) {
      const world = opened();
      const c = installed(world);
      c.phase = phase;
      world.cannonCol = other(c.col);
      expect(word(world, "p1")).toBeNull();
      expect(word(world, "p2")).toBeNull();
    }
  });

  it("puts each mark on the thing that seat is already shown", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "full";
    world.cannonCol = c.col;
    // The halo, which every screen carries (`candle-glow.ts`) and which in a
    // black field is the only steady light there is.
    expect(cue(world, "p2")?.y).toBe(candleGlowY(LAYOUT.p2));
    world.cannonCol = other(c.col);
    // The hull line, where the thumb that answers this goes. A frame around
    // the glow saying `MOVE` would be the field naming his column for him.
    expect(cue(world, "p1")?.y).toBe(LAYOUT.p1.hullY);
  });
});
