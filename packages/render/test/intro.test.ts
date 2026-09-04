import { beforeAll, describe, expect, it } from "bun:test";
import { INTRO_PAGES } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { drawGuideNav, navButtons } from "../src/guide-nav.js";
import { drawIntroPage, introHit, skipBox } from "../src/intro-page.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The six pages a pair meets before they have chosen anything, through the
 * canvas that refuses what a real one refuses.
 *
 * It is the same rule `briefing.test.ts` holds a wave's opening to, and for a
 * stronger reason: this is the *first* screen, so a colour the browser cannot
 * parse here is a game that never starts for somebody who has just been sent
 * a link. Every page, every role, at several ages — the figures breathe, so a
 * single frame would prove almost nothing.
 */

const CFG = DEFAULT_CONFIG;
const ROLES: ViewRole[] = ["p1", "p2", "test"];
/** Zero, mid-entrance, and long settled: the three shapes a page's clock takes. */
const AGES = [0, 0.3, 1.4, 9];

beforeAll(installCanvasGlobals);

function layoutAt(width: number, height: number, role: ViewRole = "p1") {
  return computeLayout({ width, height, dpr: 2 }, CFG, role);
}

describe("the intro on the stage", () => {
  it("draws every page in every role", () => {
    const { ctx } = stubCanvas();
    for (const role of ROLES) {
      const l = layoutAt(900, 1600, role);
      for (let page = 0; page < INTRO_PAGES.length; page++) {
        for (const age of AGES) {
          drawIntroPage(ctx as unknown as CanvasRenderingContext2D, l, page, age);
        }
      }
    }
  });

  it("draws on a screen narrow enough that a word does not fit", () => {
    const { ctx } = stubCanvas();
    const l = layoutAt(240, 480);
    for (let page = 0; page < INTRO_PAGES.length; page++) {
      drawIntroPage(ctx as unknown as CanvasRenderingContext2D, l, page, 1);
    }
  });

  it("draws on a window with no room in it at all", () => {
    // Two ways the box for the picture goes negative. A window too short: the
    // title and the nav bar alone fill it — a desktop browser at the
    // director's `/game` door, a phone caught mid-rotation. And a canvas that
    // has not been laid out, which is 0 by 0 and still gets frames while its
    // tab is hidden. `plate` turned either into a negative corner radius,
    // `arcTo` threw `IndexSizeError`, and the first screen of the game died
    // before it drew anything.
    const { ctx } = stubCanvas();
    for (const [width, height] of [
      [900, 0],
      [900, 60],
      [900, 200],
      [900, 229],
      [0, 0],
      [20, 1600],
    ] as const) {
      const l = layoutAt(width, height);
      for (let page = 0; page < INTRO_PAGES.length; page++) {
        drawIntroPage(ctx as unknown as CanvasRenderingContext2D, l, page, 1);
      }
    }
  });

  it("draws with a pointer resting on each of its own controls", () => {
    // A desk lights what a mouse is over, and the lit path is a second set of
    // colours that a phone never reaches (`guide-nav.ts`).
    const { ctx } = stubCanvas();
    const l = layoutAt(900, 1600);
    const b = navButtons(l);
    const s = skipBox(l);
    const spots = [
      { x: b.next.x + b.next.w / 2, y: b.next.y + b.next.h / 2 },
      { x: b.back.x + b.back.w / 2, y: b.back.y + b.back.h / 2 },
      { x: s.x + s.w / 2, y: s.y + s.h / 2 },
    ];
    for (const pointer of spots) {
      drawIntroPage(ctx as unknown as CanvasRenderingContext2D, l, 2, 1, pointer);
    }
  });

  it("survives a page number past either end rather than drawing nothing", () => {
    // The host owns the page and a host is a place a mistake can happen; a
    // blank screen with a live bar under it is the worst way to find out.
    const { ctx } = stubCanvas();
    const l = layoutAt(900, 1600);
    const before = ctx.calls;
    drawIntroPage(ctx as unknown as CanvasRenderingContext2D, l, -3, 1);
    drawIntroPage(ctx as unknown as CanvasRenderingContext2D, l, INTRO_PAGES.length + 3, 1);
    expect(ctx.calls).toBeGreaterThan(before);
  });
});

describe("where a press on the intro lands", () => {
  const l = layoutAt(900, 1600);

  it("answers NEXT and BACK where the bar draws them", () => {
    const b = navButtons(l);
    expect(introHit(l, b.next.x + b.next.w / 2, b.next.y + b.next.h / 2)).toBe("next");
    expect(introHit(l, b.back.x + b.back.w / 2, b.back.y + b.back.h / 2)).toBe("back");
  });

  it("answers the corner word where it is drawn", () => {
    const s = skipBox(l);
    expect(introHit(l, s.x + s.w / 2, s.y + s.h / 2)).toBe("skip");
  });

  it("treats the page itself as a tap forward, and the bar's gaps as nothing", () => {
    expect(introHit(l, l.width / 2, l.height * 0.5)).toBe("page");
    // Between two buttons on the bar: a thumb that missed NEXT was aiming at
    // it, and turning the page anyway is the one answer it must not get.
    const b = navButtons(l);
    const between = (b.back.x + b.back.w + b.replay.x) / 2;
    expect(introHit(l, between, b.back.y + b.back.h / 2)).toBeNull();
  });

  it("is answered by the same bar the guide draws, not a second copy of one", () => {
    // If these ever disagree the intro answers a button it did not draw, which
    // is the fault `render/stage-point.ts` exists to stop one floor down.
    const { ctx } = stubCanvas();
    drawGuideNav(ctx as unknown as CanvasRenderingContext2D, l, {
      page: 1,
      pages: INTRO_PAGES.length,
      age: 1,
    });
    const b = navButtons(l);
    expect(introHit(l, b.next.x + 1, b.next.y + 1)).toBe("next");
  });
});
