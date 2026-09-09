import { describe, expect, test } from "bun:test";
import { cadenceElapsed, EVENT_CADENCE_SECONDS } from "../src/pose-kit.js";
import { MECHANIC_POSES } from "../src/poses-mechanics.js";
import { advance } from "../src/versus-pair.js";

/**
 * The owner could not see a candidate's whole difference because it lives in
 * one instant — the meteorite hitting the shield — and the ALTERNATIVES page
 * showed that instant once and went quiet: *"the meteorite must repeatingly
 * hit the shield with around 2 seconds pause between."*
 *
 * `pose-kit.ts`'s `cadenceSeconds` is what fixes it, and it is a property of
 * the *pose* (`SHOT · BEING LAID`, `WARD · DEFLECTED`), not of any candidate
 * shown through it — the pair (`versus-pair.ts`'s `startPair`) replays
 * whichever pose it is handed on that pose's own clock. This pins the
 * arithmetic without a canvas, mirroring the loop `startPair` actually runs:
 * step every tick through `advance`, and force a fresh `build()` once
 * `cadenceElapsed` says the pose's own clock has run out.
 *
 * The quote above is the *pause* he asked for and it is still the point; the
 * number attached to it is not. He said of the page as a whole on 9 September
 * 2026 that the animation was often too short, and two seconds turned out to
 * be the whole loop rather than the gap in it. Nothing below reads a number of
 * its own any more — see `EVENT_CADENCE_SECONDS`.
 */

function findPose(name: string) {
  const pose = MECHANIC_POSES.find((p) => p.name === name);
  if (!pose) throw new Error(`pose not found: ${name}`);
  return pose;
}

/** `startPair`'s loop, without a canvas: tick at `tickHz`, and rebuild either
 * on `needWave` (continuous poses) or once the pose's own cadence elapses. */
function simulate(poseName: string, eventType: string, windowSeconds: number, tickHz = 120) {
  const pose = findPose(poseName);
  let world = pose.build();
  let clock = 0;
  const impactTicks: number[] = [];
  let tick = 0;
  for (let i = 0; i < Math.round(windowSeconds * tickHz); i++) {
    clock += 1 / tickHz;
    const next = advance(world, () => pose.build(), pose);
    tick++;
    if (next.world !== world) clock = 0;
    world = next.world;
    if (next.events.some((e) => e.type === eventType)) impactTicks.push(tick);
    if (cadenceElapsed(pose, clock)) {
      world = pose.build();
      clock = 0;
      tick++;
      if (world.events.some((e) => e.type === eventType)) impactTicks.push(tick);
    }
  }
  const gapsSeconds = impactTicks.slice(1).map((t, idx) => (t - (impactTicks[idx] ?? 0)) / tickHz);
  return { impacts: impactTicks.length, gapsSeconds };
}

describe("event-pose cadence", () => {
  test("cadenceElapsed is false for a continuous pose, however long", () => {
    const continuous = findPose("GRIP · ONE HAND");
    expect(continuous.cadenceSeconds).toBeUndefined();
    expect(cadenceElapsed(continuous, 1e9)).toBe(false);
  });

  test("cadenceElapsed fires once the pose's own clock reaches its cadence", () => {
    const cadenced = { ...findPose("GRIP · ONE HAND"), cadenceSeconds: EVENT_CADENCE_SECONDS };
    expect(cadenceElapsed(cadenced, EVENT_CADENCE_SECONDS - 0.01)).toBe(false);
    expect(cadenceElapsed(cadenced, EVENT_CADENCE_SECONDS)).toBe(true);
  });

  // Ten replays' worth of window, and every bound read off
  // `EVENT_CADENCE_SECONDS` rather than typed. The clock moved from two
  // seconds to four on 9 September 2026 and these were the only two
  // assertions in the repository that had the old number written into them —
  // a second copy of a tuning, which is exactly what `purity.test.ts`'s
  // COPIES sweep exists to stop happening in shipped code and what a test has
  // no more licence to do. What is actually being pinned is *that the moment
  // comes round on the pose's own clock*: a rock that only ever hit once, or
  // a shot firing on `waveRestBeats` instead, fails this however the constant
  // is tuned.
  const WINDOW = EVENT_CADENCE_SECONDS * 10;
  const LEAST = 8;

  function expectOnTheClock(gapsSeconds: readonly number[]): void {
    for (const g of gapsSeconds) expect(g).toBeGreaterThan(EVENT_CADENCE_SECONDS - 0.1);
    for (const g of gapsSeconds) expect(g).toBeLessThan(EVENT_CADENCE_SECONDS + 0.2);
  }

  test("WARD · DEFLECTED repeats on the event clock, not once every ten seconds", () => {
    const { impacts, gapsSeconds } = simulate("WARD · DEFLECTED", "deflect", WINDOW);
    expect(impacts).toBeGreaterThanOrEqual(LEAST);
    expectOnTheClock(gapsSeconds);
  });

  test("SHOT · BEING LAID repeats on the event clock, not on its own wave rest", () => {
    const { impacts, gapsSeconds } = simulate("SHOT · BEING LAID", "fire", WINDOW);
    expect(impacts).toBeGreaterThanOrEqual(LEAST);
    expectOnTheClock(gapsSeconds);
  });
});
