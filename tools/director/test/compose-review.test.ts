import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES, type Wave } from "@neon-spore/content";
import { itCosts } from "../../test/figure.js";
import { bossOrder } from "../src/boss-slots.js";
import { nextReview } from "../src/compose-review.js";
import { isReviewHead } from "../src/compose-starts.js";

/**
 * The composed review and the boss order over it: `nextReview` and two
 * `bossOrder`s over the whole list, each of which reads every block start off
 * the list before it. Free while no boss waited; since THE GEODE's landing of
 * 16 October 2026 THE HYDRA waits, and the test does the work — 4.4 s at a
 * load average of sixty on fourteen cores, about 1000 ms of it the machine's
 * own. So 1200, scaled by `itCosts` (`tools/test/figure.ts`).
 */
const REVIEW_AND_ORDER_MS = 1200;

describe("review blocks (wave-curriculum §7)", () => {
  test("only a review block's first wave is a review head", () => {
    WAVES.forEach((w, i) => {
      if (isReviewHead(WAVES, i)) expect(w.id).toStartWith("review");
    });
  });

  test("goes in front of a waiting boss, eight steps, a little above the block before", () => {
    const review = nextReview(WAVES);
    if (typeof review === "string") {
      expect(review).toBe("no boss waits at the end");
      return;
    }
    const { block } = review;
    expect(WAVES[block.insertAt]?.boss).toBeDefined();
    expect(WAVES[block.insertAt - 1]?.boss).toBeDefined();
    expect(block.existing).toBe(0);
    expect(block.tutorial).toBe(false);
    expect(block.floor).toBeDefined();
    expect(block.sinceTutorial).toBeGreaterThan(28);
  });

  itCosts(
    REVIEW_AND_ORDER_MS,
    "the boss behind a review block closes it: `waves:bosses` moves nothing",
    () => {
      const review = nextReview(WAVES);
      if (typeof review === "string") return;
      const at = review.block.insertAt;
      let last = at - 1;
      while (!isRegularWave(WAVES, last)) last--;
      const regular = WAVES[last] as Wave;
      const { variant: _v, ...head } = regular;
      const waves = [
        ...WAVES.slice(0, at),
        { ...head, id: `${review.prefix}Again` },
        { ...regular, id: `${review.prefix}Spread`, variant: true as const },
        ...WAVES.slice(at),
      ];
      expect(isReviewHead(waves, at)).toBe(true);
      expect(bossOrder(waves).order.map((w) => w.id)).toEqual(waves.map((w) => w.id));
    },
  );
});
