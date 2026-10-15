import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { autopilotHand } from "../src/autopilot-hands.js";

/**
 * **AUTO plays THE SCUTTLE to the end** (`autopilot-scuttle.ts`). The frame's
 * own hand alone cleared one seed in twelve: it let the pods the frame throws
 * fall to the skin, and the slimes it throws to the hull. A pod is caught
 * first now, a slime near the hull before the live part, and the last part's
 * fill before a pod that would land after the beam; and the beam is filled in
 * the colour of what stands in its column, so it burns through.
 *
 * Seeds 1, 3 and 9 were the last to fall, each to something standing in the
 * last part's column through the wind-up: a rock thrown there earlier, or a
 * pod hanging there, and the beam stops at either. The carry takes a rock or
 * a pod off a column a part still hangs over (`scuttle-swing.ts`), a pod
 * already hanging over one is shot loose before the wind-up, and no other is
 * shot loose in the frame's last cycles, where it would land inside the fill.
 * Over forty-eight seeds it loses three (34, 41, 46), each to a pod landing
 * inside the wind-up some other way — one by a bolt already in flight.
 */

/** Past this the fight is lost however it stands: it falls in about sixty beats. */
const LIMIT_BEATS = 300;

function played(seed: number): { cleared: boolean; lost: SimEvent["type"][] } {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, [], [], { kind: "scuttle" });
  const stop = LIMIT_BEATS * ticksPerBeat(world.cfg);
  const lost: SimEvent["type"][] = [];
  while (world.tick < stop && world.restBeat === 0 && !failHolds(world)) {
    const hand = autopilotHand(world);
    step(
      world,
      (hand?.(world) ?? []).map((c) => ({ ...c, tick: world.tick })),
    );
    for (const e of world.events) {
      if (e.type === "breach" || e.type === "podLost") lost.push(e.type);
    }
  }
  return { cleared: world.restBeat !== 0, lost };
}

describe("THE SCUTTLE, played by AUTO", () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])(
    "falls on seed %i with nothing on the hull and no pod lost",
    (seed) => {
      expect(played(seed)).toEqual({ cleared: true, lost: [] });
    },
  );
});
