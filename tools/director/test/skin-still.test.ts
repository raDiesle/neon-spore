import { describe, expect, it } from "bun:test";
import { CATALOGUE } from "@neon-spore/shape-sheet";
import { skinStill, UNDRAWABLE } from "../src/skin-still.js";
import { SKINS } from "../src/skins/index.js";

/**
 * The still renderer, which is the only thing in the tree that draws a skin
 * without a browser.
 *
 * What is worth testing here is not whether a picture is good — no test can
 * say that, which is the whole reason the tool writes an SVG for a person to
 * look at. It is that every skin *survives* the shim. A skin reaching for a
 * DOM method the shim does not have fails at the moment it is drawn, and the
 * failure is a stack trace in a terminal rather than a missing cell in a sheet
 * somebody then reads as the skin being broken.
 *
 * `chamber.ts` is the reason this file exists. It landed never having been
 * drawn, and the first still of it showed three defects at once: blisters
 * sitting outside the body, compartments flooding it, and levels that spanned
 * the whole body because the per-compartment clip had been lost between the
 * scratch drawing and the skin. All three were invisible to `bun run check`.
 */

const POMMEL = CATALOGUE.find((e) => e.subject.name === "THE POMMEL");
const DRAWABLE = SKINS.filter((s) => !UNDRAWABLE[s.id]);

describe("a skin drawn as a still", () => {
  it("has a body to draw on", () => {
    expect(POMMEL).toBeDefined();
  });

  it("draws every skin the shim supports", () => {
    for (const skin of DRAWABLE) {
      const svg = skinStill(POMMEL as NonNullable<typeof POMMEL>, { skin: skin.id });
      expect(svg, skin.id).toStartWith("<svg");
      expect(svg, skin.id).toContain("</svg>");
    }
  });

  /**
   * A NaN in a coordinate is the failure this class of code actually has, and
   * SVG swallows it silently: the attribute is written, the element renders
   * nothing, and the sheet comes back with a body missing a feature nobody can
   * name. `packages/render/test/frame.test.ts` makes the same argument about
   * the canvas, for the same reason.
   */
  it("writes no NaN and no undefined into any attribute", () => {
    for (const skin of DRAWABLE) {
      const svg = skinStill(POMMEL as NonNullable<typeof POMMEL>, { skin: skin.id });
      expect(svg, skin.id).not.toContain("NaN");
      expect(svg, skin.id).not.toContain("undefined");
    }
  });

  it("puts the contour on every path the skin registered", () => {
    const svg = skinStill(POMMEL as NonNullable<typeof POMMEL>, { skin: "chamber" });
    // Every `contourPath` gets the same `d`, so a skin never lags its own rim.
    const withD = svg.match(/ d="M /g) ?? [];
    expect(withD.length).toBeGreaterThan(1);
  });

  it("refuses the skins it cannot honestly draw, by name", () => {
    for (const [id, why] of Object.entries(UNDRAWABLE)) {
      expect(() =>
        skinStill(POMMEL as NonNullable<typeof POMMEL>, {
          skin: id as (typeof SKINS)[number]["id"],
        }),
      ).toThrow(why);
    }
  });

  /**
   * The shim installs a global `document`. If it did not take it away again,
   * the next test in the same process would run against a document with no
   * layout and no styles and fail somewhere unrelated — which is exactly the
   * kind of failure nobody traces back to here.
   *
   * Checked on a *throwing* skin rather than a passing one, because the
   * passing path is the easy half: `withDocument` restores in a `finally`, and
   * a `finally` is only worth writing a test for if something actually throws
   * inside it. An unknown id would not do — `buildSkin` falls back to LINE and
   * draws happily — so the skin here fails inside `build`.
   */
  it("leaves no document behind when a skin throws mid-build", () => {
    const had = "document" in globalThis;
    const exploding = {
      ...(POMMEL as NonNullable<typeof POMMEL>),
      subject: {
        ...(POMMEL as NonNullable<typeof POMMEL>).subject,
        name: "BOOM",
        // `path`, not `pointsAt`: the bounds are measured from the points
        // before the document is installed, so a subject that failed there
        // would never reach the `finally` this test is about. `contourAt`
        // calls `path` from inside it.
        path(): never {
          throw new Error("boom");
        },
      },
    };
    expect(() => skinStill(exploding, { skin: "chamber" })).toThrow("boom");
    expect("document" in globalThis).toBe(had);
  });

  it("is the same picture twice for the same moment", () => {
    const a = skinStill(POMMEL as NonNullable<typeof POMMEL>, { skin: "chamber", t: 1.4 });
    const b = skinStill(POMMEL as NonNullable<typeof POMMEL>, { skin: "chamber", t: 1.4 });
    expect(a).toBe(b);
  });
});
