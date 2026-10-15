import { describe, expect, it } from "bun:test";
import { innerAt, type ShownButton } from "../shot-inner.js";

/**
 * `--inner`, the half that needs no browser: which visible button is the tab.
 * The buttons below are DOCUMENTATION's as the page shows them with the sheet
 * open — the director's menu first, WAVES among it, then the sheet's own bar —
 * which is the order that photographed WORDINGS for `--inner WAVES`.
 */

const menu = (label: string): ShownButton => ({ label, bar: null });
const tab = (label: string): ShownButton => ({ label, bar: "statesTabs" });

const DOCUMENTATION: ShownButton[] = [
  menu("WAVES"),
  menu("MAP"),
  menu("← BACK"),
  ...["WORDINGS", "STATES", "CONTROLS", "STYLE", "WAVES"].map(tab),
];

describe("--inner", () => {
  it("presses DOCUMENTATION's WAVES room, not the menu item that reads the same", () => {
    expect(innerAt(DOCUMENTATION, "WAVES")).toBe(7);
  });

  it("takes the label in any case", () => {
    expect(innerAt(DOCUMENTATION, "controls")).toBe(5);
  });

  it("refuses a label no tab bar on screen has, naming the ones it does", () => {
    expect(() => innerAt(DOCUMENTATION, "MAP")).toThrow(
      "--inner MAP: no tab of #statesTabs reads it — it has WORDINGS · STATES · CONTROLS · STYLE · WAVES",
    );
  });

  it("reads any visible button by its words on a page with no bar showing", () => {
    expect(innerAt([menu("MAP"), menu("WAVES")], "WAVES")).toBe(1);
    expect(() => innerAt([menu("MAP")], "WAVES")).toThrow("no visible button reads WAVES");
  });
});
