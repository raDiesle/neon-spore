import { describe, expect, it } from "bun:test";
import { LAUNCH_LIFE, OpeningFx } from "../../../packages/render/src/opening-fx.js";
import { BLIND_FRAMES } from "../launch.js";

/**
 * The two halves of getting the wave's arrival out of a capture: that painting
 * is the only thing that clears it, and that the capture paints for at least
 * as long as it lasts.
 *
 * The rings a crossed gate throws were in every frame this tool ever took of a
 * gated wave — one violet, one amber, over the top two thirds of the field —
 * because a capture steps the simulation and paints only at the moment each
 * picture is taken. `OpeningFx` never sees a tick at all, which is the whole
 * of why no number of them helped.
 */

describe("the wave arriving", () => {
  /** A gate crossed: the page was on the ready screen and now nothing holds
   * the field. That transition is the only thing that starts it. */
  function crossed(): OpeningFx {
    const fx = new OpeningFx();
    fx.update(1 / 60, "w1|ready");
    fx.update(1 / 60, "");
    return fx;
  }

  it("starts when the gate is crossed", () => {
    expect(crossed().launching).toBe(true);
  });

  it("is cleared by painting, and by nothing else", () => {
    const fx = crossed();
    // A capture's own loop, before this landing: paint one frame per picture
    // and step the world in between — which `OpeningFx` never hears about.
    for (let i = 0; i < 8; i++) fx.update(1 / 60, "");
    expect(fx.launching, "eight painted frames should not be enough").toBe(true);

    for (let i = 0; i < BLIND_FRAMES; i++) fx.update(1 / 60, "");
    expect(fx.launching, "what a capture paints is not enough to clear it").toBe(false);
  });

  it("is long enough on a build that cannot be asked how long it has left", () => {
    // The fallback is the animation's own life plus a margin rather than a
    // number somebody chose, so a change to `LAUNCH_LIFE` cannot leave a
    // capture of an older build painting too few frames.
    expect(BLIND_FRAMES).toBeGreaterThanOrEqual(Math.ceil(LAUNCH_LIFE * 60));
  });
});
