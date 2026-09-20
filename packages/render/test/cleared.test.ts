import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES } from "@neon-spore/content";
import {
  beatSeconds,
  clearHolds,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The screen between the waves** (`cleared.ts`, `docs/spec/between-waves.md`).
 *
 * Four things are worth holding. That it says the wave that was cleared and
 * what the run has cost — the two figures, never a third. That it is *not* up
 * while the wave is live, which is the whole of what `clearHolds` decides.
 * That a rehearsal never draws it, for the lost screen's reason. And that it
 * has left before the next wave's guide arrives, because the hand-off is one
 * movement and two things falling past each other is not.
 */

const CFG = DEFAULT_CONFIG;
const SIZE = { width: 390, height: 844, dpr: 2 };
const WAVE = 4;
/** The wave these tests clear, named the once. */
const NAME = WAVES[WAVE]?.name ?? "";

beforeAll(installCanvasGlobals);

/**
 * A world `seconds` into the rest after a cleared wave — an empty queue clears
 * on the first beat, and the lines are still falling for the first of them.
 */
function cleared(seconds = 1): World {
  const world = createWorld(CFG, 3);
  startWave(world, WAVE, [], [], null, false, 0);
  for (let i = 0; i < ticksPerBeat(CFG) * 4 && !clearHolds(world); i++) step(world, []);
  for (let i = 0; i < Math.round(seconds * CFG.tickHz); i++) step(world, []);
  return world;
}

function drawn(world: World, rehearsal = false): TextBox[] {
  const { ctx } = stubCanvas();
  const l = computeLayout(SIZE, CFG, "p1");
  ctx.texts = [];
  drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, { role: "p1", rehearsal });
  return ctx.texts as TextBox[];
}

describe("the screen between the waves", () => {
  it("names the wave that was cleared and what the run has cost", () => {
    const world = cleared();
    expect(clearHolds(world)).toBe(true);
    const said = drawn(world).map((t) => t.text);
    expect(said).toContain(`WAVE ${WAVE + 1} CLEARED`);
    expect(said).toContain(NAME);
    expect(said.some((t) => t.includes("0:") && t.includes("NO RETRIES"))).toBe(true);
    // Three lines and no fourth: no score, and nothing said per seat.
    expect(said).toHaveLength(3);
  });

  it("is not up while the wave is live", () => {
    const world = createWorld(CFG, 3);
    startWave(world, WAVE, [], [], null, false, 0);
    expect(clearHolds(world)).toBe(false);
    expect(drawn(world)).toHaveLength(0);
  });

  it("is never drawn inside a rehearsal", () => {
    expect(drawn(cleared(), true)).toHaveLength(0);
  });

  it("leaves by rising, as the guide's own header is about to fall", () => {
    const rest = CFG.waveRestBeats * beatSeconds(CFG);
    const standing = drawn(cleared(rest / 2));
    const leaving = drawn(cleared(rest - 1 / CFG.tickHz));
    const name = (t: TextBox[]) => t.find((b) => b.text === NAME)?.y ?? 0;
    expect(name(standing)).toBeGreaterThan(0);
    // Up, not down: the header it hands over to falls into the band above.
    expect(name(leaving)).toBeLessThan(name(standing) - 10);
  });
});
