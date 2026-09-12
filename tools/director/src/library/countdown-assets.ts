import {
  dialCount,
  dialOver,
  drawCountMarks,
  fuseCount,
  fuseOver,
  irisCount,
  irisOver,
} from "@neon-spore/render";
import { drawCountdownStage } from "./countdown-stage.js";
import type { Asset } from "./types.js";

/**
 * THE COUNT's four counts — how a body says how many beats are left, on the
 * one screen that is shown it.
 *
 * `creature:countdown` was decided on 12 September 2026: the owner took IRIS
 * into the game and asked for the other candidates to go to the SHAPES page,
 * for other timing enemies. So four are here on the game's own count, all
 * counting down on the page's beat together: the iris it wears, the notches
 * it wore until that day, and the dial and the fuse that stood beside it.
 */

const FROM = "THE COUNT · creature:countdown";

export const COUNTDOWN_IRIS: Asset = {
  id: "countdown-iris",
  label: "IRIS",
  from: FROM,
  inGame: true,
  claim:
    "A dark socket in the disc with a bright core at the bottom, and blades of the body's own flesh closed over it, one per beat left. Look at the last blade standing: it slides back into the rim through its beat, and on zero there is a hole to shoot into and the core blazes.",
  note: "In the game since 12 September 2026 — the owner's pick. The socket and the core are on both screens; only the pilot sees the blades.",
  draw: (c, f) => drawCountdownStage(c, f, { over: irisOver, count: irisCount }),
};

export const COUNTDOWN_NOTCHES: Asset = {
  id: "countdown-notches",
  label: "NOTCHES",
  from: FROM,
  claim:
    "Dark notches cut through the rim from twelve o'clock clockwise, one per beat left, one gone each beat. Look at the rim on zero: no notches, and a halo of the body's colour held while it is open.",
  note: "What the count wore until 12 September 2026, and what the three candidates were judged against. Nothing on the navigator's disc.",
  draw: (c, f) => drawCountdownStage(c, f, { over: () => {}, count: drawCountMarks }),
};

export const COUNTDOWN_DIAL: Asset = {
  id: "countdown-dial",
  label: "DIAL",
  from: FROM,
  claim:
    "A dark clock face with a bezel on the disc, and a lit sector for the beats left with a hand at its leading edge. Look at the hand: it sweeps through the running beat and lands on a tick, and on zero the whole face is alight.",
  note: "Kept on 12 September 2026 for other timing enemies — a count read off a face rather than counted, saying how soon as well as how many.",
  draw: (c, f) => drawCountdownStage(c, f, { over: dialOver, count: dialCount }),
};

export const COUNTDOWN_FUSE: Asset = {
  id: "countdown-fuse",
  label: "FUSE",
  from: FROM,
  claim:
    "A cord coiled once round the body just outside its rim, burning back toward a cap at twelve with a spark on its end. Look at the burning end: it crawls a quarter turn each beat with embers coming off, the ash behind it shows the whole turn, and on zero the cord is gone.",
  note: "Kept on 12 September 2026 for other timing enemies — the one picture everybody already has for this long left, and it says hurry by itself.",
  draw: (c, f) => drawCountdownStage(c, f, { over: fuseOver, count: fuseCount }),
};
