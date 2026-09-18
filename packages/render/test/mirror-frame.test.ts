import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { mirrorChamberDepth, mirrorHullY } from "../src/mirror.js";
import { drawMirrorChamber, MIRROR_SEAT } from "../src/mirror-chamber.js";
import { P1_SKIN } from "../src/seat-skin.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  thirdOf,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MIRROR, over a whole round: it performs, the pair answers one step
 * right and the next one wrong, and both verdicts are drawn — the correct
 * one scars the mirror's own hull, the wrong one throws a rock at the ship's
 * and tips the entire frame upside down over itself.
 */

beforeAll(installCanvasGlobals);

function mirrorFrames(
  role: ViewRole,
  ticks: number,
  sampling: { every?: number; phase?: number } = {},
) {
  const world = createWorld(CFG, 5);
  const index = waveWith("mirror");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const tpb = ticksPerBeat(CFG);
  return runFrames(world, role, ticks, {
    ...sampling,
    onTick: (tick, w) => {
      const listening = w.boss?.kind === "mirror" && w.boss.phase === "listen";
      // One right, then one wrong: the first round is FIRE RED then SHIELD.
      if (listening && tick % tpb === 1) {
        step(w, [{ tick, player: 2, command: { kind: "fire", color: "red" } }]);
      } else if (listening && tick % tpb === 40) {
        step(w, [{ tick, player: 1, command: { kind: "intake" } }]);
      } else {
        step(w, []);
      }
    },
  });
}

describe("the mirror", () => {
  // Each seat draws a third of the ticks (`thirdOf`); the verdict is read off
  // the world, which every run steps whole.
  for (const [i, role] of ROLES.entries()) {
    it(`draws its ship, its sequence and both verdicts for ${role}`, () => {
      const { ctx, world } = mirrorFrames(role, ticksPerBeat(CFG) * 20, thirdOf(4, i));
      expect(ctx.calls).toBeGreaterThan(1000);
      // It really got as far as being judged, or the frames prove nothing
      // about the parts of the picture that only exist after a verdict.
      const boss = world.boss;
      expect(boss?.kind === "mirror" && boss.verdict !== 0).toBe(true);
    });
  }
});

describe("the mirror's chamber", () => {
  // The pair's own ship is a hull with tissue under it; the copy has the same
  // (`mirror-chamber.ts`), and it runs to the top edge of the screen the way
  // the pair's runs off the bottom.
  const l = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");

  it("is drawn, and its ground is a baked sheet like the band's", () => {
    const { ctx } = stubCanvas();
    drawMirrorChamber(ctx as unknown as CanvasRenderingContext2D, l, 1.5);
    expect(ctx.calls).toBeGreaterThan(20);
    expect(ctx.tally.get("drawImage") ?? 0).toBeGreaterThan(0);
  });

  it("reaches the top edge of the screen under the flip", () => {
    // Local `bandTop` is one tile under the hull; flipped, a tile above it on
    // screen; the chamber's depth is what is left up to y = 0.
    const flippedBottom = mirrorHullY(l, CFG) - l.tile - mirrorChamberDepth(l, CFG);
    expect(flippedBottom).toBeCloseTo(0, 6);
  });

  it("is the ship's chamber in blood: every stop matched to player one's by value", () => {
    const lum = (hex: string) => {
      const n = Number.parseInt(hex.slice(1), 16);
      return 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
    };
    for (const [i, own] of P1_SKIN.flesh.entries()) {
      expect(Math.abs(lum(MIRROR_SEAT.flesh[i] ?? "#000000") - lum(own))).toBeLessThan(6);
    }
    expect(MIRROR_SEAT.ground[0]).toBe(MIRROR_SEAT.hull.body[3]);
  });
});
