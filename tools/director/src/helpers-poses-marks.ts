import {
  type CapstanStep,
  createWorld,
  handoverLeft,
  startWave,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import { fresh, POSE_CONFIG, POSE_TPB, type Pose, run, runUntil, until } from "./pose-kit.js";

/**
 * The frames CONTROLS › HELPERS draws for a mark's verdict and THE
 * HANDOVER's plate (`helpers-marks.ts`, `helpers-faults.ts`), where no
 * gallery pose ends on the moment. A verdict is thrown off `world.events`,
 * which the drawn phone is handed on its last frame only (`pose-frame.ts`),
 * so its frame stops on the tick that judges.
 */

/** THE CAPSTAN asking for the left band, then a shot. */
const OPENING: CapstanStep[] = [
  { ask: "left", color: "either", beats: 10 },
  { ask: "fire", color: "red", beats: 3 },
];

/** Reversals a rubbing thumb makes in a beat — the autopilot's pace. */
const RUBS_PER_BEAT = 4;

/** How many reversals are sent: more than any band needs to come up bright. */
const RUBS = 40;

/**
 * THE CAPSTAN's left band rubbed until it comes up bright: the pilot's
 * thumb holding the drum over, the navigator's rubbing, and the tick the
 * drum says so — the green verdict on both marks (`capstan-verdicts.ts`).
 */
export const VERDICT_GIVEN: Pose = {
  name: "HELPERS · A TOUCH JUDGED RIGHT",
  note: "The tick THE CAPSTAN's band comes up bright under the rubbing.",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([], [], { kind: "capstan", steps: OPENING });
    runUntil(w, "the first band", [], (x) => x.boss?.kind === "capstan" && x.boss.phase === "lit");
    const t = w.tick;
    const pull: TimedCommand = {
      tick: t,
      player: 1,
      command: {
        kind: "drag",
        target: "capstanSteer",
        on: true,
        fromMilli: -2 * w.cfg.capstanPullMilli,
      },
    };
    const turns: TimedCommand[] = Array.from({ length: RUBS }, (_, i) => ({
      tick: t + 1 + Math.round((i * POSE_TPB) / RUBS_PER_BEAT),
      player: 2,
      command: {
        kind: "drag",
        target: "capstanRub",
        on: true,
        fromMilli: 0,
        fromYMilli: 0,
        id: i + 1,
      },
    }));
    runUntil(w, "the band bright", [pull, ...turns], (x) =>
      x.events.some((e) => e.type === "capstanBright"),
    );
    return w;
  },
};

/** THE HANDOVER's beat and hold, as `poses-handover.ts` authors them. */
const TRADE_AT = 4;
const HOLD = 6;

/** A beat into the trade: the band in the other seat's colours and THEIR PANEL — BACK IN on its lip. */
export const HANDOVER_PLATE: Pose = {
  name: "HELPERS · THE PANELS TRADED",
  note: "The pilot's screen a beat into THE HANDOVER.",
  crop: "ship",
  role: "p1",
  build: (): World => {
    const w = createWorld(POSE_CONFIG, 11);
    startWave(w, 0, [], [], null, false, 0, [{ kind: "handover", at: TRADE_AT, beats: HOLD }]);
    until(w, "the panels traded", (x) => handoverLeft(x) > 0);
    run(w, POSE_TPB);
    return w;
  },
};
