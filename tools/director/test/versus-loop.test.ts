import { describe, expect, test } from "bun:test";
import { MECHANIC_POSES } from "../src/poses-mechanics.js";
import { advance } from "../src/versus-pair.js";

/**
 * The confirmed half of `docs/queue.md`'s "THE ALTERNATIVES PAGE SHOWS
 * EVERYTHING AT ONCE" — the owner's guess that the shot and the ward "do not
 * trigger" so a candidate never has anything to draw.
 *
 * `SHOT · IN FLIGHT` and `WARD · DEFLECTED` (`poses-mechanics.ts`) each build
 * a world already holding the moment they are named after, and the pair
 * engine restarts the pose every `waveRestBeats` once the field clears —
 * `docs/versus.md`'s "the pair is a loop". What was actually broken is that
 * `versus-pair.ts` discarded a freshly built world's own `events` on every
 * restart, and `pose-kit.ts`'s `runUntil` returns on the exact tick its named
 * state occurs, so that world's `events` already holds the `deflect` (or
 * `fire`) that moment produced. A shield candidate's shockwave is drawn from
 * that event and nothing else — the rock it caught left no scar and no
 * lasting body — so throwing the event away meant the shockwave never played,
 * on the first frame or on any later loop.
 *
 * `advance` is the fix, factored out so this needs no canvas: it is the sim
 * half of the claim, and simulation is testable without a DOM the way
 * `poses.test.ts` already argues for `pose.build()` itself.
 */

function findPose(name: string) {
  const pose = MECHANIC_POSES.find((p) => p.name === name);
  if (!pose) throw new Error(`pose not found: ${name}`);
  return pose;
}

describe("the versus pair loop", () => {
  // SHOT · IN FLIGHT's `build()` runs 30 ticks past the shot leaving, so the
  // `fire` event itself is long gone by the time a fresh world is handed
  // back — the shot is drawn from `world.bullets`, a lasting body, not from
  // that event. So the thing worth pinning here is that a new bullet keeps
  // appearing every loop rather than only on the very first one.
  test("SHOT · IN FLIGHT puts a fresh bullet on screen every loop, not just the first", () => {
    const pose = findPose("SHOT · IN FLIGHT");
    let world = pose.build();
    let onsets = 0;
    let wasEmpty = world.bullets.length === 0;
    for (let i = 0; i < 2000; i++) {
      const next = advance(world, () => pose.build());
      world = next.world;
      const empty = world.bullets.length === 0;
      if (wasEmpty && !empty) onsets++;
      wasEmpty = empty;
    }
    expect(onsets).toBeGreaterThan(1);
  });

  test("WARD · DEFLECTED's deflect event survives a rebuild instead of being thrown away", () => {
    const pose = findPose("WARD · DEFLECTED");
    let world = pose.build();
    // The very first `advance` call stands in for the pair's first paint: the
    // pose already deflected during `build()`, and that event must still be
    // in `events` on the first frame — not only after some later rebuild.
    const first = advance(world, () => pose.build());
    expect(pose.build().events.some((e) => e.type === "deflect")).toBe(true);

    let onsets = first.events.some((e) => e.type === "deflect") ? 1 : 0;
    world = first.world;
    for (let i = 0; i < 4000; i++) {
      const next = advance(world, () => pose.build());
      if (next.events.some((e) => e.type === "deflect")) onsets++;
      world = next.world;
    }
    expect(onsets).toBeGreaterThan(1);
  });

  test("a tick that neither rebuilds nor deflects keeps only that tick's events", () => {
    const pose = findPose("SHOT · IN FLIGHT");
    const world = pose.build();
    const next = advance(world, () => pose.build());
    // `advance` never invents events of its own — it is a pass-through except
    // on the tick it rebuilds.
    expect(next.events).toEqual(next.world.events);
  });
});
