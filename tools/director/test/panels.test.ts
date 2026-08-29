import { describe, expect, it, test } from "bun:test";
import { decideOpen, forcedClosedFromUrl, storageKey } from "../src/panels.js";

/**
 * EVERY PANEL IN THE DIRECTOR MINIMIZES, AND CLAUDE CAN DO IT TOO.
 *
 * `panels.ts` is `document.createElement`/`insertBefore`/`querySelectorAll`
 * end to end, and this repo's test runner carries no real DOM (see
 * `demo-panel.test.ts`, `transport.test.ts`) — so, the same shape
 * `session.ts` uses for `parsePlace`/`placeToSearch`, the deciding logic is
 * pulled out as pure functions and tested directly: `forcedClosedFromUrl`
 * (parsing `?closed=`) and `decideOpen` (the priority between a URL override
 * and the human's own stored choice). The DOM grouping itself — wrapping a
 * heading and the siblings that follow it into one `<details>` — is left to
 * the browser, per `worktree-preview`/manual verification.
 *
 * The second half — that the field and the transport row are never marked,
 * so they can never collapse, and that the panels the brief calls out are
 * marked — is checked against the real markup below, the same source-text
 * shape `sheet.test.ts` and `demo-panel.test.ts` use for wiring a regex
 * cannot exercise as behaviour.
 */

describe("forcedClosedFromUrl", () => {
  it("is null when the page carries no ?closed at all", () => {
    expect(forcedClosedFromUrl("")).toBeNull();
    expect(forcedClosedFromUrl("?wave=3")).toBeNull();
  });

  it("is the literal 'all' for ?closed=all", () => {
    expect(forcedClosedFromUrl("?closed=all")).toBe("all");
  });

  it("splits a comma list into a set of ids", () => {
    const forced = forcedClosedFromUrl("?closed=brush,pair");
    expect(forced).not.toBeNull();
    expect(forced).not.toBe("all");
    expect([...(forced as ReadonlySet<string>)]).toEqual(["brush", "pair"]);
  });

  it("trims whitespace and drops empty entries", () => {
    const forced = forcedClosedFromUrl("?closed=%20brush%20,,pair");
    expect([...(forced as ReadonlySet<string>)]).toEqual(["brush", "pair"]);
  });

  it("an empty value is an empty set, not 'all' and not null — nothing forced closed", () => {
    const forced = forcedClosedFromUrl("?closed=");
    expect(forced).not.toBeNull();
    expect(forced).not.toBe("all");
    expect([...(forced as ReadonlySet<string>)]).toEqual([]);
  });
});

describe("decideOpen — the URL always wins, storage otherwise, open by default", () => {
  test("no forced, no stored: open — a panel nobody has touched starts visible", () => {
    expect(decideOpen("brush", null, null)).toBe(true);
  });

  test("no forced: the human's own stored choice wins either way", () => {
    expect(decideOpen("brush", null, true)).toBe(true);
    expect(decideOpen("brush", null, false)).toBe(false);
  });

  test("forced 'all' closes every panel regardless of what was stored open", () => {
    expect(decideOpen("brush", "all", true)).toBe(false);
    expect(decideOpen("brush", "all", null)).toBe(false);
  });

  test("forced set closes only the named ids", () => {
    const forced = new Set(["brush", "pair"]);
    expect(decideOpen("brush", forced, true)).toBe(false);
    expect(decideOpen("pair", forced, null)).toBe(false);
  });

  test("forced set leaves an unnamed panel to its stored choice", () => {
    const forced = new Set(["brush"]);
    expect(decideOpen("map", forced, true)).toBe(true);
    expect(decideOpen("map", forced, false)).toBe(false);
    expect(decideOpen("map", forced, null)).toBe(true);
  });
});

describe("storageKey", () => {
  it("is stable and namespaced, so two panels never collide", () => {
    expect(storageKey("brush")).toBe("director-panel:brush");
    expect(storageKey("pair")).not.toBe(storageKey("preset"));
  });
});

const html = await Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url))).text();

describe("which headings are marked data-panel, in the real markup", () => {
  it("marks the seven editing headings the brief names", () => {
    for (const id of [
      "waves",
      "briefing",
      "ship-adds",
      "pair",
      "preset",
      "tuning",
      "brush",
      "map",
    ]) {
      expect(html).toContain(`data-panel="${id}"`);
    }
  });

  it("never marks anything inside the stage column — the field and the transport row stay put", () => {
    const stageColMatch = html.match(/<section class="stage-col">[\s\S]*?<\/section>/);
    expect(stageColMatch).not.toBeNull();
    expect(stageColMatch?.[0]).not.toContain("data-panel");
  });

  it("panels.ts is wired into main.ts before anything else touches the page", async () => {
    // Doesn't have to be literally the first call — only that it runs, so a
    // panel added later still gets the handle by virtue of the data-panel
    // attribute alone, with no per-panel line in main.ts.
    const src = await Bun.file(
      Bun.fileURLToPath(new URL("../src/main.ts", import.meta.url)),
    ).text();
    expect(src).toMatch(/import \{ initPanels \} from "\.\/panels\.js";/);
    expect(src).toMatch(/^initPanels\(\);/m);
  });
});
