import { describe, expect, test } from "bun:test";
import { opensOnMenu } from "../src/menu.js";

/**
 * The front door.
 *
 * The menu used to be behind `?menu`, because a tester opens the game to look
 * at one wave a hundred times a day and a title screen in front of that is a
 * tap nobody asked for. That reasoning still holds — it is just no longer the
 * majority case, and somebody who opens the address is a player who would
 * otherwise land on a field with no seat, no room and no way to reach either.
 *
 * So the default is inverted and the escape hatch stays: `?play` is the way
 * straight to the field, and `tools/frames` drives it, which is what keeps
 * every captured frame a picture of the game rather than of a title screen.
 */
describe("opensOnMenu", () => {
  test("a plain game URL lands on it", () => {
    for (const url of [
      "http://localhost:4173/",
      "http://localhost:3000/index.html",
      "http://localhost:4174/game",
      "http://localhost:4173/?wave=3",
      "http://localhost:4173/#p1",
      "https://neon-spore.example/?room=ACDE",
    ]) {
      expect(opensOnMenu(url)).toBe(true);
    }
  });

  test("the director's link still asks for it, and gets it", () => {
    expect(opensOnMenu("http://localhost:4174/game?menu=1")).toBe(true);
  });

  test("`?play` is the way past it, and needs no value", () => {
    expect(opensOnMenu("http://localhost:4173/?play=1")).toBe(false);
    expect(opensOnMenu("http://localhost:4173/?play")).toBe(false);
    expect(opensOnMenu("http://localhost:4173/#play")).toBe(false);
    // The flag a capture appends to a URL that already carries one.
    expect(opensOnMenu("http://localhost:4173/?raster=1&play=1")).toBe(false);
  });
});
