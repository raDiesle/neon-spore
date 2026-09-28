import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import {
  PLATE_HALF_H,
  SCUTTLE_ROWS,
  SOCKET_FLOOR_H,
  SOCKET_HALF_H,
  scuttleHangDrop,
  scuttleSocket,
  scuttleThread,
} from "../src/scuttle-shape.js";

/**
 * **THE SCUTTLE's thread runs down, from the socket to the part.** A canvas
 * takes a segment drawn from the lower end to the upper as happily as the
 * other way, and with a round cap on it a frame test sees ink either way —
 * which is how a thread that never had a length shipped for four days. So
 * this asks the geometry: where the thread is tied, over the whole fall.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");

function hanging(phase: number) {
  const c = scuttleSocket(L, CFG, 9);
  return { c, at: { x: c.x, y: c.y + scuttleHangDrop(L, phase) } };
}

describe("THE SCUTTLE's thread", () => {
  it("is tied at ends that leave the fall a length to show", () => {
    expect(SOCKET_FLOOR_H + PLATE_HALF_H).toBeLessThan(SCUTTLE_ROWS.drop * 0.6);
  });

  it("runs downward whenever it is drawn, at every phase of the cadence", () => {
    for (let k = 0; k <= 40; k++) {
      const { c, at } = hanging(k / 40);
      const ends = scuttleThread(L, c, at);
      if (ends !== null) expect(ends[1].y).toBeGreaterThan(ends[0].y);
    }
  });

  it("is a line by the middle of the cadence, and not while the plate covers the knot", () => {
    const mid = hanging(0.5);
    const ends = scuttleThread(L, mid.c, mid.at);
    expect(ends).not.toBeNull();
    if (ends !== null) expect(ends[1].y - ends[0].y).toBeGreaterThan(L.tile * 0.04);
    const seated = hanging(0);
    expect(scuttleThread(L, seated.c, seated.at)).toBeNull();
  });

  it("brings the plate clear of its socket's lip by the throw", () => {
    const { c, at } = hanging(1);
    expect(at.y - L.tile * PLATE_HALF_H).toBeGreaterThanOrEqual(
      c.y + L.tile * SOCKET_HALF_H - 1e-6,
    );
  });

  it("leans after a carried part, still from its own socket", () => {
    const { c, at } = hanging(1);
    const ends = scuttleThread(L, c, { x: at.x + L.tile, y: at.y });
    expect(ends?.[0].x).toBe(c.x);
    expect(ends?.[1].x).toBe(c.x + L.tile);
  });
});
