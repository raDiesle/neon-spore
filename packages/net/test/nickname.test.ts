import { describe, expect, it } from "bun:test";
import { isName, NAME_MAX, NAME_MIN, nameFromWire, normalizeName } from "../src/nickname.js";

/**
 * What a player may be called, which both ends of the wire have to agree
 * about — this device typing one, and the other device drawing it.
 */

describe("normalizeName", () => {
  it("takes the ends off", () => {
    expect(normalizeName("  David  ")).toBe("David");
  });

  it("collapses a run of inner whitespace to one space", () => {
    expect(normalizeName("Ada   B")).toBe("Ada B");
    expect(normalizeName("Ada\t\nB")).toBe("Ada B");
  });

  it("keeps what was typed, rather than upper-casing it", () => {
    // Drawn upper case by CSS: a person who writes "David" is not told the
    // game thinks their name is DAVID.
    expect(normalizeName("David")).toBe("David");
  });

  it("drops punctuation and symbols, which cannot be said out loud", () => {
    expect(normalizeName("D~a!v?i,d")).toBe("David");
    expect(normalizeName("<script>")).toBe("script");
  });

  it("keeps letters and digits from any script", () => {
    // The design vocabulary of this game is English; a player's own name is
    // not part of it.
    expect(normalizeName("Ünal")).toBe("Ünal");
    expect(normalizeName("さくら")).toBe("さくら");
    expect(normalizeName("R2D2")).toBe("R2D2");
  });

  it("turns a name made only of punctuation into nothing", () => {
    expect(normalizeName("!!!")).toBe("");
    expect(normalizeName("   ")).toBe("");
  });
});

describe("isName", () => {
  it("wants three characters at least", () => {
    expect(isName("Jo")).toBe(false);
    expect(isName("Ada")).toBe(true);
    expect(NAME_MIN).toBe(3);
  });

  it("stops at twelve, which is what a seat pill can hold", () => {
    expect(isName("A".repeat(NAME_MAX))).toBe(true);
    expect(isName("A".repeat(NAME_MAX + 1))).toBe(false);
  });

  it("refuses nothing at all", () => {
    expect(isName("")).toBe(false);
  });
});

describe("nameFromWire", () => {
  it("passes a name through", () => {
    expect(nameFromWire("David")).toBe("David");
  });

  it("clamps what arrives by the same rules this device's own name obeys", () => {
    expect(nameFromWire("  David  ")).toBe("David");
    expect(nameFromWire("D~a!v?i,d")).toBe("David");
  });

  it("answers nothing for anything that is not a name", () => {
    // "" is what every screen already has a word for.
    for (const raw of ["", "Jo", "A".repeat(99), "!!!"]) {
      expect(nameFromWire(raw)).toBe("");
    }
  });

  it("answers nothing for anything that is not a string at all", () => {
    for (const raw of [null, undefined, 7, {}, ["David"], true]) {
      expect(nameFromWire(raw)).toBe("");
    }
  });

  it("never lets markup through, because a name is drawn as text", () => {
    // Two rules catch this between them, and neither relies on the other: the
    // angle brackets are not letters, and what is left of a tag is far past
    // twelve characters. It is still drawn as text and never as markup — this
    // is the belt, and `textContent` is the braces.
    expect(nameFromWire("<img src=x onerror=1>")).toBe("");
    expect(normalizeName("<b>Ada</b>")).toBe("bAdab");
    expect(nameFromWire("<b>Ada</b>")).toBe("bAdab");
  });
});
