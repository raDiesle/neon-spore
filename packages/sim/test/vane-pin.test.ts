import { describe, expect, it } from "bun:test";
import {
  createWorld,
  startWave,
  vaneColor,
  vaneFold,
  vaneOpen,
  vaneOpeningNow,
  vanePhase,
  vanePinned,
  vaneSplitCol,
  vaneTipCol,
  vaneTipNow,
} from "../src/index.js";
import { colSpan } from "../src/types.js";
import { arm, beats, CFG, open, PIVOT, pin, TPB, vane } from "./vane-fixture.js";

/**
 * **THE VANE's pilot's thumb on the picture**: pinning the arm under VEER
 * (`docs/spec/bosses.md` §11.5, *Three phases, three gestures*).
 *
 * From VEER the cycle stops handing the pair a window at each end of the
 * sweep, and the only way to one is a thumb on the arm — which buys them the
 * thing this boss has never let them have: a **fold line that is standing
 * still** for as long as the thumb is down, so a column named against the arm
 * is still true when the sentence saying it arrives. Under SEIZE that is no
 * longer enough on its own (`vane-haul.test.ts`).
 *
 * Nothing here can hurt anybody. Every miss below is a window lost, which is
 * what the boss that attacks nobody is allowed to cost (§11.5).
 */

describe("the pin, under VEER", () => {
  it("is the only thing that splits the housing", () => {
    const world = beats(open(3), 1);
    expect(vanePhase(vane(world).pins).name).toBe("VEER");
    expect(vaneOpen(world)).toBe(false);
    pin(world);
    expect(vanePinned(world, vane(world))).toBe(true);
    expect(vaneOpen(world)).toBe(true);
  });

  it("stops the arm where it stood, and the fold line with it", () => {
    const world = beats(open(3), 1);
    pin(world);
    const held = vane(world).pinCol;
    expect(held).toBe(vaneTipCol(CFG, 3, world.waveBeat));
    // Two beats on, the sweep has moved and the pinned arm has not.
    beats(world, 2);
    expect(vaneTipCol(CFG, 3, world.waveBeat)).not.toBe(held);
    expect(vaneTipNow(world, vane(world))).toBe(held);
  });

  /**
   * And that is what the thumb is *for*. An arrival on a pinned beat is folded
   * about the column the pair are looking at rather than the one the arm has
   * swept on to, which is the whole difficulty of this boss handed back to
   * them for the price of a hand.
   */
  it("folds an arrival about the column it is pinned in", () => {
    const world = createWorld({ ...CFG }, 1);
    startWave(world, 0, [{ beat: 1, col: 0, kind: "meteor", color: null }], [], {
      kind: "vane",
      pins: 3,
    });
    beats(world, 1);
    pin(world);
    const held = vane(world).pinCol;
    // Beat by beat to the one it crosses the arm on, which is where it folds.
    do beats(world, 1);
    while ((world.creatures[0]?.row ?? 0) < CFG.vaneArmRow);
    expect(vanePinned(world, vane(world))).toBe(true);
    expect(world.creatures[0]?.col).toBe(vaneFold(CFG, held, 0, colSpan("meteor")));
  });

  it("puts the split on the side away from the load, as the ends do", () => {
    const world = beats(open(3), 1);
    pin(world);
    expect(vaneSplitCol(world, vane(world))).toBe(PIVOT - vane(world).pinSide);
  });

  it("takes a pin from a shot up the split column in the housing's colour", () => {
    const world = beats(open(3), 1);
    pin(world);
    const at = world.tick;
    beats(world, 2, [
      {
        tick: at,
        player: 1,
        command: { kind: "cannonCol", col: vaneSplitCol(world, vane(world)) },
      },
      {
        tick: at + 2,
        player: 2,
        command: { kind: "fire", color: vaneColor(CFG, vaneOpeningNow(world.waveBeat)) },
      },
    ]);
    expect(vane(world).pins).toBe(2);
  });

  it("gives one pin per hold and no more, so a spray cannot skip one", () => {
    const world = beats(open(3), 1);
    pin(world);
    const col = vaneSplitCol(world, vane(world));
    const color = vaneColor(CFG, vaneOpeningNow(world.waveBeat));
    const at = world.tick;
    beats(world, 3, [
      { tick: at, player: 1, command: { kind: "cannonCol", col } },
      { tick: at + 2, player: 2, command: { kind: "fire", color } },
      { tick: at + TPB, player: 2, command: { kind: "fire", color } },
    ]);
    expect(vane(world).pins).toBe(2);
  });

  it("is torn free when its beats run out, and the window goes with it", () => {
    const world = beats(open(3), 1);
    pin(world);
    beats(world, CFG.vanePinBeats + 1);
    expect(vanePinned(world, vane(world))).toBe(false);
    expect(vane(world).pinBeat).toBe(-1);
    expect(vaneOpen(world)).toBe(false);
  });

  it("goes the moment the thumb lifts", () => {
    const world = beats(open(3), 1);
    pin(world);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 1, command: arm(false) }]);
    expect(vaneOpen(world)).toBe(false);
  });

  /** The pilot's hand and nobody else's: the seat with the cannon is the seat
   * that has to reach the column it pins. */
  it("is the pilot's alone", () => {
    const world = beats(open(3), 1);
    pin(world, 2);
    expect(vane(world).pinBeat).toBe(-1);
  });

  it("does nothing at all while SWING lasts", () => {
    const world = beats(open(CFG.vanePins), 1);
    pin(world);
    expect(vane(world).pinBeat).toBe(-1);
  });
});
