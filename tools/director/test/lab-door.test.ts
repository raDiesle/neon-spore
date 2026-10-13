import { describe, expect, it } from "bun:test";
import { FIELD_ROOM, LAB_DOORS } from "../src/lab-door.js";

/**
 * A lab's topbar door opens its card on CONTROLS › ON THE FIELD
 * (`lab-door.ts`) by pressing the buttons a person would. Each is found by an
 * id or a selector the markup has to keep, and a door or a tab renamed in
 * `index.html` would leave the door pressing nothing, with nothing red.
 */

const root = new URL("../", import.meta.url);
const read = (path: string): Promise<string> =>
  Bun.file(Bun.fileURLToPath(new URL(path, root))).text();
const html = await read("index.html");
const cards = await read("src/field-action-cards.ts");

describe("a lab's door", () => {
  it("is a button the topbar has, one for each lab", () => {
    for (const { door } of LAB_DOORS) expect(html).toContain(`id="${door}"`);
    expect(new Set(LAB_DOORS.map((d) => d.kind)).size).toBe(LAB_DOORS.length);
  });

  it("presses a sheet, a room and a tab the markup has", () => {
    expect(html).toContain(`id="${FIELD_ROOM.open}"`);
    expect(html).toContain(`<div id="${FIELD_ROOM.sheet}">`);
    expect(html).toContain('<div id="statesTabs">');
    expect(html).toMatch(/id="statesTabs"[\s\S]*?data-tab="controlsets"/);
    expect(html).toMatch(/id="controlsInnerTabs"[\s\S]*?data-tab="field"/);
  });

  it("scrolls to a card that names its lab", () => {
    expect(cards).toContain("host.dataset.lab = kind;");
    for (const { kind } of LAB_DOORS) expect(cards).toContain(`["${kind}", `);
  });
});
