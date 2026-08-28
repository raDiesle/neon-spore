import { describe, expect, it } from "bun:test";
import {
  CONTROL_SETS,
  CONTROLS,
  type ControlSetId,
  controlSet,
  controlSetForWave,
  DEFAULT_CONTROL_SET_ID,
  setControls,
  setHas,
  WAVES,
  wavesUsingSet,
} from "../src/index.js";

/**
 * What a control set is, held to by a test rather than by a paragraph.
 *
 * The three rules that make the concept worth having: a set is the *whole*
 * panel and both players are on it, sets never compose, and a set no wave can
 * reach is a panel nobody will ever see.
 */
describe("control sets", () => {
  it("names every control once", () => {
    const ids = CONTROLS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a set for every id, and no two sets share one", () => {
    const ids = CONTROL_SETS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of CONTROL_SETS) expect(controlSet(s.id)).toBe(s);
  });

  it("gives every set both players and no repeats", () => {
    for (const set of CONTROL_SETS) {
      expect(new Set(set.controls).size).toBe(set.controls.length);
      expect(setControls(set, 1).length).toBeGreaterThan(0);
      expect(setControls(set, 2).length).toBeGreaterThan(0);
    }
  });

  it("gives every set a name a person can read", () => {
    for (const set of CONTROL_SETS) {
      expect(set.name.length).toBeGreaterThan(0);
      expect(set.why.length).toBeGreaterThan(0);
    }
  });

  // The whole point of the lane. The lance is a coupling one wave asks for,
  // and it used to be on the panel of all twenty-three.
  it("keeps the lance off the default panel", () => {
    expect(setHas(controlSet(DEFAULT_CONTROL_SET_ID), "lance")).toBe(false);
  });

  it("has a set that carries the lance, and it is not the default plus a button", () => {
    const withLance = CONTROL_SETS.filter((s) => setHas(s, "lance"));
    expect(withLance.length).toBeGreaterThan(0);
    const base = controlSet(DEFAULT_CONTROL_SET_ID);
    for (const set of withLance) {
      // A set that is the default with the lance appended is the one thing the
      // owner ruled out: sets do not compose.
      const added = set.controls.filter((id) => !setHas(base, id));
      const dropped = base.controls.filter((id) => !setHas(set, id));
      expect(added.length).toBeGreaterThan(0);
      expect(dropped.length).toBeGreaterThan(0);
    }
  });

  it("gives every set at least one wave that plays on it", () => {
    for (const set of CONTROL_SETS) {
      expect(wavesUsingSet(set.id).length).toBeGreaterThan(0);
    }
  });

  it("only lets a wave name a set that exists", () => {
    for (const w of WAVES) {
      if (w.controls === undefined) continue;
      expect(CONTROL_SETS.some((s) => s.id === w.controls)).toBe(true);
    }
  });

  it("plays a wave that names nothing on the default panel", () => {
    const plain = WAVES.findIndex((w) => w.controls === undefined);
    expect(plain).toBeGreaterThanOrEqual(0);
    expect(controlSetForWave(plain).id).toBe(DEFAULT_CONTROL_SET_ID);
  });

  it("plays a wave that names one on that one", () => {
    for (const set of CONTROL_SETS) {
      const name = wavesUsingSet(set.id)[0];
      const index = WAVES.findIndex((w) => w.name === name);
      expect(controlSetForWave(index).id).toBe(set.id);
    }
  });

  // Past the authored list the game generates waves forever. They are the
  // ordinary field, so they get the ordinary panel.
  it("plays a generated wave on the default panel", () => {
    expect(controlSetForWave(WAVES.length + 7).id).toBe(DEFAULT_CONTROL_SET_ID);
  });

  it("refuses a set nobody defined", () => {
    expect(() => controlSet("nonsense" as ControlSetId)).toThrow();
  });
});
