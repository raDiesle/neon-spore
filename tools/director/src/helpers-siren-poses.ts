import { antiphonBoss, flueBoss, handedOver, type SpawnEntry, type World } from "@neon-spore/sim";
import { fresh, POSE_TPB, type Pose, run, until } from "./pose-kit.js";
import { poseNamed } from "./poses.js";
import { MIMIC_POSES } from "./poses-bosses-hands-mimic.js";
import { bossWorld } from "./poses-bosses-kit.js";

/**
 * The worlds THE SIREN's every-state rows are drawn from
 * (`helpers-siren-states.ts`): each one run to a moment the siren is in one
 * state, never set into it, and drawn twice — as player 1's phone and as
 * player 2's — cut to the top of the screen, where the dial, its two chips
 * and the words under it stand.
 */

/** The middle of eleven columns. */
const COL = 5;

/** `entries` left `beats` on the field. */
function bodies(entries: SpawnEntry[], beats = 2): World {
  const w = fresh(entries);
  run(w, POSE_TPB * beats);
  return w;
}

const at = (kind: SpawnEntry["kind"], col = COL, extra: Partial<SpawnEntry> = {}): SpawnEntry =>
  ({ beat: 0, col, kind, color: "red", ...extra }) as SpawnEntry;

/** A pose cut to the top of the phone; the screen is chosen per frame. */
const top = (name: string, build: () => World): Pose => ({
  name: `SIREN · ${name}`,
  note: name,
  crop: "top",
  build,
});

export const SIREN_DARK = top("DARK", () =>
  bodies([at("slick", 3), at("meteor", 7, { color: null })]),
);
export const SIREN_P1 = top("P1 SPEAKS", () => bodies([at("veil")]));
export const SIREN_P2 = top("P2 SPEAKS", () => bodies([at("lure")]));
export const SIREN_HALVES = top("BOTH, HALF EACH", () => bodies([at("strand")]));
export const SIREN_SAME = top("BOTH, ONE SENTENCE", () =>
  bodies([at("balloon", COL, { color: null })]),
);
export const SIREN_TWO_BODIES = top("BOTH, TWO BODIES", () =>
  bodies([at("veil", 3), at("lure", 7)]),
);
export const SIREN_TWO_WORDS = top("ONE SEAT, TWO WORDS", () =>
  bodies([at("veil", 3), at("veer", 7, { color: null })]),
);

/** A torch still on the strip: the siren is up before the body is. */
export const SIREN_EARLY = top("BEFORE IT LANDS", () => {
  const w = fresh([{ beat: 4, col: COL, kind: "torch", color: null }]);
  run(w, POSE_TPB * 3);
  return w;
});

export const SIREN_FENCE_OPEN = top("A WALL WITH A WAY THROUGH", () =>
  bodies([at("fence", COL, { color: null, gaps: [COL - 2] })], 4),
);
export const SIREN_FENCE_SHUT = top("A WALL WITH NONE", () =>
  bodies([at("fence", COL, { color: null, gaps: [], cracksRed: [COL + 2] })], 4),
);
export const SIREN_MINE_P1 = top("A MINE DRAWN ON P1", () =>
  bodies([at("mine", COL, { sees: 1 })]),
);
export const SIREN_HARPOON = top("A CONTROL HARPOONED", () =>
  poseNamed("LEECH · ON THE CANNON").build(),
);

/** A cloud on the field and THE HANDOVER in force: the panels traded. */
export const SIREN_TRADED = top("PANELS TRADED", () => {
  const w = fresh([at("veil")], [], null, {}, 0, [{ kind: "handover", at: 1, beats: 8 }]);
  until(w, "the panels traded", (x) => handedOver(x) && x.creatures.length > 0);
  run(w, POSE_TPB);
  return w;
});

export const SIREN_ANTIPHON = top("THE ANTIPHON", () => {
  const w = bossWorld("antiphon");
  until(w, "the antiphon up", (x) => antiphonBoss(x) !== null, 120 * POSE_TPB);
  run(w, POSE_TPB * 2);
  return w;
});

export const SIREN_FLUE = top("THE FLUE", () => {
  const w = bossWorld("flue");
  until(w, "the flue up", (x) => flueBoss(x) !== null, 120 * POSE_TPB);
  run(w, POSE_TPB * 2);
  return w;
});

/** THE MIMIC's own gallery pose for `state`, built again under this name. */
function mimicAt(state: string): () => World {
  return () => {
    const pose = MIMIC_POSES.find((p) => p.boss?.state === state);
    if (!pose) throw new Error(`no MIMIC pose for ${state}`);
    return pose.build();
  };
}
export const SIREN_MIMIC_P1 = top("THE MIMIC, P1 READS", mimicAt("sign"));
export const SIREN_MIMIC_P2 = top("THE MIMIC, P2 READS NEXT", mimicAt("rolling"));

/** THE GAUGE, a round with its own stage, a wound standing open. */
export const SIREN_GAUGE = top("THE GAUGE", () =>
  poseNamed("GAUGE · THE BAND WOUND, ASKING A THUMB").build(),
);
