import { describe, expect, it } from "bun:test";
import { parsePlace } from "../../director/src/place.js";
import { POSE_GROUPS } from "../../director/src/poses.js";
import { readShotFlags } from "../shot-flags.js";
import { poseRoute, STATES_PATH } from "../shot-pose.js";
import {
  CONTROLS_ROOMS,
  controlsPath,
  headingName,
  inRow,
  rowMiss,
  rowNamed,
} from "../shot-row.js";

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

  it("takes a heading that is the name over one that only ends with it, wherever each stands", () => {
    const headings = [
      { text: "HOLD THE BLISTER" },
      { text: "THE BLISTER'S SWIPE" },
      { text: "THE BLISTER" },
    ];
    expect(rowNamed(headings, "THE BLISTER")).toBe(2);
    expect(rowNamed(headings.slice(0, 2), "THE BLISTER")).toBe(0);
  });

  it("says only that no row has the name when nothing is near it", () => {
    expect(rowMiss("NOTHING LIKE IT", ["EMBER"])).not.toContain("Nearest");
  });
});

describe("--controls", () => {
  it("opens CONTROLS' room by its button's words, on the key the director's URL reads", () => {
    const path = readShotFlags(["canvas", "out.png", "--controls", "ON THE FIELD"]).path;
    expect(path).toBe(controlsPath("field"));
    expect(parsePlace(path.slice(1))).toMatchObject({
      sheet: "states",
      inner: "controlsets",
      sub: "field",
    });
  });

  it("knows every room the bar has, and refuses one it has not", () => {
    for (const room of Object.keys(CONTROLS_ROOMS)) expect(controlsPath(room)).toContain("sub=");
    expect(() => controlsPath("CONTROLS")).toThrow("no room of CONTROLS");
  });

  it("takes no --path or --wave beside it, since the pair names two places", () => {
    expect(() =>
      readShotFlags(["canvas", "out.png", "--controls", "HELPERS", "--path", "/?play=1"]),
    ).toThrow("takes no --wave or --path");
  });

  it("is named when a row is missed, so the miss says the route", () => {
    expect(rowMiss("THE BLISTER'S COMBO", [])).toContain('--controls "ON THE FIELD"');
  });
});

describe("--pose", () => {
  it("finds THE BLISTER's TAP, which no ON THE FIELD row names, in the STATES group that draws it", () => {
    const flags = readShotFlags(["canvas", "out.png", "--pose", "BLISTER · UP FOR A TAP"]);
    expect(flags.pose).toEqual({ name: "BLISTER · UP FOR A TAP", group: "COMPARED LOOKS" });
    expect(flags.path).toBe(STATES_PATH);
    expect(parsePlace(flags.path.slice(1))).toMatchObject({ sheet: "states", inner: "states" });
  });

  it("reaches every pose on the sheet, so no other is left without a route", () => {
    for (const group of POSE_GROUPS) {
      for (const pose of group.poses) expect(poseRoute(pose.name).group).toBe(group.title);
    }
  });

  it("refuses a pose nobody has, naming the nearest", () => {
    expect(() => poseRoute("BLISTER · UP FOR A TAPS")).toThrow("Nearest: ");
    expect(() => poseRoute("NOTHING LIKE IT")).toThrow('no pose is named "NOTHING LIKE IT"');
  });

  it("names a place of its own, so --row, --path, --wave or --controls beside it throws", () => {
    for (const other of [
      ["--row", "X"],
      ["--path", "/"],
      ["--controls", "HELPERS"],
    ]) {
      expect(() =>
        readShotFlags(["canvas", "o.png", "--pose", "BLISTER · UP FOR A TAP", ...other]),
      ).toThrow("--pose opens DOCUMENTATION › STATES");
    }
  });
});
