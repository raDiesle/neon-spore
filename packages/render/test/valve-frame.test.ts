import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  NO_BEARING,
  NO_SPARK,
  startWave,
  step,
  ticksPerBeat,
  VALVE_PINS,
  type ValvePhase,
  type ValveState,
  valveBoss,
  valveMark,
  type World,
} from "@neon-spore/sim";
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
 * THE VALVE's poses — settling, the wheel turning, held on its mark, frozen,
 * listing after one pin and after two, the face fallen open and the spark
 * falling — on all three screens.
 *
 * The states are **set** rather than played to, `keel-frame.test.ts`'s
 * arrangement: `sim/test/valve*.test.ts` proves the wheel, the freeze, the
 * pull and the spark. What this file asks is whether every branch of the
 * picture is one a canvas accepts, and that each says what it has to: the
 * wheel drawn where it stands, the mark and the socket white, the frozen
 * wheel's glow, and the list deepening pin by pin.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the drum hung, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("valve");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): ValveState {
  const s = valveBoss(world);
  if (s === null) throw new Error("the valve wave hung no drum");
  return s;
}

/** The drum in `phase`, a beat in, `out` pins pulled and the wheel at `wheel`. */
function posed(world: World, phase: ValvePhase, out = 0, wheel = 100): ValveState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.pins = VALVE_PINS - out;
  s.movement = Math.min(3, out + 1) as 1 | 2 | 3;
  s.wheelMilli = wheel;
  s.travelMilli = 0;
  s.handMilli = NO_BEARING;
  s.sparkCol = NO_SPARK;
  return s;
}

/** The wheel held on this movement's mark. */
function held(world: World, phase: "hold" | "frozen"): ValveState {
  const s = posed(world, phase);
  s.wheelMilli = valveMark(s);
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

/** Three frames, inside a beat, with the drum set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9);
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** A colour as a glow lays it (the palette's hex) and as a fill or a faint stroke does (`rgba`). */
function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  return count(text, hex) + count(text, `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE VALVE's drum", () => {
  it.each(ROLES)("hangs an iron drum with a white mark on it, on %s", (role) => {
    const turning = frame(role, (w) => posed(w, "turn"));
    expect(turning.calls).toBeGreaterThan(50);
    expect(tinted(turning.text, PALETTE.rock)).toBeGreaterThan(0);
    expect(tinted(turning.text, PALETTE.hullRim)).toBeGreaterThan(0);
  });

  it.each(ROLES)("settles into frame, on %s", (role) => {
    const settling = frame(role, (w) => {
      const s = posed(w, "still");
      s.phaseBeat = w.beat;
    });
    expect(settling.text).not.toBe(frame(role, (w) => posed(w, "turn")).text);
  });

  it.each(ROLES)("draws the wheel where it stands, not snapped to a mark, on %s", (role) => {
    const a = frame(role, (w) => posed(w, "turn", 0, 100));
    const b = frame(role, (w) => posed(w, "turn", 0, 130));
    expect(a.text).not.toBe(b.text);
  });

  it.each(ROLES)("opens the freeze window round the socket, on %s", (role) => {
    const turning = frame(role, (w) => posed(w, "turn"));
    const holding = frame(role, (w) => held(w, "hold"));
    expect(tinted(holding.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(turning.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("shows a frozen wheel as unlike a held one, on %s", (role) => {
    expect(frame(role, (w) => held(w, "frozen")).text).not.toBe(
      frame(role, (w) => held(w, "hold")).text,
    );
  });

  it.each(ROLES)("lists further for every pin out, on %s", (role) => {
    const sealed = frame(role, (w) => posed(w, "turn", 0));
    const one = frame(role, (w) => posed(w, "turn", 1));
    const two = frame(role, (w) => posed(w, "turn", 2));
    expect(one.text).not.toBe(sealed.text);
    expect(two.text).not.toBe(one.text);
  });

  it.each(ROLES)("lets a pin slide free over the list, on %s", (role) => {
    const listing = frame(role, (w) => posed(w, "list", 1));
    expect(listing.text).not.toBe(frame(role, (w) => posed(w, "turn", 1)).text);
  });

  it.each(ROLES)("falls open with every pin out, on %s", (role) => {
    const open = frame(role, (w) => posed(w, "open", 3));
    expect(open.calls).toBeGreaterThan(50);
    expect(open.text).not.toBe(frame(role, (w) => posed(w, "list", 3)).text);
  });

  it.each(ROLES)("drops the spark as an ember down its column, on %s", (role) => {
    const quiet = frame(role, (w) => posed(w, "turn", 1));
    const leaking = frame(role, (w) => {
      const s = posed(w, "turn", 1);
      s.sparkCol = midCol(CFG);
      s.sparkBeat = w.beat - 1;
    });
    expect(tinted(leaking.text, PALETTE.ember)).toBeGreaterThan(tinted(quiet.text, PALETTE.ember));
  });

  it.each(ROLES)("owes the third mark a lap, and shows the lap, on %s", (role) => {
    const none = frame(role, (w) => posed(w, "turn", 2));
    const half = frame(role, (w) => {
      posed(w, "turn", 2).travelMilli = 500;
    });
    expect(half.text).not.toBe(none.text);
  });

  it("draws the same drum the same way twice", () => {
    const a = frame("p1", (w) => held(w, "frozen"));
    const b = frame("p1", (w) => held(w, "frozen"));
    expect(a.text).toBe(b.text);
  });
});
