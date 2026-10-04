import { describe, expect, it } from "bun:test";
import type { Command, DragTarget } from "@neon-spore/sim";
import { Chords } from "../src/chord-pads.js";
import type { Hold } from "../src/index.js";

/**
 * **Which pad each finger is** — the count `chord.ts` keeps, with what a pad
 * down means left to `sim/trivet-hand.ts`' own test.
 */

const FRONT: Hold = {
  kind: "drag",
  target: "trivetPadFront",
  player: 1,
  originX: 0,
  originY: 0,
  chord: true,
};
const REAR: Hold = { ...FRONT, target: "trivetPadRear", player: 2 };
const PLAIN: Hold = { kind: "drag", target: "trivetPadFront", player: 1, originX: 0, originY: 0 };

const pad = (id: number, on: boolean, target: DragTarget = "trivetPadFront"): Command => ({
  kind: "drag",
  target,
  on,
  fromMilli: 0,
  fromYMilli: 0,
  id,
});

describe("a chord's fingers", () => {
  it("counts each finger down as the lowest pad no finger is on", () => {
    const c = new Chords();
    expect(c.down(1, [FRONT])).toEqual([{ player: 1, command: pad(0, true) }]);
    expect(c.down(2, [FRONT])[0]?.command).toEqual(pad(1, true));
    expect(c.down(3, [FRONT])[0]?.command).toEqual(pad(2, true));
  });

  it("lifts the same pad the finger was counted as", () => {
    const c = new Chords();
    c.down(1, [FRONT]);
    c.down(2, [FRONT]);
    expect(c.up(1)[0]?.command).toEqual(pad(0, false));
    expect(c.up(2)[0]?.command).toEqual(pad(1, false));
    expect(c.up(2)).toEqual([]);
  });

  it("gives a finger put back the gap it left", () => {
    const c = new Chords();
    c.down(1, [FRONT]);
    c.down(2, [FRONT]);
    c.down(3, [FRONT]);
    c.up(2);
    expect(c.down(4, [FRONT])[0]?.command).toEqual(pad(1, true));
  });

  it("counts each seat's foot on its own", () => {
    const c = new Chords();
    c.down(1, [FRONT]);
    expect(c.down(2, [REAR])).toEqual([{ player: 2, command: pad(0, true, "trivetPadRear") }]);
  });

  it("ignores a hold that is not a chord", () => {
    const c = new Chords();
    expect(c.down(1, [PLAIN])).toEqual([]);
    expect(c.up(1)).toEqual([]);
  });

  it("says every pad no finger is on for a press that is the whole body, and lifts them all", () => {
    const c = new Chords();
    c.down(1, [FRONT]);
    const whole = c.down(2, [{ ...FRONT, pads: 3 }]).map((p) => p.command);
    expect(whole).toEqual([pad(1, true), pad(2, true)]);
    expect(c.up(2).map((p) => p.command)).toEqual([pad(1, false), pad(2, false)]);
  });
});
