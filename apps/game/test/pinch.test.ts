import { describe, expect, it } from "bun:test";
import { computeLayout, type Hold } from "@neon-spore/render";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { Pinches } from "../src/pinch.js";

/**
 * **Which two fingers are a pinch** — the pairing `pinch.ts` keeps, with the
 * gap's meaning left to `render/pinch.ts`' own test.
 */

const l = computeLayout({ width: 420, height: 900, dpr: 2 }, DEFAULT_CONFIG, "p1");
const LEFT: Hold = {
  kind: "drag",
  target: "viseLobeLeft",
  player: 1,
  originX: 0,
  originY: 0,
  pinch: true,
};
const PLAIN: Hold = { kind: "drag", target: "viseLobeLeft", player: 1, originX: 0, originY: 0 };
const apart = (tiles: number) => 100 + l.tile * tiles;

describe("a pinch's two fingers", () => {
  it("says nothing for a finger alone, and the gap once the second is down", () => {
    const p = new Pinches();
    expect(p.down(l, 1, [LEFT], 100, 100)).toBeNull();
    const said = p.down(l, 2, [LEFT], apart(4), 100);
    expect(said).toEqual({
      player: 1,
      command: { kind: "drag", target: "viseLobeLeft", on: true, fromMilli: 2200 },
    });
  });

  it("sends a move only when it changes the gap", () => {
    const p = new Pinches();
    p.down(l, 1, [LEFT], 100, 100);
    p.down(l, 2, [LEFT], apart(4), 100);
    expect(p.move(l, 2, apart(4), 100)).toBeNull();
    expect(p.move(l, 2, apart(2), 100)?.command).toMatchObject({ on: true, fromMilli: 200 });
    expect(p.move(l, 9, 0, 0)).toBeNull();
  });

  it("lets go when either finger lifts, and the one left waits for a partner", () => {
    const p = new Pinches();
    p.down(l, 1, [LEFT], 100, 100);
    p.down(l, 2, [LEFT], apart(4), 100);
    expect(p.up(1)?.command).toMatchObject({ target: "viseLobeLeft", on: false });
    expect(p.move(l, 2, apart(3), 100)).toBeNull();
    expect(p.up(2)).toBeNull();
    expect(p.down(l, 3, [LEFT], 100, 100)).toBeNull();
  });

  it("pairs a new finger with the one left down", () => {
    const p = new Pinches();
    p.down(l, 1, [LEFT], 100, 100);
    p.down(l, 2, [LEFT], apart(4), 100);
    p.up(1);
    expect(p.down(l, 3, [LEFT], apart(6), 100)?.command).toMatchObject({ fromMilli: 200 });
  });

  it("ignores a third finger and a hold that is not a pinch", () => {
    const p = new Pinches();
    p.down(l, 1, [LEFT], 100, 100);
    p.down(l, 2, [LEFT], apart(4), 100);
    expect(p.down(l, 3, [LEFT], apart(8), 100)).toBeNull();
    expect(p.up(3)).toBeNull();
    expect(p.down(l, 4, [PLAIN], 100, 100)).toBeNull();
  });
});
