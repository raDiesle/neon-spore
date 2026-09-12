import { describe, expect, it } from "bun:test";
import { drawsAPicture, reminder } from "../after-svg-edit.ts";
import { sessionId } from "../payload.ts";

/**
 * What the SVG reminder fires on, and what it leaves alone.
 *
 * The hook's whole value is that it is not noticed until it is needed, and its
 * whole cost is a paragraph in a context window. Both halves live in one
 * predicate, so that predicate is the thing worth pinning: a false negative is
 * a thin picture shipped, and a false positive is tokens spent telling a
 * session to go and look at the rasteriser.
 */

describe("whether an edited file draws a picture", () => {
  it("says yes to any .svg, wherever it sits", () => {
    expect(drawsAPicture("apps/game/icon.svg", "")).toBe(true);
    expect(drawsAPicture("tools/shape-sheet/shape-sheet.svg", "")).toBe(true);
  });

  it("says yes to a module that builds SVG in code", () => {
    const skin = 'document.createElementNS("http://www.w3.org/2000/svg", "path")';
    expect(drawsAPicture("tools/director/src/skins/vein.ts", skin)).toBe(true);
    expect(drawsAPicture("tools/versus/candidates/creature-throb/pores.ts", skin)).toBe(true);
  });

  it("says no to a module with no SVG in it at all", () => {
    expect(drawsAPicture("packages/sim/src/step.ts", "export const tick = 0;")).toBe(false);
  });

  /**
   * The shim, the rasteriser and the packer all carry SVG in order to check or
   * convert someone else's. Reminding a session to look at those is the noise
   * that gets a hook switched off.
   */
  it("says no to the plumbing that handles SVG without drawing any", () => {
    const svgish = 'createElementNS("http://www.w3.org/2000/svg", "svg")';
    expect(drawsAPicture("tools/director/src/svg-dom.ts", svgish)).toBe(false);
    expect(drawsAPicture("tools/frames/svg.ts", svgish)).toBe(false);
    expect(drawsAPicture("tools/raster/pack.ts", svgish)).toBe(false);
    expect(drawsAPicture("tools/hooks/after-svg-edit.ts", svgish)).toBe(false);
  });

  it("says no to a test, which stands up SVG to assert about it", () => {
    const svgish = '<svg viewBox="0 0 10 10"></svg>';
    expect(drawsAPicture("packages/render/test/frame.test.ts", svgish)).toBe(false);
    expect(drawsAPicture("tools/director/test/shapes-motion.test.ts", svgish)).toBe(false);
  });

  it("says no to a payload that named no file", () => {
    expect(drawsAPicture(null, "<svg></svg>")).toBe(false);
  });
});

describe("what the reminder says", () => {
  const text = reminder("tools/director/src/skins/vein.ts");

  it("names the file, so a session knows which edit it is about", () => {
    expect(text).toContain("tools/director/src/skins/vein.ts");
  });

  /**
   * Three things a session is otherwise told twice: run the cheap check before
   * spending an image, read the png rather than merely writing it, and stop if
   * this one is a diagram.
   */
  it("carries the cheap check, the read, and the way out", () => {
    expect(text).toContain("bun run shapes:report");
    expect(text).toContain("READ the png");
    expect(text).toContain("exempt");
  });

  it("points at the skill that holds the rest", () => {
    expect(text).toContain(".claude/skills/svg-look");
  });
});

describe("the session a reminder is remembered against", () => {
  it("is the payload's own id, with anything path-unsafe taken out", () => {
    expect(sessionId({ session_id: "abc-123" })).toBe("abc-123");
    expect(sessionId({ session_id: "../../etc/passwd" })).toBe("etcpasswd");
  });

  /**
   * One shared bucket rather than a fresh id per edit: a payload that names no
   * session should still be reminded once, not on every keystroke.
   */
  it("is one constant when the payload names none", () => {
    expect(sessionId(null)).toBe("unkeyed");
    expect(sessionId({})).toBe("unkeyed");
    expect(sessionId({ session_id: 42 })).toBe("unkeyed");
  });
});
