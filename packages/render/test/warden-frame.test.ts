import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_TETHER,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  wardenColor,
  wardenCycle,
  wardenEyeOpen,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
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
 * THE WARDEN over a whole cycle, driven rather than watched: the rope has to be
 * *pulled taut* before the hatch opens at all, and the eye behind it is drawn
 * only while it is. Left alone, this wave would show a shut door for a minute
 * and never draw the half of the boss that matters.
 */

beforeAll(installCanvasGlobals);

function wardenFrames(
  role: ViewRole,
  ticks: number,
  sampling: { every?: number; phase?: number } = {},
) {
  const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  return runFrames(world, role, ticks, {
    ...sampling,
    onTick: (_tick, w) => {
      // Player 1 grabs the handle the moment a rope is there and hauls it all
      // the way over; player 2 fires into the pupil as soon as the hatch is
      // open. A slack rope, a taut one, an open eye and the snap-back after a
      // hit are four separate pictures and none of them happens on its own.
      const b = w.boss?.kind === "warden" ? w.boss : null;
      const commands: TimedCommand[] = [];
      if (b && b.tetherId !== NO_TETHER) {
        commands.push({
          tick: w.tick,
          player: 1,
          command: {
            kind: "drag",
            target: "wardenTether",
            on: true,
            fromMilli: 0,
            // Down, because that is the one direction the field always has
            // room for from where this rope hangs (`sim/handle-pull.ts`).
            fromYMilli: b.pulling ? CFG.wardenTautMilli : 0,
          },
        });
        if (wardenEyeOpen(w, b)) {
          commands.push({
            tick: w.tick,
            player: 1,
            command: { kind: "cannonCol", col: b.pupilCol },
          });
          commands.push({
            tick: w.tick,
            player: 2,
            command: { kind: "fire", color: wardenColor(wardenCycle(CFG, w.waveBeat)) },
          });
        }
      }
      step(w, commands);
    },
  });
}

describe("the warden", () => {
  const TICKS = ticksPerBeat(CFG) * (CFG.wardenCycleBeats + 2);

  // Each seat draws a third of the ticks (`thirdOf`), and the rig's play is
  // kept for the case under the loop that reads its events.
  const played = remembered((role) => wardenFrames(role, TICKS, thirdOf(4, ROLES.indexOf(role))));

  for (const role of ROLES) {
    it(`draws the ring, a pulled rope and an open eye for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really did open the hatch and land a shot, or the frames proved nothing", () => {
    // The state is no help here: a landed shot cuts the rope in the same tick,
    // so by the last frame there is nothing left to look at. What the run
    // reported is the record.
    const { events } = played("test");
    expect(events.some((e) => e.type === "tether")).toBe(true);
    expect(events.some((e) => e.type === "eyeOpen")).toBe(true);
    expect(events.some((e) => e.type === "plate")).toBe(true);
  });
});
