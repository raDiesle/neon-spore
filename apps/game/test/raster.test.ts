import { describe, expect, it } from "bun:test";
import { STRIP_NAMES, type StripName } from "@neon-spore/render";
import {
  bindRasterBurst,
  bindRasterClasp,
  bindRasterStrips,
  rasterRequested,
} from "../src/raster.js";

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

  /**
   * THE CLASP's shield goes through the same gate, and this is the assertion
   * that matters for it: the hand-painted strip spent a year unreachable
   * because nothing passed an image, and the fix must not swing the other way
   * and swap the shell out for everybody. Off means no fetch, no install, and
   * `clasp.ts`'s procedural branch — which is what the game ships.
   */
  it("leaves THE CLASP's shield alone unless the flag is set", async () => {
    let installs = 0;
    const host = {
      install(): void {
        installs++;
      },
    };
    expect(await bindRasterClasp(host, "http://game.invalid/")).toBe("off");
    expect(await bindRasterClasp(host, "http://game.invalid/?raster=0")).toBe("off");
    expect(installs).toBe(0);
  });

  /**
   * Every painted strip goes through one loop over `PAINTED_STRIPS`, so the
   * assertion is over the table: THE VISE's split, THE RIME's bare core, THE
   * TRIVET's plant, THE PLUMB's settle and whatever row comes next stay as they ship unflagged.
   */
  it("leaves every painted strip's moment as it ships unless the flag is set", async () => {
    const asked: StripName[] = [];
    let installs = 0;
    const host = {
      strip(name: StripName) {
        asked.push(name);
        return {
          install(): void {
            installs++;
          },
        };
      },
    };
    for (const href of ["http://game.invalid/", "http://game.invalid/?raster=0"]) {
      const bound = await bindRasterStrips(host, href);
      for (const name of STRIP_NAMES) expect(bound[name]).toBe("off");
    }
    expect(asked).toEqual([...STRIP_NAMES, ...STRIP_NAMES]);
    expect(installs).toBe(0);
  });
});
