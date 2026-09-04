import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { navButtons, navHit } from "../src/guide-nav.js";
import { computeLayout, computeStage } from "../src/layout.js";
import { pointOnStage } from "../src/stage-point.js";

/**
 * A press lands where the control is drawn, on a canvas that is not the window.
 *
 * Both hosts used to turn a `clientX` into stage coordinates by hand. The
 * director wrote it four times and every copy was wrong; the game wrote it
 * five times and every copy was right only while the canvas covered the whole
 * window at exactly the size the renderer had been told about. Nothing said
 * that, and nothing failed when it stopped being true — which is what this
 * file is for.
 */

const CFG = DEFAULT_CONFIG;
const VIEWPORT = { width: 900, height: 1600, dpr: 2 };
const STAGE = computeStage(VIEWPORT, CFG, "p1");
const LAYOUT = computeLayout(
  { width: STAGE.width, height: STAGE.height, dpr: VIEWPORT.dpr },
  CFG,
  "p1",
);

/** Where a finger has to be on the screen to press a control drawn at `p`. */
function clientOn(
  p: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
): { clientX: number; clientY: number } {
  return {
    clientX: box.left + ((p.x + STAGE.left) * box.width) / VIEWPORT.width,
    clientY: box.top + ((p.y + STAGE.top) * box.height) / VIEWPORT.height,
  };
}

/** The middle of NEXT, in the coordinates the renderer drew it in. */
function nextButton(): { x: number; y: number } {
  const b = navButtons(LAYOUT).next;
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

describe("a pointer on a stage canvas", () => {
  it("answers the control it was drawn on when the canvas fills the window", () => {
    const box = { left: 0, top: 0, width: VIEWPORT.width, height: VIEWPORT.height };
    const p = pointOnStage(clientOn(nextButton(), box), box, VIEWPORT, STAGE);
    expect(navHit(LAYOUT, p.x, p.y)).toBe("next");
  });

  it("answers it just the same on a canvas laid out at a different size", () => {
    // Half the size the renderer was given and pushed down the page, which is
    // what a browser at 200% zoom, a stale `ResizeObserver` and a canvas with
    // anything above it all look like from inside a pointer handler.
    const box = { left: 12, top: 40, width: VIEWPORT.width / 2, height: VIEWPORT.height / 2 };
    const client = clientOn(nextButton(), box);
    const p = pointOnStage(client, box, VIEWPORT, STAGE);
    expect(navHit(LAYOUT, p.x, p.y)).toBe("next");

    // The conversion both hosts used to write out by hand, on the same press:
    // it lands somewhere else entirely, and on a wide window it lands on
    // nothing at all.
    const byHand = { x: client.clientX - STAGE.left, y: client.clientY - STAGE.top };
    expect(navHit(LAYOUT, byHand.x, byHand.y)).not.toBe("next");
  });

  it("is unmoved by a box of no size, rather than dividing by it", () => {
    // A hidden tab and a phone mid-address-bar both report one.
    const box = { left: 0, top: 0, width: 0, height: 0 };
    const p = pointOnStage({ clientX: 100, clientY: 200 }, box, VIEWPORT, STAGE);
    expect(p).toEqual({ x: 100 - STAGE.left, y: 200 - STAGE.top });
  });
});
