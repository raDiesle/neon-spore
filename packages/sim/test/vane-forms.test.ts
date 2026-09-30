import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  type VaneState,
  vaneGuardBeat,
  vaneGuardCount,
  vaneGuardedAt,
  vanePhase,
  vanePivotCol,
  type World,
} from "../src/index.js";
import type { Bullet } from "../src/types.js";
import { vaneMouthStruck } from "../src/vane.js";

/**
 * **THE VANE's four forms and the guard arms they bring** (`vane.ts`,
 * `vane-guard.ts`, `docs/spec/bosses.md` §11.5, *Four forms*). The owner, 30
 * September 2026: *change its form of boss when it reaches current end of
 * hitting it … another arm appears and rotates around it … harder and harder
 * to hit*. Checked here: the last pin of a form re-forms the bearing rather
 * than ending it, the last form's ends it, each form turns one more guard, and
 * a shot at a guarded mouth is refused and spends the opening.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const PIVOT = vanePivotCol(CFG);
const RIGHT = PIVOT + 1;
const LEFT = PIVOT - 1;

function open(): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "vane" });
  return world;
}

const vane = (world: World): VaneState => {
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("no vane");
  return b;
};

const bolt = (col: number, color: Bullet["color"]): Bullet => ({
  id: 1,
  col,
  row: CFG.vaneArmRow,
  subMilli: 0,
  color,
  lance: false,
  driftMilli: 0,
  aimMilli: 0,
});

/** A beat on which nothing covers `col` in form `form`. */
function clearBeat(form: number, col: number): number {
  const b = { form } as VaneState;
  for (let beat = 0; beat < CFG.vaneGuardTurnBeats; beat++)
    if (!vaneGuardedAt(CFG, b, col, beat)) return beat;
  throw new Error("the mouth is never clear");
}

/** A beat on which a guard stands across `col` in form `form`. */
function guardedBeat(form: number, col: number): number {
  const b = { form } as VaneState;
  for (let beat = 0; beat < CFG.vaneGuardTurnBeats; beat++)
    if (vaneGuardedAt(CFG, b, col, beat)) return beat;
  throw new Error("the mouth is never covered");
}

/** The bearing with one pin left in `form`, pinned open on the right, and a shot that would take it. */
function lastPin(form: number): World {
  const world = open();
  const b = vane(world);
  Object.assign(b, { form, pins: 1, pinBeat: 0, pinCol: PIVOT, pinSide: -1, hauled: true });
  world.waveBeat = clearBeat(form, RIGHT);
  return world;
}

describe("the forms", () => {
  it("starts in its first form, with no guard", () => {
    const b = vane(open());
    expect(b.form).toBe(0);
    expect(vaneGuardCount(b)).toBe(0);
  });

  it("re-forms on the last pin of a form that is not its last", () => {
    const world = lastPin(0);
    vaneMouthStruck(world, bolt(RIGHT, "red"));
    const b = vane(world);
    expect(b.form).toBe(1);
    expect(b.pins).toBe(CFG.vaneFormPins);
    expect(vanePhase(b.pins).name).toBe("VEER");
    expect(b.pinBeat).toBe(-1);
    expect(b.hauled).toBe(false);
    expect(world.events.some((e) => e.type === "vaneKnock" && e.pins === 0)).toBe(true);
  });

  it("goes down on the last pin of its last form", () => {
    const world = lastPin(CFG.vaneForms - 1);
    vaneMouthStruck(world, bolt(RIGHT, "red"));
    expect(world.boss).toBeNull();
  });

  it("puts its form in the hash", () => {
    const a = open();
    const b = open();
    vane(b).form = 1;
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});

describe("the guard arms", () => {
  it("turns one more guard with each form", () => {
    for (let form = 0; form < CFG.vaneForms; form++)
      expect(vaneGuardCount({ form } as VaneState)).toBe(form);
  });

  it("spaces a form's guards evenly round the turn", () => {
    const turn = CFG.vaneGuardTurnBeats;
    const at = [0, 1, 2].map((k) => vaneGuardBeat(CFG, 3, k, 0));
    expect(at).toEqual([0, turn / 3, (2 * turn) / 3]);
  });

  it("never covers the pivot, and covers each mouth for its cover beats a guard", () => {
    for (let form = 1; form < CFG.vaneForms; form++) {
      const b = { form } as VaneState;
      const covered = (col: number) =>
        Array.from({ length: CFG.vaneGuardTurnBeats }, (_, beat) =>
          vaneGuardedAt(CFG, b, col, beat),
        ).filter(Boolean).length;
      expect(covered(PIVOT)).toBe(0);
      expect(covered(RIGHT)).toBe(form * CFG.vaneGuardCoverBeats);
      expect(covered(LEFT)).toBe(form * CFG.vaneGuardCoverBeats);
    }
  });

  // A shot is up the column within the beat, so the hand wants a beat clear and
  // the one after it clear too; every pin's length of beats holds one.
  it("leaves every pin's worth of beats a clear beat in it, in every form", () => {
    for (let form = 0; form < CFG.vaneForms; form++) {
      const b = { form } as VaneState;
      for (const col of [LEFT, RIGHT])
        for (let start = 0; start < CFG.vaneGuardTurnBeats; start++) {
          const pin = Array.from({ length: CFG.vanePinBeats }, (_, i) => start + i);
          expect(
            pin.some(
              (beat) => !vaneGuardedAt(CFG, b, col, beat) && !vaneGuardedAt(CFG, b, col, beat + 1),
            ),
          ).toBe(true);
        }
    }
  });

  it("refuses a shot at a guarded mouth, and spends the opening", () => {
    const world = lastPin(1);
    world.waveBeat = guardedBeat(1, RIGHT);
    vaneMouthStruck(world, bolt(RIGHT, "red"));
    const b = vane(world);
    expect(b.pins).toBe(1);
    expect(b.spentPin).toBe(b.pinBeat);
    expect(world.events.some((e) => e.type === "reject")).toBe(true);
  });
});
