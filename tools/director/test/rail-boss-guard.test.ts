import { describe, expect, it } from "bun:test";

/**
 * COPY AND DELETE ON A BOSS WAVE READ AS DISABLED, NOT JUST ARE DISABLED.
 *
 * `bindRail` is `document.getElementById`/`addEventListener` end to end, and
 * this repo's test runner carries no real DOM (see `demo-panel.test.ts`,
 * `panels.test.ts`) — so, as those files do, the wiring is checked against
 * the source text rather than driven.
 *
 * What is checked here is the fact a real browser exposed and a source
 * check alone would have missed: `.disabled` was already being set and
 * re-evaluated correctly (`renderFields` runs on every `onSelect`, which
 * every selection click goes through) — the earlier landing's browser
 * check was right about that much. What it did not catch is that `button`
 * sets `color` and `cursor: pointer` unconditionally and the only
 * `:disabled` rule was scoped to `.cell-actions`, so a disabled COPY/DELETE
 * rendered pixel-identical to a live, unhovered one. `.disabled` alone was
 * never going to look disabled. That is now the stylesheet's job — an
 * unscoped `button:disabled` in `src/director.css`, which covers every
 * disabled button in the director rather than the two `rail.ts` could reach —
 * so the second test below reads the stylesheet instead of this file.
 */

const source = await Bun.file(Bun.fileURLToPath(new URL("../src/rail.ts", import.meta.url))).text();
const css = await Bun.file(
  Bun.fileURLToPath(new URL("../src/director.css", import.meta.url)),
).text();

describe("the boss guard on COPY and DELETE", () => {
  it("still sets .disabled and a title, re-evaluated on every render", () => {
    expect(source).toMatch(/btn\.disabled = hasBoss;/);
    expect(source).toMatch(/btn\.title = hasBoss \? why : "";/);
    // renderFields — where the guard is applied — runs from `render()`,
    // which every selection click reaches through `onSelect`.
    expect(source).toMatch(/const render = \(\): void => \{\s*renderList\(\);\s*renderFields\(\);/);
  });

  it("leaves the look to the stylesheet rather than painting it inline", () => {
    expect(source).not.toMatch(/btn\.style\./);
  });

  it("and the stylesheet greys every disabled button, not only .cell-actions", () => {
    expect(css).toMatch(/^\s*button:disabled \{[^}]*opacity:[^}]*cursor:[^}]*\}/m);
    // Hover must not brighten a button that cannot be pressed.
    expect(css).toMatch(/button:hover:not\(:disabled\)/);
    expect(css).not.toMatch(/\.cell-actions button:disabled/);
  });

  it("both buttons go through the same guard function, so they cannot drift apart", () => {
    expect(source).toMatch(
      /setBossGuard\(waveCopyBtn, hasBoss, "A boss wave cannot be duplicated\."\);/,
    );
    expect(source).toMatch(
      /setBossGuard\(waveDelBtn, hasBoss, "A boss wave cannot be deleted\."\);/,
    );
  });

  it("bindAction still refuses a boss wave underneath, belt and braces", () => {
    expect(source).toMatch(/if \(!wave \|\| wave\.boss\) return;/g);
  });
});
