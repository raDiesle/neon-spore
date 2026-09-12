import { describe, expect, it } from "bun:test";
import { type ClingKind, clingIsStuck, clingMovesSoFar, clingStillBeats } from "../src/cling.js";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE LIMPET and THE LEECH, and the one thing about them that is new to this
 * simulation: a body whose answer is **motion**. Each takes a control the
 * way THE GUM takes the plating, and from then on the control's column is
 * judged once a beat against the column it stood in a beat before — the same
 * column is a beat of the fuse, a different one puts the fuse back and is
 * one of the moves that shake it off. The fuse's end is a heavy hit on the
 * hull at the control's column, which is the wave lost.
 *
 * The limpet is on the plate and the leech on the cannon; the two are one
 * code path with the control swapped, so every case here runs for both.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const SHIP = hullRow(CFG);
const MID = Math.floor(CFG.cols / 2);

const spawn = (kind: ClingKind, col: number, beat = 0): SpawnEntry => ({
  beat,
  col,
  kind,
  color: null,
});

/** A body authored at beat 0 falls a row a beat and is seen standing on the
 * ship — and takes its control — on the tick that starts beat `SHIP + 2`,
 * THE GUM's timing (`gum.test.ts`). Its first beat of fuse is judged one
 * beat after that: the grip beat itself is not counted. */
const STUCK_BY = TPB * (SHIP + 2);

/** The control's column set on `tick`, by the seat that has it. */
function move(kind: ClingKind, tick: number, col: number): TimedCommand {
  return kind === "limpet"
    ? { tick, player: 2, command: { kind: "shieldCol", col } }
    : { tick, player: 1, command: { kind: "cannonCol", col } };
}

/** One move a beat for `beats` beats from the grip, wall-ward and back. */
function walking(kind: ClingKind, beats: number): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let b = 0; b < beats; b++) {
    const col = b % 2 === 0 ? MID - 1 : MID + 1;
    out.push(move(kind, STUCK_BY + b * TPB + 1, col));
  }
  return out;
}

interface Run {
  world: World;
  events: SimEvent[];
}

function play(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const only = (world: World): Creature => {
  expect(world.creatures).toHaveLength(1);
  return world.creatures[0] as Creature;
};

const fuse = (kind: ClingKind): number =>
  kind === "limpet" ? CFG.limpetStillBeats : CFG.leechStillBeats;
const shake = (kind: ClingKind): number =>
  kind === "limpet" ? CFG.limpetShakeMoves : CFG.leechShakeMoves;

for (const kind of ["limpet", "leech"] as const) {
  const name = kind === "limpet" ? "THE LIMPET on the plate" : "THE LEECH on the cannon";

  describe(`${name} takes hold`, () => {
    it("falls its lane, is not stopped, and takes the control's column on the beat it is drawn standing", () => {
      const early = play([spawn(kind, 1)], STUCK_BY - TPB);
      expect(clingIsStuck(only(early.world))).toBe(false);
      const { world, events } = play([spawn(kind, 1)], STUCK_BY);
      const c = only(world);
      expect(clingIsStuck(c)).toBe(true);
      expect(c.col).toBe(MID);
      expect(c.fromCol).toBe(1);
      expect(events.filter((e) => e.type === "clingGrip")).toHaveLength(1);
      expect(events.some((e) => e.type === "breach")).toBe(false);
      expect(clingStillBeats(c)).toBe(0);
    });

    it("cannot be shot: a shot up its lane goes past it", () => {
      const fire: TimedCommand = {
        tick: TPB * 4 + 1,
        player: 2,
        command: { kind: "fire", color: "red" },
      };
      const { world, events } = play([spawn(kind, MID)], TPB * 6, [move(kind, 1, MID), fire]);
      expect(events.some((e) => e.type === "destroy" || e.type === "reject")).toBe(false);
      expect(world.creatures.some((c) => c.kind === kind)).toBe(true);
    });
  });

  describe(`${name} goes off if the control stands still`, () => {
    it(`counts a beat of fuse per beat standing, and blasts the hull at the ${fuse(kind)}th`, () => {
      const n = fuse(kind);
      const before = play([spawn(kind, 1)], STUCK_BY + TPB * (n - 1) + 1);
      expect(clingStillBeats(only(before.world))).toBe(n - 1);
      expect(before.world.failTick).toBe(NOT_FAILED);
      const { world, events } = play([spawn(kind, 1)], STUCK_BY + TPB * n + 1);
      expect(world.creatures.some((c) => c.kind === kind)).toBe(false);
      const blast = events.filter((e) => e.type === "clingBlast");
      expect(blast).toHaveLength(1);
      const breach = events.find((e) => e.type === "breach");
      expect(breach).toBeDefined();
      if (breach?.type !== "breach") throw new Error("unreachable");
      expect(breach.weight).toBe("heavy");
      expect(breach.col).toBe(MID);
      expect(breach.kind).toBe(kind);
      expect(world.failTick).not.toBe(NOT_FAILED);
    });

    it("puts the fuse back to nought on a beat the control is found elsewhere", () => {
      const n = fuse(kind);
      // Still for n - 1 beats, one move, then still again: no blast at n.
      const late = move(kind, STUCK_BY + TPB * (n - 1) + 1, MID - 1);
      const { world, events } = play([spawn(kind, 1)], STUCK_BY + TPB * n + 1, [late]);
      const c = only(world);
      expect(clingStillBeats(c)).toBe(0);
      expect(clingMovesSoFar(c)).toBe(1);
      expect(events.some((e) => e.type === "clingBlast")).toBe(false);
      expect(world.failTick).toBe(NOT_FAILED);
    });
  });

  describe(`${name} is shaken off by moving`, () => {
    it("counts a move once a beat, however many columns are crossed in it", () => {
      const twice = [move(kind, STUCK_BY + 1, MID - 1), move(kind, STUCK_BY + 3, MID + 1)];
      const { world, events } = play([spawn(kind, 1)], STUCK_BY + TPB + 1, twice);
      expect(clingMovesSoFar(only(world))).toBe(1);
      expect(events.filter((e) => e.type === "clingShake")).toHaveLength(1);
    });

    it("ignores a control that returns to where it was before the beat is judged", () => {
      const back = [move(kind, STUCK_BY + 1, MID - 1), move(kind, STUCK_BY + 3, MID)];
      const { world } = play([spawn(kind, 1)], STUCK_BY + TPB + 1, back);
      expect(clingMovesSoFar(only(world))).toBe(0);
      expect(clingStillBeats(only(world))).toBe(1);
    });

    it(`lets go on the ${shake(kind)}th move, with nothing broken`, () => {
      const k = shake(kind);
      const nearly = play([spawn(kind, 1)], STUCK_BY + TPB * (k - 1) + 1, walking(kind, k - 1));
      expect(clingMovesSoFar(only(nearly.world))).toBe(k - 1);
      const { world, events } = play([spawn(kind, 1)], STUCK_BY + TPB * k + 1, walking(kind, k));
      expect(world.creatures.some((c) => c.kind === kind)).toBe(false);
      expect(events.filter((e) => e.type === "clingFreed")).toHaveLength(1);
      expect(events.some((e) => e.type === "breach")).toBe(false);
      expect(world.failTick).toBe(NOT_FAILED);
    });

    it("fingerprints the same twice", () => {
      const k = shake(kind);
      const a = play([spawn(kind, 1)], STUCK_BY + TPB * k + 1, walking(kind, k - 2));
      const b = play([spawn(kind, 1)], STUCK_BY + TPB * k + 1, walking(kind, k - 2));
      expect(hashWorld(a.world)).toBe(hashWorld(b.world));
      expect(a.events.map((e) => e.type)).toEqual(b.events.map((e) => e.type));
    });
  });
}

describe("the two clingers are one family", () => {
  it("can both be on the ship at once, each on its own control", () => {
    const { world } = play([spawn("limpet", 1), spawn("leech", 5)], STUCK_BY + 1);
    expect(world.creatures.filter(clingIsStuck)).toHaveLength(2);
  });

  it("holds one of a kind: a second of the same kind waits on the hull as a body", () => {
    const { world, events } = play([spawn("limpet", 1), spawn("limpet", 5, 2)], STUCK_BY + TPB * 3);
    expect(world.creatures.filter(clingIsStuck)).toHaveLength(1);
    expect(events.filter((e) => e.type === "clingGrip")).toHaveLength(1);
  });
});
