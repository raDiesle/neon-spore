import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * MAP on a phone is one track, and the rules that make it one are in the
 * phone block.
 *
 * On a desk MAP and BRUSH are two columns either side of the field (17 October
 * 2026). Below the breakpoint the MAP view is the whole screen and both show,
 * the palette above the grid, as it has been since 14 September 2026 — when a
 * palette kept at its desktop 250px left a 375px map about 110px, two columns
 * of cells.
 *
 * The rules have to be inside `@media (max-width: 700px)`, where a desktop
 * never reads them. Read out of the sheet rather than out of a browser because
 * each ties on specificity with the one it replaces, so the whole of it rests on
 * which sheet comes last, which is `stylesheet-order.test.ts`'s subject next door.
 */

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

/** The body of the phone sheet's one media block. */
async function phoneBlock(): Promise<string> {
  const text = await Bun.file(join(SRC, "director-phone.css")).text();
  const at = text.indexOf("@media (max-width: 700px) {");
  expect(at, "director-phone.css has no max-width: 700px block").toBeGreaterThan(-1);
  return text.slice(at);
}

/** The declarations of the first rule under this selector, comments stripped. */
function ruleFor(css: string, selector: string): string {
  const at = css.indexOf(`${selector} {`);
  if (at === -1) return "";
  return css.slice(at + selector.length + 2, css.indexOf("}", at)).replace(/\/\*.*?\*\//gs, "");
}

describe("the director's MAP view on a phone", () => {
  it("shows both of the view's sections, the palette first", async () => {
    const phone = await phoneBlock();
    expect(ruleFor(phone, 'main[data-view="map"] > section[data-view="map"]')).toMatch(
      /display:\s*block\s*;/,
    );
    expect(ruleFor(phone, "main > section.brush-col")).toMatch(/order:\s*-1\s*;/);
  });

  it("lets the palette be as wide as the screen rather than a desktop column", async () => {
    expect(ruleFor(await phoneBlock(), "#brushCol")).toMatch(/width:\s*auto\s*;/);
  });

  it("leaves the desktop's fixed palette alone", async () => {
    const brush = await Bun.file(join(SRC, "director-brush.css")).text();
    expect(ruleFor(brush, "#brushCol")).toMatch(/width:\s*250px\s*;/);
  });
});
