import { describe, expect, it } from "bun:test";
import { slowing } from "../src/slow.js";
import { valveMark, valveOnMark } from "../src/valve.js";
import {
  CFG,
  freeze,
  install,
  pin,
  pull,
  runUntil,
  TPB,
  tick,
  toTurn,
  turn,
  turnOnto,
  valve,
  wheel,
} from "./valve-rig.js";

/**
 * THE VALVE: one seat turns the wheel onto its mark, the other taps the pin
 * to freeze it, and then either draws the pin.
 *
 * What these pin is the first movement's rule, which a phone cannot show:
 * that only the pilot's hand turns the wheel and only the navigator's tap
 * freezes it; that the tap is an edge, not a thumb parked on the pin; that a
 * frozen wheel does not turn; that a pull too shallow does nothing; and that
 * each window, run out, kicks the wheel off its mark. The later movements and
 * the spark are `valve-run.test.ts`.
 */

describe("THE VALVE comes in", () => {
  it("still, every pin in, the wheel at the top", () => {
    const world = install();
    const s = valve(world);
    expect(s.phase).toBe("still");
    expect(s.pins).toBe(3);
    expect(s.wheelMilli).toBe(0);
    expect(world.events.some((e) => e.type === "valveEnter")).toBe(true);
  });

  it("brings every authored mark inside a turn", () => {
    expect(valve(install([1250, -100, 600])).marks).toEqual([250, 900, 600]);
  });

  it("lights the first mark after it settles, with no window on the turn", () => {
    const world = install();
    const seen = runUntil(world, (w) => valve(w).phase === "turn");
    expect(seen.has("valveLight")).toBe(true);
    expect(world.beat).toBe(CFG.valveStillBeats);
    expect(slowing(world)).toBe(false);
  });
});

describe("the wheel", () => {
  it("is turned by the pilot's hand, and onto its mark opens the freeze under THE SLOW", () => {
    const world = install();
    toTurn(world);
    const seen = turnOnto(world);
    const s = valve(world);
    expect(seen.has("valveHold")).toBe(true);
    expect(s.phase).toBe("hold");
    expect(valveOnMark(s, CFG)).toBe(true);
    expect(slowing(world)).toBe(true);
  });

  it("does not answer the navigator's hand", () => {
    const world = install();
    toTurn(world);
    turn(world, 200, 40, 2);
    expect(valve(world).wheelMilli).toBe(0);
  });

  it("turned off its mark before the tap slips, and the window shuts", () => {
    const world = install();
    toTurn(world);
    turnOnto(world);
    const seen = turn(world, 120);
    expect(seen.has("valveSlip")).toBe(true);
    expect(valve(world).phase).toBe("turn");
    expect(slowing(world)).toBe(false);
  });

  it("left on its mark untapped lapses and is kicked off it", () => {
    const world = install();
    toTurn(world);
    turnOnto(world);
    const before = valve(world).wheelMilli;
    const seen = runUntil(world, (w) => valve(w).phase === "turn", CFG.valveFreezeBeats + 2);
    expect(seen.has("valveLapse")).toBe(true);
    expect(valve(world).wheelMilli).toBe((before + CFG.valveKickMilli) % 1000);
    expect(slowing(world)).toBe(false);
  });
});

describe("the pin", () => {
  it("is frozen by the navigator's tap and not the pilot's", () => {
    const world = install();
    toTurn(world);
    turnOnto(world);
    tick(world, [pin(world.tick, 1)]);
    expect(valve(world).phase).toBe("hold");
    const seen = freeze(world);
    expect(seen.has("valveFreeze")).toBe(true);
    expect(valve(world).phase).toBe("frozen");
    expect(slowing(world)).toBe(true);
  });

  it("wants a tap after the mark, not a thumb already resting on it", () => {
    const world = install();
    toTurn(world);
    tick(world, [pin(world.tick, 2)]);
    turnOnto(world);
    tick(world, [pin(world.tick, 2)]);
    expect(valve(world).phase).toBe("hold");
    tick(world, [pin(world.tick, 2, 0, false)]);
    tick(world, [pin(world.tick, 2)]);
    expect(valve(world).phase).toBe("frozen");
  });

  it("holds the wheel dead while frozen", () => {
    const world = install();
    toTurn(world);
    turnOnto(world);
    freeze(world);
    const at = valve(world).wheelMilli;
    turn(world, 200);
    expect(valve(world).wheelMilli).toBe(at);
  });

  it("comes out only when drawn deep enough, by either seat", () => {
    const world = install();
    toTurn(world);
    turnOnto(world);
    freeze(world);
    pull(world, 1, CFG.valvePullMilli - 1);
    expect(valve(world).pins).toBe(3);
    const seen = pull(world, 2, CFG.valvePullMilli);
    expect(seen.has("valvePull")).toBe(true);
    expect(valve(world).pins).toBe(2);
    expect(valve(world).movement).toBe(2);
    expect(valve(world).phase).toBe("jet");
  });

  it("thaws when the pull window runs out, and the wheel is kicked", () => {
    const world = install();
    toTurn(world);
    turnOnto(world);
    freeze(world);
    const seen = runUntil(world, (w) => valve(w).phase === "turn", CFG.valvePullBeats + 2);
    expect(seen.has("valveThaw")).toBe(true);
    expect(valve(world).pins).toBe(3);
    expect(valveOnMark(valve(world), CFG)).toBe(false);
  });

  it("gives the freeze its whole beats however late in a beat the mark was reached", () => {
    const world = install();
    toTurn(world);
    runUntil(world, (w) => w.tick % TPB === TPB - 2);
    turnOnto(world);
    const opened = world.tick;
    runUntil(world, (w) => valve(w).phase !== "hold", CFG.valveFreezeBeats + 2);
    expect(world.tick - opened).toBeGreaterThanOrEqual(CFG.valveFreezeBeats * TPB);
  });
});

describe("the hand off the rim", () => {
  it("leaves the wheel where it is and takes a fresh reference", () => {
    const world = install();
    toTurn(world);
    turn(world, 100);
    tick(world, [wheel(world.tick, 1, 0, false)]);
    tick(world, [wheel(world.tick, 1, 700)]);
    expect(valve(world).wheelMilli).toBe(100);
    expect(valveMark(valve(world))).toBe(250);
  });
});
