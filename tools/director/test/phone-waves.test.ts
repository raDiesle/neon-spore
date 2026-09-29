import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PHONE_VIEWS } from "../src/phone-view.js";

/**
 * On a phone the wave list and the open wave's settings are two views, not
 * one — the owner, 29 September 2026: *"I want to not see wave details at the
 * same time I see the wave list, so there is more space available."* Read out
 * of the markup and the sheet, because a section is shown by the pair of its
 * own `data-view` and a rule in the phone block, and either half alone is a
 * view that opens on nothing.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

async function html(): Promise<string> {
  return Bun.file(join(ROOT, "index.html")).text();
}

describe("WAVES and WAVE on a phone", () => {
  it("puts the list and the settings in different views", async () => {
    const page = await html();
    expect(page).toMatch(/<section data-view="waves" data-column="waves"/);
    expect(page).toMatch(/<section id="waveEditor" data-view="wave" /);
  });

  it("opens on the list", async () => {
    expect(await html()).toMatch(/<main data-view="waves">/);
  });

  it("gives every view a menu button and a rule that shows it", async () => {
    const page = await html();
    const css = await Bun.file(join(ROOT, "src", "director-phone.css")).text();
    for (const v of PHONE_VIEWS) {
      expect(page, `no menu button for ${v}`).toContain(`class="menu-item" data-view="${v}"`);
      expect(css, `nothing shows the ${v} view`).toContain(`main[data-view="${v}"] > section`);
    }
  });
});
