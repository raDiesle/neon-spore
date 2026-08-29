import { describe, expect, test } from "bun:test";
import { cadenceElapsed, EVENT_CADENCE_SECONDS } from "../src/pose-kit.js";
import { MECHANIC_POSES } from "../src/poses-mechanics.js";
import { advance } from "../src/versus-pair.js";

/**
 * The owner could not see a candidate's whole difference because it lives in
 * one instant — the meteorite hitting the shield — and the ALTERNATIVES page
 * showed that instant once and went quiet: *"the meteorite must repeatingly
 * hit the shield with around 2 seconds pause between."* `docs/queue.md`'s
 * `claude/burn-versus-cadence` entry.
 *
 * `pose-kit.ts`'s `cadenceSeconds` is what fixes it, and it is a property of
 * the *pose* (`SHOT · BEING LAID`, `WARD · DEFLECTED`), not of any candidate
 * shown through it — the pair (`versus-pair.ts`'s `startPair`) replays
 * whichever pose it is handed on that pose's own clock. This pins the
 * arithmetic without a canvas, mirroring the loop `startPair` actually runs:
 * step every tick through `advance`, and force a fresh `build()` once
 * `cadenceElapsed` says the pose's own clock has run out.
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

  // Over a fixed 20-second window: a rock that only ever hit once, or a shot
  // that fired every 1.2 seconds because `waveRestBeats` never agreed with
  // the owner's number, both fail this the same way an eyeballed page would
  // never have caught — a count that is too low, or gaps that are not ~2s.
  test("WARD · DEFLECTED repeats roughly every two seconds, not every ten", () => {
    const { impacts, gapsSeconds } = simulate("WARD · DEFLECTED", "deflect", 20);
    expect(impacts).toBeGreaterThanOrEqual(8);
    for (const g of gapsSeconds) expect(g).toBeGreaterThan(1.9);
    for (const g of gapsSeconds) expect(g).toBeLessThan(2.2);
  });

  test("SHOT · BEING LAID repeats roughly every two seconds, not every second", () => {
    const { impacts, gapsSeconds } = simulate("SHOT · BEING LAID", "fire", 20);
    expect(impacts).toBeGreaterThanOrEqual(8);
    for (const g of gapsSeconds) expect(g).toBeGreaterThan(1.9);
    for (const g of gapsSeconds) expect(g).toBeLessThan(2.2);
  });
});
