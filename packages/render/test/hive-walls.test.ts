import { describe, expect, it } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import {
  createWorld,
  DEFAULT_CONFIG,
  type HiveState,
  hiveBoss,
  hiveOnWall,
  startWave,
} from "@neon-spore/sim";
import { hiveLobeCircle } from "../src/hive-grip.js";
import { hiveMassPath, hiveSite, hiveUnderY, SITE_HANG, SITE_R } from "../src/hive-shape.js";
import { hiveWallFoot } from "../src/hive-stop.js";
import { computeLayout, tileCX, tileCY } from "../src/layout.js";
import { installPixelGlobals, PIXEL_VIEWPORT } from "./pixel-harness.js";

/**
 * **THE HIVE hung down both walls** (`hive-walls.ts`): one body, the corners
 * filled and the middle of the field the hole in it; every wall cocoon lying
 * on its side inside its own column, so the picture never shows a bolt in
 * the next column in meeting one the simulation lets it pass; and the
 * pilot's ring on one standing in the field beside it, where his thumb is.
 */

installPixelGlobals();
const cfg = DEFAULT_CONFIG;
const l = computeLayout(PIXEL_VIEWPORT, cfg, "p1");

function hive(): HiveState {
  const world = createWorld(cfg, 3);
  startWave(world, 6, [], [], { kind: "hive" });
  const s = hiveBoss(world);
  if (s === null) throw new Error("no hive installed");
  return s;
}

const s = hive();
const walls = s.cols.map((_, i) => i).filter((i) => hiveOnWall(s, i));
const ctx = createCanvas(4, 4).getContext("2d");
const inMass = (x: number, y: number): boolean =>
  ctx.isPointInPath(hiveMassPath(l, cfg, s, 1, 0) as never, x, y);

describe("THE HIVE's walls", () => {
  it("has cocoons on both walls", () => {
    const cols = new Set(walls.map((i) => s.cols[i]));
    expect([...cols].sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([0, cfg.cols - 1]);
  });

  it("fills both corners and leaves the middle of the field clear", () => {
    const corner = hiveUnderY(l) + l.tile * 0.4;
    expect(inMass(tileCX(l, 0) - l.tile * 0.3, corner)).toBe(true);
    expect(inMass(tileCX(l, cfg.cols - 1) + l.tile * 0.3, corner)).toBe(true);
    for (const row of [3, 5, 7]) expect(inMass(tileCX(l, 5), tileCY(l, row))).toBe(false);
  });

  it("runs the walls down the field's edges past the lowest cocoon", () => {
    for (const i of walls) {
      const c = hiveSite(l, s, i);
      const edge =
        s.cols[i] === 0 ? tileCX(l, 0) - l.tile * 0.45 : tileCX(l, cfg.cols - 1) + l.tile * 0.45;
      expect(inMass(edge, c.y)).toBe(true);
    }
  });

  it("lays every wall cocoon on its side inside its own column", () => {
    const r = l.tile * SITE_R;
    for (const i of walls) {
      const col = s.cols[i] ?? 0;
      const next = col === 0 ? 1 : cfg.cols - 2;
      const foot = hiveWallFoot(hiveSite(l, s, i), col, r, r * 0.3, r * SITE_HANG);
      expect(foot(tileCX(l, col))).not.toBeNull();
      expect(foot(tileCX(l, next))).toBeNull();
    }
  });

  it("stands the pilot's ring beside a wall cocoon, out in the field", () => {
    for (const i of walls) {
      const c = hiveSite(l, s, i);
      const ring = hiveLobeCircle(l, cfg, s, i, 0, 0);
      const out = s.cols[i] === 0 ? ring.x - c.x : c.x - ring.x;
      expect(out).toBeGreaterThan(0);
      expect(ring.y).toBe(c.y);
    }
  });
});
