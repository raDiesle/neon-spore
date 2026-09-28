import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type MantleState, type SimEvent, ticksPerBeat, type World } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { MANTLE_CORE_MARK, MANTLE_VENT_MARK, MantleMarks } from "../src/mantle-marks.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";
import { count, frame, hung, pulling } from "./mantle-frame-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE MANTLE's marks answer a touch the way THE INSTAR's do**
 * (`mantle-marks.ts`, `.claude/skills/new-boss` §5), the whole convention: a
 * knob the shell wants and nobody holds wears the halo on its owner's screen
 * and the partner's ring and clock on the other's; the core's ring asks the
 * seat whose tap is next, on that seat's half; each of the shell's words lands
 * on the mark it names; and the verdict reaches the field's frame on every
 * screen.
 */

beforeAll(installCanvasGlobals);

const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const THEIRS = rgba(PALETTE.text, 0.85);

function held(world: World, both: [boolean, boolean]): MantleState {
  const s = pulling(world, 0, 0, 0);
  s.held = both;
  return s;
}

function finishing(world: World, next: 0 | 1): MantleState {
  const s = pulling(world, 0, 0, 0);
  s.phase = "heartbeat";
  s.phaseBeat = world.beat - 4;
  s.cursor = s.thresholds.length;
  s.heartbeatNext = next;
  return s;
}

describe("THE MANTLE's knobs asking", () => {
  const halos = (role: ViewRole, both: [boolean, boolean]) =>
    count(frame(role, (w) => held(w, both)).text, HALO);
  const clocks = (role: ViewRole, both: [boolean, boolean]) =>
    count(frame(role, (w) => held(w, both)).text, THEIRS);

  it.each(["p1", "p2"] as const)("halo only the seat's own knob, on %s", (role) => {
    const one = halos(role, [false, false]) - halos(role, [true, true]);
    expect(one).toBeGreaterThan(0);
    expect(halos("test", [false, false]) - halos("test", [true, true])).toBe(2 * one);
    // The pilot's knob held, the navigator's not: only the navigator's screen still haloes one.
    const mine = role === "p1" ? halos(role, [true, false]) : halos(role, [false, true]);
    expect(mine).toBe(halos(role, [true, true]));
  });

  it.each(["p1", "p2"] as const)("show the partner's knob waiting, on %s", (role) => {
    expect(clocks(role, [false, false])).toBeGreaterThan(clocks(role, [true, true]));
    expect(clocks("test", [false, false])).toBe(clocks("test", [true, true]));
  });
});

describe("THE MANTLE's core asking", () => {
  const halos = (role: ViewRole, next: 0 | 1) =>
    count(frame(role, (w) => finishing(w, next)).text, HALO);
  const clocks = (role: ViewRole, next: 0 | 1) =>
    count(frame(role, (w) => finishing(w, next)).text, THEIRS);

  it("haloes the seat whose tap is next, and shows the other their partner waited on", () => {
    expect(halos("p1", 0)).toBeGreaterThan(halos("p1", 1));
    expect(halos("p2", 1)).toBeGreaterThan(halos("p2", 0));
    expect(clocks("p1", 1)).toBeGreaterThan(clocks("p1", 0));
    expect(clocks("p2", 0)).toBeGreaterThan(clocks("p2", 1));
  });
});

describe("THE MANTLE's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const marks = new MantleMarks();
    marks.ingest(said);
    const at = (key: number) => marks.verdicts.at(key)?.good ?? null;
    return [at(0), at(1), at(MANTLE_CORE_MARK), at(MANTLE_VENT_MARK)];
  };

  it("lands each of the shell's words on the mark it names", () => {
    expect(on([{ type: "mantleShear", left: 2, col: 5 }])).toEqual([true, true, null, null]);
    expect(on([{ type: "mantleLapse", col: 5 }])).toEqual([false, false, null, null]);
    expect(on([{ type: "mantleSlip", seat: 2, col: 5 }])).toEqual([null, false, null, null]);
    expect(on([{ type: "mantleSlip", seat: 1, col: 5 }])).toEqual([false, null, null, null]);
    expect(on([{ type: "mantleBeat", left: 2, col: 5 }])).toEqual([null, null, true, null]);
    expect(on([{ type: "mantleSeal", col: 5 }])).toEqual([null, null, null, true]);
  });

  it("forgets on reset", () => {
    const marks = new MantleMarks();
    marks.ingest([{ type: "mantleSlip", seat: 1, col: 5 }]);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  /** A beat of the pull held, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const world = hung();
    held(world, [true, true]);
    const log: string[] = [];
    runFrames(world, role, ticksPerBeat(CFG), {
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

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const slip: SimEvent[] = [{ type: "mantleSlip", seat: 1, col: 5 }];
    expect(count(frames(role, slip), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
