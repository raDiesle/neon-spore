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
  panelSends,
  setControls,
  setHas,
  setLance,
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
      // THE SCENE is the one set with nothing on the band, by design: THE
      // INSTAR's panel is the boss's own body, and every gesture on it is a
      // drag the band never carries (`control-sets-table.ts`).
      if (set.id === "scene") {
        expect(set.controls.length).toBe(0);
        continue;
      }
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

  // The lance has no button at all any more: the fill is on the two colours,
  // which every panel that can fire already carries (`sim/lance.ts`).
  it("keeps the maw off the rungs of the ladder, and on the panel they build to", () => {
    expect(setHas(controlSet(DEFAULT_CONTROL_SET_ID), "intake")).toBe(true);
    expect(setHas(controlSet("standard4"), "intake")).toBe(false);
  });

  /**
   * The owner's rule of 14 September 2026, said in his own words: *standard 1
   * to 5 have no beam shot, and STANDARD itself has everything, the lance
   * included.* It is a field rather than a held-back `ControlId` because the
   * lance has no button — it is the two colours held rather than tapped — so
   * `reduces` cannot reach it (`control-sets-table.ts`).
   */
  it("holds the hold back on every numbered STANDARD, and hands it to STANDARD", () => {
    for (const set of CONTROL_SETS) {
      if (!/^STANDARD \d/.test(set.name)) continue;
      expect(setLance(set), `${set.id} fills the lobe: ${set.name}`).toBe(false);
    }
    expect(setLance(controlSet(DEFAULT_CONTROL_SET_ID))).toBe(true);
  });

  it("gives no panel without both colours a hold at all, declared or not", () => {
    // Derived rather than authored: the gesture rides the two colour buttons,
    // so a panel without them has nowhere to put a thumb and `lance: false`
    // on it would restate its own control list.
    for (const set of CONTROL_SETS) {
      if (setHas(set, "fireRed") && setHas(set, "fireCyan")) continue;
      expect(setLance(set), `${set.id} fills a lobe it has not got`).toBe(false);
    }
  });

  /**
   * STANDARD 5 is the one rung that is not a reduction, and this is why: it
   * carries every button the full panel does. What it is less by is the
   * gesture, which no list of controls can express — so a `reduces` on it would
   * hold nothing back, which the ladder's own test refuses.
   */
  it("gives the top rung every button the full panel has and no reduction", () => {
    const five = controlSet("standard5");
    expect([...five.controls].sort()).toEqual(
      [...controlSet(DEFAULT_CONTROL_SET_ID).controls].sort(),
    );
    expect(five.reduces).toBeUndefined();
    expect(setLance(five)).toBe(false);
  });

  it("has a set that trades a button away rather than adding one", () => {
    // Sets do not compose: a set that is the default with something appended
    // is the one thing the owner ruled out, so every panel that is not a rung
    // of the ladder both gains and loses against it. THE CLAW is the plainest
    // case — the gun for an arm.
    const base = controlSet(DEFAULT_CONTROL_SET_ID);
    const set = controlSet("claw");
    const added = set.controls.filter((id) => !setHas(base, id));
    const dropped = base.controls.filter((id) => !setHas(set, id));
    expect(added.length).toBeGreaterThan(0);
    expect(dropped.length).toBeGreaterThan(0);
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
      // Eight waves on the top rung, because the maw is held back until
      // SALVAGE — the one wave whose subject asks for it.
      "standard4",
      "standard4",
      "standard4",
      "standard4",
      "standard4",
      "standard4",
      "standard4",
      "standard4",
    ]);
  });
});

/**
 * What a panel will *answer*, which is what the desk keyboard is gated by
 * (`apps/game/src/keys.ts`). The owner's rule in one sentence: if no cannon is
 * visible, no cannon shot is possible.
 */
describe("what a panel answers", () => {
  it("answers a command only when one of its own controls sends it", () => {
    expect(panelSends(controlSet("default"), "fire")).toBe(true);
    expect(panelSends(controlSet("default"), "reach")).toBe(false);
    // THE CLAW trades the gun for an arm, so firing is not a thing the game
    // can do on it — which is the whole reason the gate exists.
    expect(panelSends(controlSet("claw"), "fire")).toBe(false);
    expect(panelSends(controlSet("claw"), "guard")).toBe(false);
    expect(panelSends(controlSet("claw"), "reach")).toBe(true);
    // The mouth is on the other seat there and sends the ship's own `intake`.
    expect(panelSends(controlSet("claw"), "intake")).toBe(true);
  });

  it("answers a held control's release as well as its press", () => {
    // A gate that let a colour down and not up would leave the cannon lobe
    // filling with nobody's thumb on it, which is the failure
    // `keys-gate.test.ts` was written for in the first place.
    expect(panelSends(controlSet("default"), "prime")).toBe(true);
    expect(panelSends(controlSet("gauge"), "valve")).toBe(true);
  });

  it("lets through the five that are nobody's button", () => {
    // A gate rather than a wall: the host's own verbs and the hand on the
    // field are on no panel's list and must reach the simulation from every
    // one of them.
    for (const set of CONTROL_SETS) {
      expect(panelSends(set, "restart"), `${set.id} refuses restart`).toBe(true);
      expect(panelSends(set, "grip"), `${set.id} refuses the grip`).toBe(true);
      expect(panelSends(set, "brief"), `${set.id} refuses READY`).toBe(true);
    }
  });
});
