import { describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { DEFAULT_CONFIG, type MirrorState } from "@neon-spore/sim";
import { mirrorLobeCircle, mirrorLobeUnder } from "../src/mirror-grip.js";
import { type Field, type Hold, touchDown, touchUp } from "../src/touch.js";
import { shipHand } from "../src/touch-hand.js";
import { hold, layout, mirror } from "./mirror-grip-states.js";

/**
 * THE MIRROR's lobes as a control (`mirror-grip.ts`): which seat's thumb each
 * answers under which gesture, and that a lift carries how far the thumb went
 * so the sim can read a carry off it, with the hand's readout lit at the same
 * threshold. The rule is the simulation's (`sim/test/mirror-gestures.test.ts`);
 * this file proves the picture hands it a thumb, and `mirror-grip-draw.test.ts`
 * that the rings, the pin and the count reach the screen they belong to.
 */

function fieldWith(seat: 1 | 2, boss: MirrorState | null): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

const lobe = (l: ReturnType<typeof layout>, id: 0 | 1) =>
  mirrorLobeCircle(l, DEFAULT_CONFIG, id, id === 0 ? 2 : 4);

describe("a thumb on a lobe", () => {
  it("under reflect: player 1 has both, player 2 its cannon", () => {
    const l = layout("p1");
    for (const id of [0, 1] as const) {
      const at = lobe(l, id);
      const touch = mirrorLobeUnder(l, at.x, at.y, fieldWith(1, mirror()));
      expect(touch?.command).toEqual({
        kind: "drag",
        target: "mirrorLobe",
        on: true,
        fromMilli: 0,
        fromYMilli: 0,
        id,
      });
      expect(touch?.hold).toMatchObject({
        kind: "drag",
        target: "mirrorLobe",
        player: 1,
        carryMilli: DEFAULT_CONFIG.mirrorCarryMilli,
      });
    }
    const p2 = layout("p2");
    const cannon = lobe(p2, 0);
    const shield = lobe(p2, 1);
    expect(mirrorLobeUnder(p2, cannon.x, cannon.y, fieldWith(2, mirror()))?.player).toBe(2);
    // Player 1's shield is handed through with no hold, for the sim to refuse.
    const theirs = mirrorLobeUnder(p2, shield.x, shield.y, fieldWith(2, mirror()));
    expect(theirs).toMatchObject({ player: 2, command: { id: 1, on: true }, hold: null });
  });

  it("under hold: one lobe each, and the hold is a pin", () => {
    const l = layout("p1");
    const cannon = lobe(l, 0);
    const shield = lobe(l, 1);
    expect(mirrorLobeUnder(l, cannon.x, cannon.y, fieldWith(1, hold()))?.hold).toMatchObject({
      pin: true,
      id: 0,
    });
    expect(mirrorLobeUnder(l, shield.x, shield.y, fieldWith(1, hold()))?.hold).toBeNull();
    expect(mirrorLobeUnder(l, shield.x, shield.y, fieldWith(2, hold()))?.hold).toMatchObject({
      pin: true,
      id: 1,
    });
    expect(mirrorLobeUnder(l, cannon.x, cannon.y, fieldWith(2, hold()))?.hold).toBeNull();
  });

  it("is refused under an ordinary round, while it demonstrates, and with no mirror up", () => {
    const l = layout("p1");
    const at = lobe(l, 0);
    expect(mirrorLobeUnder(l, at.x, at.y, fieldWith(1, mirror({ round: 0 })))).toBeNull();
    expect(mirrorLobeUnder(l, at.x, at.y, fieldWith(1, mirror({ phase: "show" })))).toBeNull();
    expect(mirrorLobeUnder(l, at.x, at.y, fieldWith(1, null))).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const l = layout("p1");
    const at = lobe(l, 0);
    expect(touchDown(l, at.x, at.y, fieldWith(1, mirror()))?.command).toMatchObject({
      target: "mirrorLobe",
    });
  });
});

describe("the lift", () => {
  const l = layout("p1");
  const field = fieldWith(1, mirror());
  const at = lobe(l, 0);
  const down = () => touchDown(l, at.x, at.y, field)?.hold as Hold;

  it("carries how far the thumb went, in thousandths of a tile", () => {
    const carry = (DEFAULT_CONFIG.mirrorCarryMilli / 1000) * l.tile;
    const left = touchUp(l, down(), { x: at.x - carry, y: at.y });
    expect(left?.command).toMatchObject({ target: "mirrorLobe", on: false, fromMilli: -500 });
    const still = touchUp(l, down(), { x: at.x + 2, y: at.y })?.command;
    expect(still).toMatchObject({ target: "mirrorLobe", on: false });
    const fromMilli = still?.kind === "drag" ? still.fromMilli : Number.NaN;
    expect(Math.abs(fromMilli)).toBeLessThan(DEFAULT_CONFIG.mirrorCarryMilli);
  });

  it("lights the hand's readout at the sim's own threshold", () => {
    const carry = (DEFAULT_CONFIG.mirrorCarryMilli / 1000) * l.tile;
    const p1 = down();
    expect(shipHand(l, p1, at.x, at.y, true)).toMatchObject({
      on: "cannon",
      marks: ["slide", "suck"],
      mirror: true,
    });
    expect(shipHand(l, p1, at.x + carry, at.y, true)).toMatchObject({ marks: ["slide"] });
    const p2 = touchDown(layout("p2"), at.x, at.y, fieldWith(2, mirror()))?.hold as Hold;
    expect(shipHand(l, p2, at.x, at.y, true)).toMatchObject({ on: "muzzle", color: null });
    expect(shipHand(l, p2, at.x - carry, at.y, true)).toMatchObject({ color: "red" });
    expect(shipHand(l, p2, at.x + carry, at.y, true)).toMatchObject({ color: "cyan" });
    const pin = touchDown(l, at.x, at.y, fieldWith(1, hold()))?.hold as Hold;
    expect(shipHand(l, pin, at.x + carry, at.y, true)).toMatchObject({ marks: [], color: null });
  });
});
