import type { InstarPart, InstarPose, SceneStep } from "./instar-words.js";

/**
 * **The words THE NETTLE's script is written in** — its parts and its poses.
 * Everything else a scene says (whose thumb, which gesture, how the body
 * arrives, which phase) is THE INSTAR's list, because it is THE INSTAR's
 * engine (`instar.ts`); only what the picture is made of is this boss's own.
 *
 * THE NETTLE is a jellyfish the size of the field: a bell, two long stinging
 * arms, a pair of eyespots on the rim, a brood sac, an iris of a mouth on the
 * underside, a curtain of frilled oral arms, and the core glowing inside the
 * bell. Each part here is one a mark sits on, and one that strikes the hull
 * if its mark is left undone. Both lists are hashed by place (`instar-hash.ts`),
 * so a new word goes on the end.
 */
export const NETTLE_PARTS = [
  "arm",
  "spot",
  "sac",
  "spore",
  "mouth",
  "glob",
  "frill",
  "core",
] as const;
export type NettlePart = (typeof NETTLE_PARTS)[number];

/**
 * The pictures the body morphs between: the arms raised to sting, the bell
 * tipped to stare with its eyespots, the sac swollen with spores, the body
 * turned to show its underside, the iris open to drop, the bell squeezed to
 * spit, the oral arms let down as a curtain, and the bell open on its core.
 */
export const NETTLE_POSES = [
  "sting",
  "gaze",
  "spawn",
  "under",
  "gape",
  "spit",
  "frill",
  "core",
] as const;
export type NettlePose = (typeof NETTLE_POSES)[number];

export type NettleStep = SceneStep<NettlePose, NettlePart>;

/** Any scene's part or pose, for the events both scenes share (`events-instar.ts`). */
export type ScenePart = InstarPart | NettlePart;
export type ScenePose = InstarPose | NettlePose;

/** What a wave authors: the script, and nothing else. */
export interface NettleEntry {
  kind: "nettle";
  steps: readonly NettleStep[];
}
