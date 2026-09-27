import { afterEach, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { type Creature, createWorld, startWave, type World } from "@neon-spore/sim";
import { cairnBody, cairnUnits } from "../src/cairn.js";
import { drawCairnSettle } from "../src/cairn-settle.js";
import { computeLayout } from "../src/layout.js";
import { OUTLINE_PARTS, PART } from "../src/outline-parts.js";
import { correlation, FPS, maxSpeed, sample } from "./drift-stats.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * THE CAIRN's stones rocking on one another (`cairn-rock.ts`): each stone's top
 * moves far enough to be seen from its seat and no further, the apex carries
 * the courses under it, no two stones rock in step, and the ring on the stone
 * that goes next stands on it wherever it has rocked to.
 */

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const saved = { ...OUTLINE_PARTS };
afterEach(() => Object.assign(OUTLINE_PARTS, saved));

function pile(): { world: World; body: Creature } {
  const world = createWorld(CFG, 3);
  const index = waveWith("cairn");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "cairn") throw new Error("no cairn");
  const body = cairnBody(world, world.boss);
  if (!body) throw new Error("no pile");
  return { world, body };
}

/** How far each stone stands from where it stands at rest, in tiles, over ten minutes. */
function reach(body: Creature, seconds = 600): number[] {
  const rest = cairnUnits(L, body, 7, 0, 0);
  const worst = rest.map(() => 0);
  for (let f = 0; f <= seconds * 10; f++) {
    const t = f / 10;
    const still = cairnUnits(L, body, 7, t, 0);
    const moved = cairnUnits(L, body, 7, t, 1);
    for (const [i, u] of moved.entries()) {
      const s = still[i] as (typeof still)[number];
      worst[i] = Math.max(worst[i] as number, Math.hypot(u.x - s.x, u.y - s.y) / L.tile);
    }
  }
  return worst;
}

describe("THE CAIRN's stones", () => {
  test("ship rocking, and stand where they did at rest when hushed or held at 0", () => {
    const { body } = pile();
    expect(saved.cairn).toBe(1);
    const rest = (hush: number) => cairnUnits(L, body, 7, 41.3, hush);
    expect(rest(0).every((u) => u.rock === 0)).toBe(true);
    OUTLINE_PARTS.cairn = 0;
    expect(rest(1)).toEqual(rest(0));
  });

  test("each stone's top moves far enough to be seen from its seat, and never past `PART.tip`", () => {
    const { body } = pile();
    const r = cairnUnits(L, body, 7, 0, 0)[0]?.r ?? 0;
    for (let slot = 0; slot < 7; slot++) {
      const rocks = sample((t) => cairnUnits(L, body, 7, t, 1)[slot]?.rock ?? 0, 600);
      const top = Math.max(...rocks.map((a) => Math.abs(2 * r * Math.sin(a)))) / L.tile;
      expect(top).toBeLessThanOrEqual(PART.tip);
      expect(top).toBeGreaterThan(PART.tip * 0.6);
    }
  });

  test("the apex carries the courses under it, so it wanders furthest", () => {
    const { body } = pile();
    const worst = reach(body);
    const base = Math.max(...worst.slice(0, 4));
    expect(worst[6] as number).toBeGreaterThan(base);
    // Half a stone's height at most over the base course's worst, three stones up.
    expect(worst[6] as number).toBeLessThan(3 * PART.tip);
  });

  test("no two stones rock in step, and none faster than 30° a second", () => {
    const { body } = pile();
    const rocks = Array.from({ length: 7 }, (_, slot) =>
      sample((t) => cairnUnits(L, body, 7, t, 1)[slot]?.rock ?? 0, 120),
    );
    for (let a = 0; a < 7; a++) {
      expect(maxSpeed(rocks[a] as number[])).toBeLessThanOrEqual(30);
      for (let b = a + 1; b < 7; b++)
        expect(Math.abs(correlation(rocks[a] as number[], rocks[b] as number[]))).toBeLessThan(0.3);
    }
  });

  test("the ring on the stone that goes next stands on it where it has rocked to", () => {
    const { world, body } = pile();
    if (world.boss?.kind !== "cairn") throw new Error("no cairn");
    const boss = world.boss;
    // The widest moment of the apex in the first minute.
    let at = 0;
    let far = 0;
    for (let f = 0; f < 60 * FPS; f++) {
      const t = f / FPS;
      const d = Math.abs(
        (cairnUnits(L, body, 7, t, 1)[6]?.x ?? 0) - (cairnUnits(L, body, 7, t, 0)[6]?.x ?? 0),
      );
      if (d > far) [far, at] = [d, t];
    }
    expect(far).toBeGreaterThan(L.tile * 0.25);
    const apex = cairnUnits(L, body, boss.units, at, 1)[boss.units - 1];
    const { ctx } = stubCanvas();
    ctx.log = [];
    drawCairnSettle(ctx as unknown as CanvasRenderingContext2D, L, world, boss, body, 0.5, at, 1);
    const arc = ctx.log.find((op) => op.startsWith("arc("));
    expect(arc).toBeDefined();
    const [x, y] = (arc as string).slice(4).split(",").map(Number);
    expect(Math.abs((x as number) - (apex?.x ?? 0))).toBeLessThan(L.tile * 0.06);
    expect(Math.abs((y as number) - (apex?.y ?? 0))).toBeLessThan(0.5);
  });
});
