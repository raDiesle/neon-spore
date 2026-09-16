import { describe, expect, it } from "bun:test";

/**
 * The backlog sheet's wiring, which nothing else looks at.
 *
 * Three files have to agree for a tab to show anything: `ideas.md` names the
 * group, `backlog.ts` builds it, `backlog-page.ts` pours it into an element,
 * and `index.html` has to carry both a button and a container with the right
 * ids. Every one of those disagreements fails *silently* — a tab that switches
 * to a page that is not there leaves the sheet blank, and a `fill` into an id
 * that does not exist returns without a word (`if (!el) return`). A blank
 * panel on a page about unbuilt work reads as "nothing is queued here", which
 * is the one sentence this whole sheet exists to never say by accident.
 *
 * So the ids are derived from the sources rather than listed here. A new tab
 * that forgets its page, or a `fill` that forgets its container, is a failing
 * test rather than an empty column somebody notices four sessions later.
 */

const root = new URL("../", import.meta.url);
const html = await Bun.file(Bun.fileURLToPath(new URL("index.html", root))).text();
const pageSource = await Bun.file(Bun.fileURLToPath(new URL("src/backlog-page.ts", root))).text();

const matches = (source: string, re: RegExp): string[] =>
  [...source.matchAll(re)].map((m) => m[1] as string);

describe("the backlog sheet", () => {
  it("gives every tab a page to switch to", () => {
    const bar = html.indexOf('id="backlogTabs"');
    const tabs = matches(html.slice(bar, html.indexOf("</div>", bar)), /data-tab="([^"]+)"/g);

    // Two written in the bar since 16 September 2026, and VERSUS mounted
    // beside them by `mountLazyTabs`: BULB QUEEN VARIANTS left that morning,
    // BOSSES that afternoon, BORROWED and PARTY GAMES that evening. The floor
    // is there so an empty slice reads as a failure rather than as no tabs,
    // and it is moved down with the owner rather than held above him.
    expect(tabs.length).toBeGreaterThan(1);
    // The open one carries `on` as well, so the class is matched rather than
    // spelled — `bindTabs` only ever asks whether the id is `sheet-<tab>`.
    for (const tab of tabs) {
      expect(html).toMatch(new RegExp(`class="sheetpage[^"]*" id="sheet-${tab}"`));
    }
  });

  /**
   * The same pair of `class="on"` the documentation sheet is held to below,
   * and for the same reason: `bindTabs` only acts on a click, so a bar
   * highlighting one tab over another tab's page opens the sheet showing one
   * room under the other room's name. It was worth adding on 16 September
   * 2026, when the owner took BOSSES off and the lead passed to MECHANICS —
   * two edits in two places, and this sheet had no test holding them together.
   */
  it("starts on the same page its bar says it is on", () => {
    const bar = html.indexOf('id="backlogTabs"');
    const first = matches(html.slice(bar, html.indexOf("</div>", bar)), /data-tab="([^"]+)"/g)[0];
    expect(html).toMatch(new RegExp(`data-tab="${first}" class="on"`));
    expect(html).toMatch(new RegExp(`class="sheetpage on" id="sheet-${first}"`));
  });

  it("gives every filled group a container to be filled into", () => {
    const ids = matches(pageSource, /\bfill\("([^"]+)"/g);

    // `backlogMechanics` and not `backlogBosses`: the BOSSES page went on
    // 16 September 2026 and MECHANICS is the sheet's only filled page now.
    expect(ids).toContain("backlogMechanics");
    for (const id of ids) expect(html).toContain(`id="${id}"`);
  });
});

const docTabs = (): string[] => {
  const bar = html.indexOf('id="statesTabs"');
  return matches(html.slice(bar, html.indexOf("</div>", bar)), /data-tab="([^"]+)"/g);
};

/**
 * The same disagreement, on the other full-screen sheet. A tab whose page is
 * missing fails exactly as quietly there: `bindTabs` switches to `mech-<tab>`,
 * finds nothing, and the sheet goes blank. Derived rather than listed, for the
 * reason above.
 */
describe("the documentation sheet", () => {
  it("gives every tab a page to switch to", () => {
    const tabs = docTabs();
    // A run that found no tabs at all would otherwise pass the loop below.
    expect(tabs).toContain("wordings");
    for (const tab of tabs) {
      expect(html).toMatch(new RegExp(`class="sheetpage[^"]*" id="mech-${tab}"`));
    }
  });

  /**
   * **The tab that starts `on` and the page that starts `on` have to be the
   * same one**, which is a disagreement no runtime code would ever complain
   * about: `bindTabs` only acts on a click, so a sheet whose bar highlights
   * WORDINGS while STATES' page carries the `on` class opens showing one room
   * under the other room's name until somebody clicks something. There are two
   * `class="on"` in two places, and the day the owner asked for WORDINGS to
   * lead — 14 September 2026 — one of them was easy to forget.
   */
  it("starts on the same room its bar says it is on", () => {
    const first = docTabs()[0];
    expect(html).toMatch(new RegExp(`data-tab="${first}" class="on"`));
    expect(html).toMatch(new RegExp(`class="sheetpage on" id="mech-${first}"`));
    expect(matches(html, /class="sheetpage on" id="(mech-[^"]+)"/g)).toHaveLength(1);
  });

  /**
   * TUNING left this sheet for a topbar door of its own, because it is the one
   * page that changes the run rather than describing it. A sheet `mountSheet`
   * cannot find is a button that does nothing: it returns silently on a missing
   * element, the same way every other wiring here fails.
   */
  it("keeps nothing live under a heading that means reference", () => {
    expect(docTabs()).not.toContain("tuning");
    for (const id of ["tuning", "tuningOpen", "tuningClose"]) {
      expect(html).toContain(`id="${id}"`);
    }
    // The sliders, the presets and the ship's dials, all inside that sheet
    // rather than left behind in this one.
    const body = html.slice(html.indexOf('<div id="tuningBody">'), html.indexOf('id="soundboard"'));
    for (const id of ["sliders", "presets", "shipSheetBody"]) {
      expect(body).toContain(`id="${id}"`);
    }
  });
});
