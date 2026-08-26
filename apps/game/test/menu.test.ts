import { describe, expect, test } from "bun:test";
import { menuRequested } from "../src/menu.js";

/**
 * The menu's whole value is that it is not in the way: a tester opens the game
 * to look at one wave, many times a day, and a title screen in front of that is
 * a tap they never asked for. So the default is what is worth holding down —
 * every plain URL the game is opened with lands on the field.
 */
describe("menuRequested", () => {
  test("a plain game URL never shows it", () => {
    for (const url of [
      "http://localhost:4173/",
      "http://localhost:3000/index.html",
      "http://localhost:4174/game",
      "http://localhost:4173/?wave=3",
      "http://localhost:4173/#p1",
    ]) {
      expect(menuRequested(url)).toBe(false);
    }
  });

  test("the director's link asks for it", () => {
    expect(menuRequested("http://localhost:4174/game?menu=1")).toBe(true);
  });

  test("the flag needs no value, and the hash does as well", () => {
    expect(menuRequested("http://localhost:4173/?menu")).toBe(true);
    expect(menuRequested("http://localhost:4173/#menu")).toBe(true);
  });
});
