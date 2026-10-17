import { type BlisterGesture, blisterIsUp } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import {
  BLISTER_COMBO_PLAYED,
  BLISTER_LEVER_PLAYED,
  BLISTER_RUB_PLAYED,
  BLISTER_TURN_PLAYED,
  blisterUp,
  sent,
  sinceUp,
} from "./poses-versus-blister.js";
import { BLISTER_HOLD_PLAYED } from "./poses-versus-blister-hold.js";
import { swipePlayed } from "./poses-versus-blister-swipe.js";

/**
 * **Each control knocked out, and the body going** — what the
 * `blister:death-<gesture>` slots on VERSUS are judged on (the owner, 17
 * October 2026: *every "controls" brush has a weird destroy animation, which
 * looks like a "bulb" is destroyed*).
 *
 * Each is that gesture's played pose — the same hand dealing the same blow on
 * the same tick — held on for as long again as a death lasts after it, so the
 * pair replays the blow *and* what follows it rather than cutting away on the
 * frame the body goes. The knockout ticks are the played poses' own, counted
 * from the tick the blister comes up. Each blister answers to **both** seats,
 * so the pair — which draws player 1's screen first — draws the control
 * itself going, where a blister player 2 owns would show player 1 only the
 * waiting clock.
 */
function goingAfter(played: Pose, gesture: BlisterGesture, knockTicks: number): Pose {
  // A stroke across the field rather than down it: the played pose's way runs
  // into the pore, which would swallow any death that carries the body on.
  const way = gesture === "swipe" ? "right" : undefined;
  return {
    ...played,
    build: () => blisterUp(gesture, way, { by: "both", later: STILL_TO_COME }),
    name: `BLISTER · ${gesture.toUpperCase()} KNOCKED OUT, AND GOING`,
    note: `${played.note} Held on for a second after the blow, to watch the body go.`,
    lookAt: "how the body goes — whether it goes the way its control is worked",
    cadenceSeconds: Math.ceil((knockTicks / TICK_HZ + SEEN_GOING) * 20) / 20,
  };
}

/** A body due long after the pose has replayed, so the wave is not over
 * when the blister goes (`blisterUp`). */
const STILL_TO_COME = [
  { beat: 40, col: 0, kind: "blister", color: null, row: 3, gesture: "tap" },
] as const;

/** Ticks a second, as `DEFAULT_CONFIG` has it; and how long after the blow
 * each pose holds, a little longer than the longest death offered. */
const TICK_HZ = 120;
const SEEN_GOING = 1.35;

/** TAP has no played pose (`BLISTER · UP FOR A TAP` is the body waiting), so
 * the tap is dealt here, a moment after it is up. */
const BLISTER_TAP_PLAYED: Pose = {
  name: "BLISTER · TAPPED",
  note: "A TAP blister is up out of its pore, one blow from gone. Player 2 taps it — the blow, and it is gone. Player 2's screen, the seat its BY names.",
  lookAt: "the tap",
  crop: "tile",
  role: "p2",
  span: 3,
  at: (w) => {
    const c = w.creatures.find(blisterIsUp);
    return c ? { col: c.col, row: c.row } : { col: 4, row: 3 };
  },
  build: () => blisterUp("tap", undefined, { by: "both", later: STILL_TO_COME }),
  hand: (w) => {
    const c = w.creatures.find(blisterIsUp);
    return c && sinceUp(w, "tap") === TAP_AT ? sent(w, { kind: "tap", id: c.id }) : [];
  },
};

const TAP_AT = 40;

export const BLISTER_DEATH_POSES: Pose[] = [
  goingAfter(BLISTER_TAP_PLAYED, "tap", TAP_AT),
  goingAfter(BLISTER_HOLD_PLAYED, "hold", 105),
  goingAfter(swipePlayed("right", "BLISTER · SWIPE STROKED RIGHT AND LIFTED"), "swipe", 81),
  goingAfter(BLISTER_TURN_PLAYED, "turn", 83),
  goingAfter(BLISTER_RUB_PLAYED, "rub", 66),
  goingAfter(BLISTER_COMBO_PLAYED, "combo", 101),
  goingAfter(BLISTER_LEVER_PLAYED, "lever", 120),
];
