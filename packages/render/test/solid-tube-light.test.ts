import { describe, expect, it } from "bun:test";
import { sectionStops } from "../src/solid-tube-light.js";

/**
 * A SECTION'S LIGHT MOVES AS LITTLE AS ITS SECTION DOES. Two slices of a
 * tube lit a hair apart are drawn a hair apart: no stop of one jumps to a
 * colour the other is nowhere near. On the solid sheet's yaw 23° / pitch 0°
 * cell, the body's top edge and the stop just inside it were lit within a
 * thousandth of each other, the specular went to whichever won, and one slice
 * of the body lost its stripe under the rim.
 */

const SKIN = { base: "#3A2380", lift: "#9C82FF", sheen: "#F3DEFF" };
const STEPS = 48;

/** The largest difference in any channel between two stops, 0..255. */
function jump(a: readonly string[], b: readonly string[]): number {
  let most = 0;
  a.forEach((hex, j) => {
    const p = Number.parseInt(hex.slice(1), 16);
    const q = Number.parseInt((b[j] as string).slice(1), 16);
    for (const shift of [16, 8, 0]) {
      most = Math.max(most, Math.abs(((p >> shift) & 255) - ((q >> shift) & 255)));
    }
  });
  return most;
}

describe("a section's light", () => {
  it("keeps its stripe on the two neighbouring slices of the sheet's 23° body", () => {
    // Rings 5 and 6 of the body in that cell, keyed as `sectionGradient` keys them.
    const five = sectionStops(-32 / STEPS, 9 / STEPS, SKIN);
    const six = sectionStops(-32 / STEPS, 8 / STEPS, SKIN);
    expect(jump(five, six)).toBeLessThan(20);
    // The stop just in from the top edge carries the specular on both.
    const sheen = Number.parseInt(SKIN.sheen.slice(3, 5), 16);
    for (const stops of [five, six]) {
      const g = Number.parseInt((stops[1] as string).slice(3, 5), 16);
      expect(g).toBeGreaterThan(sheen * 0.6);
    }
  });

  it("never jumps between two neighbouring keys, anywhere a section can be lit", () => {
    let most = 0;
    for (let a = -STEPS; a <= STEPS; a++) {
      for (let f = -STEPS; f <= STEPS; f++) {
        const here = sectionStops(a / STEPS, f / STEPS, SKIN);
        if (a < STEPS)
          most = Math.max(most, jump(here, sectionStops((a + 1) / STEPS, f / STEPS, SKIN)));
        if (f < STEPS)
          most = Math.max(most, jump(here, sectionStops(a / STEPS, (f + 1) / STEPS, SKIN)));
      }
    }
    expect(most).toBeLessThan(40);
  });
});
