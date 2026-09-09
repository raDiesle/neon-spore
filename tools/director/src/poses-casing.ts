import {
  fallTilesPerBeat,
  SHELL_COLS,
  type SpawnEntry,
  shellHasPiece,
  shellIsBare,
} from "@neon-spore/sim";
import {
  aim,
  fresh,
  type Pose,
  type PoseGroup,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
  until,
} from "./pose-kit.js";
import { fallSeconds } from "./poses-surface.js";

/**
 * The states a candidate for what a body **wears** is judged on.
 *
 * Three bodies that had never been posed at all: a rock wearing fire, a body
 * wearing weather, and a boss wearing armour. Each of the three had a look
 * nobody had ever offered a second answer to, and each was offered one on
 * 9 September 2026 — so each needed a state to be judged in, and a slot with no
 * pose of its own falls through to a red slick falling, which is a vote on a
 * difference nobody can see (`versus-pose.ts`).
 *
 * Its own file rather than rows on `poses-surface.ts` next door, and the seam
 * is the same one that file was cut along: a *surface* is judged on a body
 * standing still long enough for its far side to come round, and a **casing**
 * is judged on what covers a body — which two of these three do while falling
 * as fast as they ship, because how long a plate or a flame is on screen is
 * part of the question. The third does not fall at all.
 */

const COL = 5;

/** How many of a shell's halves still carry a plate. `shellHasPiece` is the
 * simulation's own reading and this only counts what it answers, so a pose
 * cannot come to disagree with the field about how far in a shot has got. */
function shellPieces(c: { col: number; shell?: number }): number {
  let n = 0;
  for (let piece = 0; piece < SHELL_COLS; piece++) {
    if (shellHasPiece(c as never, c.col + piece)) n++;
  }
  return n;
}

/**
 * One torch coming down a lane, replayed at the speed it actually falls.
 *
 * **It is the fastest thing in the field**, so a fall-length cadence would hold
 * an empty lane for most of every replay: the rate is derived off the kind
 * rather than typed, so a torch that is re-timed re-times its own pose too.
 *
 * The whole field rather than a tile crop, for `poses-surface.ts`'s reason: a
 * crop is worked out once from the world as it is handed over, and a body this
 * fast is out of a three-tile window before the second frame.
 */
const TORCH_POSE: Pose = {
  name: "TORCH · THE FALL",
  note: "One torch, alone, coming down at the speed it ships at — a dead two-column rock with a ring of its old flame still on it, and the fastest thing the pair ever has to cover. It replays on the length of its own fall.",
  lookAt: "the fire on the stone — where it sits, and whether any of it goes behind the rock",
  crop: "field",
  cadenceSeconds: fallSeconds() / fallTilesPerBeat("torch"),
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "torch", color: null };
    const w = fresh([entry]);
    // One beat, which on this body is already two rows: enough that it is clear
    // of the top of the field and dragging its tail, and not so much that the
    // hand-over is halfway down.
    run(w, TPB);
    return w;
  },
};

/**
 * One thundercloud falling with a body inside it, on both screens at once.
 *
 * **The two seats disagree about this creature and that is the creature.**
 * Player 1 can see into the cloud and player 2 cannot, so the pair draws the
 * two halves of the disguise one above the other and a candidate is answering
 * for both at the same time — a fill that reads well opaque and hides the
 * colour when it is see-through has failed at the only job the cloud has.
 *
 * No colour is fired at it, so nothing shuts it: `shut` is 0 for the whole
 * replay, which is the state this body spends its life in. The angry red a
 * wrong colour brings is a different picture and not the one being judged.
 */
const VEIL_POSE: Pose = {
  name: "VEIL · CARRYING",
  note: "A thundercloud coming down a lane with a slick or a bulb inside it, morphing from one to the other on the beat. The lightning is the pair's metronome; player 1 can see the body through the weather and player 2 sees only the weather.",
  lookAt: "what the cloud is made of between its rim and its bolts",
  crop: "field",
  cadenceSeconds: fallSeconds(),
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "veil", color: "red" };
    const w = fresh([entry]);
    run(w, TPB * 2);
    return w;
  },
};

/**
 * THE WARDEN standing across the field with its armour on.
 *
 * The third pose on this page that needs no replay at all, and for the wisp's
 * reason turned around: this body does not fall because it is a fixture. It
 * stands dead centre for the whole fight, its pupil drifting from column to
 * column, and the ring of plates around it is the only health bar in the game —
 * which is exactly why the armour is worth a look of its own.
 *
 * It is handed over **with every plate still on**. A candidate is free to make
 * a plate look like anything; where the *gap* is has to stay the same on both
 * sides of the pair, so the honest place to start is the ring nobody has taken
 * anything off yet.
 */
const WARDEN_POSE: Pose = {
  name: "WARDEN · ARMOURED",
  note: "The boss standing across the middle of the field, open underneath, with a ring of plates around it. One plate comes off per opened eye and the gap never fills, so the silhouette is how far in the pair is — this is the ring before anything has been taken off it.",
  lookAt:
    "the arc of plates around the rim — whether a plate reads as a line or as a thing with a thickness",
  crop: "field",
  build: () => {
    const w = fresh([], [], { kind: "warden" });
    // Until the boss is standing rather than for a count of beats: the ring is
    // installed by `startWave` and the pupil starts drifting on its own, and a
    // pose that assumed which tick that lands on is a pose that goes quietly
    // wrong the first time the arrival is re-timed.
    until(w, "a warden on the field", (x) => x.creatures.some((c) => c.kind === "warden"));
    run(w, TPB * 2);
    return w;
  },
};

/**
 * One shell coming down a lane with one half already chipped off.
 *
 * **One half, and that is the whole reason this pose exists.** An intact shell
 * is two plates that tile exactly, so a candidate about the *material* would be
 * judged on a shape with no material visible anywhere but its rim; and a bare
 * body has no armour on it at all. The state in between is the one this
 * creature spends most of its life in and the only one where the two answers
 * stand side by side — a plate on one half, the grey edge it leaves on the
 * other — which is exactly the pair a look has to get right at once
 * (`shell-look.ts` on why both fields move together).
 *
 * It is reached by shooting, not by writing a bitmask: `Creature.shell` is the
 * simulation's own and a pose that set it by hand would be a picture of a state
 * the game cannot produce. Either colour chips a piece, so the shot is red and
 * the wave authors red.
 */
const SHELL_POSE: Pose = {
  name: "SHELL · ONE HALF OPEN",
  note: "A slick inside plating a size too big for it, with one half already shot off. The half still wearing armour stands outside the body's own contour with the colour coming out of its cracks; the half that is open keeps the plate's grey edge along the body's own outline, so the thing still reads as one armoured body with one side opened.",
  lookAt:
    "the plate on the armoured half — whether it reads as a lid or as a thing with a thickness, and whether the two halves look like two objects",
  crop: "field",
  cadenceSeconds: fallSeconds(),
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "shell", color: "red" };
    const w = fresh([entry]);
    run(w, TPB);
    runUntil(
      w,
      "a shell with one half chipped",
      [aim(w.tick, COL), shoot(w.tick + TPB, "red")],
      (x) => x.creatures.some((c) => c.kind === "shell" && !shellIsBare(c) && shellPieces(c) === 1),
    );
    return w;
  },
};

export const CASING_POSES: Pose[] = [TORCH_POSE, VEIL_POSE, WARDEN_POSE, SHELL_POSE];

export const CASING_GROUP: PoseGroup = {
  title: "CASINGS",
  note: "the state each open VERSUS slot about what a body wears is judged on",
  poses: CASING_POSES,
};
