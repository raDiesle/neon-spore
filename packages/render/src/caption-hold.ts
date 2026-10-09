import type { SceneStep } from "@neon-spore/content";
import type { AnchorPoint } from "./caption-anchor.js";

/**
 * **A caption about a body stays where the body last stood.**
 *
 * `anchorPoint`'s `{ at: "body" }` answers `null` on an empty field, and a
 * caption with no subject is not drawn. A page repeats its span until NEXT is
 * pressed, so a page whose body is knocked out early showed its words for a
 * sliver of every loop: THE BEATBOX's *STOPPING IS THE ANSWER* had them for
 * 55 of its 269 ticks, because the box goes quiet a beat after the last tap
 * and the page is about exactly that. THE BLISTER's last page had its tap
 * moved a beat later to keep its words up (9 October 2026).
 *
 * So the ring the page last found is kept, for that page only, until the world
 * under the film is rebuilt — a page replayed, a page turned, the guide gone —
 * when `GuideStage` resets it with both seats' `Effects`. A page that opens on
 * an empty field still waits for its body, as it always has: there is nothing
 * to remember yet. Every other anchor answers for itself.
 */
export class CaptionHold {
  private step: SceneStep | null = null;
  private point: AnchorPoint | null = null;

  /** `point` as this frame found it, or where this page's body last stood. */
  through(step: SceneStep, point: AnchorPoint | null): AnchorPoint | null {
    if (step.anchor.at !== "body") return point;
    if (point) {
      this.step = step;
      this.point = point;
      return point;
    }
    return this.step === step ? this.point : null;
  }

  reset(): void {
    this.step = null;
    this.point = null;
  }
}
