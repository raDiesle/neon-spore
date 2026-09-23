import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, primeChargeMilli, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE LEAK's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

/**
 * **THE LEAK's rehearsal, and the two halves prose could not hold apart.**
 *
 * The wave's three strings say *the lobe fills nothing*. What a pair has to see
 * is the ring round the button **not closing** under a thumb that stays down,
 * and then that same thumb lifting and a bolt going out — read as one sentence
 * those are a dead trigger, and watched in that order they are a lost weapon on
 * a panel that still works. That is the whole reason the wave has a film at
 * all, and it is the half a caption cannot assert.
 *
 * So this asserts it. The hold runs from tick 360 to 660, which is five beats
 * where `lancePrimeBeats` is three: on any other wave the lobe would be full at
 * 540 and the column alight. Here the fill is nought at every tick of it, and
 * the lift still owes its ordinary shot — `sim/lance.ts` is emphatic that the
 * press starts a hold and the lift fires, because a fault that swallowed the
 * press would have taken the trigger rather than the beam.
 *
 * Change `lancePrimeBeats`, or let the fault reach the press, and one of the
 * two pages over this stops meaning what it says — silently, in a film nobody
 * re-watches once it is written. That is `theThrob`'s argument above, one wave
 * along.
 */
describe("the rehearsal for THE LEAK", () => {
  it("fills nothing under a five-beat hold, and still fires on the lift", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLeak");
    const run = new SceneRun(sceneScript("theLeak", wave, DEFAULT_CONFIG));
    const seen: SimEvent[] = [];
    const spent: SimEvent[] = [];
    let fullest = 0;
    let destroyedByLift = -1;
    for (let t = 0; t < SCENES.theLeak.ticks - 1; t++) {
      spent.length = 0;
      run.advance(spent);
      seen.push(...spent);
      // The held page, and a beat either side of the lift: the fill is what is
      // being watched and it must never leave nought.
      if (run.world.tick >= 360 && run.world.tick <= 660) {
        fullest = Math.max(fullest, primeChargeMilli(run.world));
      }
      // The first body the film takes, and which tick took it. The bolt leaves
      // on the lift and travels, so this is after 660 rather than on it.
      if (destroyedByLift === -1 && spent.some((e) => e.type === "destroy")) {
        destroyedByLift = run.world.tick;
      }
    }
    expect(fullest, "the lobe filled under a hold on the wave where it cannot").toBe(0);
    expect(
      destroyedByLift,
      "no body was taken at all — the lift owes an ordinary shot",
    ).toBeGreaterThan(660);
    // Before the two taps that follow it, so what took this one was the lift.
    expect(destroyedByLift, "the first body waited for a tap").toBeLessThan(840);
    // Three bodies, three shots — which is the page the pilot reads last.
    expect(seen.filter((e) => e.type === "destroy")).toHaveLength(3);
    expect(run.world.creatures).toHaveLength(0);
  });
});
