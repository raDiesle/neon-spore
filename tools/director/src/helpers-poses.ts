import type { SpawnEntry, World } from "@neon-spore/sim";
import {
  firstOfKind,
  fresh,
  guard,
  hold,
  living,
  POSE_TPB,
  type Pose,
  run,
  runUntil,
  until,
  ward,
} from "./pose-kit.js";

/**
 * The frames CONTROLS › HELPERS draws that the STATES gallery has no pose
 * for (`helpers-page.ts`) — each a world built only to put one helper on the
 * screen that is shown it. They are not in `POSE_GROUPS`: a gallery pose is a
 * state of a body worth holding, and these are a body held so that a mark
 * over it can be read. Where the gallery already holds the moment a helper
 * is drawn in, the row names that pose instead and nothing is built here.
 */

/** The middle of eleven columns, so a frame round the body is never clipped. */
const COL = 5;

/** One body of `kind`, left `beats` on the field. */
function oneBody(kind: SpawnEntry["kind"], color: SpawnEntry["color"], beats: number): World {
  const w = fresh([{ beat: 0, col: COL, kind, color }]);
  run(w, POSE_TPB * beats);
  return w;
}

const field = (name: string, build: () => World): Pose => ({
  name,
  note: name,
  crop: "field",
  build,
});

/** The same, cut to a few tiles round the first body of `kind`. */
const close = (name: string, kind: string, build: () => World): Pose => ({
  ...field(name, build),
  crop: "tile",
  span: 4,
  at: firstOfKind(kind),
});

/** A lure two beats down, the siren lit for it, cut to the top of the field. */
export const SIREN_ON: Pose = {
  ...field("HELPERS · THE SIREN FOR A LURE", () => oneBody("lure", "red", 2)),
  crop: "tile",
  span: 5,
  at: () => ({ col: COL, row: -2 }),
};

/** A lure two beats down: IGNORE on player 2's screen. */
export const LURE_UP = close("HELPERS · A LURE ON THE FIELD", "lure", () =>
  oneBody("lure", "red", 2),
);

/** A cloud two beats down: the lock on player 2's screen, the clock on player 1's. */
export const VEIL_UP = close("HELPERS · A CLOUD ON THE FIELD", "veil", () =>
  oneBody("veil", "red", 2),
);

/** A wisp on the field, which player 1 is never shown: the search blinks there. */
export const WISP_UP = field("HELPERS · A WISP UNSEEN", () => oneBody("wisp", "cyan", 4));

/** A mine two beats down: its ring of pips on both screens. */
export const MINE_UP = close("HELPERS · A MINE ON THE FIELD", "mine", () =>
  oneBody("mine", "red", 2),
);

/** A magnet on the field: the band that names its side, on player 1's screen. */
export const MAGNET_UP: Pose = {
  ...field("HELPERS · A MAGNET ON THE FIELD", () => oneBody("magnet", null, 2)),
  crop: "full",
};

/** One body far up the queue, so the field is empty and the wave still on:
 * the cannon's own column with nothing in it. */
export const EMPTY_FIELD = field("HELPERS · AN EMPTY FIELD", () => {
  const w = fresh([living("red", COL, 30)]);
  run(w, POSE_TPB * 2);
  return w;
});

/** Three arrivals still on the strip, one of them a lure that wants a call. */
export const STRIP_BUSY: Pose = {
  name: "HELPERS · THE STRIP CARRYING THREE",
  note: "Three arrivals on the warning strip.",
  crop: "radar",
  build: () => {
    const w = fresh([
      { beat: 3, col: 2, kind: "meteor", color: null },
      { beat: 3, col: 5, kind: "lure", color: "red" },
      { beat: 4, col: 8, kind: "torch", color: null },
    ]);
    run(w, Math.round(POSE_TPB * 1.5));
    return w;
  },
};

/**
 * A torch still on the strip and a beat from the field: the band across the
 * top on player 1's screen. Read off the queue, so the torch is spawned late
 * and the frame is taken before it lands.
 */
export const TORCH_COMING: Pose = {
  name: "HELPERS · A TORCH ON ITS WAY",
  note: "A torch on the strip, not yet on the field.",
  crop: "full",
  build: () => {
    const w = fresh([{ beat: 4, col: COL, kind: "torch", color: null }]);
    run(w, POSE_TPB * 3);
    return w;
  },
};

/**
 * A slick the shield has thrown back up once: ONE LAST CHANCE over it. The
 * dome stands in its column and is armed every beat until the push lands.
 */
export const PUSHED_ONCE: Pose = {
  name: "HELPERS · PUSHED ONCE",
  note: "A body the shield has already pushed.",
  crop: "tile",
  span: 4,
  at: firstOfKind("slick"),
  build: () => {
    const w = fresh([living("red", COL)]);
    const cmds = [ward(0, COL)];
    for (let b = 0; b < 40; b++) cmds.push(guard(b * POSE_TPB));
    runUntil(w, "a body pushed by the shield", cmds, (x) => x.creatures[0]?.pushed === true);
    run(w, POSE_TPB);
    return w;
  },
};

/** A slick under player 1's hand: THE LOCK round it, on both screens. */
export const LOCKED: Pose = {
  name: "HELPERS · LOCKED",
  note: "A body player 1 is holding.",
  crop: "tile",
  span: 4,
  at: firstOfKind("bulb"),
  build: () => {
    const w = fresh([living("cyan", COL)]);
    until(w, "a body on the field", (x) => x.creatures.length > 0);
    const id = w.creatures[0]?.id ?? 0;
    run(w, POSE_TPB, [hold(w.tick, 1, id)]);
    return w;
  },
};
