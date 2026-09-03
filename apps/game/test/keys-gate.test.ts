import { afterEach, describe, expect, it } from "bun:test";
import type { Layout } from "@neon-spore/render";
import { type Command, DEFAULT_CONFIG } from "@neon-spore/sim";
import { bindKeys } from "../src/keys.js";

/**
 * The desk's half of the ready gate, driven rather than read.
 *
 * The sibling file next door asserts against the *source*, because there is no
 * DOM in this runner. That is not enough here: the bug this file exists for is
 * a key that sends the hold and never the release, which reads perfectly well
 * in the source and leaves a PC player's circle filling with nobody's finger on
 * it. `bindKeys` only ever touches `window.addEventListener`, so a six-line
 * stub is enough to press a key for real and watch what comes out.
 */

interface Listeners {
  [type: string]: ((e: unknown) => void)[];
}

const real = (globalThis as { window?: unknown }).window;
afterEach(() => {
  (globalThis as { window?: unknown }).window = real;
});

function desk(guideUp: boolean) {
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
    creatures: () => [],
    guideHolds: () => guideUp,
    // The arrows are the wave step here: no round is running in this rig.
    snakeHolds: () => false,
    onPauseToggle: () => {},
    onWaveStep: () => {},
  });
  const fire = (type: string, code: string): void => {
    for (const fn of listeners[type] ?? []) fn({ code, preventDefault() {} });
  };
  return {
    sent,
    down: (code: string) => fire("keydown", code),
    up: (code: string) => fire("keyup", code),
    /** Every `brief` sent for one seat, in order, as its `on` flags. */
    briefs: (player: 1 | 2) =>
      sent
        .filter((c) => c.player === player && c.command.kind === "brief")
        .map((c) => (c.command as { on?: boolean }).on),
  };
}

describe("holding the ready gate at a desk", () => {
  it("sends the hold down and the release up, for both seats, on Space", () => {
    const d = desk(true);
    d.down("Space");
    expect(d.briefs(1)).toEqual([true]);
    expect(d.briefs(2)).toEqual([true]);
    d.up("Space");
    expect(d.briefs(1)).toEqual([true, false]);
    expect(d.briefs(2)).toEqual([true, false]);
  });

  it("gives each seat its own key — F is player 1, G is player 2", () => {
    const d = desk(true);
    d.down("KeyF");
    expect(d.briefs(1)).toEqual([true]);
    expect(d.briefs(2)).toEqual([]);
    d.down("KeyG");
    expect(d.briefs(2)).toEqual([true]);
    d.up("KeyF");
    d.up("KeyG");
    expect(d.briefs(1)).toEqual([true, false]);
    expect(d.briefs(2)).toEqual([true, false]);
  });

  it("never leaves a key pressed on a screen nobody is holding", () => {
    // The bug this file was written for: a tap that sends the hold and no
    // release fills a circle on its own and starts the wave nobody was ready
    // for. Every gate key that can go down has to be able to come back up.
    for (const code of ["Space", "KeyF", "KeyG"]) {
      const d = desk(true);
      d.down(code);
      d.up(code);
      const downs = [...d.briefs(1), ...d.briefs(2)].filter((on) => on === true).length;
      const ups = [...d.briefs(1), ...d.briefs(2)].filter((on) => on === false).length;
      expect(downs).toBe(ups);
    }
  });

  it("leaves F and G alone when no guide is up — they are still the lance and the grip", () => {
    const d = desk(false);
    d.down("KeyF");
    d.down("KeyG");
    expect(d.briefs(1)).toEqual([]);
    expect(d.briefs(2)).toEqual([]);
    expect(d.sent.some((c) => c.command.kind === "prime")).toBe(true);
  });

  it("says nothing at all on Space before the guide is up", () => {
    // The introduction passes on its own timer, and a `brief` sent while it
    // stands is indistinguishable from that timer firing.
    const d = desk(false);
    d.down("Space");
    expect(d.briefs(1)).toEqual([]);
    expect(d.briefs(2)).toEqual([]);
  });
});
