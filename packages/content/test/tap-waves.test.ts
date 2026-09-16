import { describe, expect, it } from "bun:test";
import { WAVES } from "../src/index.js";

/**
 * **The two creatures answered by a finger on the field, and why no wave may
 * carry both.**
 *
 * THE BEATBOX is pressed on its own body; THE MINE is pressed on a square with
 * nothing drawn on it, from the seat the body is hidden from. `touch.ts` asks
 * for them in that order and has to: a box is a thing you can see, and a hand
 * that found one cannot also have meant the empty tile under it. So the mine's
 * press is the *last resort* — it is offered only where nothing else wanted
 * the point.
 *
 * On a wave carrying both, that order is a trap rather than a courtesy. The
 * blind seat is told a square out loud and presses it; if a box happens to be
 * standing on that square at that moment, the press becomes a beat of the
 * box's round and the mine hears nothing. The pair did everything right and
 * the game answered a different question — and there is no fix on the render
 * side, because at the moment of the press the two presses are the same press.
 *
 * The guard is here rather than in the director because a wave is content:
 * `bun run check` refuses the composition wherever it was authored, including
 * a wave typed straight into `waves/`. A wave that genuinely wants both has to
 * come back and change this file, which is the conversation it should be.
 */

const holds = (kinds: readonly string[], kind: string): boolean => kinds.includes(kind);

describe("the two creatures a bare finger answers", () => {
  it("never puts a mine and a soundbox on one wave", () => {
    for (const wave of WAVES) {
      const kinds = wave.entries.map((e) => e.kind ?? "");
      const both = holds(kinds, "mine") && holds(kinds, "beatbox");
      expect(
        both,
        `${wave.name} carries a mine and a soundbox: a blind tap that lands on a box is eaten by it`,
      ).toBe(false);
    }
  });

  it("has a wave for each of them, so the rule above is about something", () => {
    // Both directions, `scenes-prose.test.ts`'s own arrangement: a rule that
    // holds because neither creature is on the field any more is a rule that
    // has stopped saying anything.
    const kindsOf = (kind: string) =>
      WAVES.filter((w) => w.entries.some((e) => e.kind === kind)).length;
    expect(kindsOf("mine")).toBeGreaterThan(0);
    expect(kindsOf("beatbox")).toBeGreaterThan(0);
  });
});
