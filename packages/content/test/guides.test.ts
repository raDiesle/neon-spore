import { describe, expect, it } from "bun:test";
import { WAVES } from "../src/index.js";

/**
 * The words a guide carries, held where the words live.
 *
 * These three read `WAVES` and nothing a renderer draws, and until 23
 * September 2026 they sat in `render/test/briefing.test.ts` — so a lane that
 * edited only guide text changed `packages/content`, `check:fast` ran
 * content's tests and never reached them, and the 7a–7g words lane went green
 * there and red inside `bun run land`, two characters over on one wave.
 * `briefing.test.ts` keeps what it draws.
 *
 * A guide with the same line for both players is a guide that teaches half of
 * a split: one player is told to read something out and the other already has
 * it. A half is read on a phone under a beat, so it is short; a name heads the
 * guide, so it fits.
 */

/** The guides made of words — a filmed guide's words are its captions. */
const GUIDED = WAVES.filter((w) => w.guide && w.guide.scene === undefined);

/** The most a guide's half may say, in characters. */
const HALF_MAX = 220;
/** The longest name a guide can be headed with. */
const NAME_MAX = 20;

describe("the guides the waves carry", () => {
  it("never says the same thing to both players", () => {
    for (const wave of GUIDED) {
      expect(wave.guide?.p1, `${wave.name} tells both players the same thing`).not.toBe(
        wave.guide?.p2,
      );
    }
  });

  it("keeps a line short enough to read on a phone under a beat", () => {
    for (const wave of GUIDED) {
      for (const part of [wave.guide!.p1!, wave.guide!.p2!]) {
        expect(part.length, `${wave.name} has a long half: ${part}`).toBeLessThanOrEqual(HALF_MAX);
      }
    }
  });

  it("keeps the name the guide is headed with short enough to fit", () => {
    for (const wave of WAVES) {
      expect(wave.name.length, `${wave.name} is a long name`).toBeLessThanOrEqual(NAME_MAX);
    }
  });
});
