import { describe, expect, test } from "bun:test";
import { createWorld, DEFAULT_CONFIG, NO_SLOW, type World } from "@neon-spore/sim";
import { stageTickHz } from "../src/stage-loop.js";

/**
 * **The director's two clocks, and the window neither of them was spending.**
 *
 * `stage.ts` and `versus-pair.ts` both hand `runStageLoop` a `tickHz`, and
 * both answered `cfg.tickHz` flat — so a span THE SLOW opened ran at ordinary
 * speed on the two pages built for looking at one. The arithmetic is one line
 * and the assertions below are the whole of what it has to do; what makes it
 * worth a test of its own is that it is the *reciprocal* of a line in an application this
 * package may not import (`apps/game/src/tick-rate.ts`), so the two can drift
 * and nothing else would say so.
 */

function slowed(): World {
  const world = createWorld(DEFAULT_CONFIG, 5);
  world.slowFromBeat = 0;
  world.slowToBeat = 4;
  world.beat = 1;
  return world;
}

describe("stageTickHz", () => {
  test("an ordinary frame is the config's own rate, exactly", () => {
    const world = createWorld(DEFAULT_CONFIG, 5);
    expect(world.slowToBeat).toBe(NO_SLOW);
    // Exactly, and not to within a rounding step: the shipped case divides
    // 1000 by 1000, and a loop that acquired a fraction here would carry it
    // on every frame of every wave nobody has slowed (`sim/slow.ts`).
    expect(stageTickHz(world)).toBe(DEFAULT_CONFIG.tickHz);
  });

  test("inside a window it is the config's rate cut by slowRateMilli", () => {
    expect(stageTickHz(slowed())).toBeCloseTo(
      (DEFAULT_CONFIG.tickHz * DEFAULT_CONFIG.slowRateMilli) / 1000,
      9,
    );
  });

  /**
   * The number that matters is not the rate but what it costs in the hand: a
   * two-beat window has to take longer than two ordinary beats do, by the
   * factor the configuration names. This is the assertion a reader checks the
   * page against with a stopwatch.
   */
  test("a window takes its own beats longer in the hand than the same beats do", () => {
    const ordinary = createWorld(DEFAULT_CONFIG, 5);
    const seconds = (world: World, ticks: number) => ticks / stageTickHz(world);
    const ticks = DEFAULT_CONFIG.tickHz * 2;
    const factor = seconds(slowed(), ticks) / seconds(ordinary, ticks);
    expect(factor).toBeCloseTo(1000 / DEFAULT_CONFIG.slowRateMilli, 9);
    expect(factor).toBeGreaterThan(2);
  });
});
