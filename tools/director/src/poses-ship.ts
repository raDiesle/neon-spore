import type { World } from "@neon-spore/sim";
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
    /**
     * Both swellings up and nothing falling — the state `ship:light` is voted
     * on, and the reason it is not `HULL · AT REST`: one lobe in the middle
     * answers only the easy half of whether a light says the ship is round.
     * Two, far enough apart to be read separately, ask it of each swelling and
     * of the flat between them. Nothing is fired, because a muzzle flash is the
     * brightest thing on the screen and would decide a vote about a wash.
     */
    name: "HULL · BOTH LOBES UP",
    note: "The cannon swelling left of centre and the shield swelling right of it, with nothing falling and nothing pressed. The membrane runs the whole width of the field between them and past them both.",
    lookAt:
      "the light across the whole width of the hull — whether each swelling reads as a dome, and where the surface turns away toward the right edge",
    crop: "ship",
    build: () => {
      const w = fresh();
      // Three beats, not two: both lobes ease rather than snap, and a world
      // handed over on the tick of the command shows two dents.
      run(w, TPB * 3, [aim(0, COL - 2), ward(0, COL + 2)]);
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
    note: "Player 2 is holding a colour instead of tapping it, and player 1 has not moved the cannon. The beam climbs the column as the lobe fills and the ring closes on the button — both players read the same fill.",
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
    note: "The top of the fill, and the column burning by itself — nothing is pressed to send it, and nothing leaves the ship. The whole screen takes the ammunition colour on the tick it lights.",
    crop: "full",
    build: () => {
      const w = fresh();
      run(w, TPB, [aim(0, COL), prime(1, true)]);
      until(w, "a lance leaving", lanceGone);
      run(w, 2);
      return w;
    },
  },
];

/** The column is burning. The lobe fires itself at the top of the fill, so
 * `lanceReady` is true for exactly one tick inside one step and can never be
 * seen from outside it — the beam is the observable (`sim/lance.ts`). */
function lanceGone(w: World): boolean {
  return w.beam !== null;
}

export const CONTROL_POSES = CONTROLS;
