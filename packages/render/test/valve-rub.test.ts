import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  VALVE_PINS,
  valveBoss,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { ValveFx } from "../src/valve-fx.js";
import { valveCentre, valveSocket } from "../src/valve-shape.js";
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
 * THE VALVE's every rub seen (the owner, 7 October 2026: *visual should
 * change on any rub*): `valveRub` throws flecks off the pin and flares it and
 * the film's wiped edge, deals the drum nothing, and is gone before the next
 * reversal at a thumb's pace. `valve-story-frame.test.ts` has the count round
 * the pin; this file has what one reversal adds to it.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const RUB: SimEvent = { type: "valveRub", wiped: 3, col: midCol(CFG) };

describe("a rub on THE VALVE's film", () => {
  it("throws pale flecks off the pin, flares, and deals nothing", () => {
    const fx = new ValveFx();
    const thrown: { x: number; y: number; hex: string }[] = [];
    fx.ingest([RUB], L, CFG, 0.5, (x, y, _n, hex) => thrown.push({ x, y, hex }));
    const c = valveCentre(L, CFG);
    const pin = valveSocket(L).at;
    expect(thrown).toEqual([{ x: c.x + pin.x, y: c.y + pin.y, hex: PALETTE.text }]);
    expect(fx.rub).toBe(1);
    expect(fx.hurt.value).toBe(0);
    expect(fx.shock.now).toBe(0);
  });

  it("is gone before the next reversal at three a second, and on a clear", () => {
    const fx = new ValveFx();
    fx.ingest([RUB], L, CFG, 0.5, () => {});
    for (let i = 0; i < 20; i++) fx.update(1 / 60);
    expect(fx.rub).toBe(0);
    fx.ingest([RUB], L, CFG, 0.5, () => {});
    fx.clear();
    expect(fx).toEqual(new ValveFx());
  });

  it.each(ROLES)("flares the pin and the wiped edge on the %s screen", (role) => {
    const frame = (rubbed: boolean): string => {
      const world = createWorld(CFG, 5);
      const index = waveWith("valve");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
      const s = valveBoss(world);
      if (s === null) throw new Error("the valve wave hung no drum");
      s.phase = "wipe";
      s.phaseBeat = world.beat;
      s.pins = VALVE_PINS - 3;
      s.wiped = 3;
      const log: string[] = [];
      runFrames(world, role, 3, {
        every: 1,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (tick, w) => {
          if (tick === 0 && rubbed) w.events.push(RUB);
        },
      });
      return log.join("|");
    };
    expect(frame(true)).not.toBe(frame(false));
  });
});
