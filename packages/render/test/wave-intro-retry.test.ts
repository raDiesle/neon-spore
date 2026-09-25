import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, DEFAULT_CONFIG, startWave, type World } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import {
  drawIntroduction,
  INTRO_SECONDS,
  introSeconds,
  RETRY_INTRO_SECONDS,
} from "../src/wave-intro.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A wave gone again stands its introduction for less time, and the words keep
 * pace with the clock: the owner, 20 September 2026, *shorten the time to show
 * the text and start the wave rows earlier*. The countdown in
 * `apps/game/src/waves.ts` and the fade drawn here both read `introSeconds`,
 * so what is held is that the drawing arrives and leaves inside that number.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");

beforeAll(installCanvasGlobals);

function worldOnTry(tries: number): World {
  const world = createWorld(CFG, 3);
  startWave(world, 0, []);
  world.waveTries = tries;
  return world;
}

function wordsAt(world: World, age: number): TextBox[] {
  const { ctx } = stubCanvas();
  ctx.texts = [];
  drawIntroduction(ctx as unknown as CanvasRenderingContext2D, L, world, age, true);
  return ctx.texts;
}

describe("the introduction on a wave gone again", () => {
  it("stands for the full time on a first try and for less on every try after", () => {
    expect(introSeconds(0)).toBe(INTRO_SECONDS);
    expect(introSeconds(1)).toBe(INTRO_SECONDS);
    expect(RETRY_INTRO_SECONDS).toBeLessThan(INTRO_SECONDS);
    expect(RETRY_INTRO_SECONDS).toBeGreaterThan(0);
    // One shorter value, not a fall per retry: the fourth try is no quicker.
    expect(introSeconds(2)).toBe(RETRY_INTRO_SECONDS);
    expect(introSeconds(4)).toBe(RETRY_INTRO_SECONDS);
  });

  it("has every line arrived well before a retry's words leave", () => {
    const words = wordsAt(worldOnTry(2), RETRY_INTRO_SECONDS / 2);
    expect(words.some((w) => w.text.includes("TRY 2"))).toBe(true);
    // The number and the name.
    expect(words.length).toBeGreaterThanOrEqual(2);
  });

  it("is gone when a retry's seconds run out, while a first try still stands", () => {
    const age = (RETRY_INTRO_SECONDS + INTRO_SECONDS) / 2;
    // A hair past the end: the fade's last frame is a float away from zero.
    expect(wordsAt(worldOnTry(2), RETRY_INTRO_SECONDS + 0.01)).toHaveLength(0);
    expect(wordsAt(worldOnTry(2), age)).toHaveLength(0);
    expect(wordsAt(worldOnTry(1), age).length).toBeGreaterThanOrEqual(2);
    expect(wordsAt(worldOnTry(1), INTRO_SECONDS + 0.01)).toHaveLength(0);
  });
});
