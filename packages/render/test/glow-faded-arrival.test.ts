import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DAVIT_UNREAD,
  davitBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { drawDavit } from "../src/davit-draw.js";
import { davitStood } from "../src/davit-pose.js";
import { computeLayout } from "../src/layout.js";
import { drawMantle } from "../src/mantle-draw.js";
import { MantleFx } from "../src/mantle-fx.js";
import { mantleArrived } from "../src/mantle-pose.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";
import { marks } from "./glow-marks.js";
import { hung, still } from "./mantle-frame-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MANTLE and THE DAVIT arriving, half a beat into their opening "still"
 * and faded by `ctx.globalAlpha` as a whole, draw nothing brighter than that
 * fade. Before, their glows (`strokeGlow`) put the alpha back at 1 and every
 * plate, handle and hook after the first glow came in whole over a shell that
 * was meant to be arriving. And THE DAVIT stands up once: a step lit the
 * instant it begins draws the boom whole, where it used to go out and stow.
 */

beforeAll(installCanvasGlobals);

const l = computeLayout(VIEWPORT, CFG, "test");
const EPS = 1e-9;

describe("a boss arriving", () => {
  it("THE MANTLE draws nothing brighter than its arrival", () => {
    const world = hung();
    const s = still(world);
    s.phaseBeat = world.beat;
    const fade = 0.2 + 0.8 * mantleArrived(s, CFG, world.beat, 0.5);
    expect(fade).toBeLessThan(0.5);
    const fx = new MantleFx();
    const { at, after } = marks((c) => drawMantle(c, l, world, s, world.beat, 0.5, 0, fx));
    expect(at.length).toBeGreaterThan(10);
    expect(Math.max(...at)).toBeLessThanOrEqual(fade + EPS);
    expect(after).toBe(1);
  });

  it("THE DAVIT draws nothing brighter than its standing up", () => {
    const world = davitWorld();
    const s = boom(world, "still");
    const fade = davitStood(s, world.beat, 0.5, CFG.davitStillBeats);
    expect(fade).toBeLessThan(0.5);
    const { at } = marks((c) => drawDavit(c, l, world, s, world.beat, 0.5, 0));
    expect(at.length).toBeGreaterThan(5);
    expect(Math.max(...at)).toBeLessThanOrEqual(fade + EPS);
  });

  it.each(["lit", "rest"] as const)(
    "THE DAVIT stands whole the instant a %s step begins",
    (phase) => {
      const world = davitWorld();
      const s = boom(world, phase);
      expect(davitStood(s, world.beat, 0, CFG.davitStillBeats)).toBe(1);
      const { at } = marks((c) => drawDavit(c, l, world, s, world.beat, 0, 0));
      expect(Math.max(...at)).toBe(1);
    },
  );
});

/** A world with the boom installed, a few beats along, as `davit-frame.test.ts` stands it. */
function davitWorld(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("davit");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  return world;
}

/** The boom in `phase`, begun this very beat, the cursor at 0. */
function boom(world: World, phase: "still" | "lit" | "rest") {
  const s = davitBoss(world);
  if (s === null) throw new Error("the davit wave installed no boom");
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.aimMilli = 0;
  s.pivotLit = false;
  s.tiltMilli = [DAVIT_UNREAD, DAVIT_UNREAD];
  s.holding = [false, false];
  return s;
}
