import { describe, expect, it } from "bun:test";

/**
 * **The menu's text, measured against the ground it is drawn on.**
 *
 * The owner reads this page on a phone and said it was hard to read, which it
 * was: a tagline at 3.8:1 and a description at 2.2:1 are purple on purple at
 * ten pixels. What a session with no eyes can hold about "a good colour scheme"
 * is exactly this — the ratios — so the tokens are named in one block at the
 * top of `menu.css` with the job each does, and this reads them back out and
 * measures them. WCAG AA is 4.5:1 for a line of text; every ink token here
 * clears 8:1, because the page is small type on a dark ground and the standard
 * is a floor rather than a target.
 *
 * It also holds the shape that makes the measuring possible: a colour written
 * anywhere but the token block is a colour nothing checks.
 */

const css = await Bun.file(Bun.fileURLToPath(new URL("../src/menu.css", import.meta.url))).text();

/** sRGB relative luminance, as WCAG defines it. */
function luminance(hex: string): number {
  const n = hex.replace("#", "");
  const channel = (at: number): number => {
    const c = Number.parseInt(n.slice(at, at + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

/** Every `--name: #rrggbb` in the file, which is the token block and nothing
 * else — the test below is what keeps that true. */
const tokens = new Map<string, string>();
for (const [, name, hex] of css.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6});/g)) {
  if (name && hex) tokens.set(name, hex);
}

const paper = tokens.get("paper") ?? "#000000";

describe("the menu's palette", () => {
  it("names a ground to measure against", () => {
    expect(paper).toBe("#07060f");
  });

  it("carries every ink token the page uses", () => {
    for (const name of ["ink", "ink-soft", "ink-faint", "ink-key"]) {
      expect(tokens.has(name), `--${name} is gone from menu.css`).toBe(true);
    }
  });

  it("puts every text colour well past WCAG AA against the ground", () => {
    // The four inks and the three accents: everything a word is ever drawn in.
    for (const name of ["ink", "ink-soft", "ink-faint", "ink-key", "accent", "warm", "alert"]) {
      const hex = tokens.get(name);
      expect(hex, `--${name} is missing`).toBeDefined();
      const got = ratio(hex ?? "#000000", paper);
      expect(
        got,
        `--${name} (${hex}) is ${got.toFixed(1)}:1, under AA's 4.5`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("leaves the two the owner could not read behind for good", () => {
    // 3.8:1 and 2.2:1. They are named in the file's own comment, which is why
    // this looks for them as declarations rather than as strings.
    for (const dead of ["#6f639f", "#4b4177"]) {
      expect(css, `${dead} is back in a declaration`).not.toContain(`: ${dead};`);
    }
  });

  it("writes no colour outside the token block, so nothing goes unmeasured", () => {
    const body = css.slice(css.indexOf("position: fixed;"));
    const loose = [...body.matchAll(/^\s*[a-z-]+:[^;]*#[0-9a-f]{3,8}/gim)].map((m) => m[0].trim());
    expect(loose).toEqual([]);
  });
});

describe("the face", () => {
  const page = Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url)));

  it("is asked for from the one public CDN this app reaches", async () => {
    const html = await page.text();
    expect(html).toContain("https://fonts.googleapis.com/css2?family=Space+Grotesk");
    // Swapped, not blocked: the words are on the screen from the first frame
    // and the face arrives under them.
    expect(html).toContain("display=swap");
    expect(html).toContain(
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    );
  });

  it("has a real stack under it, for a phone that never gets the sheet", () => {
    const stack = /font-family:\s*\n?\s*"Space Grotesk",([^;]*);/.exec(css)?.[1] ?? "";
    expect(stack).toContain("system-ui");
    expect(stack).toContain("sans-serif");
  });
});
