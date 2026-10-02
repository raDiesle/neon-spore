import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CapstanState,
  type CapstanStep,
  capstanBoss,
  createWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { capstanCover, capstanJudder, capstanTurn } from "../src/capstan-pose.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

/** The shot's colour as the lit core is drawn in it: `drawLitCore`'s light and
 * ring are `rgba` of it, whatever the beat, and a gradient's stops are not in
 * the stub's log, so it is counted by its prefix (`lit-core.ts`). */
const CYAN_LIT = rgba(PALETTE.cyan, 0).slice(0, -2);

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CAPSTAN, drawn (`render/src/capstan-draw.ts`): the drum on its cradle
 * with a horn lit for the lean, the cradle rocked by the steering seat's
 * tilt, the bared face's band lit and worn bright mark by mark, the core lit
 * in a shot's colour under a cap that creeps back through a hold, and the
 * drum spent, and what a receipt leaves for a moment after — on all three
 * screens, set rather than played to;
 * `sim/test/capstan.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const TPB = ticksPerBeat(CFG);
const LEFT: CapstanStep = { ask: "left", color: "either", beats: 10 };
const HOLD: CapstanStep = { ask: "hold", color: "either", beats: 8 };
const FIRE: CapstanStep = { ask: "fire", color: "cyan", beats: 3 };

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("capstan");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The drum standing, `lit` under the cursor `beats` beats in, unworn, level and covered. */
function posed(world: World, lit: CapstanStep | null, beats = 1): CapstanState {
  const s = capstanBoss(world);
  if (s === null) throw new Error("the capstan wave stood no drum");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - beats;
  s.cursor = 0;
  s.wear = [0, 0];
  s.hits = 0;
  s.bared = false;
  s.pullMilli = [0, 0];
  s.rubs = [0, 0];
  s.rubbed = false;
  s.heldBeats = 0;
  if (lit !== null) s.steps[0] = lit;
  return s;
}

/** The left step with the pilot leaning it all the way over. */
function leant(world: World): CapstanState {
  const s = posed(world, LEFT);
  s.pullMilli = [-world.cfg.capstanPullMilli, 0];
  return s;
}

/** The frames of a pose, with `thrown` pushed onto the first tick's events. */
function frame(role: ViewRole, arrange: (world: World) => void, thrown?: SimEvent): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (tick === 0 && thrown) w.events.push(thrown);
    },
  });
  return log.join("|");
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

describe("THE CAPSTAN's cradle", () => {
  // The horn is the steering seat's pull arrow (`capstan-marks.ts`): a left
  // step is the pilot's to steer, so it lights on his screen and the rig's,
  // and the navigator's shows her no way for a pull that is not hers.
  it.each(["p1", "test"] as const)(
    "lights the horn a band step asks the lean toward, on %s",
    (role) => {
      const resting = frame(role, (w) => posed(w, null));
      const asked = frame(role, (w) => posed(w, LEFT));
      expect(count(asked, PALETTE.hullRim)).toBeGreaterThan(count(resting, PALETTE.hullRim));
    },
  );

  it("lights no horn for a band step on the seat that does not steer it", () => {
    const resting = frame("p2", (w) => posed(w, null));
    const asked = frame("p2", (w) => posed(w, LEFT));
    expect(count(asked, PALETTE.hullRim)).toBe(count(resting, PALETTE.hullRim));
  });

  it.each(ROLES)("rocks the drum over as the steering seat leans, on %s", (role) => {
    const level = frame(role, (w) => posed(w, LEFT));
    const over = frame(role, (w) => leant(w));
    expect(over).not.toBe(level);
  });

  it("follows the steering seat's tilt, and the phone leaning further when nobody steers", () => {
    const world = stood();
    const s = posed(world, LEFT);
    const lean = world.cfg.capstanPullMilli;
    s.pullMilli = [-lean / 2, lean];
    expect(capstanTurn(world, s)).toBeCloseTo(-0.5);
    s.pullMilli = [-lean * 3, 0];
    expect(capstanTurn(world, s)).toBe(-1);
    posed(world, FIRE);
    s.pullMilli = [lean / 4, -lean / 2];
    expect(capstanTurn(world, s)).toBeCloseTo(-0.5);
    s.phase = "open";
    expect(capstanTurn(world, s)).toBe(0);
  });
});

describe("THE CAPSTAN's bands", () => {
  it.each(ROLES)("lights the bared face's band while it is the one to rub, on %s", (role) => {
    const leaning = frame(role, (w) => {
      const s = posed(w, LEFT);
      s.pullMilli = [-w.cfg.capstanPullMilli / 2, 0];
    });
    const bared = frame(role, (w) => leant(w));
    // The horn goes dark as the face comes round and the band's rim lights in its place.
    expect(count(bared, PALETTE.hullRim)).toBeGreaterThan(0);
    expect(bared).not.toBe(leaning);
  });

  it.each(ROLES)("scrubs a band's marks bright one reversal at a time, on %s", (role) => {
    const fresh = frame(role, (w) => leant(w));
    const worn = frame(role, (w) => {
      leant(w).wear = [3, 0];
    });
    const bright = frame(role, (w) => {
      leant(w).wear = [w.cfg.capstanWearThreshold, 0];
    });
    expect(count(worn, PALETTE.capstanWorn)).toBeGreaterThan(count(fresh, PALETTE.capstanWorn));
    expect(count(bright, PALETTE.capstanWorn)).toBeGreaterThan(count(worn, PALETTE.capstanWorn));
  });
});

describe("THE CAPSTAN's core and its cap", () => {
  it.each(ROLES)(
    "lights the bared core in the shot's colour, and hits change it, on %s",
    (role) => {
      const covered = frame(role, (w) => posed(w, FIRE));
      const bared = frame(role, (w) => {
        posed(w, FIRE).bared = true;
      });
      expect(count(bared, CYAN_LIT)).toBeGreaterThan(count(covered, CYAN_LIT));
      const hit = frame(role, (w) => {
        const s = posed(w, FIRE);
        s.bared = true;
        s.hits = 2;
      });
      expect(hit).not.toBe(bared);
    },
  );

  it("creeps the cap back through a hold, and the beats the pair keeps push it open", () => {
    const world = stood();
    const s = posed(world, HOLD, 6);
    expect(capstanCover(world, s, world.beat, 0)).toBe(1);
    s.bared = true;
    const loose = capstanCover(world, s, world.beat, 0);
    expect(loose).toBeGreaterThan(0);
    expect(loose).toBeLessThan(1);
    s.heldBeats = 1;
    expect(capstanCover(world, s, world.beat, 0)).toBeLessThan(loose);
    posed(world, FIRE).bared = true;
    expect(capstanCover(world, s, world.beat, 0)).toBe(0);
  });

  it.each(ROLES)("swings the cap wide and lifts the drum away spent, on %s", (role) => {
    const standing = frame(role, (w) => {
      posed(w, null).bared = true;
    });
    const spent = frame(role, (w) => {
      const s = posed(w, null);
      s.bared = true;
      s.phase = "open";
    });
    expect(spent).not.toBe(standing);
  });

  it("draws the same pose the same way twice", () => {
    expect(frame("p1", (w) => leant(w))).toBe(frame("p1", (w) => leant(w)));
  });
});

describe("THE CAPSTAN's rattle", () => {
  it("judders unevenly while it stands, and is nothing at no rattle", () => {
    const a = capstanJudder(1.7, 3);
    const b = capstanJudder(2.3, 3);
    expect(a).not.toEqual(b);
    expect(Math.abs(a.x) + Math.abs(a.y)).toBeGreaterThan(0);
    expect(capstanJudder(1.7, 0)).toEqual({ x: 0, y: 0, roll: 0 });
  });
});

describe("THE CAPSTAN's receipts", () => {
  it.each(ROLES)(
    "flares a face bare metal for a reversal and rings it once bright, on %s",
    (role) => {
      const col = 3;
      const plain = frame(role, (w) => leant(w));
      const scrubbed = frame(role, (w) => leant(w), { type: "capstanWear", side: 0, wear: 1, col });
      const rung = frame(role, (w) => leant(w), { type: "capstanBright", side: 0, col });
      expect(count(scrubbed, PALETTE.capstanWorn)).toBeGreaterThan(
        count(plain, PALETTE.capstanWorn),
      );
      expect(count(rung, PALETTE.capstanWorn)).toBeGreaterThan(count(plain, PALETTE.capstanWorn));
    },
  );

  it.each(ROLES)("flashes the core white on a hit, and reddens the drum, on %s", (role) => {
    const bared = (w: World) => {
      posed(w, FIRE).bared = true;
    };
    const plain = frame(role, bared);
    const hit = frame(role, bared, { type: "capstanHit", hits: 1, col: 3 });
    expect(count(hit, PALETTE.hullRim)).toBeGreaterThan(count(plain, PALETTE.hullRim));
    expect(count(hit, PALETTE.redRim)).toBeGreaterThan(count(plain, PALETTE.redRim));
  });
});
