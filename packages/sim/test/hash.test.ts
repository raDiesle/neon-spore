import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { createWorld, type World } from "../src/world.js";

const world = (): World => createWorld(DEFAULT_CONFIG, 1);

/**
 * The fingerprint is only a desync detector for the fields it covers, and a
 * field it does not cover fails silently — two devices agree about a number
 * they disagree about. So every field is asserted the same way: build two
 * worlds, move one of them by hand, and require the fingerprint to notice.
 *
 * Reaching into `World` directly rather than driving a command is the point.
 * A test that pressed guard would prove that guard changes the fingerprint,
 * which the replay tests already prove; this proves that the *field* is in it,
 * and so it fails the moment its `push` is deleted from `hash.ts`.
 */
const noticed = (name: string, move: (w: World) => void): void => {
  it(`notices ${name}`, () => {
    const a = world();
    const b = world();
    expect(hashWorld(a)).toBe(hashWorld(b));
    move(b);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
};

describe("the fingerprint", () => {
  // The four ticks the hull remembers. A call released by `guard` or by
  // `fire(color)` is the simulation branching on these, so a device that
  // disagrees about one disagrees about whether the world ticked.
  noticed("guardTick", (w) => {
    w.guardTick = 12;
  });
  noticed("intakeTick", (w) => {
    w.intakeTick = 12;
  });
  noticed("wardUntilTick", (w) => {
    w.wardUntilTick = 12;
  });
  noticed("lastFireTick", (w) => {
    w.lastFireTick = 12;
  });

  // Where the wave is. `waveBeat` is not `beat`: an interlude holds one still
  // while the other counts, and a warden's clamp and a vane's opening are read
  // off `waveBeat` alone.
  noticed("wave", (w) => {
    w.wave = 3;
  });
  noticed("waveBeat", (w) => {
    w.waveBeat = 3;
  });
  noticed("spawned", (w) => {
    w.spawned = 1;
  });
  noticed("podSpawned", (w) => {
    w.podSpawned = 1;
  });
  noticed("restBeat", (w) => {
    w.restBeat = 9;
  });
  noticed("nextId", (w) => {
    w.nextId = 9;
  });

  it("agrees with itself", () => {
    const a = world();
    const b = world();
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
