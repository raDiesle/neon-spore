import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  CLAW_LEAD_BEATS,
  CLAW_POD,
  CLAW_ROCK,
  createWorld,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE CLAW over the whole stage, driven rather than watched.
 *
 * A round replaces the picture, so no frame of the field ever reaches a line
 * of it — and left alone this one draws four beats of lead-in and then a claw
 * standing on an empty socket until the clock runs out, which is the half of
 * the round with nothing in it. So the rig plays it: it walks the claw toward
 * the nearest pod and drops, and it deliberately drops on a rock on the way,
 * because the mark over a socket and the price on the hull are both drawn only
 * when something has actually been raised.
 *
 * That the rig can read the wreck field at all is its privilege, not player
 * 1's: `cells` is the one thing his screen does not carry, and reading it here
 * is how a test says what a talking pair would have said out loud.
 */

beforeAll(installCanvasGlobals);

interface Watched {
  phases: Set<string>;
  pods: number;
  rocks: number;
  passed: boolean;
  drifted: boolean;
}

function clawFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 5);
  // The round takes itself off the world when it closes, so what it did has to
  // be read while it is running rather than off the world at the end.
  const watched: Watched = {
    phases: new Set(),
    pods: 0,
    rocks: 0,
    passed: false,
    drifted: false,
  };
  const index = waveWith("claw");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const frames = runFrames(world, role, ticks, {
    onTick: (tick, w) => {
      const c = w.boss?.kind === "claw" ? w.boss : null;
      if (c !== null) {
        watched.phases.add(c.phase);
        watched.pods = c.pods;
        watched.rocks = c.rocks;
        watched.passed = c.passed;
        if (c.driftFrom >= 0) watched.drifted = true;
      }
      const commands: TimedCommand[] = [];
      if (c !== null && c.phase === "play" && w.tick % ticksPerBeat(CFG) === 0) {
        // The first grab of the round is spent on a rock on purpose: the mark
        // over a socket and the price on the hull are both drawn only when
        // something has actually come up, and a rig that only ever found pods
        // would photograph half the round.
        const want = watched.rocks === 0 ? CLAW_ROCK : CLAW_POD;
        let target = -1;
        for (let i = 0; i < c.cells.length; i++) {
          if (c.cells[i] !== want) continue;
          if (target < 0 || Math.abs(i - c.cell) < Math.abs(target - c.cell)) target = i;
        }
        if (target === c.cell) commands.push({ tick, player: 1, command: { kind: "clawGrab" } });
        else if (target >= 0) {
          commands.push({
            tick,
            player: 1,
            command: { kind: "clawStep", dir: target > c.cell ? 1 : -1 },
          });
        }
      }
      step(w, commands);
    },
  });
  return { ...frames, watched };
}

describe("THE CLAW draws on all three screens", () => {
  // The lead-in, enough of the play to clear the field, the verdict standing
  // at the end of it and the spent round holding that picture afterwards.
  const TICKS = ticksPerBeat(CFG) * (CLAW_LEAD_BEATS + CFG.clawRoundBeats + 2);

  for (const role of ROLES) {
    it(`draws the rail, the sockets and the verdict on ${role}`, () => {
      const { ctx } = clawFrames(role, TICKS);
      // The stub throws on a value a real canvas would refuse, so reaching
      // here at all is most of the assertion; the count is what tells a drawn
      // round from a frame that returned early.
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("really raised the pods, pulled a rock and watched the field move", () => {
    const { watched } = clawFrames("test", TICKS);
    expect([...watched.phases].sort()).toEqual(["lead", "play", "spent", "verdict"]);
    expect(watched.pods).toBe(CFG.clawPods);
    expect(watched.rocks).toBeGreaterThan(0);
    expect(watched.drifted).toBe(true);
    expect(watched.passed).toBe(true);
  });
});
