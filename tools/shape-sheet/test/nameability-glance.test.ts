import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { CREATURE_GLANCE, CREATURE_GLANCE_SIZE } from "@neon-spore/render";
import { confusable, type Nameability, nameability } from "../src/nameability.js";
import type { GlanceReach } from "../src/nameability-glance.js";
import { livingKinds } from "../src/subjects.js";

/**
 * **An enemy may glance as far as the naming gate allows, and no further.**
 *
 * The owner, 14 October 2026: every enemy glances as the bosses do, *within
 * the naming gate*. `CREATURE_GLANCE_SIZE` (`render/creature-glance.ts`) is the
 * largest reach, then the largest roll at it, at which no pair of living kinds
 * the gate keeps apart today becomes the same word, every body turned through
 * every swing and roll of a COCK round (`nameability-glance.ts`).
 *
 * Both edges are held, so the number cannot drift either way unnoticed: at the
 * shipped size every pair still stands apart, and a hundredth more turn or a
 * hundredth more roll puts two kinds on top of each other. A size raised past
 * the gate goes red on the first; a gate that loosened, so the size could
 * grow, goes red on the second and asks for the search to be run again.
 */

setDefaultTimeout(30_000);

const KINDS = livingKinds();
const STEP = 0.01;

const TODAY = new Map(KINDS.map((kind) => [kind, nameability(kind)]));

/** The pairs kept apart today that a glance of `size` makes the same word. */
function joined(size: GlanceReach): string[] {
  const turned = new Map<string, Nameability>(
    KINDS.map((kind) => [kind, nameability(kind, undefined, size)]),
  );
  const out: string[] = [];
  for (let i = 0; i < KINDS.length; i++) {
    for (let j = i + 1; j < KINDS.length; j++) {
      const a = KINDS[i]!;
      const b = KINDS[j]!;
      if (confusable(TODAY.get(a)!, TODAY.get(b)!)) continue;
      if (confusable(turned.get(a)!, turned.get(b)!)) out.push(`${a}/${b}`);
    }
  }
  return out;
}

describe("an enemy's glance, within the naming gate", () => {
  it("keeps every pair apart at the size that ships", () => {
    expect(joined(CREATURE_GLANCE_SIZE)).toEqual([]);
  });

  it("is the largest turn: a hundredth more joins a pair", () => {
    expect(
      joined({ ...CREATURE_GLANCE_SIZE, reach: CREATURE_GLANCE_SIZE.reach + STEP }),
    ).not.toEqual([]);
  });

  it("is the largest roll at that turn: a hundredth more joins a pair", () => {
    expect(joined({ ...CREATURE_GLANCE_SIZE, cock: CREATURE_GLANCE_SIZE.cock + STEP })).not.toEqual(
      [],
    );
  });

  it("measures nothing new with no glance", () => {
    for (const kind of KINDS) {
      expect(nameability(kind, undefined, { reach: 0, cock: 0 })).toEqual(TODAY.get(kind)!);
    }
  });

  it("ships still until the lane that turns the enemies", () => {
    for (const t of [0, 1.3, 2.9, 4.4]) {
      expect(CREATURE_GLANCE.swing(t)).toBe(0);
      expect(CREATURE_GLANCE.roll(t)).toBe(0);
    }
  });
});
