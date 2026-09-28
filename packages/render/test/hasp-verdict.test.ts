import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  HASP_COUNT,
  haspBoss,
  NO_BEARING,
  NO_BOLT,
  NO_BURN,
  NO_LATCH,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { HASP_LATCH_MARK, HASP_WHEEL_MARK, HaspFx } from "../src/hasp-fx.js";
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

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE HASP's marks answer a touch the way THE INSTAR's do**
 * (`instar-verdict.test.ts`, `hasp-marks.ts`): the latch washes green on the
 * grip and red on the burn, the wheel green when it comes free under her hand
 * and red when it seizes there — each on the screens its mark is drawn on and
 * no other. The halo stands on each seat's open mark, and **no partner's
 * ring and no clock is drawn anywhere**, since each seat is shown its own
 * half and never the other's (§11.37).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

interface Hands {
  /** His hand past the grip. */
  held?: boolean;
  /** Her hand on the rim. */
  hand?: boolean;
}

/** A latch lit and a wheel up, the hands where `h` says, nothing loose. */
function working(h: Hands = {}): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("hasp");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  const s = haspBoss(world);
  if (s === null) throw new Error("the hasp wave hung no door");
  s.phase = "work";
  s.phaseBeat = world.beat - 1;
  s.hasps = HASP_COUNT;
  s.latchMilli = h.held === true ? CFG.haspReachMilli : NO_LATCH;
  s.gripBeat = world.beat;
  s.burnBeat = NO_BURN;
  s.handMilli = h.hand === true ? 250 : NO_BEARING;
  s.seized = h.hand === true && h.held !== true;
  s.woundMilli = 0;
  s.boltCol = NO_BOLT;
  return world;
}

/** Nine ticks drawn, `said` thrown on the first. */
function drawn(role: ViewRole, said: SimEvent[], world: World = working()): string {
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
const good = (t: string) => count(t, PALETTE.good);
const red = (t: string) => count(t, PALETTE.red);

const at = { col: 5 };
const gripped: SimEvent = { type: "haspGrip", ...at };
const burnt: SimEvent = { type: "haspBurn", ...at };
const freed: SimEvent = { type: "haspFree", ...at };
const seized: SimEvent = { type: "haspSeize", ...at };

describe("THE HASP's verdict on a touch", () => {
  it("washes his latch green on the grip and red on the burn, on the latch's screens alone", () => {
    for (const role of ["p1", "test"] as const) {
      expect(good(drawn(role, []))).toBe(0);
      expect(good(drawn(role, [gripped]))).toBeGreaterThan(0);
      expect(red(drawn(role, [burnt]))).toBeGreaterThan(red(drawn(role, [])));
    }
    expect(good(drawn("p2", [gripped]))).toBe(0);
    expect(red(drawn("p2", [burnt]))).toBe(red(drawn("p2", [])));
  });

  it("washes her wheel green as it comes free and red as it seizes, on the wheel's screens alone", () => {
    const on = working({ hand: true });
    for (const role of ["p2", "test"] as const) {
      expect(good(drawn(role, [freed], working({ hand: true, held: true })))).toBeGreaterThan(0);
      expect(red(drawn(role, [seized], on))).toBeGreaterThan(
        red(drawn(role, [], working({ hand: true }))),
      );
    }
    expect(good(drawn("p1", [freed], working({ hand: true, held: true })))).toBe(0);
    expect(red(drawn("p1", [seized], working({ hand: true })))).toBe(
      red(drawn("p1", [], working({ hand: true }))),
    );
  });

  it("puts the halo on each seat's open mark, and goes when a hand is on it", () => {
    const halo = "createRadialGradient";
    expect(count(drawn("p1", []), halo)).toBeGreaterThan(
      count(drawn("p1", [], working({ held: true })), halo),
    );
    expect(count(drawn("p2", []), halo)).toBeGreaterThan(
      count(drawn("p2", [], working({ hand: true })), halo),
    );
  });

  it.each(ROLES)("draws no partner's ring and no clock, on %s", (role) => {
    const theirs = rgba(PALETTE.text, 0.8);
    const clock = rgba(PALETTE.text, 0.85);
    for (const world of [working(), working({ held: true }), working({ hand: true })]) {
      const frame = drawn(role, [], world);
      expect(count(frame, theirs)).toBe(0);
      expect(count(frame, clock)).toBe(0);
    }
  });

  it("keeps each mark's verdict in the fx, fades it and forgets it on reset", () => {
    const fx = new HaspFx();
    const l = { tile: 40, gridLeft: 0, gridWidth: 400, cols: 11 } as never;
    const burst = () => {};
    fx.ingest([burnt, freed], l, CFG, 0.5, "test", burst);
    expect(fx.verdicts.at(HASP_LATCH_MARK)?.good).toBe(false);
    expect(fx.verdicts.at(HASP_WHEEL_MARK)?.good).toBe(true);
    fx.ingest([gripped, seized], l, CFG, 0.5, "test", burst);
    expect(fx.verdicts.at(HASP_LATCH_MARK)?.good).toBe(true);
    expect(fx.verdicts.at(HASP_WHEEL_MARK)?.good).toBe(false);
    fx.update(1);
    expect(fx.verdicts.at(HASP_LATCH_MARK)).toBeNull();
    fx.ingest([gripped], l, CFG, 0.5, "test", burst);
    fx.clear();
    expect(fx.verdicts.at(HASP_LATCH_MARK)).toBeNull();
  });
});
