import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  vanePhase,
  vanePinned,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { armPoints } from "../src/vane-spar.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  remembered,
  runFrames,
  thirdOf,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE VANE over a full cycle and a half: the arm at both ends of its travel,
 * mid-sweep in both directions, the housing split in both colours and shut, and
 * the flick it leaves when it throws an arrival. Its own wave carries the
 * arrivals, because a mechanism turning over an empty field draws none of them.
 */

beforeAll(installCanvasGlobals);

function vaneFrames(
  role: ViewRole,
  ticks: number,
  sampling: { every?: number; phase?: number } = {},
) {
  const world = createWorld(CFG, 3);
  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return runFrames(world, role, ticks, sampling);
}

describe("the vane", () => {
  // Each seat draws a third of the ticks (`thirdOf`), and the rig's play is
  // kept for the case under the loop that reads what it reached.
  const played = remembered((role) =>
    vaneFrames(role, ticksPerBeat(CFG) * 18, thirdOf(4, ROLES.indexOf(role))),
  );

  for (const role of ROLES) {
    it(`draws the arm, the bearing and a split housing for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  /**
   * The spar ends where `vaneTipNow` says the fold is. Until 20 September 2026
   * the bow was cubed in `f`, which is largest exactly at the end of the run,
   * so a fast sweep drew the arm tens of pixels past its own tip and the bead
   * the pair is naming sat somewhere in the middle of it.
   */
  it("bows behind the tip and never past it", () => {
    const pts = armPoints(0, 0, 100, 0, 40);
    const last = pts.at(-1);
    expect(last?.x).toBeCloseTo(100, 6);
    expect(last?.y).toBeCloseTo(0, 6);
    // And it really is bowed: the middle of the arm trails the straight line
    // between its two ends, against the direction of travel.
    const mid = pts[Math.floor(pts.length / 2)];
    expect(mid?.x ?? 0).toBeLessThan(50);
  });

  /**
   * The two hands, which no frame above reaches: the rings are drawn from VEER
   * on, and a wave played straight through keeps every pin in its bearing. So
   * this one wears the bearing down by hand and *plays* both gestures — the
   * pilot's thumb on the arm, then the navigator's haul on the seized housing —
   * which is the only way a frame of either ring exists at all
   * (`render/vane-grip.ts`).
   */
  it("draws both hands once the pins have worn and a thumb has stopped the arm", () => {
    const world = createWorld(CFG, 3);
    const index = waveWith("vane");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    if (world.boss?.kind !== "vane") throw new Error("the vane's wave installed no vane");
    world.boss.pins = 2; // VEER: the pin is the opening, and there is no other.
    const seen = { pinned: false, hauled: false };
    const half = ticksPerBeat(CFG) * 8;
    const { ctx } = runFrames(world, "p1", half * 2, {
      onTick: (tick, w) => {
        const v = w.boss?.kind === "vane" ? w.boss : null;
        const cmds: TimedCommand[] = [];
        if (v !== null) {
          // Halfway, the bearing seizes and her hand becomes the second half
          // of every opening.
          if (tick === half) v.pins = 1;
          const pinned = vanePinned(w, v);
          seen.pinned ||= pinned;
          seen.hauled ||= v.hauled;
          if (!pinned) {
            cmds.push({
              tick,
              player: 1,
              command: { kind: "drag", target: "vaneArm", on: true, fromMilli: 0, fromYMilli: 0 },
            });
          } else if (vanePhase(v.pins).asks === "haul" && !v.hauled) {
            cmds.push({
              tick,
              player: 2,
              command: {
                kind: "drag",
                target: "vaneHousing",
                on: false,
                fromMilli: 0,
                fromYMilli: -CFG.vaneHaulMilli,
              },
            });
          }
        }
        step(w, cmds);
      },
    });
    expect(ctx.calls).toBeGreaterThan(1000);
    // Without both of these the rings were never in a frame and the assertion
    // above is a picture of the same boss nobody has touched.
    expect(seen.pinned).toBe(true);
    expect(seen.hauled).toBe(true);
  });

  it("really threw something, or the flick was never drawn", () => {
    const { world } = played("test");
    const boss = world.boss;
    expect(boss?.kind === "vane" && boss.throwBeat !== -1).toBe(true);
  });
});
