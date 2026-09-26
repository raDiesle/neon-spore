import { describe, expect, it } from "bun:test";
import { WAVES } from "../src/index.js";
import { SCENES } from "../src/scenes.js";

/**
 * **The guides that are still prose, and the count of the ones that are
 * not.**
 *
 * `docs/spec/briefings.md` said *one rehearsal exists* and *FIRST STEP has the
 * only one* for as long as it took to write fifty-five more — a sentence
 * nobody had a reason to open, contradicted by a directory anybody could count.
 * A document that states a number about the code is a copy of the code, and the
 * rule this repository already plays by is that a copy is held by a test
 * (`sim/test/copies-table.ts`). So the numbers in that section are here, in the
 * package that owns them.
 *
 * Both directions matter. A film written for one of the two below fails this
 * and the failure says to update the section; a guide that loses its film fails
 * it the other way. Neither is a defect in the film — it is the document being
 * asked to keep up, which is the only thing that was ever wrong with it.
 */

/**
 * The guided waves whose opening is the three strings and the two circles.
 *
 * Most of them are films nobody has written yet, and the reason is written
 * beside each — the two at the end are the other case, where the picture exists
 * and something else is in the way. THE MINE stood here as *the
 * one that cannot have one* — every act was a thumb on a named control and
 * its answer is a finger on a bare square — until the act grew a `tile`
 * gesture that names the square and the seat (`scene-act-types.ts`), and the
 * hand landing on nothing turned out to be exactly the picture.
 */
const STILL_PROSE = [
  // THE COUNT left this list on 26 September 2026: `scenes/the-count.ts` is
  // the shot on sight refused and the shot on zero taken.
  // And THE CHOKE the same day: `scenes/the-choke.ts` is the cannon walking
  // to the wall and back, and the bolt on the beat it is under the body.
  // And THE LIMPET: `scenes/the-limpet.ts` is the shield walked a column a
  // beat under the body, and the round lost when the thumb stops.
  // And THE LEECH after it: `scenes/the-leech.ts` is the same film on the
  // cannon, with the word on the other screen.
  // And THE CODEX: `scenes/the-codex.ts` is red refused by a red body in a
  // swapped hold, and cyan taking it on the pilot's word.
  // THE HIVE left this list on 21 September 2026: the wave it could not be
  // filmed against — nobody could finish it — was fixed on the 20th, and
  // `scenes/the-hive.ts` is the film of it being won.
  // THE INSTAR left this list on 25 September 2026 without a film: the owner
  // took its guide off, because its marks say their own words on the field
  // (`waves.test.ts`, `SAYS_ITSELF`).
  // And THE FILAMENT the same day, the same way: asked whether it wanted a
  // film, the owner answered *both guides go*.
  // And THE GIMBAL, once the drum and its two rims were drawn:
  // `scenes/the-gimbal.ts` is both rings turned to their marks and held — hers
  // the other way round on her own face — and a tooth sheared off each.
  // THE SPOOL left this list on 24 September 2026, a day after its brake
  // learnt to answer a thumb: `scenes/the-spool.ts` is the shallow brake, the
  // slip, *slower* and the rib.
  // And THE HASP after it, once its door was drawn: `scenes/the-hasp.ts` is
  // the wheel turned while the latch is held, seized when it is let go, and
  // the first hasp opened once it is taken again.
  // And THE RATCHET after that: `scenes/the-ratchet.ts` is a clean tooth
  // pressed on her catch, and the next one pressed with nothing set and lost.
  // And THE NETTLE (§11.39), a sixth time, 26 September 2026: the jellyfish
  // is undrawn, and the guide says which marks are a thumb and which the
  // panel's.
  "THE NETTLE",
  // And THE MANTLE (§23), a seventh time, the same day: the shell and its two
  // handles are undrawn, and the guide says which handle is whose and what
  // letting go costs.
  "THE MANTLE",
  // And THE KEEL (§24), an eighth time, the same day: the spine is undrawn,
  // and the guide says whose half of the screen a joint is on.
  "THE KEEL",
];

const guided = WAVES.filter((w) => w.guide);

describe("what `docs/spec/briefings.md` §3.2 says about the rehearsals", () => {
  it("names exactly the guided waves that carry no film", () => {
    const prose = guided.filter((w) => !w.guide?.scene).map((w) => w.name);
    expect(prose.sort(), "update §3.2 of docs/spec/briefings.md and the list above").toEqual(
      [...STILL_PROSE].sort(),
    );
  });

  it("counts one film per guided wave that carries one, and no film unused", () => {
    const filmed = guided.filter((w) => w.guide?.scene);
    const fix = "update §3.2 of docs/spec/briefings.md, which counts eighty-nine films";
    expect(filmed.length, fix).toBe(guided.length - STILL_PROSE.length);
    // Eighty-nine, which is the number in the section. A film with no wave
    // showing it is `scenes.test.ts`'s own failure; this is the other half —
    // the two counts are the same number only while that holds.
    expect(Object.keys(SCENES).length, fix).toBe(filmed.length);
  });

  it("counts the guided waves the opening section names", () => {
    // "seventy-four of the eighty-three waves today" — the one figure in §1
    // that goes stale the same way, and it went stale at sixteen of twenty-six.
    const fix =
      "update §1 of docs/spec/briefings.md, which says ninety-two of the hundred and three";
    expect(guided.length, fix).toBe(92);
    expect(WAVES.length, fix).toBe(103);
  });

  it("puts a film instead of the prose rather than beside it", () => {
    // The section said, until 25 September 2026, that a wave with a film keeps
    // its three strings. The game never drew them once a film was up, and the
    // owner's word that day was *either … not both*: a film arriving is the
    // prose leaving, in the same commit.
    for (const w of guided) {
      if (w.guide?.scene === undefined) continue;
      expect(w.guide.both, `${w.name} keeps its words beside a film`).toBeUndefined();
    }
  });
});
