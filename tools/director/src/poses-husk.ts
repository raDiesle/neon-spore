import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * The state a candidate for `pod:husk-tell` is judged on.
 *
 * Its own file because `poses-versus.ts` is at its length. One pose: a husk
 * hanging alone, on player 2's screen — the seat the tell is drawn for. Both
 * answers on the slot draw player 1 a pod, and a candidate judged on the
 * seat that must not be able to tell would be a candidate judged on nothing;
 * `versus-seat.ts` finds that out for itself, but the pose says so first.
 *
 * It hangs a beat and a bit in, moored, the way POD · HANGING does: the
 * shipped tell is a frame round a moored pod, and the offered one is a moored
 * pod drawn dead, so the moment the two differ on is the hang and nothing
 * later. A husk shot loose is a wreck on every answer, and a wreck is the
 * wrong thing to vote on. No cadence: nothing here is an event.
 */
export const HUSK_POSE: Pose = {
  name: "HUSK · HANGING ON PLAYER 2's SCREEN",
  note: "A husk moored in the middle of the field, as player 2 sees it. Player 1's screen shows a pod on every answer; this is the seat that has to tell.",
  lookAt:
    "the pod itself — whether what says leave it alone is the frame round it or the body it hangs in",
  crop: "tile",
  role: "p2",
  at: (w) => {
    const p = w.pods[0];
    return {
      col: p ? Math.round(p.colMilli / 1000) : 3,
      row: p ? Math.round(p.rowMilli / 1000) : 5,
    };
  },
  build: () => {
    const w = fresh([], [{ beat: 0, col: 3, row: 5, kind: "ward", husk: true }]);
    run(w, TPB * 2);
    if (!w.pods[0]?.husk) throw new Error("no husk is hanging");
    return w;
  },
};
