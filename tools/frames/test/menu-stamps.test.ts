import { describe, expect, it } from "bun:test";
import { INTRO_KEY } from "../../../apps/game/src/intro.js";
import { NAME_KEY } from "../../../apps/game/src/nickname.js";
import { arrivalStamps, parsePartnerFlag } from "../menu-stamps.js";

/**
 * What a shot arrives as, and the one key that is left out on purpose.
 *
 * The intro is stamped away on every shot but its own. A camera that arrived
 * having seen it could not photograph it at all — which is the state the tool
 * was in until 17 September 2026, and is why the queue entry asking for the
 * scene to be redrawn said nobody could tell whether a change had worked.
 */

const keys = (stamps: [string, string][]): string[] => stamps.map(([k]) => k);

describe("arrivalStamps", () => {
  it("stamps the intro away by default, so the menu is what is up", () => {
    expect(keys(arrivalStamps({ firstVisit: false, partners: [] }))).toContain(INTRO_KEY);
  });

  it("leaves it unstamped for the shot that is of the intro", () => {
    const stamps = arrivalStamps({ firstVisit: false, partners: [], unseenIntro: true });
    expect(keys(stamps)).not.toContain(INTRO_KEY);
    // And the device still has a name: the first meeting would otherwise stand
    // in front of the scene, which is a second screen in the way rather than
    // none.
    expect(keys(stamps)).toContain(NAME_KEY);
  });

  it("leaves the name unstamped on the first meeting, and nothing else", () => {
    const stamps = arrivalStamps({ firstVisit: true, partners: [] });
    expect(keys(stamps)).not.toContain(NAME_KEY);
    expect(keys(stamps)).toContain(INTRO_KEY);
  });
});

describe("parsePartnerFlag", () => {
  it("reads a bare name as somebody met and not played with", () => {
    expect(parsePartnerFlag("Ada")).toEqual([{ name: "Ada", wave: 0 }]);
  });

  it("reads the wave a row will say, in the numbering the row uses", () => {
    expect(parsePartnerFlag("Ada,David:7")).toEqual([
      { name: "Ada", wave: 0 },
      { name: "David", wave: 7 },
    ]);
  });

  it("refuses a wave that is not one", () => {
    expect(() => parsePartnerFlag("David:soon")).toThrow('"soon" is not a wave');
  });

  it("is nobody at all when the flag was not given", () => {
    expect(parsePartnerFlag(undefined)).toEqual([]);
  });
});
