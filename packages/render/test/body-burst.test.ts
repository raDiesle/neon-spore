import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { SimEvent } from "@neon-spore/sim";
import { BodyBurst } from "../src/body-burst.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { RenderState } from "../src/render-state.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A body bursting on the hull like a balloon of water (`body-burst.ts`),
 * asked for by name by the owner on 22 September 2026.
 *
 * No test can say whether it *reads* as a balloon going. What is worth holding
 * is the four things that are decisions: which hits burst and which have their
 * own picture already, that the colour is the body's own and not a damage red,
 * that a drop is back on the plating by the end rather than hanging in the
 * sky, and that the whole thing is state a restart forgets.
 */

beforeAll(installCanvasGlobals);

const L = () => computeLayout(VIEWPORT, CFG, "test");

function breach(over: Partial<Extract<SimEvent, { type: "breach" }>>): SimEvent {
  return {
    type: "breach",
    col: 4,
    weight: "heavy",
    span: 1,
    kind: "slick",
    fromRow: 13,
    seed: 0,
    holes: 0,
    color: null,
    beat: 7,
    ...over,
  } as SimEvent;
}

/** Every call one burst makes at `age` seconds, on a flat membrane. */
function painted(e: SimEvent, age: number): string[] {
  const fx = new BodyBurst();
  const l = L();
  fx.ingest([e]);
  fx.update(age);
  const { ctx } = stubCanvas();
  ctx.log = [];
  fx.draw(ctx as unknown as CanvasRenderingContext2D, l, () => l.hullY);
  const log = [...(ctx.log ?? [])];
  // Closed and not merely read, for `hull-splash.test.ts`'s reason: the log is
  // a module pointer and the next helper's paths would append to this array.
  ctx.log = undefined;
  return log;
}

describe("a body bursting on the hull", () => {
  it("throws nothing for the three hits that have their own picture", () => {
    // A rock punches a hole (`craters.ts`), a wall earths through the dome
    // without breaking the skin, and a gum is already a drop of water with a
    // splash of its own (`gum-splash.ts`).
    for (const kind of ["meteor", "fence", "gum"] as const) {
      expect(painted(breach({ kind }), 0.05), `${kind} burst`).toHaveLength(0);
    }
    expect(painted(breach({}), 0.05).length).toBeGreaterThan(0);
  });

  it("bursts in the colour the body was wearing", () => {
    for (const [color, hex] of [
      ["cyan", PALETTE.cyan],
      ["red", PALETTE.red],
    ] as const) {
      const log = painted(breach({ color }), 0.05).join("\n");
      const v = Number.parseInt(hex.slice(1), 16);
      expect(log, `a ${color} body burst in no ${hex}`).toContain(
        `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`,
      );
    }
  });

  it("has every drop back on the plating by the end of it", () => {
    // The arc is a throw and a fall in one expression, and a drop still in the
    // sky when the burst is filtered away would vanish in mid-air.
    const l = L();
    const ys = painted(breach({}), 0.49)
      .map((line) => /^Path2D\.ellipse\([-\d.]+, ([-\d.]+),/.exec(line))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => Number(m[1]));
    expect(ys.length, "the burst threw no drops").toBeGreaterThan(8);
    expect(Math.max(...ys) - l.hullY).toBeLessThan(l.tile * 0.2);
    expect(l.hullY - Math.min(...ys)).toBeLessThan(l.tile * 0.6);
  });

  it("throws the same water twice from the same hit", () => {
    // Both phones draw one hull: a drop seeded from anything but the column
    // and its own index would be two different bursts.
    expect(painted(breach({ color: "cyan" }), 0.2)).toEqual(
      painted(breach({ color: "cyan" }), 0.2),
    );
  });

  it("is forgotten with the rest of what a renderer holds", () => {
    // It outlives its frame by half a second, so it is state, and the
    // guard `restart.test.ts` keeps for `Effects` has to hold here.
    const used = new RenderState();
    used.frame([breach({})], L(), 1 / 60);
    expect(used.bodyBurst).not.toEqual(new RenderState().bodyBurst);
    used.forget();
    expect(used.bodyBurst).toEqual(new RenderState().bodyBurst);
  });
});
