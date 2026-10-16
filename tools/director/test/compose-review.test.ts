import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES, type Wave } from "@neon-spore/content";
import { bossOrder } from "../src/boss-slots.js";
import { nextReview } from "../src/compose-review.js";
import { isReviewHead } from "../src/compose-starts.js";

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

  test("the boss behind a review block closes it: `waves:bosses` moves nothing", () => {
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
  });
});
