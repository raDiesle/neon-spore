import { describe, expect, it } from "bun:test";
import { type Command, DEFAULT_CONFIG, type DragTarget } from "@neon-spore/sim";
import { Fingers } from "../src/fingers.js";
import { computeLayout, type Hold } from "../src/index.js";
import { Rubs } from "../src/rub-turns.js";

/**
 * **How many times a thumb has turned back** — the count `rub.ts` keeps, with
 * what a count means left to `sim/rime-hand.ts`' own test; and the
 * foot's chord beside it, through `fingers.ts`, lifting the pad it was.
 */

const L = computeLayout({ width: 420, height: 900, dpr: 2 }, DEFAULT_CONFIG, "p1");
const T = L.tile;

const FLAT: Hold = {
  kind: "drag",
  target: "rimeHalfLeft",
  player: 1,
  originX: 0,
  originY: 0,
  rub: true,
};
const FOOT: Hold = {
  kind: "drag",
  target: "trivetPadFront",
  player: 1,
  originX: 0,
  originY: 0,
  chord: true,
};

const says = (id: number, on: boolean, target: DragTarget = "rimeHalfLeft"): Command => ({
  kind: "drag",
  target,
  on,
  fromMilli: 0,
  fromYMilli: 0,
  id,
});

/** Every count a thumb sends moved through `ys`, from a press at the top. */
function rubbed(ys: number[]): (number | undefined)[] {
  const r = new Rubs();
  const sent = [r.down(1, [FLAT], 100, 100)];
  for (const y of ys) sent.push(r.move(L, 1, 100, 100 + y * T));
  sent.push(r.up(1));
  return sent.flatMap((s) => (s?.command.kind === "drag" ? [s.command.id] : []));
}

describe("a rubbing thumb", () => {
  it("sends nought on the press and a rising count as it goes back and forth", () => {
    const r = new Rubs();
    expect(r.down(1, [FLAT], 100, 100)).toEqual({ player: 1, command: says(0, true) });
    const sent: (Command | undefined)[] = [];
    for (const y of [0.5, 1, 0.4, -0.2, 0.3, 1, 0.2, 0.8])
      sent.push(r.move(L, 1, 100, 100 + y * T)?.command);
    expect(sent.filter((c) => c !== undefined)).toEqual([
      says(1, true),
      says(2, true),
      says(3, true),
      says(4, true),
    ]);
    expect(r.up(1)?.command).toEqual(says(4, false));
  });

  it("does not count a jitter as a turn", () => {
    expect(rubbed([0.1, -0.1, 0.1, -0.1])).toEqual([0, 0]);
  });

  it("does not count a thumb carried one way", () => {
    expect(rubbed([0.5, 1, 2, 3])).toEqual([0, 0]);
  });

  it("counts a rub across as well as along", () => {
    const r = new Rubs();
    r.down(1, [FLAT], 100, 100);
    expect(r.move(L, 1, 100 + T, 100)).toBeNull();
    expect(r.move(L, 1, 100, 100)?.command).toEqual(says(1, true));
  });

  it("ignores a hold that is not a rub", () => {
    const r = new Rubs();
    expect(r.down(1, [FOOT], 0, 0)).toBeNull();
    expect(r.move(L, 1, 0, T)).toBeNull();
    expect(r.up(1)).toBeNull();
  });
});

describe("the fingers on one foot", () => {
  it("lifts each of a foot's pads by the id it went down as", () => {
    const f = new Fingers();
    expect(f.down(L, 1, [FOOT], 0, 0).map((s) => s.command)).toEqual([
      says(0, true, "trivetPadFront"),
    ]);
    expect(f.down(L, 2, [FOOT], 0, 0).map((s) => s.command)).toEqual([
      says(1, true, "trivetPadFront"),
    ]);
    expect(f.up(2).map((s) => s.command)).toEqual([says(1, false, "trivetPadFront")]);
    expect(f.up(1).map((s) => s.command)).toEqual([says(0, false, "trivetPadFront")]);
  });

  it("counts a rub's turns beside a foot's pads", () => {
    const f = new Fingers();
    f.down(L, 1, [FOOT], 0, 0);
    f.down(L, 2, [FLAT], 0, 0);
    f.move(L, 2, 0, T);
    expect(f.move(L, 2, 0, 0).map((s) => s.command)).toEqual([says(1, true)]);
    expect(f.up(2).map((s) => s.command)).toEqual([says(1, false)]);
  });
});
