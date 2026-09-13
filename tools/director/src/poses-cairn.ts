import { CAIRN_COLS } from "@neon-spore/sim";
import { firstOfKind, fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE CAIRN standing whole, before the pair has pulled anything off it.
 *
 * `cairn:pile` is judged here. The slot is the first perf run of the wave
 * turned into a look question: the pile is seven of the field's burning rocks
 * drawn live every frame under one clip, most of each fire under the stone
 * above it, and the candidates ask whether the stack should instead be a
 * picture taken once — the same seven fires frozen at one instant, or grey
 * stone with the heat left only in the seams. Neither can be judged on a
 * rock: the thing that differs is how a *stack* of them reads when nothing in
 * it moves, so the pose is the whole pile and nothing falling past it.
 *
 * Handed over with every unit still on it, because that is the state the pile
 * is in for the longest and the one where the seams are most of the picture;
 * the boss appears on the field a beat or two after the wave opens, so the
 * world is run until the body exists rather than for a fixed count. Continuous
 * — no cadence — the way `poses-surface.ts` argues for a thing that is on
 * screen the whole time: what is being asked is whether a still pile still
 * reads as one thing made of seven, and that is read, not replayed.
 */
export const CAIRN_PILE_POSE: Pose = {
  name: "CAIRN · THE PILE",
  note: "Seven of the field's rocks stacked four, two and one into one outline, standing still near the top of the field. The pair takes them off one pull at a time, so the seams between the stones are the count of what is left.",
  lookAt:
    "the stack of seven stones itself — whether the fire on it moves or holds, and whether the seams between the stones still read as seven separate rocks",
  crop: "tile",
  span: 7,
  at: (w) => {
    // The body's column is its left edge and it is five wide; the crop is
    // centred on the middle stone rather than on the leftmost one.
    const c = firstOfKind("cairn")(w);
    return { col: c.col + (CAIRN_COLS - 1) / 2, row: c.row };
  },
  build: () => {
    const w = fresh([], [], { kind: "cairn" });
    runUntil(w, "the pile standing on the field", [], (x) =>
      x.creatures.some((c) => c.kind === "cairn"),
    );
    // A beat more, so the settle has drifted the stones off their first frame.
    run(w, TPB);
    return w;
  },
};
