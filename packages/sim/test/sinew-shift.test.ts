import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  type SimEvent,
  type SinewState,
  sinewBoss,
  sinewSum,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { seatShift } from "../src/sinew-shift.js";

/**
 * THE SINEW's shifting fibre (`sinew-shift.ts`): on one fibre each hand's
 * pull is worth weak, whole or strong, rolled again every `sinewShiftBeats`
 * and called a beat before. What these pin: nothing shifts on any other
 * fibre; the sum is the pulls at their power; a call comes on the beat before
 * every shift and the shift puts exactly the called powers in force; a shift
 * never rolls the pair already in force; the next part puts both hands back
 * at their whole pull; and the powers are in the fingerprint.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true, sinewEnterBeats: 0 };
const TPB = ticksPerBeat(CFG);

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "sinew" });
  return world;
}

function sinew(world: World): SinewState {
  const s = sinewBoss(world);
  if (s === null) throw new Error("the wave installed no sinew");
  return s;
}

/** The tendon on its shifting fibre, the clock started from this beat. */
function shifting(seed = 0): { world: World; s: SinewState } {
  const world = install(seed);
  const s = sinew(world);
  s.fibres = CFG.sinewFibres - CFG.sinewShiftFibre;
  seatShift(world, s);
  return { world, s };
}

type PowerEvent = Extract<SimEvent, { type: "sinewPower" }>;

/** Step `beats` beats with no hands on, and every power event with its beat. */
function powerEvents(world: World, beats: number): { beat: number; e: PowerEvent }[] {
  const out: { beat: number; e: PowerEvent }[] = [];
  for (let i = 0; i < beats * TPB; i++) {
    step(world, []);
    for (const e of world.events) if (e.type === "sinewPower") out.push({ beat: world.beat, e });
  }
  return out;
}

describe("THE SINEW's shifting fibre", () => {
  it("shifts nothing on the fibres before it", () => {
    const world = install();
    const s = sinew(world);
    expect(s.shiftBeat).toBe(-1);
    expect(powerEvents(world, 12)).toEqual([]);
    expect(s.powerP1Permille).toBe(1000);
    expect(s.powerP2Permille).toBe(1000);
  });

  it("adds the two pulls at their power", () => {
    const { s } = shifting();
    s.pullP1Milli = 2000;
    s.pullP2Milli = 1000;
    s.powerP1Permille = CFG.sinewShiftStrongPermille;
    s.powerP2Permille = CFG.sinewShiftWeakPermille;
    const p1 = (2000 * CFG.sinewShiftStrongPermille) / 1000;
    const p2 = (1000 * CFG.sinewShiftWeakPermille) / 1000;
    expect(sinewSum(s)).toBe(p1 + p2);
  });

  it("calls the powers a beat before each shift, and puts exactly those in force", () => {
    const { world, s } = shifting();
    const seen = powerEvents(world, CFG.sinewShiftBeats * 4 + 1);
    const calls = seen.filter((x) => x.e.called);
    const shifts = seen.filter((x) => !x.e.called);
    expect(shifts.length).toBe(4);
    expect(calls.length).toBe(4);
    for (let k = 0; k < shifts.length; k++) {
      const call = calls[k];
      const shift = shifts[k];
      if (call === undefined || shift === undefined) throw new Error("a shift went uncalled");
      expect(shift.beat - call.beat).toBe(1);
      expect([shift.e.p1Permille, shift.e.p2Permille]).toEqual([
        call.e.p1Permille,
        call.e.p2Permille,
      ]);
    }
    const last = shifts[shifts.length - 1]?.e;
    if (last === undefined) throw new Error("nothing shifted");
    expect([s.powerP1Permille, s.powerP2Permille]).toEqual([last.p1Permille, last.p2Permille]);
  });

  it("never rolls the pair of powers already in force", () => {
    for (const seed of [0, 1, 2, 3]) {
      const { world } = shifting(seed);
      let was = [1000, 1000];
      const kinds = new Set<string>();
      for (const { e } of powerEvents(world, CFG.sinewShiftBeats * 30)) {
        if (e.called) continue;
        const now = [e.p1Permille, e.p2Permille];
        expect(now).not.toEqual(was);
        kinds.add(now.join(","));
        was = now;
      }
      // Over thirty shifts the roll reaches most of the nine pairs.
      expect(kinds.size).toBeGreaterThan(5);
    }
  });

  it("puts both hands back at their whole pull on the next part", () => {
    const { world, s } = shifting();
    powerEvents(world, CFG.sinewShiftBeats * 3);
    s.fibres -= 1;
    seatShift(world, s);
    expect(s.shiftBeat).toBe(-1);
    expect([s.powerP1Permille, s.powerP2Permille]).toEqual([1000, 1000]);
    expect(powerEvents(world, CFG.sinewShiftBeats * 3)).toEqual([]);
  });

  it("puts the powers in the fingerprint", () => {
    const a = shifting();
    const b = shifting();
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    b.s.powerP2Permille = CFG.sinewShiftStrongPermille;
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
