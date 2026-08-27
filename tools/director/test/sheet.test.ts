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

    expect(tabs.length).toBeGreaterThan(5);
    // The open one carries `on` as well, so the class is matched rather than
    // spelled — `bindTabs` only ever asks whether the id is `sheet-<tab>`.
    for (const tab of tabs) {
      expect(html).toMatch(new RegExp(`class="sheetpage[^"]*" id="sheet-${tab}"`));
    }
  });

  it("gives every filled group a container to be filled into", () => {
    const ids = matches(pageSource, /\bfill\("([^"]+)"/g);

    expect(ids).toContain("backlogInterludes");
    for (const id of ids) expect(html).toContain(`id="${id}"`);
  });
});
