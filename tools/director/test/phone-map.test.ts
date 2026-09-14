import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * MAP on a phone is one column, and the rules that make it one are in the
 * phone block.
 *
 * BRUSH and MAP share a section whose body is two tracks on a desktop — the
 * palette at a fixed 250px, the grid taking the rest (`director-brush.css`).
 * Below the breakpoint that section *is* the screen, and until 14 September
 * 2026 it kept both tracks: on a 375px viewport the map got the ~110px left
 * over, two columns of cells showed, and the cell panel, the note and the
 * row's trash sat off the right edge behind `#mapCol`'s own sideways scroll.
 *
 * Two rules undo it and both have to be inside `@media (max-width: 700px)`,
 * where a desktop never reads them — one track for the body, and a palette
 * sized by the screen instead of by a desktop column. Read out of the sheet
 * rather than out of a browser because that is what went wrong: each rule ties
 * on specificity with the one it replaces, so the whole of it rests on which
 * sheet comes last, which is `stylesheet-order.test.ts`'s subject next door.
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
  it("gives BRUSH and MAP one track, so the grid is not squeezed into what is left", async () => {
    const rule = ruleFor(await phoneBlock(), "main > section.brush-col > .column-body");
    expect(rule, "no one-track rule for the BRUSH/MAP body in the phone block").toMatch(
      /grid-template-columns:\s*1fr\s*;/,
    );
  });

  it("lets the palette be as wide as the screen rather than a desktop column", async () => {
    expect(ruleFor(await phoneBlock(), "#brushCol")).toMatch(/width:\s*auto\s*;/);
  });

  it("leaves the desktop's own two tracks and fixed palette alone", async () => {
    const brush = await Bun.file(join(SRC, "director-brush.css")).text();
    expect(ruleFor(brush, "main > section.brush-col > .column-body")).toMatch(
      /grid-template-columns:\s*max-content\s+minmax\(var\(--map-w\),\s*1fr\)\s*;/,
    );
    expect(ruleFor(brush, "#brushCol")).toMatch(/width:\s*250px\s*;/);
  });
});
