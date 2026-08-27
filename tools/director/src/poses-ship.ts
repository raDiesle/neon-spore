import { lanceReady } from "@neon-spore/sim";
import {
  aim,
  fresh,
  guard,
  type Pose,
  prime,
  run,
  suck,
  POSE_TPB as TPB,
  until,
  ward,
} from "./pose-kit.js";

/**
 * What a player's own hands put the ship into.
 *
 * Four of the five are a control being *spent*: a window opened, a lobe turned
 * inside out, a fill under way. The fifth is the ship with nothing pressed,
 * and it is on the page for the same reason the shape catalogue keeps the
 * built contours beside the drafts — a state means nothing except against the
 * state it is not.
 */

const COL = 5;

const CONTROLS: Pose[] = [
  {
    name: "HULL · AT REST",
    note: "Nothing pressed. The cannon lobe is the only thing standing off the hull, and it is where the shot will leave from.",
    crop: "ship",
    build: () => {
      const w = fresh();
      run(w, TPB * 2, [aim(0, COL)]);
      return w;
    },
  },
  {
    name: "SHIELD · ARMED",
    note: "Player 2 put it in a column, player 1 triggered it. Passive it does nothing at all — this pose is the whole of what the trigger buys, and it lasts guardWindowMs.",
    crop: "ship",
    build: () => {
      const w = fresh();
      run(w, TPB * 2, [ward(0, COL), guard(TPB)]);
      return w;
    },
  },
  {
    name: "MAW · OPEN",
    note: "The same cannon lobe, turned inside out. A pod that reaches the hull in this column while it is open is taken in; nothing else changes.",
    crop: "ship",
    build: () => {
      const w = fresh();
      run(w, TPB * 2, [aim(0, COL), suck(TPB)]);
      return w;
    },
  },
  {
    name: "LANCE · FILLING",
    note: "Player 1's thumb is down and the cannon has not moved. The brackets climb the column as the lobe fills and the ring closes on the button — both players read the same fill.",
    crop: "full",
    build: () => {
      const w = fresh();
      // Roughly half of `lancePrimeBeats`, so the picture is a fill in
      // progress rather than one that has already arrived.
      run(w, Math.round(TPB * 1.6), [aim(0, COL), prime(1, true)]);
      return w;
    },
  },
  {
    name: "LANCE · FULL",
    note: "The mark is set and the next shot player 2 fires is a lance. Until they fire it, player 1 is holding a thumb and a column and can do nothing else with either.",
    crop: "full",
    build: () => {
      const w = fresh();
      run(w, TPB, [aim(0, COL), prime(1, true)]);
      until(w, "a full lobe", lanceReady);
      run(w, 2);
      return w;
    },
  },
];

export const CONTROL_POSES = CONTROLS;
