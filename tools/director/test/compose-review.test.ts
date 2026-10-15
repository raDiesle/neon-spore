import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES, type Wave } from "@neon-spore/content";
import { bossOrder } from "../src/boss-slots.js";
import { isReviewHead, nextReview, REVIEW_FROM, REVIEW_NAMES } from "../src/compose-review.js";

describe("review blocks (wave-curriculum §7)", () => {
  test("only a review block's first wave is a review head", () => {
    WAVES.forEach((w, i) => {
      if (isReviewHead(WAVES, i)) expect(w.id).toStartWith("review");
    });
  });

  test("every theme's names fit: at most 20 letters and four words", () => {
    const from = WAVES.findIndex((w) => w.id === REVIEW_FROM);
    const plurals = WAVES.filter(
      (w, i) => i > from && w.id.endsWith("Again") && !w.id.startsWith("review"),
    ).map((w) => w.name.replace(/ AGAIN$/, ""));
    expect(plurals.length).toBeGreaterThan(20);
    for (const p of plurals) {
      for (const name of REVIEW_NAMES.map((n) => n(p))) {
        expect({ name, fits: name.length <= 20 && name.split(" ").length <= 4 }).toEqual({
          name,
          fits: true,
        });
      }
    }
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
