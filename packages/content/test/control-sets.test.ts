import { describe, expect, it } from "bun:test";
import {
  CONTROL_SETS,
  CONTROLS,
  type ControlSetId,
  controlSet,
  controlSetForWave,
  DEFAULT_CONTROL_SET_ID,
  groupsCoveredBy,
  heldBack,
  layoutSet,
  panelForm,
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

/**
 * The other kind of panel. A round that is not the field replaces the band
 * rather than sitting in it, and a set says which kind it is by what is in it
 * rather than by a field beside it — see `panelForm`.
 */
describe("a panel that is slabs rather than a band", () => {
  it("reads the form off the controls, so the two cannot disagree", () => {
    expect(panelForm(controlSet(DEFAULT_CONTROL_SET_ID))).toBe("band");
    expect(panelForm(controlSet("gauge"))).toBe("slabs");
  });

  it("refuses a set that mixes the two, because there is no way to draw one", () => {
    expect(() =>
      panelForm({
        id: "default",
        name: "N",
        why: "W",
        controls: ["cannon", "gaugeCall"],
      }),
    ).toThrow();
  });

  it("gives every slab panel both seats, so neither sits and watches", () => {
    for (const set of CONTROL_SETS) {
      if (panelForm(set) !== "slabs") continue;
      expect(setControls(set, 1).length).toBeGreaterThan(0);
      expect(setControls(set, 2).length).toBeGreaterThan(0);
    }
  });

  /**
   * The one thing that can silently go wrong now that a round is a wave: the
   * boss is installed and the wave forgets to name the panel, so the round
   * draws itself over a screen with no buttons on it. `controlSetForWave` is
   * what the draw and both hit tests ask, and it answers from the wave.
   */
  it("gives every wave whose boss is a round a panel of slabs", () => {
    const rounds = WAVES.filter((w) => w.boss?.kind === "gauge");
    expect(rounds.length).toBeGreaterThan(0);
    for (const w of rounds) {
      const index = WAVES.indexOf(w);
      expect(panelForm(controlSetForWave(index)), w.name).toBe("slabs");
    }
  });
});

/**
 * The standard ladder: four rungs that are the standard panel with buttons
 * held back, so a pair meeting the game is handed one control at a time.
 *
 * The rules that make a rung a rung rather than a fifth panel somebody drew:
 * everything on it is on the panel it reduces, each rung is strictly more than
 * the one before it, and the last one plus the maw is the full panel — which
 * is why there is no fifth entry and why STANDARD itself is the top of the
 * ladder rather than something beside it.
 */
describe("the standard ladder", () => {
  const LADDER: ControlSetId[] = ["standard1", "standard2", "standard3", "standard4"];

  it("only ever reduces a panel that exists, and never itself", () => {
    for (const set of CONTROL_SETS) {
      if (set.reduces === undefined) continue;
      expect(set.reduces, `${set.id} reduces itself`).not.toBe(set.id);
      expect(controlSet(set.reduces).reduces, `${set.id} reduces a reduction`).toBeUndefined();
    }
  });

  it("puts nothing on a rung that is not on the panel it reduces", () => {
    for (const set of CONTROL_SETS) {
      if (set.reduces === undefined) continue;
      const base = controlSet(set.reduces);
      for (const id of set.controls) {
        expect(setHas(base, id), `${set.id} carries ${id}, which ${base.id} has not got`).toBe(
          true,
        );
      }
      // A "reduction" that held nothing back is the full panel under a second
      // name, which is a panel nobody could tell from the one it copies.
      expect(heldBack(set).length, `${set.id} holds nothing back`).toBeGreaterThan(0);
    }
  });

  it("adds exactly one button a rung, and ends one short of the full panel", () => {
    const full = controlSet(DEFAULT_CONTROL_SET_ID);
    let previous: ControlSetId | null = null;
    for (const id of LADDER) {
      const set = controlSet(id);
      expect(set.reduces, `${id} is not a reduction of the standard panel`).toBe(
        DEFAULT_CONTROL_SET_ID,
      );
      if (previous) {
        const below = controlSet(previous);
        for (const had of below.controls) {
          expect(setHas(set, had), `${id} took ${had} back off ${previous}`).toBe(true);
        }
        expect(
          set.controls.length - below.controls.length,
          `${id} adds more than one button to ${previous}`,
        ).toBe(1);
      }
      previous = id;
    }
    // The top rung plus the one thing it holds back *is* the standard panel.
    // That is what makes the ladder five rungs rather than six, and why the
    // fifth is `default` itself rather than a copy of it.
    expect(heldBack(controlSet("standard4")).map((c) => c.id)).toEqual(["intake"]);
    expect(controlSet("standard4").controls.length + 1).toBe(full.controls.length);
  });

  it("lays a rung out against the panel it reduces, so nothing moves", () => {
    // The whole promise of the ladder, and the one thing a wave author cannot
    // see for themselves: a button that arrives has to arrive in the place it
    // will keep. `bandLobes` reads the slots off this and drops the rest.
    for (const id of LADDER) {
      expect(layoutSet(controlSet(id)).id).toBe(DEFAULT_CONTROL_SET_ID);
    }
    expect(layoutSet(controlSet(DEFAULT_CONTROL_SET_ID)).id).toBe(DEFAULT_CONTROL_SET_ID);
  });

  /**
   * The rung the coverage rule was rewritten for. STANDARD 3 has the trigger
   * and no strip under the plate: the plate stands in the middle of the field
   * whether or not anybody can carry it, so a rock in that column is answered
   * and the group is covered. Without the trigger nothing raises it at all,
   * and it is not.
   */
  it("counts a panel as guarding when it has the trigger, strip or no strip", () => {
    expect(groupsCoveredBy(controlSet("standard3"))).toContain("guard");
    expect(groupsCoveredBy(controlSet("standard2"))).not.toContain("guard");
  });

  it("plays the first waves of the game on the ladder, in order", () => {
    // A rung nobody reaches is the same failure as a set nobody reaches, one
    // level down: the ladder is only a ladder if the arc actually climbs it.
    const rungs = WAVES.map((_, i) => controlSetForWave(i).id).filter((id) =>
      (LADDER as string[]).includes(id),
    );
    expect(rungs).toEqual([
      "standard1",
      "standard2",
      "standard2",
      "standard2",
      "standard3",
      "standard4",
      "standard4",
      "standard4",
    ]);
  });
});
