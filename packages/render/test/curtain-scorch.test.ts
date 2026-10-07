import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { curtainBody, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { NO_GIVE } from "../src/curtain-give.js";
import { type ClothAt, CurtainScorch } from "../src/curtain-scorch.js";
import { curtainThin } from "../src/curtain-thin.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { body, stood } from "./curtain-harness.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";

/**
 * THE CURTAIN's cloth keeps where a bolt struck it (`curtain-scorch.ts`) and
 * thins where a hand strains it against the jammed rail (`curtain-thin.ts`),
 * the two parts of §6's look that were *not drawn still*.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const T = L.tile;
const SPB = ticksPerBeat(CFG) / CFG.tickHz;

/** The sheet hung at `col`, its left edge a tile on per column. */
function cloth(col: number): ClothAt {
  return { col, x0: 100 + col * T, railY: 50, hemY: 150, lag: 0, give: NO_GIVE };
}

function bolt(col: number, row = CFG.curtainRow) {
  return { type: "bounce", col, row, color: "red" } as const;
}

/** The covered sheet, run for a beat with a bolt into its cloth on the first tick, or none. */
function struck(hit: boolean): string {
  const world = stood(false);
  const sheet = curtainBody(world, body(world));
  if (sheet === undefined) throw new Error("no fabric");
  const log: string[] = [];
  runFrames(world, "p2", ticksPerBeat(CFG), {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w: World) => {
      step(w, []);
      if (hit && tick === 0) w.events.push(bolt(sheet.col + 2));
    },
  });
  return log.join("|");
}

describe("THE CURTAIN keeps where a bolt struck its cloth", () => {
  it("draws a hot scorch where the bolt bounced", () => {
    const count = (s: string) => s.split(PALETTE.ember).length - 1;
    expect(count(struck(true))).toBeGreaterThan(count(struck(false)));
  });

  it("rides the sheet when it is shoved a column", () => {
    const s = new CurtainScorch();
    s.ingest([bolt(5)], CFG, SPB);
    const [before] = s.placed(T, cloth(3));
    const [after] = s.placed(T, cloth(4));
    expect(before).toBeDefined();
    expect((after?.x ?? 0) - (before?.x ?? 0)).toBeCloseTo(T, 6);
    // On the cloth between the rail and the hem, nearer the hem a bolt meets.
    expect(before?.y ?? 0).toBeGreaterThan(100);
    expect(before?.y ?? 0).toBeLessThan(150);
  });

  it("heals over its beats and is gone after them", () => {
    const s = new CurtainScorch();
    s.ingest([bolt(5)], CFG, SPB);
    s.update(SPB);
    const fresh = s.placed(T, cloth(3))[0]?.fresh ?? 0;
    expect(fresh).toBeGreaterThan(0);
    expect(fresh).toBeLessThan(1);
    s.update(4 * SPB);
    expect(s.placed(T, cloth(3))).toEqual([]);
  });

  it("marks nothing for a bounce off another row, or off the sheet's edge", () => {
    const s = new CurtainScorch();
    s.ingest([bolt(5, CFG.curtainRow + 3)], CFG, SPB);
    expect(s.placed(T, cloth(3))).toEqual([]);
    s.ingest([bolt(1)], CFG, SPB);
    expect(s.placed(T, cloth(3))).toEqual([]);
  });
});

describe("THE CURTAIN thins under a hand on the jammed rail", () => {
  const give = { x: 200, across: 0.4 * T, sag: 0.26 * T, spread: 1.7 * T };

  it("thins only while the rail is pinned and a hand holds the cloth", () => {
    const world = stood(false);
    const c = body(world);
    expect(curtainThin(L, c, give, 100)).toBeNull();
    c.phase = "pinned";
    expect(curtainThin(L, c, NO_GIVE, 100)).toBeNull();
    const thin = curtainThin(L, c, give, 100);
    expect(thin?.amount ?? 0).toBeGreaterThan(0);
    // Round the hand, which the cloth has carried towards where it pulls.
    expect(thin?.x).toBeCloseTo(200 + 0.4 * T, 6);
  });

  it("thins further the harder the cloth is strained", () => {
    const world = stood(false);
    const c = body(world);
    c.phase = "pinned";
    const one = curtainThin(L, c, give, 100)?.amount ?? 0;
    const apart = curtainThin(L, c, { ...give, sag: 0.6 * T }, 100)?.amount ?? 0;
    expect(apart).toBeGreaterThan(one);
    expect(apart).toBeLessThanOrEqual(1);
  });

  it.each(ROLES)("draws the strained fibres on %s", (role) => {
    const held = stood(false);
    const c = body(held);
    c.phase = "pinned";
    c.phaseBeat = held.beat;
    held.gripP1 = c.creatureId;
    const loose = stood(false);
    const d = body(loose);
    d.phase = "pinned";
    d.phaseBeat = loose.beat;
    const rims = (w: World) => {
      const log: string[] = [];
      runFrames(w, role, 3, {
        every: 3,
        onCanvas: (k) => {
          k.log = log;
        },
      });
      return log.join("|").split(PALETTE.hullRim).length - 1;
    };
    expect(rims(held)).toBeGreaterThan(rims(loose));
  });
});
