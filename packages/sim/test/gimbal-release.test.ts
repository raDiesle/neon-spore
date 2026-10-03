import { describe, expect, it } from "bun:test";
import { NO_BEARING, OUTER } from "../src/index.js";
import {
  CFG,
  FIRST,
  gimbal,
  grip,
  install,
  letGoTogether,
  lit,
  onFirstMarks,
  runTo,
  TPB,
} from "./gimbal-harness.js";

/**
 * THE GIMBAL's hands through the shear.
 *
 * Until 26 September 2026 a hand was heard only while the marks were lit, so a
 * thumb lifted during the shear's beats was never heard at all and the ring
 * kept its bearing with nobody's finger on it. Since the let-go (3 October
 * 2026) the shear *is* both hands coming off, so what is left to pin is the
 * other half: the rings off their hands drift once the next marks light, and
 * a thumb put back on during the shear turns nothing until they do.
 */

function shearing() {
  const world = install();
  lit(world);
  onFirstMarks(world);
  letGoTogether(world);
  expect(gimbal(world).phase).toBe("shear");
  return world;
}

describe("THE GIMBAL's hands through the shear", () => {
  it("are off both rings, and the outer drifts on the first turning beat", () => {
    const world = shearing();
    const s = gimbal(world);
    expect(s.handMilli).toEqual([NO_BEARING, NO_BEARING]);
    while (s.phase === "shear") runTo(world, world.tick + 1);
    const before = s.atMilli[OUTER];
    runTo(world, world.tick + TPB);
    expect(s.atMilli[OUTER]).toBe(before - CFG.gimbalDriftMilli);
  });

  it("but a thumb put back on does not turn a ring while the drum shears", () => {
    const world = shearing();
    const at = gimbal(world).atMilli[OUTER];
    const t = world.tick;
    runTo(world, t + 2, [grip(t, 1, 0), grip(t + 1, 1, FIRST.outerMilli + 100)]);
    expect(gimbal(world).atMilli[OUTER]).toBe(at);
  });
});
