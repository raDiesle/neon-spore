import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_BEARING,
  NO_SPARK,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  VALVE_PINS,
  type ValvePhase,
  valveBoss,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { VALVE_PIN_MARK, VALVE_WHEEL_MARK, ValveVerdicts } from "../src/valve-verdicts.js";
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
 * **THE VALVE's wheel and pin answer a touch the way THE INSTAR's marks do**
 * (`valve-verdicts.ts`, `.claude/skills/new-boss` §5), the whole convention:
 * the turning wheel wears the halo on the pilot's screen and the partner's
 * ring and clock on the navigator's; the held wheel's pin the other way
 * round; through the brace a thumb already down sees the one still missing;
 * each of the drum's words lands on the mark it names; and the verdict reaches
 * the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("valve");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The drum in `phase` since a beat ago, one pin out, neither thumb down. */
function at(world: World, phase: ValvePhase, held: [boolean, boolean] = [false, false]): void {
  const s = valveBoss(world);
  if (s === null) throw new Error("the valve wave hung no drum");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.pins = VALVE_PINS - 1;
  s.movement = 2;
  s.wheelMilli = 100;
  s.travelMilli = 0;
  s.handMilli = NO_BEARING;
  s.sparkCol = NO_SPARK;
  s.held = held;
}

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = hung();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      w.events.length = 0;
      if (tick === 2) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;
const halos = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), HALO);
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);

describe("THE VALVE's marks asking", () => {
  const phase = (p: ValvePhase, held?: [boolean, boolean]) => (w: World) => at(w, p, held);
  const list = phase("list");

  it("haloes the wheel for the pilot while it turns, and shows the navigator it waited on", () => {
    expect(halos("p1", phase("turn"))).toBeGreaterThan(halos("p1", list));
    expect(halos("p2", phase("turn"))).toBe(halos("p2", list));
    expect(clocks("p2", phase("turn"))).toBeGreaterThan(clocks("p2", list));
    expect(clocks("test", phase("turn"))).toBe(clocks("test", list));
  });

  it("haloes the pin for the navigator while the wheel holds, and shows the pilot it waited on", () => {
    expect(halos("p2", phase("hold"))).toBeGreaterThan(halos("p2", list));
    expect(halos("p1", phase("hold"))).toBe(halos("p1", list));
    expect(clocks("p1", phase("hold"))).toBeGreaterThan(clocks("p1", list));
  });

  it("haloes the pin on both screens while it is anybody's", () => {
    for (const p of ["frozen", "jet", "wipe"] as const) {
      expect(halos("p1", phase(p))).toBeGreaterThan(halos("p1", list));
      expect(halos("p2", phase(p))).toBeGreaterThan(halos("p2", list));
    }
  });

  it("through the brace, shows a thumb already down the one still missing", () => {
    const pilotDown = phase("brace", [true, false]);
    expect(clocks("p1", pilotDown)).toBeGreaterThan(clocks("p1", list));
    expect(halos("p1", pilotDown)).toBe(halos("p1", list));
    expect(halos("p2", pilotDown)).toBeGreaterThan(halos("p2", list));
    expect(halos("p1", phase("brace", [true, true]))).toBe(halos("p1", list));
  });
});

describe("THE VALVE's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new ValveVerdicts();
    v.ingest(said);
    return [
      v.verdicts.at(VALVE_WHEEL_MARK)?.good ?? null,
      v.verdicts.at(VALVE_PIN_MARK)?.good ?? null,
    ];
  };
  const col = 5;

  it("lands each of the drum's words on the mark it names", () => {
    expect(on([{ type: "valveHold", col }])).toEqual([true, null]);
    expect(on([{ type: "valveSlip", col }])).toEqual([false, null]);
    for (const type of ["valveFreeze", "valveCap", "valveBrace", "valveDry", "valveSeal"] as const)
      expect(on([{ type, col }])).toEqual([null, true]);
    expect(on([{ type: "valvePull", pins: 2, col }])).toEqual([null, true]);
    for (const type of [
      "valveLapse",
      "valveThaw",
      "valveBlow",
      "valveShake",
      "valveSmear",
      "valveRough",
    ] as const)
      expect(on([{ type, col }])).toEqual([null, false]);
    expect(on([{ type: "valveSpark", col }])).toEqual([null, null]);
  });

  it("forgets on reset", () => {
    const v = new ValveVerdicts();
    v.ingest([{ type: "valveSlip", col }]);
    v.clear();
    expect(v.verdicts.at(VALVE_WHEEL_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const list = (w: World) => at(w, "list");
    const lapse: SimEvent[] = [{ type: "valveLapse", col }];
    expect(count(frame(role, list, lapse), PALETTE.red)).toBeGreaterThan(
      count(frame(role, list), PALETTE.red),
    );
  });
});
