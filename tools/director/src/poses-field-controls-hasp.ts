import type { TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE HASP's two hands, one under each seat's thumb — and, unlike THE
 * BELLOWS's pair next door, **the same instant photographed from two seats**
 * rather than two instants.
 *
 * That is the whole reason there are two: this boss's two controls are worked
 * *together*, and neither picture makes sense without the other having been
 * taken at the same moment. His latch is down and nothing on the door has
 * moved; her wheel is going round and the winding is coming up — one cause,
 * two screens, and a reader who sees only his would conclude the control does
 * nothing, which is exactly what it does.
 *
 * The wheel pose therefore **runs his hold first** and leaves it down: a
 * gallery pose is run to, never set (`.claude/skills/new-boss` §4), and a rim
 * turned without that hold would have photographed a seize instead.
 */

/** His thumb on the latch: one message, because the latch is read as a level
 * and the depth it is at is the whole of what the simulation is told. */
function latch(tick: number, downMilli: number): TimedCommand {
  return {
    tick,
    player: 1,
    command: { kind: "drag", target: "haspLatch", on: true, fromMilli: 0, fromYMilli: downMilli },
  };
}

/** Her thumb round the rim: the grab carries `NO_BEARING` and turns nothing,
 * and every sample after it is where her hand is (`sim/bearing.ts`). */
function rim(tick: number, atMilli: number): TimedCommand {
  return {
    tick,
    player: 2,
    command: { kind: "drag", target: "haspWheel", on: true, fromMilli: atMilli },
  };
}

const HASP_LATCH: Pose = {
  name: "HASP · THE LATCH UNDER A THUMB",
  note: "THE HASP hung over the middle of the field: a door of three iron clasps with a wheel across its face, the first clasp lit and the latch beside it carried down under the pilot's thumb. Nothing on the door has moved — the latch opens no part of it — and his heat is a beat or two into the fuse. Player 1's screen, which is the only one the latch and the heat are drawn on.",
  lookAt:
    "whether the latch reads as a thing to press down and keep down rather than as a lever that does something when it lands, and whether the heat beside it is plainly his own clock and not the door's",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "hasp" });
    run(w, TPB * 3);
    // Past `haspGripMilli` of `haspReachMilli`: he is holding, so the fuse is
    // counting from the beat this message landed.
    run(w, Math.round(TPB * 1.5), [latch(w.tick, 900)]);
    return w;
  },
};

const HASP_WHEEL: Pose = {
  name: "HASP · THE WHEEL UNDER A THUMB",
  note: "The same door on the other phone at the same instant, with his latch down off-screen: her thumb is on the rim and the wheel has come round about half of what the first clasp wants. The winding is drawn on the wheel itself rather than beside it, and his heat is nowhere on this screen. Player 2's screen; the latch is not drawn on it at all.",
  lookAt:
    "whether it is readable at a glance how far round the wheel has come without a bar anywhere, and whether the rim looks like something to keep turning rather than something to turn to a mark",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([], [], { kind: "hasp" });
    run(w, TPB * 3);
    // His hold, then her hand: the grab first, then eight samples round the
    // rim, half of `haspWindMilli`. Short of it, on purpose — the clasp opening is a
    // different picture, and this one is the gesture rather than its end.
    const cmds: TimedCommand[] = [latch(w.tick, 900), rim(w.tick + 1, -1), rim(w.tick + 2, 0)];
    for (let i = 1; i <= 8; i++) cmds.push(rim(w.tick + 2 + i * 2, i * 100));
    run(w, Math.round(TPB * 1.5), cmds);
    return w;
  },
};

export const HASP_GRIPS: readonly Pose[] = [HASP_LATCH, HASP_WHEEL];
