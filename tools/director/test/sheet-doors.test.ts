import { describe, expect, it } from "bun:test";
import { DOORS } from "../src/sheet-doors.js";

/**
 * The topbar's page doors against the markup and the stylesheet.
 *
 * `bindSheetDoors` skips a door whose ids it cannot find, without a word, so a
 * page renamed in `index.html` would quietly go back to a door that never
 * lights and a second page stacked over the first. And a page missing from
 * `director-sheet-doors.css` would cover the topbar again, with nothing red.
 */

const root = new URL("../", import.meta.url);
const read = (path: string): Promise<string> =>
  Bun.file(Bun.fileURLToPath(new URL(path, root))).text();
const html = await read("index.html");
const css = await read("src/director-sheet-doors.css");

describe("the topbar's page doors", () => {
  it("name a door, a page and a BACK the markup has", () => {
    for (const d of DOORS) {
      expect(html).toContain(`id="${d.door}"`);
      expect(html).toContain(`<div id="${d.sheet}">`);
      expect(html).toContain(`id="${d.back}" class="sheet-back"`);
    }
  });

  it("put BACK first in its page's header, where reading starts", () => {
    for (const d of DOORS) {
      const page = html.indexOf(`<div id="${d.sheet}">`);
      const header = html.indexOf("<header>", page);
      const first = html.slice(header + "<header>".length).trimStart();
      expect(first.startsWith(`<button type="button" id="${d.back}"`)).toBe(true);
    }
  });

  it("open every page under the topbar rather than over it", () => {
    for (const d of DOORS) expect(css).toContain(`#${d.sheet}`);
  });

  it("cover every full-screen page the markup has", () => {
    const backs = [...html.matchAll(/id="(\w+)" class="sheet-back"/g)].map((m) => m[1]);
    expect(backs.sort()).toEqual(DOORS.map((d) => d.back).sort());
  });
});
