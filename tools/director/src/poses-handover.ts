import { createWorld, handoverWarning, startWave } from "@neon-spore/sim";
import { POSE_CONFIG, type Pose, until } from "./pose-kit.js";

/**
 * THE HANDOVER, a beat before the ship says it is coming.
 *
 * `handover:notice` is judged here. The fault trades the two panels for a
 * window mid-wave and the game announces it with a plate on the band's lip
 * (`handover-look.ts`); the candidate asks whether the hull should say it too,
 * with the shape-sheet's two exchanging lobes. Neither can be judged on the
 * rig: `test` never trades, so the pose is the pilot's phone, whose band and
 * hull change colour when the window opens.
 *
 * The world is handed over on the beat before the warning, so the pair watches
 * the whole window from its first beat: two beats of countdown, the trade, the
 * hold, the panels coming back. The window is authored short — a hold of six
 * beats rather than the game's eight — and the replay clock is cut to fit it,
 * so the pair sees the window out, a beat of the ship quiet again, and then the
 * same from the start: that is what makes a thing that happens once a thing a
 * pair can compare. Built through `startWave` with the fault on the wave, the
 * way the director's rail puts one there, rather than by setting
 * `world.malfunction` on a built world.
 */

/** The fault's beat and hold on this wave, and the beat the pose opens on. */
const TRADE_AT = 4;
const HOLD = 6;
const OPEN_ON = TRADE_AT - POSE_CONFIG.handoverWarnBeats;
/** From the beat the pose opens on to a beat after the panels are back. */
const REPLAY_BEATS = TRADE_AT + HOLD + 2 - OPEN_ON;

export const HANDOVER_TRADE_POSE: Pose = {
  name: "HANDOVER · THE TRADE",
  note: "The pilot's screen a beat before THE HANDOVER warns. Two beats of countdown on the band's lip, then the band comes up amber with the navigator's buttons in it and the plate counts the six beats until it comes back.",
  lookAt:
    "the lip of the band where the plate counts down, and the middle of the hull above it — whether the ship itself says the trade as well as the plate does",
  crop: "ship",
  role: "p1",
  cadenceSeconds: (REPLAY_BEATS * 60) / POSE_CONFIG.bpm,
  build: () => {
    const w = createWorld(POSE_CONFIG, 11);
    startWave(w, 0, [], [], null, false, 0, [{ kind: "handover", at: TRADE_AT, beats: HOLD }]);
    until(w, "the beat before the warning", (x) => x.waveBeat >= OPEN_ON);
    if (handoverWarning(w) > 0) throw new Error("the warning came before the pose opened");
    return w;
  },
};
