import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  DEFAULT_CONFIG as CFG,
  installMaze,
  MAZE_TURN,
  type MazeWheel,
  mazeEntranceAngle,
  mazeEntranceCol,
  mazeWheel,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { mazeDoorMouth } from "../src/maze-door.js";
import { drawMaze } from "../src/maze-draw.js";
import { FUNNEL_DEPTH, mazeFunnelHalfMilli, mazeFunnelLips } from "../src/maze-funnel.js";
import { mazeStringCircle, mazeStringHandle } from "../src/maze-string.js";
import { mazeDrum } from "../src/maze-walls.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MAZE's way in as a funnel, held to the one promise that makes it more
 * than paint: **its mouth is the snap window**. A way in whose angle is inside
 * the mouth clicks onto the column, and one outside it does not — so what a
 * pair sees at the rim is what the rule will catch (`maze-funnel.ts`).
 */

const DRUM = { cx: 450, cy: 500, r: 300 };

/** Three rings and one way in, at the bottom of the rim. */
function wheel(): MazeWheel {
  return mazeWheel(
    {
      rings: 3,
      coreMilli: 250,
      openMilli: 55,
      walls: [[], [0, 180_000], [0, 180_000], [90_000]],
      openings: [[90_000, 270_000], [45_000, 225_000], [45_000, 225_000], [0]],
    },
    0,
  );
}

describe("THE MAZE's funnel", () => {
  it("is wider at its mouth than at the rim", () => {
    const w = wheel();
    const inner = mazeFunnelHalfMilli(CFG, w, DRUM.r, 0);
    const mouth = mazeFunnelHalfMilli(CFG, w, DRUM.r, 1);
    expect(mouth).toBeGreaterThan(inner * 1.3);
  });

  it("has a mouth exactly as wide as the angle a way in clicks from", () => {
    const w = wheel();
    const mouth = mazeFunnelHalfMilli(CFG, w, DRUM.r, 1);
    let caught = 0;
    for (let a = -12_000; a <= 12_000; a += 50) {
      const theta = mazeEntranceAngle(w, a, 0);
      const off = theta > MAZE_TURN / 2 ? theta - MAZE_TURN : theta;
      // A tenth of a degree either side for the sine table's own steps.
      if (Math.abs(Math.abs(off) - mouth) < 100) continue;
      const clicks = mazeEntranceCol(CFG, w, a, 0) >= 0;
      expect(clicks).toBe(Math.abs(off) < mouth);
      if (clicks) caught++;
    }
    expect(caught).toBeGreaterThan(10);
  });

  it("runs its lips from the rim's cut ends out to the mouth", () => {
    const w = wheel();
    const lips = mazeFunnelLips(CFG, w, DRUM, 0);
    expect(lips.length).toBe(2);
    for (const lip of lips) {
      const rIn = Math.hypot(lip.from.x - DRUM.cx, lip.from.y - DRUM.cy);
      const rOut = Math.hypot(lip.to.x - DRUM.cx, lip.to.y - DRUM.cy);
      expect(rIn).toBeCloseTo(DRUM.r, 6);
      expect(rOut).toBeCloseTo(DRUM.r * (1 + FUNNEL_DEPTH), 6);
    }
    const [a, b] = lips;
    if (a === undefined || b === undefined) throw new Error("no lips");
    const wideIn = Math.hypot(a.from.x - b.from.x, a.from.y - b.from.y);
    const wideOut = Math.hypot(a.to.x - b.to.x, a.to.y - b.to.y);
    expect(wideOut).toBeGreaterThan(wideIn);
  });
});

/**
 * **The lever's knob never covers the lit way in.** The wheel only counts the
 * bottom column, and the knob runs round the rim, so the pilot's thumb brings
 * the knob to the bottom exactly when the gap arrives there — the big disc
 * then stands in the door. Its lips are drawn after the knob, so the funnel
 * that caught the column still reads over the hand that turned it.
 */
describe("THE MAZE's lit way in and the lever's knob", () => {
  beforeAll(installCanvasGlobals);

  it("draws the funnel's lips after the knob's disc", () => {
    const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
    const w = wheel();
    const m = installMaze({ beat: 0 } as World, [w]);
    let at = 0;
    while (mazeEntranceCol(CFG, w, at, 0) < 0) at += 25;
    m.phase = "read";
    m.angleMilli = at;
    m.lockedWay = 0;
    m.lockedCol = mazeEntranceCol(CFG, w, at, 0);
    // The knob carried round to straight under the drum, onto the door.
    const d = mazeDrum(l, CFG);
    const rest = mazeStringCircle(l, CFG);
    const ringR = Math.hypot(rest.x - d.cx, rest.y - d.cy);
    const restAngle = Math.atan2(d.cx - rest.x, rest.y - d.cy);
    m.dragFromMilli = Math.round((restAngle * ringR * 1000) / l.tile);
    const knob = mazeStringHandle(l, CFG, m);
    const mouth = mazeDoorMouth(l, CFG, m, w, 0);
    expect(Math.hypot(knob.x - mouth.x, knob.y - mouth.y)).toBeLessThan(rest.r * 2);

    // The stub logs a `Path2D`'s builders but not the context's own, and the
    // lips are the context's: `moveTo` goes into the same log on its way past.
    const { ctx } = stubCanvas();
    const log: string[] = [];
    ctx.log = log;
    const r3 = (v: number) => Math.round(v * 1000) / 1000;
    const spy = new Proxy(ctx, {
      get(target, prop, receiver) {
        const got = Reflect.get(target, prop, receiver);
        if (prop !== "moveTo") return got;
        return (x: number, y: number) => {
          log.push(`moveTo(${r3(x)}, ${r3(y)})`);
          return got.call(target, x, y);
        };
      },
    }) as unknown as CanvasRenderingContext2D;
    drawMaze(spy, l, CFG, m, "p1", 3, 0, 0);
    const knobArc = `Path2D.arc(${r3(knob.x)}, ${r3(knob.y)}, ${r3(rest.r)},`;
    const disc = log.map((op) => op.startsWith(knobArc)).lastIndexOf(true);
    const lips = mazeFunnelLips(CFG, w, d, mazeEntranceAngle(w, m.angleMilli, 0)).map((lip) =>
      log.indexOf(`moveTo(${r3(lip.from.x)}, ${r3(lip.from.y)})`),
    );
    expect(disc).toBeGreaterThanOrEqual(0);
    expect(lips.length).toBe(2);
    for (const lip of lips) expect(lip).toBeGreaterThan(disc);
  });
});
