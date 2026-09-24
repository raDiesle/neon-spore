import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * GAME on a phone is the whole screen, and nothing stands on it but the way
 * out.
 *
 * The owner, 18 September 2026: *"when I am in game mode, the screen is fully
 * focused and nothing else left right top bottom is disturbing to play. Only
 * menu button allows me to select another wave."* GAME is two sections — RUN
 * and the stage — and RUN is the earlier of the two in `index.html`, so the
 * view opened on ten full-width rows of transport with the picture a scroll
 * below them. The field took `order: -1` and the whole of `main`, and the
 * strip went one thumb-flick under the fold.
 *
 * And then, 24 September 2026: *"when opening game screen e.g. from wave list,
 * the game must fit 100 height and width so I can play it with focus and
 * without scroll."* Three things were between the picture and the whole of the
 * screen, and the flick was one of them.
 *
 *   - **The header.** 76px of NEON SPORE — DIRECTOR, SAVE and the build stamp
 *     wrapped onto two rows, which on a real phone with the browser's own bars
 *     out is what makes the field height-limited and stands it between two
 *     black side bars. It is `position: fixed` in this view, so the body grid's
 *     first row has nothing in it — and the grid is told `1fr` rather than
 *     `auto 1fr`, or `main` is auto-placed into that first row and takes its
 *     content's height instead of the viewport's.
 *   - **The aspect box.** `#stage` keeps `min(100cqh, 100cqw / 0.56)` on a desk
 *     (`director-field.css`), where a window far wider than a phone would draw
 *     a hull nobody will see. On a phone that reserved a band at the foot — 67px
 *     at 375x812 — for an aspect the screen already has, and `computeStage`
 *     (`render/layout-stage.ts`) does the identical job inside the canvas
 *     anyway. So `aspect-ratio: auto` here, and the canvas is simply the pane.
 *   - **The scroll**, which is the word the ask names. RUN cannot stay a flick
 *     below a field that fills the screen: the canvas answers every press
 *     itself (`touch-action: none`), so there is no gesture left for the flick
 *     to be made of. `mobile-menu.ts` moves the transport into the open ☰
 *     instead — the same ten controls and not a second set.
 *
 * Read out of the sheet rather than out of a browser for `phone-map.test.ts`'
 * reason — each rule ties on specificity with the one it replaces, so the whole
 * of it rests on which sheet comes last (`stylesheet-order.test.ts`).
 *
 * **What this cannot see is whether it looks right.** A browser at 375x812 on
 * 24 September 2026 answered that half: the canvas measures 375x812 exactly,
 * `main` is 812, `documentElement.scrollHeight` is 812 and `main.scrollHeight`
 * is its own client height, so neither scrolls; ☰ MENU sits at (302,4) and
 * TEST/P1/P2 at (225,44), both clear of the run clock at the top-left; the open
 * menu holds the transport in one column with no sideways overflow; and a desk
 * at 1200x800 still draws a 299x534 canvas at ratio 0.560 in four columns.
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
const GAME_BODY = 'body:has(main[data-view="game"]):not(.menu-open)';

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

  it("does not scroll, which is the word the ask names", async () => {
    const block = await phoneBlock();
    expect(
      ruleFor(block, 'main[data-view="game"]'),
      "the GAME view still scrolls, so the field is not the whole of it",
    ).toMatch(/overflow:\s*hidden\s*;/);
    // RUN is not under the fold any more; it is in the menu (below).
    expect(ruleFor(block, 'main[data-view="game"] > section[data-view="game"]')).toMatch(
      /display:\s*none\s*;/,
    );
  });

  it("gives the canvas both lengths of the pane and no aspect of its own", async () => {
    // `computeStage` letterboxes inside the canvas already — the desk's 0.56
    // box would only reserve a second band for the same aspect.
    const rule = ruleFor(await phoneBlock(), 'main[data-view="game"] #stage');
    expect(rule, "the canvas is not the full width of the pane").toMatch(/width:\s*100%\s*;/);
    expect(rule, "the canvas is not the full height of the pane").toMatch(/height:\s*100%\s*;/);
    expect(rule, "the desk's aspect box still reserves a band at the foot").toMatch(
      /aspect-ratio:\s*auto\s*;/,
    );
  });

  it("leaves nothing of the header on the field but the one way out", async () => {
    const block = await phoneBlock();
    expect(
      ruleFor(block, GAME_BODY),
      "the header's row is still in the grid, so `main` is not the viewport",
    ).toMatch(/grid-template-rows:\s*1fr\s*;/);
    expect(ruleFor(block, `${GAME_BODY} header`), "the header is still in the flow").toMatch(
      /position:\s*fixed\s*;/,
    );
    expect(ruleFor(block, `${GAME_BODY} header > :not(#menuToggle)`)).toMatch(
      /display:\s*none\s*;/,
    );
    // And the menu opened out is the same header, which this must not touch.
    expect(block, "the game-view header rules are not held off the open menu").toContain(
      ":not(.menu-open)",
    );
  });

  it("puts TEST, P1 and P2 over the field, where a solo test can reach them", async () => {
    // The owner, 18 September 2026: *"when I am in solo test mode, I can also
    // test for both players on mobile device."* RUN is behind the menu, and the
    // seat is switched over and over while the wave runs.
    const html = await Bun.file(join(SRC, "..", "index.html")).text();
    const stage = html.slice(html.indexOf('<section class="stage-col"'));
    const section = stage.slice(0, stage.indexOf("</section>"));
    for (const role of ["test", "p1", "p2"]) {
      expect(section, `the stage has no ${role} button`).toMatch(
        new RegExp(`<button type="button" data-role="${role}" class="role[ "]`),
      );
    }
    // And BRIEFINGS and ↺ WAVE beside them, the phone's own copies of RUN's
    // (the owner, 24 September 2026), bound by id with the originals.
    for (const id of ["briefToggleField", "restartField"]) {
      expect(section, `the stage has no #${id}`).toContain(`id="${id}"`);
    }
    const strip = ruleFor(await phoneBlock(), 'main[data-view="game"] .role-strip');
    expect(strip).toMatch(/display:\s*flex\s*;/);
    expect(strip, "the three do not stand over the field").toMatch(/position:\s*absolute\s*;/);
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

  it("leaves the desktop's own padded, bordered columns and aspect box alone", async () => {
    const columns = await Bun.file(join(SRC, "director-columns.css")).text();
    expect(ruleFor(columns, "main > section")).toMatch(/padding:\s*10px\s*;/);
    expect(ruleFor(columns, "main")).toMatch(/display:\s*grid\s*;/);
    const field = await Bun.file(join(SRC, "director-field.css")).text();
    expect(
      ruleFor(field, "#stage"),
      "the desk lost the aspect that keeps its hull visible",
    ).toMatch(/height:\s*min\(100cqh,\s*100cqw\s*\/\s*0\.56\)\s*;/);
  });
});

/**
 * **RUN, MOVED INTO THE MENU AND NOT COPIED INTO IT.**
 *
 * ⏸ and DIFFICULTY are bound to these elements by id (`stage-transport.ts`,
 * `pair-panel.ts`), so a second set of controls would be a second state to keep
 * right. `mobile-menu.ts` appends the one `.transport` to `<header>` while the
 * menu is open and puts it back in its own section on the way out, which is
 * what a desk — which never opens this menu — goes on seeing.
 */
describe("RUN while the phone menu is open", () => {
  it("moves the one transport rather than building a second", async () => {
    const src = await Bun.file(join(SRC, "mobile-menu.ts")).text();
    expect(src, "the transport is not moved into the header").toMatch(
      /header\.append\(transport\)/,
    );
    expect(src, "the transport never goes home, so a desk loses its column").toMatch(
      /home\.append\(transport\)/,
    );
    expect(src, "the transport is built rather than moved").not.toMatch(/cloneNode|createElement/);
  });

  it("follows `body`'s own class, so every way into the menu is covered", async () => {
    // `showPhoneView` opens a wave straight into a view from a row in the wave
    // list (`phone-view.ts`) and has no business knowing what a transport is.
    const src = await Bun.file(join(SRC, "mobile-menu.ts")).text();
    expect(src).toMatch(/new MutationObserver\([\s\S]*?menu-open[\s\S]*?\)\.observe\(/);
    expect(src).toMatch(/attributeFilter:\s*\["class"\]/);
  });

  it("stacks in one column instead of wrapping off the right edge", async () => {
    // The compact bar wraps; a *column* that wraps puts everything past the
    // fold in a second column, which is what the taller menu showed.
    const block = await phoneBlock();
    const header = ruleFor(block, "body.menu-open header");
    expect(header).toMatch(/flex-direction:\s*column\s*;/);
    expect(header, "the open menu still wraps, so a tall one runs off the edge").toMatch(
      /flex-wrap:\s*nowrap\s*;/,
    );
    expect(ruleFor(block, "body.menu-open header .transport")).toMatch(/display:\s*flex\s*;/);
  });
});
