import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG, mazeRadiusMilli } from "@neon-spore/sim";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";
import { clicked, layoutFor, mazeState, watch, wheel } from "./maze-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MAZE's shot in the drum and the drum's fall (`maze-draw.ts`,
 * `maze-fall.ts`): one shot in the colour it was fired in, kept inside the
 * rim, and the whole drum coming down only when the shot was lost in a dead
 * end. The wheel's walls, its lit mouth and the two seats' frames are
 * `maze-draw.test.ts`; the harness they share is `maze-harness.ts`.
 */

const CFG = DEFAULT_CONFIG;

beforeAll(installCanvasGlobals);

describe("THE MAZE's shot", () => {
  it("draws one shot, in the colour it was fired in, and keeps it in the drum", () => {
    const red = watch("p1", mazeState({ phase: "travel", way: 0, step: 2, shotColor: 0 }), 3, 0.9);
    const cyan = watch("p1", mazeState({ phase: "travel", way: 0, step: 2, shotColor: 1 }), 3, 0.9);
    // The shot is the shot player 2 loaded — the drum swallowed the bullet, so
    // a gold stand-in beside a red one is two shots for one trigger.
    expect(red.colours).toContain(PALETTE.red);
    expect(red.colours).not.toContain(PALETTE.cyan);
    expect(cyan.colours).toContain(PALETTE.cyan);
    // And nothing is drawn along the corridors it has already walked: a trail
    // is the route, and the route is the one thing the shot is there to find.
    // Against the read less the string knob's two-headed arrow, five segments,
    // which a string in travel does not draw.
    const ARROW_SEGMENTS = 5;
    const read = watch("p1", mazeState({ phase: "read" }), 3).segments;
    expect(red.segments).toBe(read - ARROW_SEGMENTS);

    const l = layoutFor("p1");
    const r = (mazeRadiusMilli(CFG) * l.tile) / 1000;
    const cx = l.gridLeft + l.gridWidth / 2;
    const cy = l.gridTop + r + l.tile * 0.6;
    for (const p of red.points) {
      expect(Math.hypot(p.x - cx, p.y - cy)).toBeLessThan(r * 4.1);
    }
  });

  /**
   * The one verdict that is drawn loudly. A shot lost in a dead end brings the
   * whole drum down over the ship — the rings drift out, turn and fade — and a
   * shot the heart merely refused for its colour leaves the walls standing,
   * because it never touched them. Both cost the hull the same, so the picture
   * is the only place the difference is visible at all.
   */
  it("takes the drum apart when the shot was lost, and not when it was refused", () => {
    const { angleMilli, col } = clicked();
    const base = {
      phase: "verdict",
      phaseBeat: 0,
      angleMilli,
      lockedWay: 0,
      lockedCol: col,
      way: 0,
      step: 2,
      verdict: -1,
    } as const;
    const stood = watch("p1", mazeState({ ...base, lost: "color" }), 2);
    const fell = watch("p1", mazeState({ ...base, lost: "mouth" }), 2);

    // Every circle of a standing drum is struck about the drum's own centre;
    // a falling one has let go of it, so none of them are any more. Counting
    // the arcs still centred there is the cheapest way to say that without
    // knowing which ring went where.
    const l = layoutFor("p1");
    const r = (mazeRadiusMilli(CFG) * l.tile) / 1000;
    const cx = l.gridLeft + l.gridWidth / 2;
    const cy = l.gridTop + r + l.tile * 0.6;
    const onCentre = (points: { x: number; y: number }[]) =>
      points.filter((p) => Math.abs(p.x - cx) < 0.5 && Math.abs(p.y - cy) < 0.5).length;
    const pieces = wheel().openings.reduce((n, o) => n + Math.max(1, o.length), 0);
    expect(onCentre(stood.points) - onCentre(fell.points)).toBeGreaterThanOrEqual(pieces);

    // And there are no doors in a wall that is coming down.
    expect(stood.colours).toContain(PALETTE.good);
    expect(fell.colours).not.toContain(PALETTE.good);
  });
});
