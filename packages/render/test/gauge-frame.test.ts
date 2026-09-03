import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  GAUGE_LEAD_BEATS,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE GAUGE over the whole stage, driven rather than watched.
 *
 * A round replaces the picture, so no frame of the field ever reaches a line
 * of it — and left alone this one draws four beats of lead-in and then a
 * needle that never moves, which is the half of the round that has no dial in
 * it. The pilot turns toward the band and the navigator calls, so the marks,
 * the misses and the verdict are all drawn.
 *
 * That the pilot can see the band at all is the rig's privilege, not the
 * game's: `markMilli` is the one thing player 1's screen does not carry, and
 * reading it here is how a test says what a talking pair would have said.
 */

beforeAll(installCanvasGlobals);

interface Watched {
  phases: Set<string>;
  marks: number;
  misses: number;
  passed: boolean;
}

function gaugeFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 5);
  // The round takes itself off the world when it closes, so what it did has
  // to be read while it is running rather than off the world at the end.
  const watched: Watched = { phases: new Set(), marks: 0, misses: 0, passed: false };
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const frames = runFrames(world, role, ticks, {
    onTick: (tick, w) => {
      const g = w.boss?.kind === "gauge" ? w.boss : null;
      if (g !== null) {
        watched.phases.add(g.phase);
        watched.marks = g.marks;
        watched.misses = g.misses;
        watched.passed = g.passed;
      }
      const commands: TimedCommand[] = [];
      if (g !== null && g.phase === "play") {
        const away = g.markMilli - g.needleMilli;
        const dir = Math.abs(away) <= CFG.gaugeSpanMilli ? 0 : away > 0 ? 1 : -1;
        if (dir !== g.valve) {
          commands.push({
            tick,
            player: 1,
            command:
              dir === 0 ? { kind: "valve", on: false, dir: 1 } : { kind: "valve", on: true, dir },
          });
        }
        // The first call is made blind and early, before the needle has gone
        // anywhere: a round drawn without a miss in it never shows the mark
        // that says a call went wrong.
        const seated = Math.abs(away) <= CFG.gaugeSpanMilli;
        if (seated || w.beat - g.openBeat === GAUGE_LEAD_BEATS + 1) {
          commands.push({ tick, player: 2, command: { kind: "call" } });
        }
      }
      step(w, commands);
    },
  });
  return { ...frames, watched };
}

describe("THE GAUGE draws on all three screens", () => {
  // The lead-in, the whole of the play, a verdict standing at the end of it
  // and the spent round holding that picture afterwards: every phase this
  // round has, through a canvas that refuses what a real one refuses.
  const TICKS = ticksPerBeat(CFG) * (GAUGE_LEAD_BEATS + CFG.gaugeRoundBeats + 2);

  for (const role of ROLES) {
    it(`draws the dial, the band and the verdict on ${role}`, () => {
      const { ctx } = gaugeFrames(role, TICKS);
      // The stub throws on a value a real canvas would refuse, so reaching
      // here at all is most of the assertion; the count is what tells a drawn
      // round from a frame that returned early.
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("really turned the needle, landed calls and missed one, or the frames proved nothing", () => {
    const { watched } = gaugeFrames("test", TICKS);
    expect([...watched.phases].sort()).toEqual(["lead", "play", "spent", "verdict"]);
    expect(watched.marks).toBeGreaterThan(0);
    expect(watched.misses).toBeGreaterThan(0);
    expect(watched.passed).toBe(true);
  });
});
