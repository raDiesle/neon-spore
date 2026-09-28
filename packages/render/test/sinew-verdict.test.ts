import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  sinewBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { SinewFx } from "../src/sinew-fx.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SINEW's handles answer a touch the way THE INSTAR's marks do**
 * (`instar-verdict.test.ts`, `sinew-marks.ts`): the grip washes the handle
 * green, the other seat's refused press red, and the snap both red — on every
 * screen, since both handles are drawn on both. While a handle asks for its
 * hand, its owner sees a halo under it and the partner the turning ring and a
 * clock on it; a hand on it ends both; and the verdict is a transient the
 * next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** The tendon hung, the hands where `p1` and `p2` say — a pull, or off. */
function hung(p1 = -1, p2 = -1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("sinew");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const s = sinewBoss(world);
  if (s === null) throw new Error("the sinew wave hung no tendon");
  s.pullP1Milli = p1;
  s.pullP2Milli = p2;
  return world;
}

/** Nine ticks drawn, `said` thrown on the first. */
function drawn(role: ViewRole, said: SimEvent[], world: World = hung()): string {
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      if (tick === 0) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, colour: string): number => text.split(colour).length - 1;
const halo = "createRadialGradient";
const theirs = rgba(PALETTE.text, 0.8);
const clock = rgba(PALETTE.text, 0.85);

const gripped: SimEvent = { type: "sinewGrip", col: 4, player: 1 };
const refused: SimEvent = { type: "sinewRefuse", col: 4, player: 2 };
const snapped: SimEvent = { type: "sinewSnap", col: 5, rocks: 1 };

describe("THE SINEW's verdict on a touch", () => {
  it.each(ROLES)("washes the handle green on the grip, on %s", (role) => {
    expect(count(drawn(role, []), PALETTE.good)).toBe(0);
    expect(count(drawn(role, [gripped]), PALETTE.good)).toBeGreaterThan(0);
  });

  it.each(ROLES)("washes it red on a refused press and on the snap, on %s", (role) => {
    const red = (t: string) => count(t, PALETTE.red);
    const quiet = red(drawn(role, []));
    expect(red(drawn(role, [refused]))).toBeGreaterThan(quiet);
    expect(red(drawn(role, [snapped]))).toBeGreaterThan(red(drawn(role, [refused])));
    expect(count(drawn(role, [refused]), PALETTE.good)).toBe(0);
  });

  it("puts the halo on this seat's handle and the partner's ring and clock on theirs", () => {
    for (const role of ["p1", "p2"] as const) {
      const frame = drawn(role, []);
      expect(count(frame, theirs)).toBeGreaterThan(0);
      expect(count(frame, clock)).toBeGreaterThan(0);
    }
    const test = drawn("test", []);
    expect(count(test, theirs)).toBe(0);
    expect(count(test, halo)).toBeGreaterThan(count(drawn("p1", []), halo));
  });

  it("asks nothing of a hand already on: no halo for it, no ring on the other screen", () => {
    const his = hung(300, -1);
    expect(count(drawn("p1", [], his), halo)).toBeLessThan(count(drawn("p1", []), halo));
    expect(count(drawn("p2", [], his), theirs)).toBe(0);
    expect(count(drawn("p1", [], hung(300, 300)), theirs)).toBe(0);
  });

  it("keeps each handle's verdict in the fx under its owner, and forgets it on reset", () => {
    const fx = new SinewFx();
    const l = { tile: 40, cols: 11, gridLeft: 0, gridWidth: 440 } as never;
    const burst = () => {};
    fx.ingest([refused], l, CFG, 0.5, burst);
    expect(fx.verdicts.at(1)?.good).toBe(false);
    expect(fx.verdicts.at(2)).toBeNull();
    fx.ingest([gripped], l, CFG, 0.5, burst);
    expect(fx.verdicts.at(1)?.good).toBe(true);
    fx.ingest([snapped], l, CFG, 0.5, burst);
    expect(fx.verdicts.at(1)?.good).toBe(false);
    expect(fx.verdicts.at(2)?.good).toBe(false);
    fx.update(1);
    expect(fx.verdicts.at(1)).toBeNull();
    fx.ingest([gripped], l, CFG, 0.5, burst);
    fx.clear();
    expect(fx.verdicts.at(1)).toBeNull();
  });
});
