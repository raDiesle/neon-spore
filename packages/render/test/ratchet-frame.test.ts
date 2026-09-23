import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_CATCH,
  RATCHET_TEETH,
  type RatchetState,
  ratchetBoss,
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
 * THE RATCHET's poses — the rack still, the catch glowing under a held hand,
 * a tooth climbing with its click, the strut folding away and the rack
 * jammed into the hull — on all three screens.
 *
 * The states are **set** rather than played to, `hasp-frame.test.ts`'s
 * arrangement: `sim/test/ratchet.test.ts` proves the gate, the teeth and the
 * two ends. What this file asks is whether every branch of the picture is one
 * a canvas accepts, and **the split**: both screens show the whole rack, and
 * the pilot's must not move for anything the catch does.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the rack hung, a few beats along so a beat set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("ratchet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  return world;
}

function body(world: World): RatchetState {
  const s = ratchetBoss(world);
  if (s === null) throw new Error("the ratchet wave hung no rack");
  return s;
}

interface Rack {
  teeth?: number;
  clean?: number;
  /** Catch depth, `NO_CATCH` for her hand off. */
  depth?: number;
  spent?: boolean;
}

/** The pawl lit and a tooth waiting, the rack and her hand where `r` says. */
function working(world: World, r: Rack = {}): RatchetState {
  const s = body(world);
  s.phase = "work";
  s.phaseBeat = world.beat - 1;
  s.teeth = r.teeth ?? RATCHET_TEETH;
  s.clean = r.clean ?? 0;
  s.catchMilli = r.depth ?? NO_CATCH;
  s.catchSpent = r.spent ?? false;
  s.pawlDown = false;
  s.boltCol = -1;
  return s;
}

function phased(world: World, phase: RatchetState["phase"], r: Rack = {}): RatchetState {
  const s = working(world, r);
  s.phase = phase;
  return s;
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
  /** One event thrown on the first tick, for the reactions (`render/ratchet-fx.ts`). */
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

/** Three frames, inside a beat, with the rack set as `arrange` says. */
function frame(
  role: ViewRole,
  arrange: (world: World) => void,
  said: SimEvent | null = null,
): string {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9, said).text;
}

const at = (depth: number) => (w: World) => {
  working(w, { depth });
};

describe("THE RATCHET's rack", () => {
  it.each(ROLES)("hangs seven teeth down the middle, on %s", (role) => {
    const world = hung();
    const still = drawn(world, role, 9);
    expect(still.calls).toBeGreaterThan(50);
    expect(count(still.text, PALETTE.rock)).toBeGreaterThan(0);
  });

  it("glows the set catch on her screen and never on his", () => {
    const set = at(CFG.ratchetGripMilli + 100);
    const off = at(NO_CATCH);
    expect(frame("p2", set)).not.toBe(frame("p2", off));
    expect(frame("test", set)).not.toBe(frame("test", off));
    expect(count(frame("p2", set), PALETTE.pod)).toBeGreaterThan(
      count(frame("p2", off), PALETTE.pod),
    );
    // He is never shown her hold: not the glow, not the bar, not how deep.
    expect(frame("p1", set)).toBe(frame("p1", off));
    expect(frame("p1", at(300))).toBe(frame("p1", off));
    // A thumb resting short of the notch holds nothing, and the bar says so
    // by where it sits and never by the glow.
    expect(count(frame("p2", at(300)), PALETTE.pod)).toBe(count(frame("p2", off), PALETTE.pod));
  });

  it("dims a spent catch until she lifts it, on her screen alone", () => {
    const spent = (w: World) => {
      working(w, { spent: true, clean: 1, teeth: 6 });
    };
    const fresh = (w: World) => {
      working(w, { clean: 1, teeth: 6 });
    };
    expect(frame("p2", spent)).not.toBe(frame("p2", fresh));
    expect(frame("p1", spent)).toBe(frame("p1", fresh));
  });

  it.each(ROLES)("reads the health off the rack and the lock's pins, on %s", (role) => {
    const whole = frame(role, (w) => working(w));
    const climbed = frame(role, (w) => working(w, { teeth: 5, clean: 0 }));
    const clean = frame(role, (w) => working(w, { teeth: 5, clean: 2 }));
    expect(climbed).not.toBe(whole);
    // Two teeth spent clean light two pins; two burnt light none.
    expect(clean).not.toBe(climbed);
  });

  it.each(ROLES)("climbs a tooth over the climb's beats, on %s", (role) => {
    const started = frame(role, (w) => {
      phased(w, "climb", { teeth: 6, clean: 1 }).phaseBeat = w.beat;
    });
    const landed = frame(role, (w) => working(w, { teeth: 6, clean: 1 }));
    expect(started).not.toBe(landed);
  });

  it.each(ROLES)(
    "jolts and clicks on a clean tooth and on a burnt one not at all, on %s",
    (role) => {
      const rack = (w: World) => {
        phased(w, "climb", { teeth: 6, clean: 1 });
      };
      const quiet = frame(role, rack);
      const click: SimEvent = { type: "ratchetClick", teeth: 6, clean: 1, col: 5 };
      const burn: SimEvent = { type: "ratchetBurn", teeth: 6, late: false, col: 5 };
      expect(frame(role, rack, click)).not.toBe(quiet);
      expect(frame(role, rack, burn)).toBe(quiet);
    },
  );

  it("throws the catch's receipts on her screens alone", () => {
    const rack = at(CFG.ratchetGripMilli + 100);
    const set: SimEvent = { type: "ratchetSet", col: 5 };
    expect(frame("p2", rack, set)).not.toBe(frame("p2", rack));
    expect(frame("p1", rack, set)).toBe(frame("p1", rack));
  });

  it.each(ROLES)("drops the loose bolt down the column toward the hull, on %s", (role) => {
    const loose = (w: World) => {
      const s = working(w, { teeth: 5, clean: 2 });
      s.boltCol = 5;
      s.boltBeat = w.beat - 2;
    };
    const bolt = frame(role, loose);
    const none = frame(role, (w) => working(w, { teeth: 5, clean: 2 }));
    expect(count(bolt, PALETTE.hullRim)).toBeGreaterThan(count(none, PALETTE.hullRim));
  });

  it.each(ROLES)("folds the strut away when the lock gives, on %s", (role) => {
    const open = frame(role, (w) => {
      phased(w, "open", { teeth: 2, clean: 5 }).phaseBeat = w.beat - 1;
    });
    const last = frame(role, (w) => working(w, { teeth: 3, clean: 4 }));
    expect(open).not.toBe(last);
  });

  it.each(ROLES)("drives the jammed rack into the hull, on %s", (role) => {
    const jam = frame(role, (w) => {
      phased(w, "jam", { teeth: 3, clean: 1 }).phaseBeat = w.beat - 1;
    });
    const before = frame(role, (w) => working(w, { teeth: 3, clean: 1 }));
    expect(jam).not.toBe(before);
  });
});
