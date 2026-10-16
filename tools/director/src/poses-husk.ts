import { beatSeconds } from "@neon-spore/sim";
import { fresh, POSE_CONFIG, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * The state a candidate for `pod:husk-tell` was judged on. The slot closed
 * with nothing taken on 17 September 2026 (`tools/versus/DECIDED.md`); the
 * pose stays in the gallery, the way every decided slot's does.
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
 * wrong thing to vote on. Cadenced since the pod beside it wears a clock
 * (16 October 2026): it starts again well before that clock loses the wave.
 *
 * `pod:hollow` is judged here too, from 16 October 2026: the hollow pod's
 * answers are bodies drawn on player 2's screen alone, and this is that seat.
 */
/** Beats the husk pose plays before it starts again. */
const HUSK_PLAYS = 10;

export const HUSK_POSE: Pose = {
  name: "HUSK · HANGING ON PLAYER 2's SCREEN",
  note: "A husk moored in the middle of the field, as player 2 sees it. Player 1's screen shows a pod on every answer; this is the seat that has to tell.",
  lookAt:
    "the pod itself — whether what says leave it alone is the frame round it or the body it hangs in",
  crop: "tile",
  role: "p2",
  cadenceSeconds: HUSK_PLAYS * beatSeconds(POSE_CONFIG),
  at: (w) => {
    const p = w.pods.find((x) => x.kind === "husk");
    return {
      col: p ? Math.round(p.colMilli / 1000) : 3,
      row: p ? Math.round(p.rowMilli / 1000) : 5,
    };
  },
  build: () => {
    // A real pod at the far edge, out of the crop, because a field holding
    // nothing but a husk is a cleared field (`beat.ts`) and the cleared card
    // came down over the husk from 16 October 2026.
    const w = fresh(
      [],
      [
        { beat: 0, col: 3, row: 5, kind: "husk" },
        { beat: 0, col: 0, row: 1, kind: "pod" },
      ],
    );
    run(w, TPB * 2);
    if (!w.pods.some((x) => x.kind === "husk")) throw new Error("no husk is hanging");
    return w;
  },
};

/** Beats on the clock when POD · OWED starts, and how many of them it plays
 * before it starts again — it stops one short of zero, where the wave is lost
 * and the screen is no longer a pod's. */
const OWED_FROM = 8;
const OWED_PLAYS = 7;

/**
 * **A real pod with its clock running out**, from eight beats to one, over and
 * over. `pod:real` is judged here (16 October 2026): every answer on it moves
 * with the deadline — loosens, thrashes or wakes — and POD · HANGING, two
 * beats in, shows none of that. Cadenced, because the run to the end of the
 * clock is the event.
 */
export const POD_OWED_POSE: Pose = {
  name: "POD · OWED",
  note: "A pod hanging with its clock running down from eight beats. Nobody shoots it; the replay stops a beat before the wave is lost.",
  lookAt: "the pod itself — whether it says how little time is left before the ring does",
  crop: "tile",
  cadenceSeconds: OWED_PLAYS * beatSeconds(POSE_CONFIG),
  at: (w) => {
    const p = w.pods[0];
    return {
      col: p ? Math.round(p.colMilli / 1000) : 3,
      row: p ? Math.round(p.rowMilli / 1000) : 5,
    };
  },
  build: () => {
    const w = fresh([], [{ beat: 0, col: 3, row: 5, kind: "pod" }]);
    // Hung within its first beat, which is when its clock is set.
    run(w, TPB);
    run(w, Math.max(0, (w.pods[0]?.dueTicks ?? 0) - OWED_FROM * TPB));
    if (!w.pods[0] || w.pods[0].dueTicks <= 0) throw new Error("no pod is owed");
    return w;
  },
};
