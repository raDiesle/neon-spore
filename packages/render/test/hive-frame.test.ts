import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HiveState,
  hiveBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
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
 * THE HIVE's mass, its sites shut, swelling, open and scarred, and its end,
 * on all three screens.
 *
 * The states are **set** rather than played to, `scuttle-frame.test.ts`'s
 * arrangement: `sim/test/hive.test.ts` proves the cadence, the seal, the
 * provoke and the spill, and what this file asks is whether every branch of
 * the picture is one a canvas accepts — shut, a breach open, a scar, a site
 * swelling, twins swelling, down, out — and the two things nothing else in
 * the suite could catch: that a breach's **colour** is on the pilot's screen
 * and not the navigator's, that the **swell** is on the navigator's and not
 * the pilot's; and that the clench is a transient the next run does not
 * inherit.
 */

/**
 * The canvas, and one throwaway frame a seat: the first frame drawn at a
 * size lays down a sprite the frames after it `drawImage`, and two pictures
 * this file says are the same have to be two frames after that one.
 */
beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/**
 * A world with the mass in, stepped enough beats that every `*Beat` field an
 * arrangement sets in the past is still a beat the world has seen — a
 * `downBeat` before beat zero would read as a mass that hangs. That is past
 * the look, so the first site has opened; `shut` closes it again.
 */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("hive");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.hiveOutBeats + 2); i++) step(world, []);
  return world;
}

/** The mass with every site shut and the look just begun: nothing open, nothing swelling. */
function shut(world: World): HiveState {
  const s = hiveBoss(world);
  if (s === null) throw new Error("the hive wave hung no mass");
  s.opened = 0;
  s.sealed = s.sealed.map(() => false);
  s.openBeat = world.beat;
  s.spillBeat = world.beat;
  s.downBeat = -1;
  return s;
}

/** The first `n` sites open, every one red, the next opening a whole cadence away. */
function open(world: World, n = 2): HiveState {
  const s = shut(world);
  s.opened = n;
  for (let i = 0; i < n; i++) s.colors[i] = "red";
  s.openBeat = world.beat;
  return s;
}

/** Two sites open and the third a beat into its swell, so the swell is more than nothing. */
function swelling(world: World, n = 2): HiveState {
  const s = open(world, n);
  s.openBeat = world.beat - (CFG.hiveOpenBeats - CFG.hiveSwellBeats) - 1;
  return s;
}

/** The first three opened and sealed again: three scars, nothing open. */
function scarred(world: World): HiveState {
  const s = open(world, 3);
  for (let i = 0; i < 3; i++) s.sealed[i] = true;
  return s;
}

/** Every site sealed, the last of them a beat ago. */
function down(world: World): HiveState {
  const s = shut(world);
  s.opened = s.cols.length;
  s.sealed = s.sealed.map(() => true);
  s.downBeat = world.beat - 1;
  return s;
}

function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the mass shut and then set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  shut(world);
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE HIVE's mass", () => {
  it.each(ROLES)("draws the mass in its wax on %s", (role) => {
    const f = frame(role, () => {});
    expect(f.calls).toBeGreaterThan(200);
    expect(f.text).toContain(PALETTE.bile);
  });

  it("puts a breach's colour on the pilot's screen and not the navigator's", () => {
    // An open breach is red on the screen shown the colour, and the same
    // breaches recoloured cyan are the same picture on the screen that is not.
    const red = (role: ViewRole) => frame(role, open);
    const cyan = (role: ViewRole) =>
      frame(role, (w) => {
        const s = open(w);
        s.colors[0] = "cyan";
        s.colors[1] = "cyan";
      });
    const bare = (role: ViewRole) => frame(role, () => {});
    expect(count(red("p1").text, PALETTE.red)).toBeGreaterThan(count(bare("p1").text, PALETTE.red));
    expect(count(red("test").text, PALETTE.red)).toBeGreaterThan(
      count(bare("test").text, PALETTE.red),
    );
    expect(count(red("p2").text, PALETTE.red)).toBe(count(bare("p2").text, PALETTE.red));
    expect(red("p1").text).not.toBe(cyan("p1").text);
    expect(red("test").text).not.toBe(cyan("test").text);
    expect(red("p2").text).toBe(cyan("p2").text);
    // The navigator's breach is grey, and it is still a breach: another picture than none.
    expect(count(red("p2").text, PALETTE.dim)).toBeGreaterThan(count(bare("p2").text, PALETTE.dim));
  });

  it("puts the swell on the navigator's screen and not the pilot's", () => {
    // The next site a beat into its swell is another picture than the same
    // sites with the opening a whole cadence away, on the screen shown the
    // swell — and the same one where it is not.
    const still = (role: ViewRole) => frame(role, open);
    const bulge = (role: ViewRole) => frame(role, swelling);
    expect(bulge("p2").text).not.toBe(still("p2").text);
    expect(bulge("test").text).not.toBe(still("test").text);
    expect(bulge("p1").text).toBe(still("p1").text);
    expect(count(bulge("p2").text, PALETTE.bileRim)).toBeGreaterThan(
      count(still("p2").text, PALETTE.bileRim),
    );
  });

  it("swells two sites at once from the twin count, on the navigator's screen", () => {
    const one = frame("p2", (w) => swelling(w, CFG.hiveTwinFrom - 1));
    const two = frame("p2", (w) => swelling(w, CFG.hiveTwinFrom));
    const oneStill = frame("p2", (w) => open(w, CFG.hiveTwinFrom - 1));
    const twoStill = frame("p2", (w) => open(w, CFG.hiveTwinFrom));
    expect(
      count(two.text, PALETTE.bileRim) - count(twoStill.text, PALETTE.bileRim),
    ).toBeGreaterThan(count(one.text, PALETTE.bileRim) - count(oneStill.text, PALETTE.bileRim));
  });

  it.each(ROLES)("stitches a scar over a sealed site, on %s", (role) => {
    const bare = frame(role, () => {});
    const sealed = frame(role, scarred);
    expect(count(sealed.text, PALETTE.hullRim)).toBeGreaterThan(count(bare.text, PALETTE.hullRim));
    expect(count(sealed.text, PALETTE.red)).toBe(count(bare.text, PALETTE.red));
  });

  it.each(ROLES)("closes the mass and fades it once the last site is sealed, on %s", (role) => {
    const going = frame(role, down);
    const stood = frame(role, () => {});
    expect(count(going.text, PALETTE.bile)).toBeLessThan(count(stood.text, PALETTE.bile));
    const wax = rgba(PALETTE.bileDeep, 0.8).slice(0, -5);
    expect(count(going.text, wax)).toBeGreaterThan(0);
    const gone = frame(role, (w) => {
      down(w).downBeat = w.beat - CFG.hiveOutBeats - 1;
    });
    expect(count(gone.text, wax)).toBe(0);
    expect(count(gone.text, PALETTE.bile)).toBe(0);
  });

  it("keeps the clench and the jolt as transients the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest(
      [
        { type: "hiveWrong", col: 5 },
        { type: "hiveSeal", col: 5, left: 3 },
      ],
      L,
      0,
      () => 0,
      CFG,
    );
    fx.update(1 / 60, L);
    expect(fx.boss.hive.clench).toBeGreaterThan(0);
    expect(fx.boss.hive.jolt).toBeGreaterThan(0);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
