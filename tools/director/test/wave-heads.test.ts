import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { placeable } from "../src/compose-block.js";
import { isFillerHead, isLesson, isReviewHead } from "../src/compose-starts.js";
import { waveGroups } from "../src/rail-groups.js";

/**
 * WHICH WAVES HEAD A GROUP IN THE WAVE LIST, AND WHICH FOLD UNDER ONE.
 *
 * The owner, 16 October 2026: *"the rock" i expect to have waves below,
 * because it introduces new brush (enemy). apply accordingly across waves.*
 * So a wave heads a group exactly when it starts a block — it brings a brush
 * (a body or a pod, `placeable`), a panel or a fault (`isLesson`), or it
 * opens a review (`isReviewHead`) or a filler (`isFillerHead`) — or is the
 * first wave. Every other wave is a variant of the head above it, guided or
 * not, and so is a boss, which closes the group it follows (the owner, 17
 * October 2026) — past the arc, a filler's, never a group that teaches.
 *
 * **THE HAND and ONE LAST CHANCE are the two heads that bring nothing a
 * block is cut by.** THE HAND teaches the grip, a verb the whole run has, and
 * the owner the same day: *"the hand" is introducing new concept, so have it
 * a separate after "the rock".* ONE LAST CHANCE teaches the shield's push,
 * and the owner again: *"one last chance" is again something which is
 * separate new introduction … it should come after meteors introduced
 * parent … as shield was introduced there.* So both stand after THE ROCK's
 * regular waves, alone, before TORCH. CATCH AND AIM heads its own since a
 * boss closed the block in front of it (BULB QUEEN, the owner's pick, the
 * same day): folded under a boss, it would read as the boss's.
 *
 * A wave dragged into another group in the director turns this red; the fix
 * is its `variant` flag in the act file, set or taken off.
 */

/** Waves that head a group of their own without starting a block. */
const STANDS_ALONE = new Set(["theHand", "oneLastChance", "catchAndAim"]);

function headsBlock(i: number): boolean {
  const wave = WAVES[i];
  if (!wave) return false;
  if (i === 0 || STANDS_ALONE.has(wave.id)) return true;
  if (wave.boss) return false;
  return (
    placeable(WAVES, i) !== undefined ||
    isLesson(WAVES, i) ||
    isReviewHead(WAVES, i) ||
    isFillerHead(WAVES, i)
  );
}

describe("the wave list's groups", () => {
  test("a wave heads a group exactly when it starts a block", () => {
    const groups = waveGroups(WAVES);
    const wrong: string[] = [];
    for (const [i, wave] of WAVES.entries()) {
      const head = groups.head[i] === -1;
      if (head === headsBlock(i)) continue;
      wrong.push(`${i + 1} ${wave.name}: ${head ? "heads a group" : "is a variant"}`);
    }
    expect(wrong).toEqual([]);
  });

  test("every wave that brings a brush has waves under it", () => {
    const groups = waveGroups(WAVES);
    const alone = WAVES.flatMap((wave, i) =>
      placeable(WAVES, i) !== undefined && (groups.size[i] ?? 0) === 0 ? [wave.name] : [],
    );
    expect(alone).toEqual([]);
  });
});
