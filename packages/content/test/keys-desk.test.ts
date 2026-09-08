import { describe, expect, it } from "bun:test";
import { CONTROL_SETS, controlSet, setControls } from "../src/control-sets.js";
import { deskKey, deskKeys } from "../src/keys-desk.js";

/**
 * The desk keyboard is a panel, and this is what holds it to that.
 *
 * Two failures are worth a file of their own. The first is a **control no key
 * reaches**: a panel invented next month with three presses on one seat would
 * quietly leave the third unplayable at a desk, and the only sign would be a
 * tester saying the button does nothing. The second is **two controls on one
 * key**, which is worse — one of them answers and the other is silently gone.
 * Neither is visible in the source of `keys-desk.ts`, because both are facts
 * about the sets rather than about the table.
 *
 * The third group below is the owner's rule itself, as the smallest test that
 * can hold it: one key, several meanings, chosen by the panel.
 */

describe("every panel fits the desk keyboard", () => {
  for (const set of CONTROL_SETS) {
    it(`${set.name} reaches every control it carries, once each`, () => {
      const keys = deskKeys(set);
      const reached = keys.map((k) => k.control);
      for (const player of [1, 2] as const) {
        for (const def of setControls(set, player)) {
          expect(reached).toContain(def.id);
        }
      }
      // And no key says two things at once. A strip takes both keys of its
      // seat's pair, which is one control on two keys and not two on one.
      const codes = keys.map((k) => k.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
  }
});

describe("the keys the desk already had", () => {
  it("leaves the standard panel exactly where it was", () => {
    const set = controlSet("default");
    expect(deskKey(set, "KeyI")?.control).toBe("guard");
    expect(deskKey(set, "KeyS")?.control).toBe("intake");
    expect(deskKey(set, "KeyQ")?.control).toBe("fireRed");
    expect(deskKey(set, "KeyE")?.control).toBe("fireCyan");
    expect(deskKey(set, "KeyA")).toEqual({
      code: "KeyA",
      player: 1,
      control: "cannon",
      step: -1,
    });
    expect(deskKey(set, "KeyL")).toEqual({
      code: "KeyL",
      player: 2,
      control: "shield",
      step: 1,
    });
  });

  it("keeps a rung's buttons on the keys the full panel will give them", () => {
    // STANDARD 1 has red and nothing else on player 2's half. Laid out on its
    // own terms cyan's key would come free and red would still be first — the
    // point is that the *held-back* button keeps its slot, so a pair who
    // learns Q on the first wave finds Q there on the fifth.
    const one = controlSet("standard1");
    expect(deskKey(one, "KeyQ")?.control).toBe("fireRed");
    expect(deskKey(one, "KeyE")).toBeUndefined();
    // And the trigger arrives on I, where the full panel keeps it, rather than
    // on the first free key of a shorter row.
    const three = controlSet("standard3");
    expect(deskKey(three, "KeyI")?.control).toBe("guard");
    expect(deskKey(three, "KeyS")).toBeUndefined();
  });
});

describe("one key, several meanings", () => {
  it("gives S the maw on one panel and nothing on a panel without one", () => {
    // A key means whatever landed in its slot, and a slot a panel leaves empty
    // says nothing rather than reaching for the control next to it.
    expect(deskKey(controlSet("default"), "KeyS")?.control).toBe("intake");
    // THE CLAW has no maw on player 1's half at all — its second press key is
    // the crank, which is a control like any other and takes the slot the maw
    // would have had.
    expect(deskKey(controlSet("claw"), "KeyS")?.control).toBe("crank");
  });

  it("gives player 1's first press key to whatever the panel puts there", () => {
    expect(deskKey(controlSet("default"), "KeyI")?.control).toBe("guard");
    expect(deskKey(controlSet("claw"), "KeyI")?.control).toBe("reach");
    expect(deskKey(controlSet("fleet"), "KeyI")?.control).toBe("salvo");
    expect(deskKey(controlSet("snake"), "KeyI")?.control).toBe("snakeFire");
    expect(deskKey(controlSet("pinball"), "KeyI")?.control).toBe("pinLatch");
  });

  it("gives the sideways pair to whatever slides on that seat", () => {
    // The cannon steps, the valve and the bucket are held — one pair of keys,
    // three panels, and the difference is `step`, which only a strip carries.
    expect(deskKey(controlSet("claw"), "KeyA")?.control).toBe("cannon");
    expect(deskKey(controlSet("gauge"), "KeyA")?.control).toBe("gaugeLeft");
    expect(deskKey(controlSet("gauge"), "KeyD")?.control).toBe("gaugeRight");
    expect(deskKey(controlSet("gauge"), "KeyD")?.step).toBeUndefined();
    expect(deskKey(controlSet("pinball"), "KeyA")?.control).toBe("cannon");
  });

  it("gives the arrows to a panel that walks something across the field", () => {
    const fleet = controlSet("fleet");
    expect(deskKey(fleet, "ArrowUp")?.control).toBe("aimUp");
    expect(deskKey(fleet, "ArrowDown")?.control).toBe("aimDown");
    expect(deskKey(fleet, "ArrowLeft")?.control).toBe("aimLeft");
    expect(deskKey(fleet, "ArrowRight")?.control).toBe("aimRight");
    expect(deskKey(controlSet("snake"), "ArrowLeft")?.control).toBe("snakeLeft");
    // And leaves them to the wave step on every panel that walks nothing.
    expect(deskKey(controlSet("default"), "ArrowLeft")).toBeUndefined();
  });

  it("puts THE CLAW's mouth on the other seat's first key", () => {
    // The one panel in the game that moves the maw to player 2, and the key
    // moves with it rather than a letter being invented for it.
    const claw = controlSet("claw");
    expect(deskKey(claw, "KeyQ")).toEqual({ code: "KeyQ", player: 2, control: "mawTake" });
    // Player 1's own second key is the crank, not the mouth: the mouth moved
    // seats and the key moved with it.
    expect(deskKey(claw, "KeyS")?.control).toBe("crank");
  });
});
