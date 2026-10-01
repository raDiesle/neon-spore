import { describe, expect, it } from "bun:test";
import type { Bullet, Color } from "@neon-spore/sim";
import { type BoltHit, BoltStops } from "../src/bolt-stop.js";
import { PALETTE } from "../src/palette.js";

/**
 * **A bolt stops on what it meets** (`bolt-stop.ts`): drawn no further than
 * the line the boss's drawer gives it, burst once there — in its own colour on
 * the target, in grey grit on anything else — and forgotten when the field
 * lets it go.
 */

const bolt = (id: number, color: Color = "cyan"): Bullet => ({
  id,
  col: 4,
  row: 0,
  subMilli: 0,
  color,
  lance: false,
  driftMilli: 0,
  aimMilli: 0,
});

/** A stopper with its line at screen y 100, meeting `hit`. */
function aimed(stops: BoltStops, hit: BoltHit): void {
  stops.aim(() => ({ y: 100, hit }));
}

function bursts(stops: BoltStops): [number, string][] {
  const said: [number, string][] = [];
  stops.update(0, (_x, _y, n, hex) => said.push([n, hex]));
  return said;
}

describe("BoltStops", () => {
  it("lets a bolt below the line be drawn, and stops one at it", () => {
    const stops = new BoltStops();
    aimed(stops, "target");
    expect(stops.stopped(bolt(1), 50, 140, PALETTE.cyan)).toBe(false);
    expect(stops.stopped(bolt(1), 50, 100, PALETTE.cyan)).toBe(true);
  });

  it("bursts a target once, in the bolt's colour, and keeps it hidden", () => {
    const stops = new BoltStops();
    aimed(stops, "target");
    stops.stopped(bolt(1), 50, 90, PALETTE.cyan);
    stops.end([bolt(1)]);
    const first = bursts(stops);
    expect(first).toHaveLength(1);
    expect(first[0]?.[1]).toBe(PALETTE.cyan);
    // Next frame, past the line and with no answer aimed: still not drawn.
    expect(stops.stopped(bolt(1), 50, 40, PALETTE.cyan)).toBe(true);
    stops.end([bolt(1)]);
    expect(bursts(stops)).toHaveLength(0);
  });

  it.each(["wrong", "body"] as const)("scuffs a %s hit in grey, smaller", (hit) => {
    const stops = new BoltStops();
    aimed(stops, "target");
    stops.stopped(bolt(1), 50, 90, PALETTE.cyan);
    aimed(stops, hit);
    stops.stopped(bolt(2, "red"), 50, 90, PALETTE.red);
    const [good, scuff] = bursts(stops);
    expect(scuff?.[1]).toBe(PALETTE.rock);
    expect(scuff?.[0] ?? 0).toBeLessThan(good?.[0] ?? 0);
  });

  it("stops nothing when no boss has aimed it this frame", () => {
    const stops = new BoltStops();
    aimed(stops, "target");
    stops.end([]);
    expect(stops.stopped(bolt(1), 50, 10, PALETTE.cyan)).toBe(false);
  });

  it("forgets a bolt the field no longer holds", () => {
    const stops = new BoltStops();
    aimed(stops, "body");
    stops.stopped(bolt(1), 50, 90, PALETTE.cyan);
    stops.end([]);
    expect(stops.stopped(bolt(1), 50, 140, PALETTE.cyan)).toBe(false);
  });
});
