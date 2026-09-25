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
 * Both directions matter. A film written for one of the nine below fails this
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
  "THE COUNT",
  "THE CHOKE",
  "THE LIMPET",
  "THE LEECH",
  "THE CODEX",
  // THE HIVE left this list on 21 September 2026: the wave it could not be
  // filmed against — nobody could finish it — was fixed on the 20th, and
  // `scenes/the-hive.ts` is the film of it being won.
  // THE INSTAR left this list on 25 September 2026 without a film: the owner
  // took its guide off, because its marks say their own words on the field
  // (`waves.test.ts`, `SAYS_ITSELF`).
  // And THE FILAMENT, drawn 18 September 2026 (`render/filament-draw.ts` and
  // the three files beside it, `bosses.md` §11.33) with its film still owed:
  // its guide already says the one rule each seat has — draw a tile a beat,
  // follow the lit part — and its words are on the field beside the rings, so
  // whether a boss that says its own verbs wants a film is the question THE
  // INSTAR's guide was dropped over, and it waits on the owner's eye.
  "THE FILAMENT",
  // And THE GIMBAL, whose simulation landed 22 September 2026 (`bosses.md`
  // §11.34) with nothing of it drawn at all yet. A film is a rehearsal of the
  // game's own screen, and there is no screen to rehearse until the look lane
  // draws the drum and its two rims; the guide says the rule in the meantime.
  "THE GIMBAL",
  // THE SPOOL left this list on 24 September 2026, a day after its brake
  // learnt to answer a thumb: `scenes/the-spool.ts` is the shallow brake, the
  // slip, *slower* and the rib.
  // And THE HASP the same day (§11.37), for the same reason a fourth time:
  // the door of clasps, its wheel and the latch beside it are undrawn, so
  // there is no screen for a film to rehearse. The guide says the one thing
  // its pilot has to know — keep holding — until the look lane draws it.
  "THE HASP",
  // And THE RATCHET (§11.38), a fifth time: the rack, its catch and its
  // pawl are undrawn, and the guide says who holds and who presses.
  "THE RATCHET",
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
    const fix = "update §3.2 of docs/spec/briefings.md, which counts eighty films";
    expect(filmed.length, fix).toBe(guided.length - STILL_PROSE.length);
    // Eighty, which is the number in the section. A film with no wave
    // showing it is `scenes.test.ts`'s own failure; this is the other half —
    // the two counts are the same number only while that holds.
    expect(Object.keys(SCENES).length, fix).toBe(filmed.length);
  });

  it("counts the guided waves the opening section names", () => {
    // "seventy-four of the eighty-three waves today" — the one figure in §1
    // that goes stale the same way, and it went stale at sixteen of twenty-six.
    const fix = "update §1 of docs/spec/briefings.md, which says eighty-nine of ninety-nine";
    expect(guided.length, fix).toBe(89);
    expect(WAVES.length, fix).toBe(99);
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
