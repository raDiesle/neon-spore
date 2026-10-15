import { describe, expect, it } from "bun:test";
import { readShotFlags } from "../shot-flags.js";
import { headingName, inRow, rowMiss, rowNamed } from "../shot-row.js";

/**
 * `--row`, the half that needs no browser: the flag read, the selector put
 * inside the row it marks, and what is said when no row has the name. The
 * scroll that draws the row's picture is the browser's, and was proved on
 * CONTROLS › HELPERS › DEFLECTED, the row that could not be reached.
 */

describe("--row", () => {
  it("is read off the command line, and absent when not said", () => {
    expect(readShotFlags(["canvas", "out.png", "--row", "DEFLECTED"]).row).toBe("DEFLECTED");
    expect(readShotFlags(["canvas", "out.png"]).row).toBeUndefined();
  });

  it("leaves the element positional, so the selector is the one inside the row", () => {
    const flags = readShotFlags(["canvas", "out.png", "--row", "THE HASP'S LATCH AND WHEEL"]);
    expect(flags.selector).toBe("canvas");
    expect(flags.out).toBe("out.png");
  });

  it("looks for the selector only inside the marked row", () => {
    expect(inRow("canvas")).toBe("[data-shot-row] canvas");
  });

  it("names the rows that share a word when none has the name", () => {
    const labels = ["DEFLECTED", "THE SHIELD GOING OUT", "EMBER", "THE SHIELD'S FACE"];
    expect(rowMiss("DEFLECT", labels)).toContain("Nearest: DEFLECTED");
    expect(rowMiss("THE SHIELD", labels)).toContain("THE SHIELD GOING OUT · THE SHIELD'S FACE");
  });

  it("finds a labelled heading by its label before any heading's words", () => {
    const headings = [
      { text: "P2'S SCREEN THE BLISTER'S COMBO" },
      { label: "THE BLISTER'S COMBO", text: "BOTH THE BLISTER'S COMBO" },
    ];
    expect(rowNamed(headings, "THE BLISTER'S COMBO")).toBe(1);
  });

  it("finds an unlabelled heading by the words it ends with: an ON THE FIELD card's rows line", () => {
    const headings = [
      { label: "PRESS, THEN PULL", text: "PRESS, THEN PULL 2 USES" },
      { text: "THE BLISTER" },
      { text: "THE BLISTER'S COMBO" },
    ];
    expect(rowNamed(headings, "THE BLISTER'S COMBO")).toBe(2);
    expect(rowNamed(headings, "THE BLISTER'S TURN")).toBe(-1);
    expect(headings.map(headingName)).toEqual([
      "PRESS, THEN PULL",
      "THE BLISTER",
      "THE BLISTER'S COMBO",
    ]);
  });

  it("says only that no row has the name when nothing is near it", () => {
    expect(rowMiss("NOTHING LIKE IT", ["EMBER"])).toBe(
      'no row is named "NOTHING LIKE IT" — is the tab right?',
    );
  });
});
