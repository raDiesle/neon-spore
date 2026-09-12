import { countdownIsOpen, countdownMarks } from "@neon-spore/sim";
import { firstOfKind, fresh, type Pose, run, POSE_TPB as TPB, until } from "./pose-kit.js";

/**
 * The state a candidate for THE COUNT is judged on.
 *
 * Its own file because `poses-bodies.ts` and `poses-versus.ts` are both at
 * their length. One pose: a count falling alone down the middle with three
 * beats left, on the pilot's screen — the seat the count is drawn for. The
 * pair runs on from here, so a look is watched through the last three
 * marks, the two open beats and the count starting over, before the body
 * reaches the hull and the world is rebuilt (`versus-pair.ts`).
 *
 * Three rather than four because a full count and an open body can look alike
 * on a look that lights the whole face, and a pose starting one beat in
 * shows the difference at once.
 */

const COL = 5;

export const COUNT_POSE: Pose = {
  name: "COUNT · THREE BLADES LEFT",
  note: "One red count falling down the middle with three beats to go before it opens. Player 1's screen: the count is drawn for this seat and player 2's eye never blinks. Watch it through three blades, two open beats and the count starting again.",
  lookAt: "the socket — how the blades say three, then two, then one, and the hole on zero",
  crop: "tile",
  span: 4,
  role: "p1",
  at: firstOfKind("countdown"),
  build: () => {
    const w = fresh([{ beat: 0, col: COL, kind: "countdown", color: "red" }]);
    until(w, "a count with three marks left", (x) => {
      const c = x.creatures.find((k) => k.kind === "countdown");
      return (
        c !== undefined &&
        !countdownIsOpen(x.cfg, x.beat, c) &&
        countdownMarks(x.cfg, x.beat, c) === 3
      );
    });
    // Just past the beat, so the first frame is not the mark going.
    run(w, Math.round(TPB / 6));
    return w;
  },
};
