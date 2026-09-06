import { afterEach, describe, expect, it } from "bun:test";
import type { Layout } from "@neon-spore/render";
import { type Command, type Creature, DEFAULT_CONFIG } from "@neon-spore/sim";
import { bindKeys } from "../src/keys.js";

/**
 * THE PUSH at a desk, driven rather than read.
 *
 * The mechanic was reachable only with a pointer for as long as `G` was the
 * whole of the rig's hand: a keyboard could take hold of a rock and had no way
 * to carry it, so a headless check and the director's stage both saw half a
 * gesture. What has to hold here is the half a key cannot fake — a `drag` is
 * **cumulative from the grab**, so two presses the same way say two tiles and
 * not one twice (`sim/grip-push.ts`).
 */

interface Listeners {
  [type: string]: ((e: unknown) => void)[];
}

const real = (globalThis as { window?: unknown }).window;
afterEach(() => {
  (globalThis as { window?: unknown }).window = real;
});

/** `nearestHull` reads three fields and nothing else, so the rig hands it
 * three rather than a whole body it would have to keep in step with. */
const rock = (id: number, row: number): Creature =>
  ({ id, kind: "meteor", row }) as unknown as Creature;

function desk(creatures: readonly Creature[]) {
  const listeners: Listeners = {};
  (globalThis as { window?: unknown }).window = {
    addEventListener(type: string, fn: (e: unknown) => void) {
      listeners[type] ??= [];
      listeners[type].push(fn);
    },
  };
  const sent: { player: 1 | 2; command: Command }[] = [];
  bindKeys({
    buffer: {
      push(player: 1 | 2, command: Command) {
        sent.push({ player, command });
      },
    } as never,
    layout: () => ({ cols: DEFAULT_CONFIG.cols }) as Layout,
    cfg: DEFAULT_CONFIG,
    isOver: () => false,
    creatures: () => creatures,
    guideHolds: () => false,
    snakeHolds: () => false,
    onPauseToggle: () => {},
    onWaveStep: () => {},
    onGuideReplay: () => {},
  });
  const fire = (type: string, code: string): void => {
    for (const fn of listeners[type] ?? []) fn({ code, preventDefault() {} });
  };
  return {
    sent,
    down: (code: string) => fire("keydown", code),
    up: (code: string) => fire("keyup", code),
    /** Every carry sent, as the pair a reader of the wire would read. */
    drags: () =>
      sent
        .filter((c) => c.command.kind === "drag")
        .map((c) => c.command as { target: string; fromMilli: number; id?: number }),
  };
}

describe("carrying a body at a desk", () => {
  it("names the body G took hold of, and a distance from where it grabbed", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    expect(d.drags()).toEqual([
      {
        kind: "drag",
        target: "gripBody",
        on: true,
        fromMilli: DEFAULT_CONFIG.gripPushMilli,
        id: 7,
      },
    ] as never);
  });

  it("adds up, because a drag is cumulative and never a step", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    d.up("Period");
    d.down("Period");
    expect(d.drags().map((c) => c.fromMilli)).toEqual([
      DEFAULT_CONFIG.gripPushMilli,
      DEFAULT_CONFIG.gripPushMilli * 2,
    ]);
  });

  it("goes back the way it came, and through nought", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    d.up("Period");
    d.down("Comma");
    d.up("Comma");
    d.down("Comma");
    expect(d.drags().map((c) => c.fromMilli)).toEqual([
      DEFAULT_CONFIG.gripPushMilli,
      0,
      -DEFAULT_CONFIG.gripPushMilli,
    ]);
  });

  it("says nothing at all with no hand on anything", () => {
    const d = desk([]);
    d.down("Period");
    d.down("Comma");
    expect(d.drags()).toEqual([]);
    // And with G pressed over an empty field there is still nothing to carry.
    d.down("KeyG");
    d.down("Period");
    expect(d.drags()).toEqual([]);
  });

  it("forgets the distance when the hand comes off, so the next grab starts at nought", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    d.up("Period");
    d.up("KeyG");
    d.down("KeyG");
    d.down("Period");
    expect(d.drags().map((c) => c.fromMilli)).toEqual([
      DEFAULT_CONFIG.gripPushMilli,
      DEFAULT_CONFIG.gripPushMilli,
    ]);
  });

  it("carries as player 2, the seat whose hand the grip is", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    expect(d.sent.filter((c) => c.command.kind === "drag").every((c) => c.player === 2)).toBe(true);
  });
});
