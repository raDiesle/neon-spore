import { describe, expect, it } from "bun:test";
import { WAVES } from "../src/index.js";
import { SCENES } from "../src/scenes.js";

/**
 * **The five guides that are still prose, and the count of the ones that are
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
 * Both directions matter. A film written for one of the six below fails this
 * and the failure says to update the section; a guide that loses its film fails
 * it the other way. Neither is a defect in the film — it is the document being
 * asked to keep up, which is the only thing that was ever wrong with it.
 */

/**
 * The guided waves whose opening is the three strings and the two circles.
 *
 * Five of them are films nobody has written yet. **THE MINE is the one that
 * cannot have one**: every act of a rehearsal is a thumb on a named control
 * (`scene-script.ts`, `controlPress`), and that creature's whole answer is a
 * finger on a bare square of the field, which is not a control and has no
 * name to press. A film for it would have to show a hand landing on nothing.
 */
const STILL_PROSE = ["THE COUNT", "THE CHOKE", "THE LIMPET", "THE LEECH", "THE CODEX", "THE MINE"];

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
    const fix = "update §3.2 of docs/spec/briefings.md, which counts fifty-nine films";
    expect(filmed.length, fix).toBe(guided.length - STILL_PROSE.length);
    // Fifty-nine, which is the number in the section. A film with no wave
    // showing it is `scenes.test.ts`'s own failure; this is the other half —
    // the two counts are the same number only while that holds.
    expect(Object.keys(SCENES).length, fix).toBe(filmed.length);
  });

  it("counts the guided waves the opening section names", () => {
    // "sixty-five of the seventy-four waves today" — the one figure in §1
    // that goes stale the same way, and it went stale at sixteen of twenty-six.
    const fix = "update §1 of docs/spec/briefings.md, which says sixty-five of seventy-four";
    expect(guided.length, fix).toBe(65);
    expect(WAVES.length, fix).toBe(74);
  });

  it("keeps the prose beside a film rather than instead of it", () => {
    // The section says a wave with a film keeps its three strings. A film that
    // arrived with the prose deleted would leave a pair with nothing to read on
    // the second time through.
    for (const w of guided) {
      expect(w.guide?.both, `${w.name} carries a guide with no words in it`).toBeTruthy();
    }
  });
});
