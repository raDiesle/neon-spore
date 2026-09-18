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
 * Both directions matter. A film written for one of the ten below fails this
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
  // And THE FLIP's, owed by the lane that finishes it. A rehearsal is the
  // game's own screen played at full size, one device at a time — and this
  // wave's whole content is that one of those two screens is a mirror, which
  // a film has to show by turning and then by being believed.
  "THE FLIP",
  // And THE HUSK, owed by the lane that films it. A rehearsal is a thumb
  // landing on a named control, and half of this wave's answer is a thumb that
  // must **not** land — the maw left shut while a pod arrives, which is THE
  // STARE's problem a second time, and its film's answer is the one THE
  // STARE's took: the other seat's page, and the cost last — with the other half being a
  // mark drawn on one seat's screen and not the other's, so the film has to be
  // shot twice and read as one lesson.
  "THE HUSK",
  // And THE HIVE, which is drawn — the mass, the nine sites, a breach open or
  // sealed and the swell read by seat are all in `render/hive-draw.ts`,
  // `hive-shape.ts` and `hive-fx.ts`. What its film waits on is that the wave
  // cannot be won as it stands (`bosses.md` §11.14): two of the nine sites open
  // on a spill beat for every seed, and a film is a world stepped by the real
  // rules, so there is no honest film of a fight nobody can finish. Three
  // answers are in `docs/queue.md` (*THE HIVE cannot be won*) and the film
  // follows the one the owner picks.
  "THE HIVE",
  // And THE INSTAR, which is drawn too, and is the picture every other boss's
  // is now measured against (`render/instar-draw.ts` and the eight files beside
  // it). Its guide names the rule and leaves the gestures to the body: each
  // mark carries its own word in a scanner box with the kind of action over it,
  // which is the case `docs/decisions.md` #34 says a briefing gives its words
  // back to. So this one may stay prose — the lane to open is not a film but
  // the question of whether a boss that says its own verbs wants one.
  "THE INSTAR",
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
    const fix = "update §3.2 of docs/spec/briefings.md, which counts seventy-eight films";
    expect(filmed.length, fix).toBe(guided.length - STILL_PROSE.length);
    // Seventy-seven, which is the number in the section. A film with no wave
    // showing it is `scenes.test.ts`'s own failure; this is the other half —
    // the two counts are the same number only while that holds.
    expect(Object.keys(SCENES).length, fix).toBe(filmed.length);
  });

  it("counts the guided waves the opening section names", () => {
    // "seventy-four of the eighty-three waves today" — the one figure in §1
    // that goes stale the same way, and it went stale at sixteen of twenty-six.
    const fix = "update §1 of docs/spec/briefings.md, which says eighty-seven of ninety-six";
    expect(guided.length, fix).toBe(87);
    expect(WAVES.length, fix).toBe(96);
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
