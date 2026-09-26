import type { World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE KEEL's one hand: the first joint lit and waiting for its tap. A gallery
 * pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** The spine dropped in and its first joint — the left end, the pilot's — a beat into its window. */
function lit(): World {
  const w = fresh([], [], { kind: "keel", socket: "red", reprise: [4, 3, 0] });
  runUntil(w, "the first joint", [], (x) => x.boss?.kind === "keel" && x.boss.phase === "joint");
  run(w, TPB);
  return w;
}

const KEEL_JOINT: Pose = {
  name: "KEEL · THE LIT JOINT UNDER A THUMB",
  note: "THE KEEL hung along the top of the field, six iron segments loose and swaying under a slack arch. The left end's joint is lit: a white ring round its plate, the arc of it left of the window already shorter by a beat. Player 1's screen, whose half the joint sits over.",
  lookAt:
    "whether the ring reads as *tap here, now* rather than as a target to shoot, and whether it plainly sits over the pilot's half and not the navigator's",
  crop: "field",
  role: "p1",
  build: lit,
};

export const KEEL_GRIPS: readonly Pose[] = [KEEL_JOINT];
