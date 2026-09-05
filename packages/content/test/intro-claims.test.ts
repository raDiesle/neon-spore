import { describe, expect, it } from "bun:test";
import { INTRO_PAGES } from "../src/intro.js";
import { WAVES } from "../src/waves.js";

/**
 * The one thing a page of advertising can be: wrong.
 *
 * Every other rule about the intro is about how it reads — short lines, a
 * loud tag, six colours — and a test can only hold the shape of those. This
 * holds the substance, which is the half that goes stale on its own: the boss
 * page names a number, waves are added by a lane that has never read this
 * file, and the copy said *eight* on the day a ninth boss was already in the
 * game.
 *
 * It counts what the waves actually install rather than restating it, which is
 * the rule `packages/sim/test/purity.test.ts` carries for the simulation and
 * the same rule for the same reason: a second copy of a fact drifts, and the
 * loudest screen in the game is the worst place for it to drift quietly.
 */

/** The numbers this page could plausibly reach, spelled the way it spells them. */
const SPELLED = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

describe("what the intro claims about the game", () => {
  it("names as many bosses as the waves install", () => {
    const kinds = new Set(WAVES.map((w) => w.boss?.kind).filter((k) => k !== undefined));
    const page = INTRO_PAGES.find((p) => p.id === "boss");
    expect(page, "the boss page").toBeDefined();
    const spelled = SPELLED[kinds.size];
    expect(spelled, `no word for ${kinds.size} bosses`).toBeDefined();
    expect(page?.line.toLowerCase(), `${kinds.size} bosses: ${[...kinds].join(", ")}`).toContain(
      spelled as string,
    );
  });
});
