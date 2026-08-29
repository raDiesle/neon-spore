import { describe, expect, it } from "bun:test";
import {
  BRIEFING_SUBJECTS,
  type BriefingId,
  createWorld,
  DEFAULT_CONFIG,
  openBriefings,
} from "@neon-spore/sim";
import { mechanicsInWave } from "../src/mechanics.js";
import { AUTHORED_COLS, bossFromWave, podsFromWave, queueFromWave } from "../src/queue.js";
import type { Wave } from "../src/wave-types.js";
import { WAVES } from "../src/waves.js";

/**
 * The invariant an authored `card` hands over, held to by a test rather than
 * by a paragraph — see `docs/queue.md`, "a wave may name the card it
 * teaches". `Wave.card` overrides `openBriefings`'s own derivation, and
 * override is the one thing in this feature that nobody keeps by remembering:
 * today every mechanic is taught exactly once, at the moment it first
 * appears, as a *consequence* of deriving. The moment a wave can name a
 * different subject than the one it would otherwise raise, that property
 * stops being automatic and becomes something an author can get wrong.
 *
 * `control-sets.test.ts` does the equivalent for panels — a set no wave
 * reaches is a panel nobody can see — so this copies that shape rather than
 * inventing one.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };

/**
 * Which wave first raises each subject, for a pair playing the whole list in
 * campaign order — the same question `tools/director/src/card-waves.ts`'s
 * `cardFirstWave` asks, walked here against an arbitrary wave list instead of
 * the shipped `WAVES`, so the failure modes below can be demonstrated on a
 * handful of waves rather than by editing the real game.
 *
 * Calls `openBriefings` itself, the exact function `startWave` calls, rather
 * than re-deriving "what a wave introduces" by hand — a second reading of
 * that rule is a second reading that drifts.
 */
function firstWavePerSubject(waves: readonly Wave[]): Map<BriefingId, number> {
  const world = createWorld({ ...CFG }, 0);
  const map = new Map<BriefingId, number>();
  for (let i = 0; i < waves.length; i++) {
    const wave = waves[i]!;
    openBriefings(
      world,
      queueFromWave(wave, AUTHORED_COLS),
      podsFromWave(wave, AUTHORED_COLS),
      bossFromWave(wave, AUTHORED_COLS),
      wave.card,
    );
    for (const idx of world.brief.due) {
      const id = BRIEFING_SUBJECTS[idx]!;
      if (!map.has(id)) map.set(id, i);
      world.brief.met |= 1 << idx;
    }
  }
  return map;
}

describe("the invariant an authored card must hold to", () => {
  it("never authors a card twice across the shipped waves", () => {
    const authored = WAVES.map((w) => w.card).filter((c) => c !== undefined);
    expect(new Set(authored).size).toBe(authored.length);
  });

  it("never authors a card for something the wave does not contain", () => {
    for (const w of WAVES) {
      if (w.card === undefined) continue;
      expect(mechanicsInWave(w).has(w.card), `${w.name} names ${w.card}`).toBe(true);
    }
  });

  it("reaches every subject from some wave, in campaign order", () => {
    const first = firstWavePerSubject(WAVES);
    for (const id of BRIEFING_SUBJECTS) {
      if (id === "opening") continue; // not tied to any wave's contents
      expect(first.has(id), id).toBe(true);
    }
  });

  it("fails when a wave authors the same card as another wave", () => {
    const rock: Wave = {
      name: "A",
      sentence: "s",
      hint: "h",
      entries: [{ beat: 0, col: 0, kind: "meteor", color: null }],
      card: "meteor",
    };
    const rockAgain: Wave = {
      name: "B",
      sentence: "s",
      hint: "h",
      entries: [{ beat: 0, col: 0, kind: "meteorMedium", color: null }],
      card: "meteor",
    };
    const authored = [rock, rockAgain].map((w) => w.card).filter((c) => c !== undefined);
    expect(new Set(authored).size).toBeLessThan(authored.length);
  });

  it("fails when a wave names a card for something it does not contain", () => {
    const wrong: Wave = {
      name: "A",
      sentence: "s",
      hint: "h",
      entries: [{ beat: 0, col: 0, color: "red" }],
      card: "meteor",
    };
    expect(mechanicsInWave(wrong).has("meteor")).toBe(false);
  });

  it("fails when a subject is reachable by no wave at all", () => {
    const onlySlick: Wave[] = [
      { name: "A", sentence: "s", hint: "h", entries: [{ beat: 0, col: 0, color: "red" }] },
    ];
    const first = firstWavePerSubject(onlySlick);
    expect(first.has("meteor")).toBe(false);
  });
});
