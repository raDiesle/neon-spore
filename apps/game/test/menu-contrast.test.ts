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

/**
 * The face is the bundle's, and this is what it used to be.
 *
 * Until 14 September 2026 `index.html` carried two preconnects and a
 * stylesheet link to Google Fonts, and this described that: the CDN the app
 * reaches, the `display=swap` on the query string. What it cost was a first
 * frame that depended on a host the owner does not own, and — under
 * `tools/frames` — a picture of this checkout that was a picture of this
 * checkout plus a network. Now the woff2 is in `src/fonts/` and the bundler
 * inlines it (`tools/frames/offline.ts` has the numbers).
 *
 * So the assertions turn over: the head must name no third party at all, and
 * the swap moves from a query string to the face's own `font-display`.
 */
describe("the face", () => {
  const page = Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url)));

  it("asks no third party for anything", async () => {
    const html = await page.text();
    // In a comment saying what it used to be, but never in a tag.
    expect(html).not.toMatch(/<link[^>]*fonts\.(googleapis|gstatic)\.com/);
  });

  it("is declared here, out of the bundle, and still swapped in", () => {
    const face = css.slice(css.indexOf("@font-face"), css.indexOf("}", css.indexOf("@font-face")));
    expect(face, "no @font-face for the menu's own face").toContain('font-family: "Space Grotesk"');
    // Swapped, not blocked: the words are on the screen from the first frame
    // and the face arrives under them.
    expect(face).toContain("font-display: swap");
    // Relative, so the bundler follows and hashes it — an absolute URL would be
    // a second host again, and a rooted one breaks a build served off a path.
    expect(face).toMatch(/src:\s*url\("\.\/fonts\/[^"]+\.woff2"\)/);
  });

  it("carries the one file three weights need, because the face is variable", () => {
    const face = css.slice(css.indexOf("@font-face"), css.indexOf("}", css.indexOf("@font-face")));
    expect(face).toContain("font-weight: 400 700");
    const url = /url\("\.\/(fonts\/[^"]+)"\)/.exec(face)?.[1] as string;
    expect(
      Bun.file(Bun.fileURLToPath(new URL(`../src/${url}`, import.meta.url))).size,
    ).toBeGreaterThan(1000);
  });

  it("has a real stack under it, for a phone that loses the file", () => {
    const stack = /font-family:\s*\n?\s*"Space Grotesk",([^;]*);/.exec(css)?.[1] ?? "";
    expect(stack).toContain("system-ui");
    expect(stack).toContain("sans-serif");
  });
});
