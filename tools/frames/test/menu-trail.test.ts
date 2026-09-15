import { describe, expect, it } from "bun:test";
import { noSuchButton, noSuchField, parseTrail, parseTyping, RIG_LABEL } from "../menu-trail.js";

/**
 * The half of `bun run menu-shot` that needs no browser: which presses a
 * `--page` flag means, which fields a `--type` flag fills, and what each says
 * when it finds nothing.
 */

describe("parseTrail", () => {
  it("reads no flag as the front page, which is no presses", () => {
    expect(parseTrail(undefined)).toEqual([]);
  });

  it("reads one label as one press", () => {
    expect(parseTrail("SETTINGS")).toEqual([{ kind: "press", label: "SETTINGS" }]);
  });

  it("reads a trail in the order a thumb would say it", () => {
    expect(parseTrail("SETTINGS > CONTROLS")).toEqual([
      { kind: "press", label: "SETTINGS" },
      { kind: "press", label: "CONTROLS" },
    ]);
  });

  it("ignores the spaces and the empty steps a person types", () => {
    expect(parseTrail("  PLAY  >>  DIFFICULTY ")).toEqual([
      { kind: "press", label: "PLAY" },
      { kind: "press", label: "DIFFICULTY" },
    ]);
  });

  /** The rig has no row: three presses on the spore are the whole door. */
  it("reads TESTING as the spore, whatever case it is typed in", () => {
    expect(parseTrail(RIG_LABEL)).toEqual([{ kind: "spore" }]);
    expect(parseTrail("testing")).toEqual([{ kind: "spore" }]);
  });

  /** Refused rather than treated as the front page: a flag that says nothing
   * is a caller who meant something, and a picture of the wrong page proves
   * the wrong thing convincingly. */
  it("refuses a flag that names no page", () => {
    expect(() => parseTrail(" > ")).toThrow(/no page named/);
    expect(() => parseTrail("")).toThrow(/no page named/);
  });
});

describe("noSuchButton", () => {
  it("names what the open page does offer, because that is what the caller cannot see", () => {
    const said = noSuchButton("CONTROLS", ["WHAT THIS IS", "SOUND ON"]);
    expect(said).toContain('"CONTROLS"');
    expect(said).toContain("WHAT THIS IS");
    expect(said).toContain("SOUND ON");
  });

  it("says so when the page offers nothing at all", () => {
    expect(noSuchButton("PLAY", [])).toContain("nothing on it can be pressed");
  });
});

describe("parseTyping", () => {
  it("reads no flag as nothing typed", () => {
    expect(parseTyping([])).toEqual([]);
  });

  it("reads a selector and a value split on the first =", () => {
    expect(parseTyping(["#helloName=DAVID"])).toEqual([{ selector: "#helloName", value: "DAVID" }]);
  });

  /** The order is the order a thumb would have used: a second field is filled
   * after the first, and a screen may be reading both. */
  it("keeps repeats in the order they were given", () => {
    expect(parseTyping(["#a=one", "#b=two"])).toEqual([
      { selector: "#a", value: "one" },
      { selector: "#b", value: "two" },
    ]);
  });

  /** The value is whatever follows, `=` and all: a name with one in it is a
   * name somebody will want a picture of. */
  it("leaves every later = in the value", () => {
    expect(parseTyping(["#helloName=A=B"])).toEqual([{ selector: "#helloName", value: "A=B" }]);
  });

  /** An empty value is a field emptied on purpose — the state a screen shows
   * after a name is cleared, which is not the state it arrived in. */
  it("reads an empty value as a field to empty", () => {
    expect(parseTyping(["#helloName="])).toEqual([{ selector: "#helloName", value: "" }]);
  });

  it("refuses an argument with no = and names it", () => {
    expect(() => parseTyping(["#helloName"])).toThrow(/"#helloName"/);
    expect(() => parseTyping(["#helloName"])).toThrow(/no field named/);
  });

  /** `page.locator("")` fails in the browser half, where the message is about
   * a selector engine rather than about the flag somebody typed. */
  it("refuses an argument with nothing before the =", () => {
    expect(() => parseTyping(["=DAVID"])).toThrow(/no field before/);
    expect(() => parseTyping(["  =DAVID"])).toThrow(/no field before/);
  });
});

describe("noSuchField", () => {
  it("names the selector and where the shot was standing", () => {
    const said = noSuchField("#helloName", "the first meeting");
    expect(said).toContain('"#helloName"');
    expect(said).toContain("the first meeting");
  });
});
