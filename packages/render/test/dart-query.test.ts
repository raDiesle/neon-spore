import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SpawnEntry,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "../src/creature-place.js";
import { drawDartQueries } from "../src/dart-query.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * **Player 1's mark must say "ask" and it must never say "left".**
 *
 * Two arrows and a question mark, and the whole creature rests on the pilot
 * being unable to read a side out of them. Nothing about that would throw or
 * look wrong if it broke: a mark that leaned even slightly toward the side the
 * body is really taking would quietly make the navigator unnecessary, and the
 * pair would stop talking about darts — which is the one thing this game is
 * for. So the check is on the drawn calls themselves: draw the same body
 * twice, once aimed each way, and the two pictures have to be one picture.
 */

installCanvasGlobals();

const CFG: SimConfig = DEFAULT_CONFIG;
const SCREEN = { width: 900, height: 1600, dpr: 1 };
const dart: SpawnEntry = { beat: 0, col: 4, kind: "dart", color: "red" };

/** A dart on the field, hanging, aimed at `dir` and standing exactly where a
 * dart aimed the other way would stand. */
function hanging(dir: -1 | 1) {
  const world = createWorld({ ...CFG }, 1, [dart]);
  for (let t = 0; t < ticksPerBeat(CFG); t++) step(world, []);
  const c = world.creatures[0];
  if (!c) throw new Error("no dart on the field");
  c.dartFloat = true;
  c.dartDir = dir;
  c.dartNext = dir;
  return world;
}

/** The calls the pilot's mark makes, through the canvas that refuses what a
 * real one refuses. */
function marks(dir: -1 | 1, role: ViewRole = "p1"): string[] {
  const { ctx } = stubCanvas();
  ctx.log = [];
  drawDartQueries(
    ctx as unknown as CanvasRenderingContext2D,
    computeLayout(SCREEN, CFG, role),
    hanging(dir),
    0.5,
  );
  return ctx.log ?? [];
}

/** Every point the mark puts a pen on, which the strict stub does not keep. */
function points(dir: -1 | 1): { x: number; y: number }[] {
  const seen: { x: number; y: number }[] = [];
  const at = (x: number, y: number) => {
    seen.push({ x, y });
  };
  const ctx = {
    save() {},
    restore() {},
    beginPath() {},
    closePath() {},
    stroke() {},
    fill() {},
    moveTo: at,
    lineTo: at,
    arc: at,
  };
  drawDartQueries(
    ctx as unknown as CanvasRenderingContext2D,
    computeLayout(SCREEN, CFG, "p1"),
    hanging(dir),
    0.5,
  );
  return seen;
}

describe("the pilot's dart mark", () => {
  it("is the same picture whichever way the body is really going", () => {
    expect(marks(-1)).toEqual(marks(1));
    expect(points(-1)).toEqual(points(1));
  });

  it("reaches down both diagonals, so neither side is the answer", () => {
    const layout = computeLayout(SCREEN, CFG, "p1");
    const cx = layout.gridLeft + layout.tile * 4.5;
    const xs = points(1).map((p) => p.x);
    expect(Math.min(...xs)).toBeLessThan(cx - layout.tile * 0.2);
    expect(Math.max(...xs)).toBeGreaterThan(cx + layout.tile * 0.2);
  });

  it("stands clear of the body it is about", () => {
    const world = hanging(1);
    const c = world.creatures[0];
    if (!c) throw new Error("no dart on the field");
    const { y } = creatureCenter(computeLayout(SCREEN, CFG, "p1"), c, 0.5);
    const r = creatureRadius(computeLayout(SCREEN, CFG, "p1"), c, 0.5, CFG);
    // Every point of it above the body's own contour: a mark drawn across the
    // thing it is about is a mark read as part of that thing.
    for (const p of points(1)) expect(p.y).toBeLessThan(y - r);
  });

  it("is on the pilot's screen and nowhere else", () => {
    expect(marks(1, "p1").length).toBeGreaterThan(0);
    // The seats that are shown the real answer get the legs and the
    // placeholder instead — this half beside them would be a contradiction.
    expect(marks(1, "p2")).toHaveLength(0);
    expect(marks(1, "test")).toHaveLength(0);
  });
});
