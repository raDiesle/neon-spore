import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  HASP_COUNT,
  type HaspState,
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
 * THE HASP's poses — the row sealed, a latch glowing under a held hand, its
 * wheel spinning free, a wheel seized dark mid-turn, a hasp swinging and the
 * row swung clear — on all three screens.
 *
 * The states are **set** rather than played to, `spool-frame.test.ts`'s
 * arrangement: `sim/test/hasp.test.ts` proves the gate, the heat and the
 * openings. What this file asks is whether every branch of the picture is one
 * a canvas accepts, and the thing nothing else could catch: **the split**. The
 * pilot's screen must not move for anything the wheel does, the navigator's
 * must not move for anything the latch does beyond whether it is holding, and
 * the receipts are split the same way.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the door hung, a few beats along so a beat set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("hasp");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  return world;
}

function body(world: World): HaspState {
  const s = haspBoss(world);
  if (s === null) throw new Error("the hasp wave hung no door");
  return s;
}

/** The opening dark: three sealed clasps, both hands off, nothing loose. */
function still(world: World): HaspState {
  const s = body(world);
  s.phase = "still";
  s.phaseBeat = world.beat;
  s.hasps = HASP_COUNT;
  s.latchMilli = NO_LATCH;
  s.gripBeat = 0;
  s.burnBeat = NO_BURN;
  s.wheelMilli = 0;
  s.handMilli = NO_BEARING;
  s.woundMilli = 0;
  s.seized = false;
  s.boltCol = NO_BOLT;
  return s;
}

interface Hands {
  /** Latch depth, `NO_LATCH` for his hand off. */
  latch?: number;
  /** Beats since he gripped — the heat. */
  warm?: number;
  wheel?: number;
  wound?: number;
  /** Her hand on the rim, or off it. */
  hand?: boolean;
  hasps?: number;
}

/** A latch lit and a wheel to wind, with the hands where `h` says. The seize is
 * set as the simulation would read it, so the first tick says nothing new. */
function working(world: World, h: Hands = {}): HaspState {
  const s = still(world);
  s.phase = "work";
  s.phaseBeat = world.beat - 1;
  s.hasps = h.hasps ?? HASP_COUNT;
  s.latchMilli = h.latch ?? NO_LATCH;
  s.gripBeat = world.beat - (h.warm ?? 0);
  s.wheelMilli = h.wheel ?? 0;
  s.woundMilli = h.wound ?? 0;
  s.handMilli = h.hand === true ? 250 : NO_BEARING;
  s.seized = s.handMilli !== NO_BEARING && s.latchMilli < CFG.haspGripMilli;
  return s;
}

/** The first hasp swinging, a beat in. */
function swinging(world: World): HaspState {
  const s = still(world);
  s.phase = "swing";
  s.phaseBeat = world.beat - 1;
  s.hasps = HASP_COUNT - 1;
  s.wheelMilli = 800;
  return s;
}

/** The second hasp's bolt, half way down to the hull. */
function loose(world: World): HaspState {
  const s = swinging(world);
  s.hasps = HASP_COUNT - 2;
  s.boltCol = 5;
  s.boltBeat = world.beat - Math.floor(CFG.haspBoltBeats / 2);
  return s;
}

/** The row swinging clear, a beat in. */
function clearing(world: World): HaspState {
  const s = still(world);
  s.phase = "clear";
  s.phaseBeat = world.beat - 1;
  s.hasps = 0;
  return s;
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
  /** One event thrown on the first tick, for the reactions (`render/hasp-fx.ts`). */
  said: SimEvent | null = null,
): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (tick === 0 && said !== null) w.events.push(said);
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the door set as `arrange` says. */
function frame(
  role: ViewRole,
  arrange: (world: World) => void,
  said: SimEvent | null = null,
): string {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9, said).text;
}

const held = (warm: number) => (w: World) => {
  working(w, { latch: 800, warm, hand: true, wheel: 300, wound: 300 });
};
const wound = (wheel: number, woundMilli: number) => (w: World) => {
  working(w, { latch: 800, warm: 1, hand: true, wheel, wound: woundMilli });
};

describe("THE HASP's door", () => {
  it.each(ROLES)("hangs three sealed clasps, on %s", (role) => {
    const world = hung();
    still(world);
    const dark = drawn(world, role, 9);
    expect(dark.calls).toBeGreaterThan(50);
    expect(count(dark.text, PALETTE.rock)).toBeGreaterThan(0);
  });

  it("drifts the latch's colour with his heat, on his screen and never on hers", () => {
    // The pilot's whole readout: a slow colour drift on the mark itself.
    expect(frame("p1", held(4))).not.toBe(frame("p1", held(0)));
    expect(frame("test", held(4))).not.toBe(frame("test", held(0)));
    // Her screen says the wheel is free, and nothing about how long for.
    expect(frame("p2", held(4))).toBe(frame("p2", held(0)));
    // Nor how deep his thumb is past the grip.
    const deeper = (w: World) => {
      working(w, { latch: 950, warm: 1, hand: true, wheel: 300, wound: 300 });
    };
    expect(frame("p2", deeper)).toBe(frame("p2", held(1)));
  });

  it("turns the wheel and creeps the clasp on her screen and never on his", () => {
    expect(frame("p2", wound(600, 500))).not.toBe(frame("p2", wound(100, 0)));
    expect(frame("test", wound(600, 500))).not.toBe(frame("test", wound(100, 0)));
    // He is never shown a wheel, whether it turns, or that there is one —
    // not even as a lid prised open by it.
    expect(frame("p1", wound(600, 500))).toBe(frame("p1", wound(100, 0)));
    const handOff = (w: World) => {
      working(w, { latch: 800, warm: 1, hand: false, wheel: 100, wound: 0 });
    };
    expect(frame("p1", handOff)).toBe(frame("p1", wound(100, 0)));
  });

  it("shows her a free wheel while he holds and a seized one while he does not", () => {
    const seized = (w: World) => {
      working(w, { latch: NO_LATCH, hand: true, wheel: 300, wound: 300 });
    };
    const shortOfGrip = (w: World) => {
      working(w, { latch: 300, hand: true, wheel: 300, wound: 300 });
    };
    expect(frame("p2", held(1))).not.toBe(frame("p2", seized));
    // A thumb resting short of the grip is not holding, and she cannot tell
    // it from no thumb at all.
    expect(frame("p2", shortOfGrip)).toBe(frame("p2", seized));
  });

  it.each(ROLES)("counts the health in shut clasps, on %s", (role) => {
    const whole = frame(role, (w) => working(w, { hasps: 3 }));
    const worn = frame(role, (w) => working(w, { hasps: 2 }));
    expect(worn).not.toBe(whole);
  });

  it.each(ROLES)("swings a hasp open and then the whole row clear, on %s", (role) => {
    const sealed = frame(role, (w) => working(w));
    const swing = frame(role, swinging);
    const clear = frame(role, clearing);
    expect(swing).not.toBe(sealed);
    expect(clear).not.toBe(swing);
    // The passage behind the door is edged in the violet's rim, and only once
    // the row has gone.
    expect(count(clear, PALETTE.wispRim)).toBeGreaterThan(count(swing, PALETTE.wispRim));
  });

  it.each(ROLES)("drops the loose bolt down the column toward the hull, on %s", (role) => {
    const bolt = frame(role, loose);
    const none = frame(role, (w) => {
      loose(w).boltCol = NO_BOLT;
    });
    expect(bolt).not.toBe(none);
    expect(count(bolt, PALETTE.hullRim)).toBeGreaterThan(count(none, PALETTE.hullRim));
  });

  it.each(ROLES)("jolts the row when a hasp gives, on %s", (role) => {
    const quiet = frame(role, (w) => working(w, { hasps: 2 }));
    const jolted = frame(role, (w) => working(w, { hasps: 2 }), {
      type: "haspOpen",
      hasps: 2,
      col: 5,
    });
    expect(jolted).not.toBe(quiet);
  });

  it("throws each receipt only on the screens shown the half it happened to", () => {
    const at = (w: World) => {
      working(w, { latch: 800, warm: 1, hand: true, wheel: 300, wound: 300 });
    };
    const grip: SimEvent = { type: "haspGrip", col: 5 };
    const seize: SimEvent = { type: "haspSeize", col: 5 };
    expect(frame("p1", at, grip)).not.toBe(frame("p1", at));
    expect(frame("p2", at, grip)).toBe(frame("p2", at));
    // The seize dims her whole field for a beat, and his not at all.
    expect(frame("p2", at, seize)).not.toBe(frame("p2", at));
    expect(frame("p1", at, seize)).toBe(frame("p1", at));
  });
});
