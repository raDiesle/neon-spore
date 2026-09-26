import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { step } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";
import { acting, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE INSTAR's second act's own things (`instar-spit.ts`, `instar-heart.ts`):
 * the rear's globs and the spread's embers falling on their marks, and the
 * heart lit in the bare body. Each is counted by a colour only it draws.
 */

beforeAll(installCanvasGlobals);

const at = (pose: string): number => INSTAR_SCRIPT.findIndex((s) => s.pose === pose);
/** A colour's strokes at any alpha, as the canvas is handed it. */
const tint = (hex: string): string => rgba(hex, 0.5).replace(/[\d.]+\)$/, "");

/** How often `what` — a colour, or a call's name — is in two frames' log. */
function count(cursor: number, what: string): number {
  const world = hung();
  acting(world, cursor);
  const log: string[] = [];
  runFrames(world, "p1", 2, {
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (_, w) => step(w, []),
  });
  const needle = what.startsWith("#") ? tint(what) : what;
  return log.join("|").split(needle).length - 1;
}

describe("THE INSTAR's second act, drawn", () => {
  it("throws globs out of the rear's mouth at its shield marks", () => {
    // A glob is a gradient, whose stops the stub does not log: count gradients.
    const glob = "createRadialGradient";
    expect(count(at("rear"), glob)).toBeGreaterThanOrEqual(count(at("coil"), glob) + 2);
  });

  it("shakes embers off the spread onto its suck marks", () => {
    expect(count(at("spread"), PALETTE.emberRim)).toBeGreaterThan(
      count(at("coil"), PALETTE.emberRim),
    );
  });

  it("lights a heart in the bare body", () => {
    expect(count(at("bare"), PALETTE.redRim)).toBeGreaterThan(count(at("coil"), PALETTE.redRim));
  });
});
