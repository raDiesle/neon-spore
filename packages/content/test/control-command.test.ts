import { describe, expect, it } from "bun:test";
import { CONTROL_SETS, CONTROLS, controlHeld, controlHold, controlPress } from "../src/index.js";

/**
 * What a control says is one table now, and this is what keeps it one.
 *
 * There were four copies — a lobe's, a scene's, and one inside each round's
 * own listener under `apps/game` — and nothing compared them. The failure was
 * silent in three of the four and loud in the fourth: a guide's rehearsal
 * threw on any control outside the standard panel, so every wave with a boss
 * in it was a wave no tutorial could be written for.
 */
describe("what a control says", () => {
  it("answers for every control on every panel", () => {
    for (const def of CONTROLS) {
      expect(() => controlPress(def.id), `${def.id} says nothing`).not.toThrow();
      expect(controlPress(def.id).down.kind, `${def.id} sends an empty command`).toBeTruthy();
    }
  });

  it("gives a release to exactly the controls a thumb stays on", () => {
    // The lance's lobe, the gauge's two valve slabs and the bucket's two. Any
    // other control gaining an `up` is a press somebody has quietly turned
    // into a hold, and the panel drawing it would not know.
    const held = CONTROLS.filter((c) => controlHeld(c.id)).map((c) => c.id);
    expect(held.sort()).toEqual(["gaugeLeft", "gaugeRight", "lance", "pinLeft", "pinRight"]);
    for (const id of held) {
      expect(controlHold(id).up.kind, `${id}'s release sends nothing`).toBeTruthy();
    }
  });

  it("refuses to give a release to a control that is only ever pressed", () => {
    expect(() => controlHold("fireRed")).toThrow();
  });

  it("puts a strip's column into the command and leaves everything else alone", () => {
    expect(controlPress("cannon", 7).down).toEqual({ kind: "cannonCol", col: 7 });
    expect(controlPress("shield", 3).down).toEqual({ kind: "shieldCol", col: 3 });
    // A column handed to something that is not a place is simply not read, so
    // a caller with no column to give can pass whatever it is standing on.
    expect(controlPress("guard", 7).down).toEqual(controlPress("guard", 0).down);
  });

  it("says something for every control every panel in the game carries", () => {
    for (const set of CONTROL_SETS) {
      for (const id of set.controls) {
        expect(controlPress(id).down, `${set.name} carries ${id}, which says nothing`).toBeTruthy();
      }
    }
  });
});
