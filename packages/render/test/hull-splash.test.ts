import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { Scar } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { DROP, drawHullSplashes, splashReach } from "../src/hull-splash.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The splash an enemy leaves on the hull, in its own colour.
 *
 * Asked for by name by the owner on 17 September 2026, which is why it is on
 * the field at all (`hull-splash.ts`). What is worth holding is not how it
 * looks — no test can say that — but the three things about it that are
 * decisions: meteors are exempt, the colour is the creature's own rather than
 * a damage red, and the whole of it comes off the scar, so it is still drawn
 * when the body that made it has been gone for a minute.
 */

beforeAll(installCanvasGlobals);

const L = () => computeLayout(VIEWPORT, CFG, "test");

/** Every call one scar makes, in order. */
function painted(scar: Scar): string[] {
  const { ctx } = stubCanvas();
  const l = L();
  // Built before the log is opened: `new Path2D` counts against whichever
  // context last claimed it, so a path made inside the call is a call
  // (`canvas-stub.ts`).
  const filled = new Path2D();
  ctx.log = [];
  drawHullSplashes(
    ctx as unknown as CanvasRenderingContext2D,
    l,
    [scar],
    (x) => ({ x, y: l.hullY }),
    filled,
  );
  const log = [...(ctx.log ?? [])];
  // Closed, not merely read: the log a context is recording into is a module
  // pointer, and a `new Path2D` built by the *next* call to this helper would
  // otherwise be appended to the array this one just handed back.
  ctx.log = undefined;
  return log;
}

const scar = (over: Partial<Scar>): Scar => ({ col: 4, beat: 9, kind: "slick", ...over });

describe("a splash on the hull", () => {
  it("is not drawn for a meteor, which leaves a hole instead", () => {
    expect(painted(scar({ kind: "meteor" }))).toHaveLength(0);
  });

  it("carries the colour the body was wearing", () => {
    for (const [color, hex] of [
      ["cyan", PALETTE.cyan],
      ["red", PALETTE.red],
    ] as const) {
      const log = painted(scar({ color })).join("\n");
      expect(log, `a ${color} body splashed no ${hex}`).toContain(rgba(hex, DROP));
    }
  });

  it("carries the colour its kind says, where the kind says one", () => {
    // A wall is a live wire and arrives in its own blue whatever it was shot
    // with; the one mapping is `breachHue` and this proves it is read.
    const log = painted(scar({ kind: "fence", color: "red" })).join("\n");
    expect(log).toContain(rgba(PALETTE.arc, DROP));
    expect(log).not.toContain(rgba(PALETTE.red, DROP));
  });

  it("paints the same picture twice from the same scar", () => {
    // Both phones draw one hull, so a splash seeded from anything but the
    // column and the beat would be two different stains (`tile-seed.ts`).
    expect(painted(scar({ color: "cyan" }))).toEqual(painted(scar({ color: "cyan" })));
  });

  it("reaches well past the column it landed on", () => {
    // Half a look, per `.claude/skills/destruction`: the owner has twice asked
    // for damage to show on the whole hull and not only where it landed. The
    // wash is a path and a canvas log records no path points, so its reach is
    // asked of the drawing; the drops are ellipses and are read off the frame.
    const l = L();
    expect(splashReach(l, scar({}))).toBeGreaterThanOrEqual(l.tile * 2);
    expect(splashReach(l, scar({ span: 3 }))).toBeGreaterThan(splashReach(l, scar({})));
    const xs = painted(scar({ color: "red" }))
      .map((line) => /^ellipse\(([-\d.]+),/.exec(line))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => Number(m[1]));
    expect(xs.length, "the splash threw no drops").toBeGreaterThan(8);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(l.tile * 2);
  });
});
