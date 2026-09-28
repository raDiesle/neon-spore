import { valveHand } from "@neon-spore/hands";
import { VALVE_PINS, valveLeaking, type World } from "@neon-spore/sim";
import { POSE_CONFIG, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose, bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * **THE VALVE's ten states**, posed with a hand on the controls
 * (`boss-hands-valve.ts`): the still and the first lit mark arrive by
 * themselves, and the rest are earned the way the pair earns them — the
 * pilot's thumb turning the wheel onto its mark, the navigator's tap on the
 * socket freezing it, the live pin drawn down, and the story between the
 * pins answered: the jet capped, the brace and the seal held by both thumbs,
 * the film rubbed off. The hand sends the grip's own commands, the ones
 * `poses-field-controls-valve.ts` sends by hand.
 *
 * `valve:pin` is judged on the still, because every pin is still in and
 * nothing of the story is moving: a pin swinging on its own is only seen
 * where the drum is otherwise still.
 */
export const VALVE_POSES: Pose[] = [
  bossPose(
    "valve",
    "still",
    "The drum has dropped in over the middle column, its three pins hung under it. P1 and P2 wait: nothing is lit yet.",
    {
      hold: Math.round(TPB * 1.9),
      lookAt: "the three hung pins — whether they hang from the drum or are bolted to it",
    },
  ),
  bossPose(
    "valve",
    "turn",
    "The first mark lit on the drum's face. P1 turns the wheel onto it; P2 waits.",
    { hold: 6, role: "p1" },
  ),
  bossPose(
    "valve",
    "hold",
    "The wheel on its mark, the socket flashing. P1 holds the wheel; P2 taps the socket.",
    { hand: valveHand, hold: 2, role: "p2" },
  ),
  bossPose(
    "valve",
    "frozen",
    "The wheel frozen, the live pin hanging long and lit. P1 lets go; P2 draws the pin down.",
    { hand: valveHand, hold: 2 },
  ),
  bossPose(
    "valve",
    "jet",
    "The first pin out, its socket blowing back. P1 waits; P2 taps the pin to cap it.",
    { hand: valveHand, hold: 2, budgetBeats: 90 },
  ),
  bossPose(
    "valve",
    "list",
    "The jet capped, the drum listing, a spark falling. P1 aims under it; P2 fires.",
    { hand: valveHand, hold: 6, budgetBeats: 90 },
  ),
  bossPose(
    "valve",
    "brace",
    "The second pin out, the drum shuddering. P1 and P2 hold the pin together.",
    { hand: valveHand, hold: 2, budgetBeats: 160 },
  ),
  bossPose(
    "valve",
    "wipe",
    "The last pin out, a film over the face. P1 waits; P2 rubs the pin back and forth.",
    { hand: valveHand, hold: 6, budgetBeats: 240 },
  ),
  bossPose(
    "valve",
    "seal",
    "The face wiped dry, the bare seal straining. P1 and P2 hold the pin together.",
    { hand: valveHand, hold: 2, budgetBeats: 240 },
  ),
  bossPose(
    "valve",
    "open",
    "The seal held, the face falling open in two halves. P1 and P2 are done.",
    { hand: valveHand, hold: 6, budgetBeats: 240 },
  ),
];

/**
 * The fight played to the second pin's brace, and the spark it leaks let fall
 * a beat with nobody shooting it — the hand would shoot it at once — and
 * replayed each beat, as long as it has left to fall. VERSUS
 * `valve:spark` was judged here, 28 September 2026: both sparks are drawn
 * alike, as a threat, because the hull takes one hit whichever spark it is.
 */
function secondSpark(): World {
  const w = bossWorld("valve");
  runHand(
    w,
    "the second spark leaking",
    valveHand,
    (x) => x.boss?.kind === "valve" && valveLeaking(x.boss) && x.boss.pins === VALVE_PINS - 2,
    200 * TPB,
  );
  run(w, TPB);
  return w;
}

export const VALVE_SECOND_SPARK_POSE: Pose = {
  name: "VALVE · THE SECOND SPARK FALLING",
  note: "THE VALVE over the middle column, two of its three pins out and the shudder braced: a second ember falls from under the drum down its column. Player 1 has not aimed under it yet.",
  lookAt: "whether the spark reads as a threat, a thing to shoot before it reaches the hull",
  crop: "field",
  role: "p1",
  build: secondSpark,
  cadenceSeconds: 60 / POSE_CONFIG.bpm,
};
