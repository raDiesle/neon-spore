import { describe, expect, test } from "bun:test";
import { authorsBodyColor, CREATURES, categoryOf } from "@neon-spore/content";
import { type CreatureKind, isBossBody, isMeteorKind } from "@neon-spore/sim";
import { BRUSHES, LIVING_BRUSH_KINDS } from "../src/brushes.js";
import { hasSilhouette } from "../src/silhouette.js";
import { brushOf, CREATURE_BRUSHES, emptyWave, paint } from "../src/state.js";

/**
 * `docs/INDEX.md` used to call `palette.ts` "the creature palette — the
 * brushes are the bestiary". They were not: `brushes.ts` used to name
 * `slick` and `bulb` by hand, and a creature added to `CREATURES` since —
 * the Runt, the Throb — could not be placed in a wave at all. This file is
 * the guard that promise now has to keep: every placeable living kind in
 * `CREATURES` gets a brush by construction, and this test is what notices
 * if that construction ever stops covering one.
 *
 * The expected set is recomputed here from `CREATURES` and the same three
 * calls `brushes.ts` uses (`isMeteorKind`, `isBossBody`, `categoryOf`) —
 * independently of `LIVING_BRUSH_KINDS` itself, so a bug in the filter
 * inside `brushes.ts` (an accidental exclusion, a typo'd kind name) fails
 * here rather than passing because the test asked the code under test what
 * the answer should be.
 */
function expectedLivingKinds(): CreatureKind[] {
  return (Object.keys(CREATURES) as CreatureKind[]).filter(
    (kind) => !isMeteorKind(kind) && !isBossBody(kind) && categoryOf(kind) !== "special",
  );
}

describe("LIVING_BRUSH_KINDS", () => {
  test("is exactly the bestiary's placeable living kinds — no more, no fewer", () => {
    expect(new Set(LIVING_BRUSH_KINDS)).toEqual(new Set(expectedLivingKinds()));
  });

  test("includes the Lure and the Throb, which carry no colour of their own", () => {
    expect(LIVING_BRUSH_KINDS).toContain("lure");
    expect(LIVING_BRUSH_KINDS).toContain("throb");
  });

  test("excludes rocks, boss bodies and the tether", () => {
    expect(LIVING_BRUSH_KINDS).not.toContain("meteor");
    expect(LIVING_BRUSH_KINDS).not.toContain("torch");
    expect(LIVING_BRUSH_KINDS).not.toContain("queen");
    expect(LIVING_BRUSH_KINDS).not.toContain("warden");
    expect(LIVING_BRUSH_KINDS).not.toContain("tether");
  });
});

describe("every placeable living kind has a real brush", () => {
  for (const kind of expectedLivingKinds()) {
    test(`${kind} is a brush BRUSHES actually carries, with a card it can draw`, () => {
      const entry = BRUSHES.find((b) => b.brush === kind);
      expect(entry, kind).toBeDefined();
      expect(entry?.note).toBe(CREATURES[kind].blurb);
      expect(entry?.stroke.length ?? 0, kind).toBeGreaterThan(0);
      // A brush with a subject the shape sheet has never tuned draws a blank
      // card — the palette's silent version of the bug this file exists for.
      for (const subject of entry?.subjects ?? []) {
        expect(hasSilhouette(subject), subject).toBe(true);
      }
    });
  }

  test("is also on the boss-wave guard list, so a boss wave still hides it", () => {
    for (const kind of expectedLivingKinds()) {
      expect(CREATURE_BRUSHES, kind).toContain(kind);
    }
  });
});

describe("paint and brushOf round trip for every living brush", () => {
  for (const kind of expectedLivingKinds()) {
    test(`painting ${kind} makes a cell brushOf reads back as ${kind}`, () => {
      const wave = emptyWave();
      paint(wave, 0, 3, kind);
      const entry = wave.entries.find((e) => e.beat === 0 && e.col === 3);
      expect(entry, kind).toBeDefined();

      const color = CREATURES[kind].color;
      if (color) {
        // A coloured kind is named by its colour alone — see WaveEntry.kind's
        // comment in packages/content/src/wave-types.ts.
        expect(entry?.color).toBe(color);
        expect(entry?.kind).toBeUndefined();
      } else if (authorsBodyColor(kind)) {
        // A kind whose colour is a fact about the arrival: it is placed on the
        // slick, and the panel under the map turns it into a bulb. Placing one
        // with no colour at all is what this used to do, and it authored a
        // body the game then had to fall back to a grey stand-in for.
        expect(entry?.color).toBe("red");
        expect(entry?.kind as string).toBe(kind);
      } else {
        expect(entry?.color).toBeNull();
        // `entry?.kind`'s type is WaveEntry's narrow, hand-written union
        // (RockKind | "runt" | "throb"); `kind` here is the wider
        // CreatureKind, so the comparison is on the string, not the type.
        expect(entry?.kind as string).toBe(kind);
      }

      expect(entry && brushOf(entry)).toBe(kind);
    });
  }
});
