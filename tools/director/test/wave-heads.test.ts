import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { placeable } from "../src/compose-block.js";
import { isLesson, isReviewHead } from "../src/compose-starts.js";
import { waveGroups } from "../src/rail-groups.js";

/**
 * WHICH WAVES HEAD A GROUP IN THE WAVE LIST, AND WHICH FOLD UNDER ONE.
 *
 * The owner, 16 October 2026: *"the rock" i expect to have waves below,
 * because it introduces new brush (enemy). apply accordingly across waves.*
 * So a wave heads a group exactly when it starts a block — it brings a brush
 * (a body or a pod, `placeable`), a panel or a fault (`isLesson`), or it
 * opens a review (`isReviewHead`) — or is a boss, or is the first wave. Every
 * other wave is a variant of the head above it, guided or not: THE HAND
 * teaches the grip, and still folds under THE ROCK, whose brush it uses.
 *
 * A wave dragged into another group in the director turns this red; the fix
 * is its `variant` flag in the act file, set or taken off.
 */

function headsBlock(i: number): boolean {
  const wave = WAVES[i];
  if (!wave) return false;
  if (i === 0 || wave.boss) return true;
  return placeable(WAVES, i) !== undefined || isLesson(WAVES, i) || isReviewHead(WAVES, i);
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
