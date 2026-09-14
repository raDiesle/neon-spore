import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { opensWelcome, WELCOME_KEY, WELCOME_VERSION, welcomeForced } from "../src/welcome.js";

/**
 * When the welcome before a device's first tutorial opens, and how it is
 * wired — `intro.test.ts`'s shape, for the same reason: the deciding is pure
 * and the wiring is read off the source, there being no DOM here.
 */

const source = readFileSync(new URL("../src/welcome.ts", import.meta.url), "utf8");
const sheets = readFileSync(new URL("../src/canvas-sheets.ts", import.meta.url), "utf8");
const frame = readFileSync(new URL("../src/frame.ts", import.meta.url), "utf8");

describe("whether the welcome opens", () => {
  it("opens on a device that has never seen it", () => {
    expect(opensWelcome(null, true, false)).toBe(true);
  });

  it("does not open again once it has been pressed away", () => {
    expect(opensWelcome(WELCOME_VERSION, true, false)).toBe(false);
  });

  it("opens again when it is given a new version", () => {
    expect(opensWelcome("0", true, false)).toBe(true);
  });

  it("never opens where the menu itself would not", () => {
    // `?play=1` is the tester's door and the camera's (`tools/frames`); a
    // page in front of either is a tap neither asked for.
    expect(opensWelcome(null, false, false)).toBe(false);
  });

  it("opens wherever it is asked for by name, which is how it is photographed", () => {
    expect(opensWelcome(WELCOME_VERSION, false, true)).toBe(true);
    expect(welcomeForced("https://x/?play=1&welcome=1")).toBe(true);
    expect(welcomeForced("https://x/?play=1")).toBe(false);
  });

  it("is remembered under a namespaced key, like everything else here", () => {
    expect(WELCOME_KEY.startsWith("neon-spore.")).toBe(true);
    expect(WELCOME_KEY).not.toBe("neon-spore.intro");
  });
});

describe("the way it is wired", () => {
  it("writes the version down when it closes, not when it opens", () => {
    const closing = source.slice(source.indexOf("function close()"));
    expect(closing).toContain("localStorage.setItem(WELCOME_KEY, WELCOME_VERSION)");
    expect(source.slice(0, source.indexOf("function close()"))).not.toContain("setItem");
  });

  it("survives a browser that refuses to remember", () => {
    expect(source).toMatch(/localStorage\.setItem\(WELCOME_KEY, WELCOME_VERSION\);\s*\}\s*catch/);
  });

  it("opens only on the first page of a guide, and not under the menu", () => {
    // The menu's hold is "something is covering the game"; a guide may
    // already be holding under it, and a welcome nobody can see is a page
    // spent. And only the first page: a pair on page three have found NEXT.
    expect(source).toContain("b.covered()");
    expect(source).toMatch(/guidePage\(b\.world, .*\) !== 0\) return;/);
    expect(sheets).toMatch(/covered: \(\) => p\.run\.held\("menu"\)/);
  });

  it("holds the film on its first frame while it is up", () => {
    // The film's clock is `dt`, and the frame hands the renderer none while
    // the page is up — so the picture the page says waits does wait.
    expect(frame).toMatch(/dt: p\.welcome\.isOpen\(\) \? 0 : dt/);
  });

  it("is drawn under the intro, which the menu opens over anything", () => {
    expect(frame.indexOf("p.welcome.over(p.ctx, dt)")).toBeGreaterThan(0);
    expect(frame.indexOf("p.welcome.over(p.ctx, dt)")).toBeLessThan(
      frame.indexOf("p.intro.over(p.ctx, dt)"),
    );
  });

  it("paints the page where the frame under it was painted", () => {
    expect(source).toContain("b.onStage(ctx,");
  });

  it("is decided at the door by the intro's rule", () => {
    expect(sheets).toMatch(
      /opensWelcome\(readWelcomeSeen\(\), opensOnMenu\(p\.url\), welcomeForced\(p\.url\)\)/,
    );
  });
});
