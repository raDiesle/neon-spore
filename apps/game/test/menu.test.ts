import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
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

/**
 * **What `?play` skips is the opening, and not the menu itself.**
 *
 * `bindMainMenu` stood inside the `opensOnMenu` branch until 17 September
 * 2026, so the road a tester takes had no ☰ in the corner — and on a phone
 * that chip is the whole of the way out of a field, there being no Escape key
 * and no browser chrome worth the name. The owner asked for the chip on that
 * road too. Read off the source, because nothing here can drive a document.
 */
describe("the way the shell reads it", () => {
  const shell = readFileSync(new URL("../src/shell.ts", import.meta.url), "utf8");

  test("binds the menu before it asks which road this is", () => {
    const bind = shell.indexOf("menu = bindMainMenu(menuWiring(p, {");
    const gate = shell.indexOf("if (!opensOnMenu(location.href)) return link;");
    expect(bind).toBeGreaterThan(-1);
    expect(gate).toBeGreaterThan(-1);
    expect(bind).toBeLessThan(gate);
  });

  test("puts nothing in front of the field on that road", () => {
    // The gate returns rather than branching, so the intro, the name and the
    // front page are all below it and none of them can be reached from here.
    const after = shell.slice(shell.indexOf("if (!opensOnMenu(location.href)) return link;"));
    for (const step of ["p.intro.open(onward)", "openHello(", "menu?.open()"]) {
      expect(after, `${step} stands after the gate`).toContain(step);
    }
  });
});
