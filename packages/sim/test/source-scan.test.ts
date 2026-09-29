import { describe, expect, it } from "bun:test";
import { stripNonCode } from "./source-scan.js";

/**
 * The stripper three guards share, tested on its own: a guard that reads text
 * as code fails a lane over a word in a hint, and one that reads code as text
 * lets a ban through. Both happened (`source-scan.ts`).
 */

/** A source with `@{` for each hole's opening, which a plain string in this
 * file may not spell (Biome's `noTemplateCurlyInString`). */
const src = (text: string): string => text.replaceAll("@{", "$" + "{");

describe("stripNonCode", () => {
  it("strips a template's text and keeps its holes", () => {
    const code = stripNonCode(src("const s = `Math.random @{seed.next()} done`;"));
    expect(code).not.toContain("Math.random");
    expect(code).not.toContain("done");
    expect(code).toContain("seed.next()");
  });

  it("keeps a hole's braces and a template nested in it", () => {
    const code = stripNonCode(src("`a @{f({ x: 1 })} b @{ok ? `Date.now` : later} c`; tail();"));
    expect(code).toContain("f({ x: 1 })");
    expect(code).toContain("ok ?");
    expect(code).toContain(": later");
    expect(code).toContain("tail();");
    expect(code).not.toContain("Date.now");
  });

  it("reads an escaped backtick as text", () => {
    expect(stripNonCode("`a \\` Math.random` + b;")).not.toContain("Math.random");
  });

  it("does not open a string at a quote inside a template", () => {
    const code = stripNonCode(src("`it's @{x}`; Math.random(); 'y';"));
    expect(code).toContain("Math.random()");
  });

  it("does not open a template at a backtick inside a string", () => {
    const code = stripNonCode('"a `" + Math.random() + "`";');
    expect(code).toContain("Math.random()");
  });

  it("strips a string with the letter n and a comment's slashes in it", () => {
    expect(stripNonCode('hint("the navigator: https://x");')).toBe('hint("");');
  });

  it("strips both kinds of comment, and a quote inside one opens nothing", () => {
    const code = stripNonCode("a(); // it's Math.random\nb(); /* don't */ c();");
    expect(code).not.toContain("Math.random");
    expect(code).toContain("b();");
    expect(code).toContain("c();");
  });

  it("leaves a quote with no close on its line as code", () => {
    const code = stripNonCode("x = /'/;\nMath.random();");
    expect(code).toContain("Math.random()");
  });
});
