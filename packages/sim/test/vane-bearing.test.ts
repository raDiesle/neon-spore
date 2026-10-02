import { describe, expect, it } from "bun:test";
import {
  vaneColor,
  vaneOpen,
  vaneOpening,
  vaneOpeningNow,
  vanePhase,
  vaneSplitCol,
  vaneWeakCol,
  type World,
} from "../src/index.js";
import { NO_SHELL } from "../src/shell.js";
import { beats, CFG, open, PIVOT, TPB, vane } from "./vane-fixture.js";

/**
 * THE VANE's bearing, and the shot that knocks a pin out of it: split at the
 * ends of the sweep while SWING lasts, answered only in the split's column and
 * colour, one pin an opening, and shielded by whatever the arm has thrown into
 * that lane. The arm itself is `vane.test.ts`.
 */

/**
 * One shot up `col`, fired now and followed for three beats — long enough for
 * it to cross the field and leave through the top, which is where the bearing
 * hangs and the only place this boss can be answered.
 */
function shoot(world: World, col: number, color: "red" | "cyan"): World {
  const at = world.tick;
  return beats(world, 3, [
    { tick: at, player: 1, command: { kind: "cannonCol", col } },
    { tick: at + 2, player: 2, command: { kind: "fire", color } },
  ]);
}

describe("the bearing", () => {
  it("is split at each end of the sweep and nowhere else", () => {
    const world = open();
    beats(world, 1);
    expect(vaneOpen(world)).toBe(true);
    beats(world, 3);
    expect(vaneOpen(world)).toBe(false);
    beats(world, 3);
    expect(vaneOpen(world)).toBe(true);
  });

  it("takes a pin from a shot in the split column, in the split's colour", () => {
    const world = beats(open(), 1);
    shoot(world, vaneWeakCol(CFG, world.waveBeat), vaneColor(CFG, vaneOpening(world.waveBeat)));
    expect(vane(world).pins).toBe(CFG.vanePins - 1);
  });

  it("refuses the wrong colour, and books it against the colour balance", () => {
    const world = beats(open(), 1);
    const right = vaneColor(CFG, vaneOpening(world.waveBeat));
    shoot(world, vaneWeakCol(CFG, world.waveBeat), right === "red" ? "cyan" : "red");
    expect(vane(world).pins).toBe(CFG.vanePins);
    expect(world.balance.colorMisses).toBe(1);
  });

  it("refuses the wrong column, and does not call that a colour miss", () => {
    const world = beats(open(), 1);
    shoot(world, PIVOT, vaneColor(CFG, vaneOpening(world.waveBeat)));
    expect(vane(world).pins).toBe(CFG.vanePins);
    expect(world.balance.colorMisses).toBe(0);
  });

  it("refuses everything while the housing is shut", () => {
    // Cycle beat 4 is mid-sweep, and a shot fired there arrives before the arm
    // has finished travelling. Both columns and both colours, so nothing about
    // this is an aim that happened to be wrong.
    for (const col of [PIVOT - 1, PIVOT + 1]) {
      for (const color of ["red", "cyan"] as const) {
        const world = beats(open(), 4);
        expect(vaneOpen(world)).toBe(false);
        shoot(world, col, color);
        expect(vane(world).pins).toBe(CFG.vanePins);
      }
    }
  });

  it("gives one pin per opening and no more, so a spray cannot skip one", () => {
    const world = beats(open(), 1);
    const col = vaneWeakCol(CFG, world.waveBeat);
    const color = vaneColor(CFG, vaneOpening(world.waveBeat));
    const at = world.tick;
    beats(world, 3, [
      { tick: at, player: 1, command: { kind: "cannonCol", col } },
      { tick: at + 2, player: 2, command: { kind: "fire", color } },
      { tick: at + TPB, player: 2, command: { kind: "fire", color } },
    ]);
    expect(vane(world).pins).toBe(CFG.vanePins - 1);
  });

  it("is not reachable up a column that has something standing in it", () => {
    // A rock cannot be shot and stops a shot going up its column, so the arm
    // defends its own bearing with whatever it has just thrown into that lane.
    const world = beats(open(), 1);
    const col = vaneWeakCol(CFG, world.waveBeat);
    world.creatures.push({
      id: world.nextId++,
      kind: "meteor",
      col,
      row: 4,
      fromRow: 4,
      color: null,
      holes: 0,
      petals: 0,
      dragMilli: 0,
      shell: NO_SHELL,
    });
    shoot(world, col, vaneColor(CFG, vaneOpening(world.waveBeat)));
    expect(vane(world).pins).toBe(CFG.vanePins);
  });

  it("is split at the ends only while its first phase lasts", () => {
    // From VEER the stops have worn: the cycle's own openings are gone and a
    // window is something the pair makes with a thumb (`vane-open.ts`).
    const world = beats(open(3), 1);
    expect(vanePhase(vane(world).pins).name).toBe("VEER");
    expect(vaneOpen(world)).toBe(false);
    shoot(world, vaneWeakCol(CFG, 1), vaneColor(CFG, vaneOpening(1)));
    expect(vane(world).pins).toBe(3);
  });

  it("re-forms on its first form's last pin rather than going down", () => {
    // SEIZE: the arm pinned under the pilot's thumb, the seized housing hauled
    // off it by the navigator, and then the shot (`vane-haul.test.ts`). The
    // fall itself is the last form's (`vane-forms.test.ts`).
    const world = beats(open(1), 1);
    const at = world.tick;
    beats(world, 1, [
      { tick: at, player: 1, command: { kind: "drag", target: "vaneArm", on: true, fromMilli: 0 } },
      {
        tick: at + 1,
        player: 2,
        command: {
          kind: "drag",
          target: "vaneHousing",
          on: false,
          fromMilli: 0,
          fromYMilli: CFG.vaneHaulMilli,
        },
      },
    ]);
    shoot(world, vaneSplitCol(world, vane(world)), vaneColor(CFG, vaneOpeningNow(world.waveBeat)));
    expect(vane(world).form).toBe(1);
    expect(vane(world).pins).toBe(CFG.vaneFormPins);
  });
});
