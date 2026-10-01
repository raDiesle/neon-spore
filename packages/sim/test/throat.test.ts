import { describe, expect, it } from "bun:test";
import { hullRow, midCol } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import {
  THROAT_MODES,
  throatAimAt,
  throatAimBox,
  throatMouthCol,
  throatRadiusMilli,
  throatRingsLeft,
} from "../src/throat.js";
import { throatHeard, throatModeSeat } from "../src/throat-hand.js";
import { CFG, drag, open, pump, tube } from "./throat-fixture.js";

/**
 * THE THROAT's hands, and the sentence they make true: **one of you carries
 * the mouth, the other pumps it open, and each sets two of its four colours**
 * (`throat-hand.ts`). The suck itself is `throat-suck.test.ts`.
 */

describe("the gullet as it is installed", () => {
  it("stands over the middle column, red, not pumped, every ring tight", () => {
    const b = tube(open());
    expect(b.aimXMilli).toBe(midCol(CFG) * 1000);
    expect(b.aimYMilli).toBe((hullRow(CFG) - 3) * 1000);
    expect(b.mode).toBe("red");
    expect(b.pumpMilli).toBe(0);
    expect(throatRingsLeft(CFG, b)).toBe(CFG.throatRings);
    expect(throatRadiusMilli(CFG, b)).toBe(0);
  });

  it("is a fixture and not a body, so there is nothing of it on the field", () => {
    expect(open().creatures).toHaveLength(0);
  });
});

describe("the box the mouth is kept in", () => {
  it("leaves the side walls and the top their margins, and the hull a row", () => {
    const box = throatAimBox(CFG);
    expect(box.minX).toBe(CFG.throatSideMarginMilli);
    expect(box.maxX).toBe((CFG.cols - 1) * 1000 - CFG.throatSideMarginMilli);
    expect(box.minY).toBe(CFG.throatTopMarginMilli);
    expect(box.maxY).toBe((hullRow(CFG) - 1) * 1000);
  });

  it("clamps a mouth carried past any edge", () => {
    const b = tube(open());
    const box = throatAimBox(CFG);
    throatAimAt(CFG, b, -50_000, -50_000);
    expect([b.aimXMilli, b.aimYMilli]).toEqual([box.minX, box.minY]);
    throatAimAt(CFG, b, 99_000, 99_000);
    expect([b.aimXMilli, b.aimYMilli]).toEqual([box.maxX, box.maxY]);
  });
});

describe("the carry, player 2's", () => {
  it("puts the mouth at where it stood plus how far the thumb has come", () => {
    const world = open();
    const b = tube(world);
    const [x, y] = [b.aimXMilli, b.aimYMilli];
    drag(world, 2, "throatAim", true, 0, 0);
    drag(world, 2, "throatAim", true, -1500, -2000);
    expect([b.aimXMilli, b.aimYMilli]).toEqual([x - 1500, y - 2000]);
    drag(world, 2, "throatAim", true, -1000, -2500);
    expect([b.aimXMilli, b.aimYMilli]).toEqual([x - 1000, y - 2500]);
  });

  it("leaves the mouth where it was on a lift, and the next hold starts from there", () => {
    const world = open();
    const b = tube(world);
    drag(world, 2, "throatAim", true, 0, 0);
    drag(world, 2, "throatAim", true, 1000, -1000);
    drag(world, 2, "throatAim", false, 0, 0);
    expect(b.aimFromXMilli).toBe(-1);
    const [x, y] = [b.aimXMilli, b.aimYMilli];
    drag(world, 2, "throatAim", true, 0, 0);
    drag(world, 2, "throatAim", true, 1000, 0);
    expect([b.aimXMilli, b.aimYMilli]).toEqual([x + 1000, y]);
  });

  it("is not the pilot's: player 1 on the mouth moves nothing", () => {
    const world = open();
    const b = tube(world);
    const x = b.aimXMilli;
    drag(world, 1, "throatAim", true, 0, 0);
    drag(world, 1, "throatAim", true, 2000, 0);
    expect(b.aimXMilli).toBe(x);
  });

  it("moves the column the events are panned to", () => {
    const world = open();
    const b = tube(world);
    drag(world, 2, "throatAim", true, 0, 0);
    drag(world, 2, "throatAim", true, -2000, 0);
    expect(throatMouthCol(b)).toBe(midCol(CFG) - 2);
  });
});

describe("the pump, player 1's", () => {
  it("gives nothing for the first stroke, and a gain for every turn after", () => {
    const world = open();
    const b = tube(world);
    pump(world, 0);
    expect(b.pumpMilli).toBe(0);
    pump(world, 3);
    expect(b.pumpMilli).toBe(3 * CFG.throatPumpGainMilli);
  });

  it("opens the circle wider the more it is pumped, and never past full", () => {
    const world = open();
    const b = tube(world);
    pump(world, 1);
    const small = throatRadiusMilli(CFG, b);
    expect(small).toBeGreaterThanOrEqual(CFG.throatMinRadiusMilli);
    pump(world, 40);
    expect(b.pumpMilli).toBe(1000);
    expect(throatRadiusMilli(CFG, b)).toBe(CFG.throatMaxRadiusMilli);
    expect(small).toBeLessThan(CFG.throatMaxRadiusMilli);
  });

  it("does not count a thumb that drifts back by less than a stroke", () => {
    const world = open();
    const b = tube(world);
    const jitter = CFG.throatStrokeMilli - 1;
    drag(world, 1, "throatPump", true, 0, 0);
    drag(world, 1, "throatPump", true, 0, 2000);
    for (let i = 0; i < 10; i++) {
      drag(world, 1, "throatPump", true, 0, 2000 - jitter);
      drag(world, 1, "throatPump", true, 0, 2000);
    }
    expect(b.pumpMilli).toBe(0);
  });

  it("is not the navigator's: player 2 on the pump opens nothing", () => {
    const world = open();
    const b = tube(world);
    for (let i = 0; i < 6; i++) drag(world, 2, "throatPump", true, 0, i % 2 === 0 ? 0 : 2000);
    expect(b.pumpMilli).toBe(0);
  });
});

describe("the colour, each seat's own two", () => {
  it("gives the two shots to player 2 and the shield and the maw to player 1", () => {
    expect(THROAT_MODES.map(throatModeSeat)).toEqual([2, 2, 1, 1]);
  });

  it("changes on its own seat's press and says so", () => {
    const world = open();
    const b = tube(world);
    throatHeard(world, 1, { kind: "throatMode", mode: "shield" });
    expect(b.mode).toBe("shield");
    expect(world.events.some((e) => e.type === "throatMode")).toBe(true);
  });

  it("refuses the other seat's colour aloud and keeps its own", () => {
    const world = open();
    const b = tube(world);
    throatHeard(world, 1, { kind: "throatMode", mode: "cyan" });
    expect(b.mode).toBe("red");
    const refused = world.events.find((e) => e.type === "throatRefuse");
    expect(refused).toMatchObject({ part: "cyan", player: 1 });
  });

  it("says nothing for a press on the colour it already has", () => {
    const world = open();
    world.events.length = 0;
    throatHeard(world, 2, { kind: "throatMode", mode: "red" });
    expect(world.events).toHaveLength(0);
  });
});

describe("what two devices must agree on", () => {
  it("fingerprints the mouth's place, the pump and the colour", () => {
    const world = open();
    const b = tube(world);
    const at = hashWorld(world);
    throatAimAt(CFG, b, b.aimXMilli + 1, b.aimYMilli);
    const moved = hashWorld(world);
    expect(moved).not.toBe(at);
    b.pumpMilli += 1;
    const pumped = hashWorld(world);
    expect(pumped).not.toBe(moved);
    b.mode = "suck";
    expect(hashWorld(world)).not.toBe(pumped);
  });
});
