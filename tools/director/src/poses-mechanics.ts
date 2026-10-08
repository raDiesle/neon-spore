import { laying, PLAY_CHARGE, type World } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  fresh,
  guard,
  hold,
  type Pose,
  prime,
  rock,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
  until,
  ward,
} from "./pose-kit.js";
import { POD_RADAR_POSES } from "./poses-mechanics-reads.js";

/**
 * What those hands add up to on the field: a hand on something falling, a
 * shot in the air, a rock that was answered and a rock that was not.
 *
 * The two radar rows are the only pair here that are one moment seen twice.
 * The split is the whole reason the game needs two people, and it is the one
 * thing a single screenshot of the test view cannot show — the test view has
 * both halves, which is exactly the arrangement no player is ever in.
 */

const COL = 5;
const ROCK = rock(COL);

/** Where a `tile` crop is centred, read off the posed world rather than guessed. */
const bodyAt =
  (index = 0) =>
  (w: World) => {
    const c = w.creatures[index];
    return c ? { col: c.col, row: c.row } : { col: COL, row: 7 };
  };

const MECHANICS: Pose[] = [
  {
    name: "GRIP · ONE HAND",
    note: "A finger held on something falling. It keeps gripSlowPermille of its speed for as long as the hand stays, and the hand is a thumb off that player's own strip.",
    crop: "tile",
    at: bodyAt(),
    build: () => {
      const w = fresh([ROCK]);
      run(w, TPB * 4, [hold(TPB, 2, 1)]);
      return w;
    },
  },
  {
    name: "GRIP · BOTH HANDS",
    note: "Two hands compound, and now neither player is working a control. The word on the field names whose hand each one is.",
    crop: "tile",
    at: bodyAt(),
    build: () => {
      const w = fresh([ROCK]);
      run(w, TPB * 4, [hold(TPB, 1, 1), hold(TPB, 2, 1)]);
      return w;
    },
  },
  {
    name: "SHOT · IN FLIGHT",
    note: "An ordinary bolt, twelve tiles a beat. It stops at the first body in its column whatever that body is.",
    crop: "tile",
    at: (w) => ({ col: w.bullets[0]?.col ?? COL, row: w.bullets[0]?.row ?? 8 }),
    build: () => {
      const w = fresh();
      run(w, 30, [aim(0, COL), shoot(1, "red")]);
      return w;
    },
  },
  {
    name: "SHOT · BEING LAID",
    note: "The button has been pressed and the shot has not left yet. The mouth on top of the ship opens, the skin beside it parts, and the bolt goes half a beat later. It repeats every two seconds with nobody pressing anything.",
    lookAt: "the mouth on top of the ship, as it opens and the bolt leaves it",
    crop: "ship",
    // Event-shaped: the whole difference between two `cannon:shot` or
    // `cannon:mouth` candidates lives in the instant the shot leaves, so the
    // pair must replay it rather than show it once and go still.
    // `versus-pair.ts` reads this and replays `build()` on its own two-second
    // clock instead of waiting on `waveRestBeats` below, which is timed for
    // play — see `EVENT_CADENCE_SECONDS`.
    cadenceSeconds: EVENT_CADENCE_SECONDS,
    build: () => {
      // Three departures from every other pose here, and each one is the
      // difference between a picture and a loop.
      //
      // `shotChargeBeats` first: it is 0 in `DEFAULT_CONFIG`, so out of the
      // ordinary config a press *is* a bullet and there is no wind-up to pose
      // at all. `apps/game` runs it at a half beat, so this is the game as it
      // is actually played rather than as the defaults describe it.
      //
      // Then the frame this stops on. `runUntil` returns on the tick the
      // charge lands in the muzzle rather than after it has gone, so the
      // ALTERNATIVES pair — which steps a pose forward and never presses
      // anything — takes the world over *before* the shot leaves and watches
      // the whole act: the opening working, the departure, the bolt, and the
      // mouth afterwards. Held one tick later, as this pose's neighbour above
      // is, all of that has already happened inside `build` where nobody sees
      // it, which is exactly why a candidate for the mouth could not be
      // compared against anything.
      //
      // And `waveRestBeats`: with an empty queue the wave is clear on its
      // first beat, so the rest is the whole loop. One beat puts a press every
      // 148 ticks — 1.97 beats, about a second and a quarter — which is often
      // enough to compare two mouths and slow enough that each lay is watched
      // rather than strobed.
      const w = fresh([], [], null, { ...PLAY_CHARGE, waveRestBeats: 1 });
      runUntil(w, "a shot in the muzzle", [aim(0, COL), shoot(1, "red")], laying);
      return w;
    },
  },
  // `frame:glow` is judged here: the beam is the brightest thing the game
  // draws that stands still, white at its core against the dark field, so a
  // bloom over the frame shows on it first and a threshold that also catches
  // the pale hull shows beside it.
  {
    name: "LANCE · BURNING",
    note: "The beam standing in the column it has just burnt, in the ammunition's own colour with white at its core. Nothing travels: every body of that colour in the column went on the tick it lit, and it stops where a rock or a wrong colour stopped it.",
    lookAt: "the beam's white core and the light either side of it, and the hull's rim below",
    crop: "full",
    build: () => {
      const w = fresh();
      run(w, TPB, [aim(0, COL), prime(1, true)]);
      until(w, "a column burning", (x) => x.beam !== null);
      run(w, 20);
      return w;
    },
  },
  {
    name: "WARD · DEFLECTED",
    note: "The shield is in the right column and the trigger came at the right moment, so a falling rock is turned away instead of hitting the ship. It is the only moment in the game where a rock leaves without marking the hull. It repeats every two seconds.",
    lookAt: "the shield above the hull, at the instant the rock meets it",
    crop: "ship",
    // Event-shaped, the queue entry this cadence was written for: the whole
    // difference between two `shield:ward` candidates is one instant of
    // impact, and the rock's own fall to the shield already takes several
    // times longer than the pause the owner asked for — `waveRestBeats`
    // alone cannot be trusted to land near two seconds. `cadenceSeconds`
    // makes `versus-pair.ts` replay this `build()` on its own clock instead.
    cadenceSeconds: EVENT_CADENCE_SECONDS,
    build: () => {
      const w = fresh([ROCK]);
      // The trigger goes in on every beat, so whichever beat the rock lands on
      // is a beat the window was open — the pair playing it perfectly.
      const cmds = [ward(0, COL)];
      for (let b = 0; b < 30; b++) cmds.push(guard(b * TPB + 1));
      runUntil(w, "a deflection", cmds, (x) => x.guard.deflected > 0);
      return w;
    },
  },
  {
    name: "BREACH · A SCAR",
    note: "A rock reached the hull with the shield elsewhere. The break is at that column, it is permanent, and both players see it for the rest of the run.",
    lookAt:
      "the hole in the ship's skin, and the skin right around it — the crack running out of the rim",
    crop: "ship",
    build: () => {
      const w = fresh([ROCK]);
      runUntil(w, "a scarred hull", [ward(0, 0)], (x) => x.scars.length > 0);
      run(w, 8);
      return w;
    },
  },
  ...POD_RADAR_POSES,
];

export const MECHANIC_POSES = MECHANICS;
