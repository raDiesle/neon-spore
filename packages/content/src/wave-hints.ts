import type { Wave } from "./wave-types.js";

/**
 * **A wave that teaches on its own field** rather than in front of it.
 *
 * The owner, 19 October 2026: *replace tutorial mode before wave starts in a
 * way that it is giving hints during gameplay of the related wave but players
 * can interact already (so it is not a separate step) — right now it is
 * unclear for players that it is tutorial.* A wave naming one of these opens
 * on its introduction and is played at once, and the field writes the next
 * thing to do on the screen of the seat that does it, until the pair has shown
 * it can (`render/src/wave-hint.ts`). A name rather than the readings
 * themselves, for `FilmedGuide.scene`'s reason: one line for the director to
 * write back out. FIRST STEP is the first, and the one the owner is shown
 * before any other wave is moved over (`docs/spec/briefings.md`).
 */
export type WaveHintsId = "firstStep";

/**
 * **Whether a wave teaches anything**: a guide in front of it, or hints on its
 * field while it is played (`Wave.hints`). Not `waveHasGuide`, which is the
 * question of whether there is a guide to *play* — a wave with hints has none,
 * and opens on its introduction. This is the question the rules about what is
 * taught where ask (`wave-keys.ts`, `wave-regular.ts`).
 */
export function waveTeaches(wave: Pick<Wave, "guide" | "hints">): boolean {
  return wave.guide !== undefined || wave.hints !== undefined;
}
