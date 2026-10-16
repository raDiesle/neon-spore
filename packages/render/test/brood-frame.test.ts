import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BroodState,
  broodBoss,
  createWorld,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { broodRimOver, broodSacAt } from "../src/brood-place.js";
import { broodOutline } from "../src/brood-shape.js";
import { rgba } from "../src/hex.js";
import { computeLayout, tileCX, tileCY, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
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
 * THE BROOD, drawn (`render/src/brood-draw.ts`): the sac on all three
 * screens, a bud hanging in its colour and a dropped one's nub, its rig and a
 * body about to be laid seen inside it, a lobe on the rim for every bud still to pop, the half turn of a rest, the belly level
 * with the row a bolt is met on, and the sac beaten — set rather than played
 * to; `sim/test/brood.test.ts` proves the rules.
 */

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");
const RIM = rgba(PALETTE.organRim, 0.8);

/** The wave's own sac, down and growing its first bud. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("brood");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.broodEnterBeats + 1); i++) step(world, []);
  return world;
}

function brood(world: World): BroodState {
  const s = broodBoss(world);
  if (s === null) throw new Error("the brood wave hung no sac");
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
function frame(role: ViewRole, arrange: (world: World, s: BroodState) => void = () => {}): string {
  const world = hung();
  arrange(world, brood(world));
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

const count = (text: string, colour: string): number => text.split(colour).length - 1;

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role);
});

describe("THE BROOD's sac", () => {
  it.each(ROLES)("hangs over the field on %s", (role) => {
    expect(count(frame(role), RIM)).toBeGreaterThan(0);
  });

  it.each(ROLES)("draws a bud in its colour, and a dropped one's nub, on %s", (role) => {
    const none = frame(role, (_, s) => {
      s.buds = [];
    });
    const red = frame(role, (w, s) => {
      s.buds = [{ col: midCol(CFG), color: "red", bornBeat: w.beat - 2, popped: false }];
    });
    const regrowing = frame(role, (w, s) => {
      s.buds = [{ col: midCol(CFG), color: "red", bornBeat: w.beat + 2, popped: false }];
    });
    expect(count(red, PALETTE.red)).toBeGreaterThan(count(none, PALETTE.red));
    const nub = rgba(PALETTE.redDark, 0.9);
    expect(count(regrowing, nub)).toBeGreaterThan(count(none, nub));
    expect(count(regrowing, PALETTE.red)).toBeLessThan(count(red, PALETTE.red));
  });

  it.each(ROLES)(
    "hangs in its rig, and shows a body it is about to lay inside it, on %s",
    (role) => {
      const none = frame(role, (_, s) => {
        s.buds = [];
        s.eggs = [];
      });
      const egg = frame(role, (w, s) => {
        s.buds = [];
        s.eggs = [{ col: midCol(CFG) - 2, color: "cyan", layBeat: w.beat + 1 }];
      });
      const metal = rgba(PALETTE.rock, 0.75);
      expect(count(none, metal)).toBeGreaterThan(0);
      expect(count(egg, PALETTE.cyan)).toBeGreaterThan(count(none, PALETTE.cyan));
      expect(count(egg, rgba(PALETTE.cyanDark, 0.95))).toBeGreaterThan(0);
    },
  );

  it("carries a lobe on its rim for every bud still to pop", () => {
    const s = brood(hung());
    const sac = broodSacAt(L, CFG, s, s.phaseBeat, 0);
    const top = (lobes: number) => Math.min(...broodOutline(sac, lobes, L.tile, 0).map((p) => p.y));
    expect(top(10)).toBeLessThan(top(0));
    expect(frame("p1", (_, st) => (st.cursor = 5))).not.toBe(frame("p1"));
  });

  it("hangs its belly on the row a bolt is met on, across every column it covers", () => {
    const s = brood(hung());
    const sac = broodSacAt(L, CFG, s, s.phaseBeat, 0);
    const row = tileCY(L, CFG.broodBudRow);
    for (let d = -CFG.broodSpan; d <= CFG.broodSpan; d++) {
      const y = broodRimOver(sac, tileCX(L, midCol(CFG) + d));
      expect(Math.abs(y - row), `column ${d} from the middle`).toBeLessThan(L.tile * 0.4);
    }
  });

  it("turns half round in a rest, and not while a bud hangs", () => {
    const s = brood(hung());
    const growing = broodSacAt(L, CFG, s, s.phaseBeat, 0).turn;
    s.phase = "rest";
    s.cursor = 1;
    const midway = broodSacAt(L, CFG, s, s.phaseBeat + CFG.broodRestBeats / 2, 0).turn;
    const done = broodSacAt(L, CFG, s, s.phaseBeat + CFG.broodRestBeats, 0).turn;
    expect(growing).toBe(0);
    expect(midway).toBeGreaterThan(0);
    expect(done).toBeCloseTo(Math.PI);
  });

  it.each(ROLES)("greys and sags away once beaten, on %s", (role) => {
    const spent = frame(role, (w, s) => {
      s.phase = "spent";
      s.phaseBeat = w.beat;
      s.buds = [];
    });
    expect(count(spent, rgba(PALETTE.dim, 0.8))).toBeGreaterThan(0);
    expect(count(spent, RIM)).toBe(0);
  });
});
