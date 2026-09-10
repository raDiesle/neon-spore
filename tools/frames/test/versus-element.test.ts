import { describe, expect, it } from "bun:test";
import { elementFor, PICTURE, STAGE } from "../versus-element.js";

/**
 * `--at` is a rectangle inside the *picture*, so the element it is measured
 * against has to be the window the pose cuts and not the stage around it —
 * on a tile pose the stage carries a name line and a 172 px square in a 380
 * px box, and a rectangle measured from its corner lands under the tile.
 */
describe("elementFor", () => {
  it("photographs the stage when nothing narrows the shot", () => {
    expect(elementFor({})).toBe(STAGE);
  });

  it("measures --at against the picture, not the stage", () => {
    expect(elementFor({ at: "110,110,120,120" })).toBe(PICTURE);
  });

  it("lets --element say otherwise, with or without --at", () => {
    expect(elementFor({ element: ".versus-row" })).toBe(".versus-row");
    expect(elementFor({ element: ".versus-row", at: "0,0,10,10" })).toBe(".versus-row");
  });
});
