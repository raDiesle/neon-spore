import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { BYTES, SPRITE_BYTES_CEILING, spriteBytes } from "../src/sprite-bytes.js";
import { DEMOS } from "../src/sprite-demos.js";

setDefaultTimeout(30_000);

/**
 * A baked sprite ships as code, and this is the line that code stays under:
 * each one's gzipped cost beside the drawing it is offered against. A sprite
 * on the sheet with no row here would go unweighed, so that fails too.
 */
describe("a baked sprite's bytes", () => {
  it("has a row for every sprite on the sheet", () => {
    expect(DEMOS.map((d) => d.name).sort()).toEqual(Object.keys(BYTES).sort());
  });

  for (const name of Object.keys(BYTES))
    it(`${name} adds at most ${SPRITE_BYTES_CEILING} B gzipped`, async () => {
      const [, gz] = await spriteBytes(name);
      expect(gz).toBeLessThanOrEqual(SPRITE_BYTES_CEILING);
    });
});
