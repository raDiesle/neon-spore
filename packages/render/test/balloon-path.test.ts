import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, type SpawnEntry, step, type World } from "@neon-spore/sim";
import { balloonHandleCircle } from "../src/balloon-handles.js";
import { balloonArc, balloonArcPoint, balloonArcPts } from "../src/balloon-path.js";
import { balloonHandleUnder } from "../src/handles-pairs.js";
import { computeLayout } from "../src/layout.js";
import type { Field } from "../src/touch-field.js";
import { touchMove } from "../src/touch-move.js";
import { CFG, FRAME_TIMEOUT_MS } from "./frame-harness.js";

// Stated here rather than inherited, for `balloon-frame.test.ts`'s reason.
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE BALLOON's handles are carried along a bend, out and down
 * (`balloon-path.ts`), so that the full pull is on the glass from every
 * column — the wall columns included, where a pull straight out ran off the
 * screen — and a thumb that follows the bend reaches taut.
 */

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "test");
const LENGTH = (CFG.balloonTautMilli * L.tile) / 1000;

/** One balloon in every column, stepped until they have all arrived. */
function everyColumn(): World {
  const queue: SpawnEntry[] = [];
  for (let col = 0; col < CFG.cols; col++) {
    queue.push({ beat: 0, col, kind: "balloon", color: null });
  }
  const world = createWorld(CFG, 1, queue);
  for (let t = 0; t < 200 && world.creatures.length < CFG.cols; t++) step(world, []);
  expect(world.creatures.length).toBe(CFG.cols);
  return world;
}

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: null,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("the bend a balloon's handle is carried along", () => {
  it("keeps the whole pull on the glass, from every column", () => {
    const world = everyColumn();
    for (const c of world.creatures) {
      for (const side of [-1, 1] as const) {
        const rest = balloonHandleCircle(L, CFG, c, world.beat, 0, side);
        const pts = balloonArcPts(balloonArc(L, CFG, rest, side), LENGTH);
        for (const p of pts) {
          expect(p.x, `col ${c.col} side ${side}`).toBeGreaterThanOrEqual(rest.r - 1);
          expect(p.x, `col ${c.col} side ${side}`).toBeLessThanOrEqual(L.width - rest.r + 1);
        }
        // Outward and down, never back over the body or up.
        const end = pts[pts.length - 1]!;
        expect(side * (end.x - rest.x)).toBeGreaterThanOrEqual(-0.5);
        expect(end.y).toBeGreaterThan(rest.y + L.tile * 0.5);
      }
    }
  });

  it("bends down out in the open, too — the pull is never level", () => {
    const world = everyColumn();
    const mid = world.creatures.find((c) => c.col === Math.floor(CFG.cols / 2))!;
    const rest = balloonHandleCircle(L, CFG, mid, world.beat, 0, 1);
    const at = balloonArcPoint(balloonArc(L, CFG, rest, 1), 0);
    expect(at.dx).toBeGreaterThan(0);
    expect(at.dy).toBeGreaterThan(0);
  });

  it("answers a thumb that follows it with the full pull, signed by side", () => {
    const world = everyColumn();
    for (const c of world.creatures) {
      for (const [seat, side] of [
        [1, -1],
        [2, 1],
      ] as const) {
        const rest = balloonHandleCircle(L, CFG, c, world.beat, 0, side);
        const field = fieldOf({ ...world, creatures: [c] }, seat);
        const down = balloonHandleUnder(L, rest.x, rest.y, field);
        expect(down, `col ${c.col}`).not.toBeNull();
        const end = balloonArcPoint(balloonArc(L, CFG, rest, side), LENGTH);
        const moved = touchMove(L, down!.hold!, end.x, end.y);
        const cmd = moved?.command;
        if (cmd?.kind !== "drag") throw new Error("no drag");
        expect(Math.abs(cmd.fromMilli - side * CFG.balloonTautMilli)).toBeLessThanOrEqual(2);
      }
    }
  });
});
