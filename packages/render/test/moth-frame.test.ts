import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type MothState,
  mothBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { strikeLook } from "../src/boss-strike-look.js";
import { computeLayout, tileCX, tileCY, type ViewRole } from "../src/layout.js";
import { BODY_LIFT, mothPlates, mothPoseAt } from "../src/moth-place.js";
import { FORE, wingOutline, wingPoint } from "../src/moth-shape.js";
import { PALETTE } from "../src/palette.js";
import { stubCanvas } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MOTH, drawn (`render/src/moth-draw.ts`): the moth on all three
 * screens, its lit spots glowing red within and a spot waiting its turn shut
 * dark, each spot over its own column on the row a bolt meets it, a wing
 * torn shorter for every spot shot off it, its belly lit only while it sinks
 * over the cannon on the last step, the edge-on fold of a rest that turns
 * its other face out, and the moth beaten — set rather than played to;
 * `sim/test/moth.test.ts` proves the rules.
 */

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** The wave's own moth, come in and lighting its first spots. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("moth");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.mothEnterBeats + 1); i++) step(world, []);
  return world;
}

function moth(world: World): MothState {
  const s = mothBoss(world);
  if (s === null) throw new Error("the moth wave hung no moth");
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
function frame(role: ViewRole, arrange: (world: World, s: MothState) => void = () => {}): string {
  const world = hung();
  arrange(world, moth(world));
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

const count = (text: string, part: string): number => text.split(part).length - 1;
/** A part lit from within: every `lightWithin` lays its colour in hard light. */
const LIT = "hard-light";

/** The moth on its in-turn step, with `spots` still on its wings. */
const inTurn = (spots: number[]) => (_: World, s: MothState) => {
  s.cursor = 1;
  s.spots = spots;
};

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role);
});

describe("THE MOTH", () => {
  it.each(ROLES)("hangs over the field with its eyespots on %s", (role) => {
    expect(count(frame(role), PALETTE.redDark)).toBeGreaterThan(0);
  });

  it.each(ROLES)(
    "lights a spot from within, and keeps one waiting its turn dark, on %s",
    (role) => {
      const none = frame(role, (_, s) => {
        s.spots = [];
      });
      const one = count(frame(role, inTurn([-2, 2, -1, 1])), LIT) - count(none, LIT);
      const all = (_: World, s: MothState) => {
        s.cursor = 2;
        s.spots = [-2, -1, 1, 2];
      };
      const four = count(frame(role, all), LIT) - count(none, LIT);
      expect(one).toBeGreaterThan(0);
      expect(four).toBe(4 * one);
    },
  );

  it("hangs each spot over its own column, on the row a bolt meets it", () => {
    const s = moth(hung());
    for (const time of [0, 0.13, 0.31, 0.57]) {
      const p = mothPoseAt(L, CFG, s, s.phaseBeat + 1, 0, time);
      for (const off of [-2, -1, 1, 2]) {
        const at = wingPoint(p, L.tile, off < 0 ? -1 : 1, { x: Math.abs(off), y: BODY_LIFT });
        expect(Math.abs(at.x - tileCX(L, s.centre + off))).toBeLessThan(L.tile * 0.5);
        expect(Math.abs(at.y - tileCY(L, CFG.mothRow))).toBeLessThan(L.tile * 0.5);
      }
    }
  });

  it("tears a wing shorter for every spot shot off it", () => {
    const s = moth(hung());
    const p = mothPoseAt(L, CFG, s, s.phaseBeat, 0, 0);
    const reach = (tears: number) =>
      Math.max(...wingOutline(p, L.tile, FORE, 1, tears).map((q) => q.x));
    expect(reach(1)).toBeLessThan(reach(0));
    expect(reach(3)).toBeLessThan(reach(1));
  });

  it.each(ROLES)("lights its belly only while it sinks over the cannon, on %s", (role) => {
    const last = (settle: number) => (w: World, s: MothState) => {
      s.cursor = 3;
      s.spots = [];
      s.centre = w.cannonCol;
      s.settle = settle;
    };
    const shut = count(frame(role, last(0)), LIT);
    expect(count(frame(role, last(2)), LIT)).toBeGreaterThan(shut);
  });

  it("folds edge on in a rest and opens on its other face", () => {
    const s = moth(hung());
    s.phase = "rest";
    s.cursor = 1;
    const at = (k: number) => mothPoseAt(L, CFG, s, s.phaseBeat, k * CFG.mothRestBeats, 0);
    expect(at(0.5).fold).toBeGreaterThan(0.9);
    expect(at(0.1).face).not.toBe(at(0.9).face);
  });

  it("loses a belly plate for every hit", () => {
    const s = moth(hung());
    s.cursor = 3;
    expect(mothPlates(s)).toBe(4);
    s.hits = 3;
    expect(mothPlates(s)).toBe(1);
  });

  it("droops and fades once beaten", () => {
    const s = moth(hung());
    s.phase = "spent";
    const early = mothPoseAt(L, CFG, s, s.phaseBeat, 0, 0);
    const late = mothPoseAt(L, CFG, s, s.phaseBeat + CFG.mothSpentBeats - 1, 0.9, 0);
    expect(late.alpha).toBeLessThan(early.alpha);
    expect(late.y).toBeGreaterThan(early.y);
  });

  it("lands on the hull in a cloud of scales and rakes it, then is gone", () => {
    const look = strikeLook("moth");
    const from = { x: tileCX(L, 5), y: tileCY(L, CFG.mothRow) };
    const to = { x: from.x, y: L.hullY };
    const f = { l: L, blow: "land", from, to, tile: L.tile, time: 0 };
    const calls = (reach: number, after: number): number => {
      const { ctx } = stubCanvas();
      look(ctx as unknown as CanvasRenderingContext2D, { ...f, reach, after });
      return ctx.calls;
    };
    expect(calls(0.5, 0)).toBeGreaterThan(0);
    expect(calls(1, 0.3)).toBeGreaterThan(calls(0.5, 0));
    expect(calls(1, 1)).toBe(0);
  });
});
