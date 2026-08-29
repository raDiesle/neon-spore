import { lanceReady, laying, type World } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  fresh,
  guard,
  hold,
  living,
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
    note: "The press has landed and the bolt has not. The opening dilates, the skin beside it parts and the shot leaves on the next half beat — the one thing player 1 gets to see player 2 do, and the only picture on this sheet that needs a rule the default config ships switched off.",
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
      const w = fresh([], [], null, { shotChargeBeats: 0.5, waveRestBeats: 1 });
      runUntil(w, "a shot in the muzzle", [aim(0, COL), shoot(1, "red")], laying);
      return w;
    },
  },
  {
    name: "LANCE · IN FLIGHT",
    note: "The same column at half the speed, with the cannon's own colour round the head. It passes through bodies of its own colour and stops at anything else.",
    crop: "tile",
    at: (w) => ({ col: w.bullets[0]?.col ?? COL, row: w.bullets[0]?.row ?? 8 }),
    build: () => {
      const w = fresh();
      run(w, TPB, [aim(0, COL), prime(1, true)]);
      until(w, "a full lobe", lanceReady);
      run(w, 40, [shoot(w.tick + 1, "red")]);
      return w;
    },
  },
  {
    name: "WARD · DEFLECTED",
    note: "Right column and right moment, both halves arriving. This is the only frame in the game where a rock leaves without a scar.",
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
    crop: "ship",
    build: () => {
      const w = fresh([ROCK]);
      runUntil(w, "a scarred hull", [ward(0, 0)], (x) => x.scars.length > 0);
      run(w, 8);
      return w;
    },
  },
  {
    name: "POD · HANGING",
    note: "It does nothing and blocks nothing. Player 2 has to shoot it loose before player 1 has anything to open the maw for.",
    crop: "tile",
    at: (w) => {
      const p = w.pods[0];
      return {
        col: p ? Math.round(p.colMilli / 1000) : COL,
        row: p ? Math.round(p.rowMilli / 1000) : 4,
      };
    },
    build: () => {
      const w = fresh([], [{ beat: 0, col: COL, row: 5 }]);
      run(w, TPB * 2);
      return w;
    },
  },
  {
    name: "POD · FALLING",
    note: "Shot loose, sinking like a wreck and sliding the way the seeded rng picked. Neither player knew which way until it moved.",
    crop: "tile",
    at: (w) => {
      const p = w.pods[0];
      return {
        col: p ? Math.round(p.colMilli / 1000) : COL,
        row: p ? Math.round(p.rowMilli / 1000) : 6,
      };
    },
    build: () => {
      const w = fresh([], [{ beat: 0, col: COL, row: 5 }]);
      // The pod is hung on a beat, so there is nothing in the column to shoot
      // loose until one has passed. Aim first, then fire at something there.
      run(w, TPB * 2, [aim(0, COL)]);
      runUntil(w, "a pod shot loose", [shoot(w.tick, "cyan")], (x) => Boolean(x.pods[0]?.loose));
      run(w, 40);
      return w;
    },
  },
  {
    name: "RADAR · THE PILOT'S HALF",
    note: "The same field, player 1's screen. Rocks are announced here and the living are not — and player 1 cannot fire, so what they read has to be said out loud.",
    crop: "radar",
    role: "p1",
    build: () => radarWorld(),
  },
  {
    name: "RADAR · THE NAVIGATOR'S HALF",
    note: "The same moment, player 2's screen. The living are announced here and the rocks are not — and player 2 cannot move the cannon or trigger the shield.",
    crop: "radar",
    role: "p2",
    build: () => radarWorld(),
  },
];

/**
 * One field with both kinds coming, so the two radar poses are the same
 * moment seen from the two seats. Held a beat short of the first arrival —
 * the strip is a warning, and a warning is only legible before the thing
 * it warns about is on the field.
 */
function radarWorld(): World {
  const w = fresh([rock(2, "meteor", 3), living("red", 7, 4), living("cyan", 9, 5)]);
  run(w, TPB * 2);
  return w;
}

export const MECHANIC_POSES = MECHANICS;
