import { livingKindForColor, type SpawnEntry } from "@neon-spore/sim";
import { fresh, POSE_CONFIG, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

// A second and a half of the light lit, after the rest has run.
const READY_SECONDS = 1.5;

/**
 * **THE LOCK's light through its rest and into ready**: built on the tick a
 * locked shot has just landed, so the replay opens on the rest's start, fills
 * for its four seconds, and holds lit for a second and a half before it
 * starts again. `ship:lock-light` is judged here (19 October 2026). Two
 * bodies come down far from the cannon, so there is something to lock and the
 * light is drawn.
 */
export const LOCK_LIGHT_POSE: Pose = {
  name: "LOCK · RESTING, THEN READY",
  note: "A locked shot has just landed: the lock rests four seconds, then is ready again. Two bodies are coming down far from the cannon.",
  lookAt:
    "the cannon on the ship at the bottom — whether you can tell from across a table that a lock is ready again, and how far the rest has run",
  crop: "ship",
  cadenceSeconds: POSE_CONFIG.lockRestMs / 1000 + READY_SECONDS,
  build: () => {
    const entries: SpawnEntry[] = [
      { beat: 0, col: 7, kind: livingKindForColor("red"), color: "red" },
      { beat: 2, col: 5, kind: livingKindForColor("cyan"), color: "cyan" },
    ];
    const w = fresh(entries);
    run(w, TPB, [{ tick: 0, player: 1, command: { kind: "cannonCol", col: 1 } }]);
    w.lockRestTicks = Math.round((POSE_CONFIG.lockRestMs * POSE_CONFIG.tickHz) / 1000);
    return w;
  },
};
