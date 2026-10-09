import { blisterIsUp, type TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, until } from "./pose-kit.js";

/**
 * THE BLISTER's SWIPE with a thumb half way through its stroke: the body up
 * out of its pore, the track laid across it pointing up, and the bar filled
 * to the half the thumb has carried (`sim/blister-swipe.ts`,
 * `render/blister-help.ts`).
 *
 * Its own file for the reason every pose beside it gives — the group's file
 * is near its limit. The stroke is a press and one move, the way
 * `touchMove` sends a `blisterSwipe` drag while the finger travels.
 */
export const BLISTER_SWIPE: Pose = {
  name: "BLISTER · A STROKE HALF CARRIED",
  note: "A SWIPE blister is up out of its pore for its two beats, pointing up. Player 2 has pressed on it and carried the thumb half the way a stroke needs: the bar across it is half full. Lifted now it would count nothing; carried on and lifted, one of its three blows. Player 2's screen, the seat its BY names.",
  lookAt: "whether the bar reads as which way to go, and whether half full reads as not yet",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([
      {
        beat: 0,
        col: 4,
        kind: "blister",
        color: null,
        row: 3,
        count: 3,
        gesture: "swipe",
        way: "up",
      },
    ]);
    until(w, "a blister up", (x) => x.creatures.some(blisterIsUp));
    const body = w.creatures.find(blisterIsUp);
    if (!body) throw new Error("no blister up");
    const half = Math.round(w.cfg.blisterSwipeMilli / 2);
    const stroke = (tick: number, reach: number): TimedCommand => ({
      tick,
      player: 2,
      command: {
        kind: "drag",
        target: "blisterSwipe",
        id: body.id,
        on: true,
        fromMilli: 0,
        fromYMilli: -reach,
      },
    });
    run(w, 3, [stroke(w.tick, 0), stroke(w.tick + 1, half)]);
    return w;
  },
};
