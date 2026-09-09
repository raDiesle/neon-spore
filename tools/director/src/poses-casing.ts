import {
  DEFAULT_CONFIG,
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
 * Torches coming down three lanes a beat apart, at the speed they actually fall.
 *
 * **A torch crosses the whole field in three quarters of a second.** It is the
 * fastest thing in the game by a long way — `fallTilesPerBeat` gives it
 * thirteen tiles a beat, where a slick gets one — and every number below
 * follows from that one fact rather than from taste.
 *
 * **It used to replay on exactly its own fall, which is a strobe.** The
 * cadence was `fallSeconds() / fallTilesPerBeat("torch")` and that is 0.745
 * seconds, so the rock left the top of the field, hit the hull, and was
 * immediately back at the top again — the same three quarters of a second
 * over and over with no gap anywhere in it. The owner looked at both
 * candidates in this slot on 9 September 2026 and said of each, separately,
 * *"i cant see different — let the animation take more time before repeat, i
 * want to see it fall down longer."* Under a second of picture, restarting
 * eight times every six seconds, is not long enough to read a flame on a
 * stone, let alone to tell two of them apart.
 *
 * Two things fix it, and neither slows the body down, which he ruled out in
 * the same breath. There are **three of them, one beat apart in three lanes**,
 * so something is falling for two full seconds instead of for three quarters
 * of one — each still a single torch at the size the field draws one, which is
 * what the slot asks about (`versus-pose.ts`), and a wave that sends three is
 * an ordinary wave. And the replay waits for **one more fall's worth of empty
 * field** after the last of them lands, which is the pause `pose-type.ts`
 * argues is the thing that makes a repeat legible at all.
 *
 * Every number is derived off the kind, so a torch that is re-timed re-times
 * its own pose too.
 *
 * The whole field rather than a tile crop, for `poses-surface.ts`'s reason: a
 * crop is worked out once from the world as it is handed over, and a body this
 * fast is out of a three-tile window before the second frame.
 */
/** Torches in the pose, and one beat between them. Three, because two leaves a
 * hole in the middle of the window and four has the first one long gone before
 * the last has been looked at. */
const TORCHES = 3;
/** The lanes they use, far enough apart that two flames never overlap. */
const TORCH_COLS = [2, 5, 8];

/** How long one torch takes to cross the field, in seconds. The pose's whole
 * clock is built out of this and a beat. */
function torchFallSeconds(): number {
  return fallSeconds() / fallTilesPerBeat("torch");
}

const TORCH_POSE: Pose = {
  name: "TORCH · THE FALL",
  note: "Three torches a beat apart in three lanes, each coming down at the speed it ships at — a dead two-column rock with a ring of its old flame still on it, and the fastest thing the pair ever has to cover. The lane is never empty until the last of them has landed.",
  lookAt: "the fire on the stone — where it sits, and whether any of it goes behind the rock",
  crop: "field",
  // The last one arrives `TORCHES - 1` beats after the hand-over and takes its
  // own fall to land; then one more fall's worth of empty field, so the eye
  // re-reads before the next three come.
  cadenceSeconds: (TORCHES - 1) * (60 / DEFAULT_CONFIG.bpm) + 2 * torchFallSeconds(),
  build: () => {
    const w = fresh(
      TORCH_COLS.slice(0, TORCHES).map((col, i) => ({
        beat: i,
        col,
        kind: "torch" as const,
        color: null,
      })),
    );
    // One beat, which is when the first of them appears at the top of the
    // field: a spawn listed for beat 0 arrives on the first beat boundary, not
    // on tick 0. Handing over any earlier is handing over an empty field.
    run(w, TPB);
    return w;
  },
};

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
