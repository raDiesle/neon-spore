import { describe, expect, it } from "bun:test";
import type { SceneStep } from "@neon-spore/content";
import type { AnchorPoint } from "../src/caption-anchor.js";
import { CaptionHold } from "../src/caption-hold.js";

/**
 * **A caption about a body outlives the body, until the page is rebuilt**
 * (`caption-hold.ts`). THE BEATBOX's last page was the case that found it: the
 * box went quiet a beat after the last tap, and the words *STOPPING IS THE
 * ANSWER* were up for 55 of the page's 269 ticks. THE BEATBOX teaches on its
 * field since 19 October 2026 (`wave-hint.ts`), and its film went with it.
 */

const body = (text: string): SceneStep => ({ tick: 0, seat: 1, text, anchor: { at: "body" } });
const RING: AnchorPoint = { x: 100, y: 200, r: 20, clear: 16 };

describe("the hold", () => {
  it("keeps the last ring of a body page once the body has gone", () => {
    const hold = new CaptionHold();
    const page = body("A");
    expect(hold.through(page, RING)).toBe(RING);
    expect(hold.through(page, null)).toBe(RING);
  });

  it("has nothing to keep on a page whose body has not come yet", () => {
    expect(new CaptionHold().through(body("A"), null)).toBeNull();
  });

  it("does not carry one page's ring onto another", () => {
    const hold = new CaptionHold();
    hold.through(body("A"), RING);
    expect(hold.through(body("B"), null)).toBeNull();
  });

  it("forgets on a reset, which is the world under the film being rebuilt", () => {
    const hold = new CaptionHold();
    const page = body("A");
    hold.through(page, RING);
    hold.reset();
    expect(hold.through(page, null)).toBeNull();
  });

  it("leaves every other anchor to answer for itself", () => {
    const hold = new CaptionHold();
    const step: SceneStep = { tick: 0, seat: 1, text: "A", anchor: { at: "pod" } };
    hold.through(step, RING);
    expect(hold.through(step, null)).toBeNull();
  });
});
