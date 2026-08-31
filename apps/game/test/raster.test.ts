import { describe, expect, it } from "bun:test";
import { bindRasterBurst, rasterRequested } from "../src/raster.js";

/**
 * The flag, and what it decides.
 *
 * `menu.test.ts` is the model: the rule that keeps something out of the way is
 * pure, so it can be checked without a browser. Here the rule is the one that
 * keeps a look the owner has not chosen off the field — and the thing worth
 * asserting is the negative case, that no atlas is even fetched without the
 * flag, because that is what "the shipped game is unchanged" actually means.
 */

describe("the raster flag", () => {
  it("is off unless it is asked for", () => {
    expect(rasterRequested("http://game.invalid/")).toBe(false);
    expect(rasterRequested("http://game.invalid/?menu")).toBe(false);
    expect(rasterRequested("http://game.invalid/?raster=0")).toBe(false);
  });

  it("is on for the ways somebody would type it", () => {
    expect(rasterRequested("http://game.invalid/?raster=1")).toBe(true);
    expect(rasterRequested("http://game.invalid/?raster")).toBe(true);
    expect(rasterRequested("http://game.invalid/?menu&raster=on")).toBe(true);
  });

  it("installs nothing, and asks for nothing, when it is off", async () => {
    let installs = 0;
    const host = {
      install(): void {
        installs++;
      },
    };
    expect(await bindRasterBurst(host, "http://game.invalid/")).toBe("off");
    expect(installs).toBe(0);
  });
});
