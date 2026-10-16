import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES, waveIntroduces } from "@neon-spore/content";
import { introducesAt, regularAt } from "../src/list-reading.js";

/**
 * **A list read once answers what content answers an index at a time**
 * (`list-reading.ts`): what each wave is the first to bring, and whether it
 * is regular — every twentieth wave, and the first and last.
 */

const sample = WAVES.flatMap((_, i) => (i % 20 === 0 || i === WAVES.length - 1 ? [i] : []));

describe("the composers' reading of a list", () => {
  test("is content's, index by index", () => {
    for (const i of sample) {
      expect({ i, fresh: introducesAt(WAVES, i) }).toEqual({ i, fresh: waveIntroduces(WAVES, i) });
      expect({ i, regular: regularAt(WAVES, i) }).toEqual({ i, regular: isRegularWave(WAVES, i) });
    }
  });

  test("is read again when the list grew", () => {
    const waves = WAVES.slice(0, 40);
    const was = regularAt(waves, 39);
    waves.push(...WAVES.slice(40, 80));
    expect(regularAt(waves, 79)).toBe(isRegularWave(WAVES, 79));
    expect(regularAt(waves, 39)).toBe(was);
  });
});
