import type { Scene } from "../scene.js";
import { BOSS_SCENES } from "./bosses.js";
import { CREATURE_SCENES } from "./creatures.js";

/**
 * Every mechanic that has been drawn as a placement rather than as a contour.
 *
 * Split along the seam the backlog page already groups by, for the reason
 * `drafts/index.ts` gives: a list of a dozen entries with a paragraph each is a
 * long file, and an entry filed wrongly should be one move between two files.
 *
 * There are fewer of these than there are drafts, and that is the intended
 * ratio rather than a backlog. A contour is worth drawing for any idea with a
 * body; a scene is only worth drawing where the *placement* is the argument —
 * a width, a lane, a comparison, a thing standing on the hull. An idea whose
 * whole claim fits in one fitted frame does not need one.
 */
export const SCENES: Scene[] = [...CREATURE_SCENES, ...BOSS_SCENES];
