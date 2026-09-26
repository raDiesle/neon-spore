import { afterEach, describe, expect, it } from "bun:test";
import type { Command } from "@neon-spore/sim";
import { askForLean, LEAN_STEP_MILLI, leanMilli, leanReader } from "../src/lean.js";

/**
 * **THE PLUMB's lean on the wire** (`lean.ts`): one reading per half degree
 * moved, never one per event; only while a bob is on the field; the seat's
 * own weight; and `on: false` once when the page loses the sensor. The
 * reader is tested without a page — the listener around it is two lines.
 */

type Sent = { player: 1 | 2; command: Command };

function reader(o: { seat?: 1 | 2; bob?: () => object | null } = {}) {
  const sent: Sent[] = [];
  const bob = {};
  const r = leanReader(
    (player, command) => sent.push({ player, command }),
    () => o.seat ?? 1,
    o.bob ?? (() => bob),
  );
  return { r, sent };
}

describe("leanMilli", () => {
  it("is gamma in thousandths of a degree, an integer", () => {
    expect(leanMilli(3.2004)).toBe(3200);
    expect(leanMilli(-0.4)).toBe(-400);
    expect(Number.isInteger(leanMilli(1 / 3))).toBe(true);
  });

  it("is held to ninety degrees either way, the simulation's clamp", () => {
    expect(leanMilli(120)).toBe(90_000);
    expect(leanMilli(-120)).toBe(-90_000);
  });
});

describe("leanReader", () => {
  it("sends a burst of readings inside one step as one command", () => {
    const { r, sent } = reader();
    for (const g of [2, 2.1, 1.9, 2.2, 2.4, 1.6]) r.read(g);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.command).toEqual({
      kind: "drag",
      target: "plumbLevelLeft",
      on: true,
      fromMilli: 2000,
    });
  });

  it("sends again once the lean has moved a step from the last one sent", () => {
    const { r, sent } = reader();
    r.read(0);
    r.read((LEAN_STEP_MILLI - 1) / 1000);
    r.read(LEAN_STEP_MILLI / 1000);
    r.read(0.2);
    r.read(0);
    expect(sent.map((s) => (s.command.kind === "drag" ? s.command.fromMilli : null))).toEqual([
      0, 500, 0,
    ]);
  });

  it("is the pilot's left weight and the navigator's right", () => {
    const left = reader({ seat: 1 });
    const right = reader({ seat: 2 });
    left.r.read(1);
    right.r.read(1);
    expect(left.sent[0]?.player).toBe(1);
    expect(right.sent[0]?.player).toBe(2);
    expect(right.sent[0]?.command).toMatchObject({ target: "plumbLevelRight" });
  });

  it("sends nothing with no bob on the field", () => {
    const { r, sent } = reader({ bob: () => null });
    r.read(4);
    r.lose();
    expect(sent).toHaveLength(0);
  });

  it("tells a new bob the lean it already told the old one", () => {
    let bob: object | null = {};
    const { r, sent } = reader({ bob: () => bob });
    r.read(1);
    r.read(1);
    bob = {};
    r.read(1);
    bob = null;
    r.read(1);
    bob = {};
    r.read(1);
    expect(sent).toHaveLength(3);
  });

  it("sends the phone unread once when the sensor is lost, then reads afresh", () => {
    const { r, sent } = reader({ seat: 2 });
    r.read(3);
    r.lose();
    r.lose();
    r.read(3);
    expect(sent.map((s) => s.command)).toEqual([
      { kind: "drag", target: "plumbLevelRight", on: true, fromMilli: 3000 },
      { kind: "drag", target: "plumbLevelRight", on: false, fromMilli: 0 },
      { kind: "drag", target: "plumbLevelRight", on: true, fromMilli: 3000 },
    ]);
  });

  it("ignores a reading that is not a number", () => {
    const { r, sent } = reader();
    r.read(Number.NaN);
    expect(sent).toHaveLength(0);
  });
});

describe("askForLean", () => {
  const g = globalThis as Record<string, unknown>;
  const had = g.DeviceOrientationEvent;
  afterEach(() => {
    g.DeviceOrientationEvent = had;
  });

  it("asks iOS once, and a refusal is swallowed", async () => {
    let asks = 0;
    g.DeviceOrientationEvent = {
      requestPermission: () => {
        asks++;
        return Promise.reject(new Error("denied"));
      },
    };
    askForLean();
    await Promise.resolve();
    expect(asks).toBe(1);
  });

  it("is safe where the browser never asks, or throws outright", () => {
    g.DeviceOrientationEvent = undefined;
    expect(() => askForLean()).not.toThrow();
    g.DeviceOrientationEvent = {
      requestPermission: () => {
        throw new Error("not a gesture");
      },
    };
    expect(() => askForLean()).not.toThrow();
  });
});
