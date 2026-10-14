import { type BossEntry, coreRowMilli, midCol, type World } from "@neon-spore/sim";
import { fresh, POSE_TPB, type Pose, run, runUntil } from "./pose-kit.js";

/**
 * THE BASTION, THE CHRYSALIS and THE HYDRA on their last shell, skin and
 * level, for ONE BOSS'S OWN (`helpers-bosses-c.ts`): each splits the eyes
 * there and nowhere else, and a gallery pose of any of them is an earlier
 * one. Each is a boss whose script is that last step alone, lit and a beat
 * in, so what one seat is shown of it is up.
 */

/** Long enough that the step is still lit when the frame is taken. */
const BEATS = 24;

/** Tiles across the cut round the core: the moon, the cocoon, the slime and a little round it. */
const SPAN = 5;

const lastStep = (
  name: string,
  note: string,
  boss: BossEntry,
  lit: string,
  role: Pose["role"],
): Pose => ({
  name: `HELPERS · ${name}`,
  note,
  crop: "tile",
  role,
  span: SPAN,
  at: (w) => ({ col: midCol(w.cfg), row: coreRowMilli(boss.kind) / 1000 }),
  build: (): World => {
    const w = fresh([], [], boss);
    runUntil(w, `${name} lit`, [], (x) => (x.boss as { phase?: string } | null)?.phase === lit);
    run(w, POSE_TPB);
    return w;
  },
});

export const BASTION_PORT = lastStep(
  "THE BASTION'S PORT OPEN",
  "The last shell: one port open on the core and two shut, on the navigator's screen.",
  { kind: "bastion", steps: [{ layer: "port", beats: BEATS, offsets: [-1, 1, 0] }] },
  "layer",
  "p2",
);

export const CHRYSALIS_HEART = lastStep(
  "THE CHRYSALIS'S HEART BEATING",
  "The last skin: the pore open over the heart's column and its colour, on the pilot's screen.",
  {
    kind: "chrysalis",
    steps: [{ skin: "heart", beats: BEATS, offsets: [1, -1, 0], colors: ["red", "cyan", "red"] }],
  },
  "skin",
  "p1",
);

export const HYDRA_MAW = lastStep(
  "THE HYDRA'S MAW GAPING",
  "The last level: one maw open, white heat in it, on the navigator's screen.",
  {
    kind: "hydra",
    steps: [{ head: "maw", beats: BEATS, offsets: [-1, 1], colors: ["cyan", "red"] }],
  },
  "heads",
  "p2",
);
