import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * GAME on a phone is the field, and the strip is under it.
 *
 * The owner, 18 September 2026: *"when I am in game mode, the screen is fully
 * focused and nothing else left right top bottom is disturbing to play. Only
 * menu button allows me to select another wave."* GAME is two sections — RUN
 * and the stage — and RUN is the earlier of the two in `index.html`, so the
 * view opened on ten full-width rows of transport with the picture a scroll
 * below them.
 *
 * Three declarations undo it and all three have to be inside
 * `@media (max-width: 700px)`, where a desktop never reads them: `main` as a
 * flex column for this view, the stage ordered first and given the whole of
 * it, and the scroll that leaves the strip reachable under the fold. Read out
 * of the sheet rather than out of a browser for `phone-map.test.ts`' reason —
 * each rule ties on specificity with the one it replaces, so the whole of it
 * rests on which sheet comes last (`stylesheet-order.test.ts`).
 *
 * **What this cannot see is whether it looks right**, and that is the half
 * the queue entry asked a browser for. `bun run shot --serve --size 375x812
 * --path "?view=game"` answered two of its three on 19 September 2026: the
 * document does not scroll — `body` photographs at exactly the viewport, and
 * the scroll that reaches the strip is `main`'s own — and there is no header
 * row this view could give back, because the canvas is width-limited here.
 * `#stage` is `min(100cqh, 100cqw / 0.56)`, which at 375 wide is 669px
 * whatever height `main` has, so the band under the field is that aspect's
 * reserve and a shorter header would only make it taller. The third stays
 * unverified: a real browser's own chrome eating the foot of the field is not
 * something headless has.
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

const STAGE = 'main[data-view="game"] > section.stage-col[data-view="game"]';

describe("the director's GAME view on a phone", () => {
  it("orders the two sections rather than taking the grid's document order", async () => {
    const rule = ruleFor(await phoneBlock(), 'main[data-view="game"]');
    expect(rule, "the GAME view is not a flex column, so order says nothing").toMatch(
      /display:\s*flex\s*;/,
    );
    expect(rule).toMatch(/flex-direction:\s*column\s*;/);
  });

  it("puts the field first and gives it the whole of the view", async () => {
    const rule = ruleFor(await phoneBlock(), STAGE);
    expect(rule, "the field is not ordered before the strip").toMatch(/order:\s*-1\s*;/);
    // `main` is the body grid's `1fr` row, so 100% here is a definite height.
    expect(rule, "the field is not given the whole of the view").toMatch(
      /flex:\s*0\s+0\s+100%\s*;/,
    );
  });

  it("leaves the strip reachable under the fold rather than hiding it", async () => {
    // A phone showing the field without the transport is a field nobody can
    // start (15 September 2026); this moves the strip, it does not drop it.
    const block = await phoneBlock();
    expect(ruleFor(block, 'main[data-view="game"]')).toMatch(/overflow-y:\s*auto\s*;/);
    expect(ruleFor(block, 'main[data-view="game"] > section[data-view="game"]')).toMatch(
      /display:\s*block\s*;/,
    );
  });

  it("puts TEST, P1 and P2 under the field, where a solo test can reach them", async () => {
    // The owner, 18 September 2026: *"when I am in solo test mode, I can also
    // test for both players on mobile device."* RUN is under the fold, so the
    // three role buttons are copied into the stage's own section.
    const html = await Bun.file(join(SRC, "..", "index.html")).text();
    const stage = html.slice(html.indexOf('<section class="stage-col"'));
    const section = stage.slice(0, stage.indexOf("</section>"));
    for (const role of ["test", "p1", "p2"]) {
      expect(section, `the stage has no ${role} button`).toMatch(
        new RegExp(`<button type="button" data-role="${role}" class="role[ "]`),
      );
    }
    expect(ruleFor(await phoneBlock(), 'main[data-view="game"] .role-strip')).toMatch(
      /display:\s*flex\s*;/,
    );
    // And a desktop, whose RUN is in view beside the field, never sees them.
    const field = await Bun.file(join(SRC, "director-field.css")).text();
    expect(ruleFor(field, ".role-strip")).toMatch(/display:\s*none\s*;/);
  });

  it("takes the panel off all four edges of the picture", async () => {
    const rule = ruleFor(await phoneBlock(), STAGE);
    expect(rule, "ten pixels of panel are still down each edge").toMatch(/padding:\s*0\s*;/);
    expect(rule, "the column border is still beside a column that is not there").toMatch(
      /border-right:\s*0\s*;/,
    );
  });

  it("leaves the desktop's own padded, bordered columns alone", async () => {
    const columns = await Bun.file(join(SRC, "director-columns.css")).text();
    expect(ruleFor(columns, "main > section")).toMatch(/padding:\s*10px\s*;/);
    expect(ruleFor(columns, "main")).toMatch(/display:\s*grid\s*;/);
  });
});
