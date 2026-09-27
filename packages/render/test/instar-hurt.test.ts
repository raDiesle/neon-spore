import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import type { SimEvent } from "@neon-spore/sim";
import { BossHurt, JAB_SHAKE } from "../src/boss-hurt.js";
import { InstarFx } from "../src/instar-fx.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import { acting, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Every bolt THE INSTAR counts shows the hurt** — the owner, 27 September
 * 2026: *when correctly hit, there must be a clear visual every time*. A
 * counted bolt on a shoot mark is the red at full and half the shake
 * (`BossHurt.jab`); a refused bolt, a miss — which the simulation says
 * nothing about at all — and a counted thumb on a mark that is not a shoot
 * mark start none. The landing keeps the full blow (`boss-hurt.test.ts`).
 */

const L = computeLayout(VIEWPORT, CFG, "test");

type Mark = { gesture: string };
const SHOOT_STEP = INSTAR_SCRIPT.findIndex((s) => s.marks.some((m: Mark) => m.gesture === "shoot"));
const SHOOT_MARK = INSTAR_SCRIPT[SHOOT_STEP]?.marks.findIndex((m) => m.gesture === "shoot") ?? -1;
const THUMB_STEP = INSTAR_SCRIPT.findIndex((s) => s.marks.every((m) => m.gesture !== "shoot"));
const shootPart = INSTAR_SCRIPT[SHOOT_STEP]?.marks[SHOOT_MARK]?.part ?? "tail";

/** An InstarFx standing on `cursor`, its marks placed the way the drawer places them. */
function standing(cursor: number): InstarFx {
  const world = hung();
  const s = acting(world, cursor);
  const fx = new InstarFx();
  fx.place(L, s, { xMilli: 0, yMilli: 0 }, 0, { x: 0, y: 0 }, 40);
  return fx;
}

const answer = (mark: number, part: string): SimEvent =>
  ({ type: "instarAnswer", mark, part, col: 3 }) as SimEvent;

/** Frames enough for any blow to be over. */
function settle(fx: InstarFx): void {
  for (let i = 0; i < 40; i++) fx.update(1 / 60);
}

describe("THE INSTAR's hurt on a counted bolt", () => {
  it("has a shoot step and a step with none, to tell them apart", () => {
    expect(SHOOT_STEP).toBeGreaterThanOrEqual(0);
    expect(SHOOT_MARK).toBeGreaterThanOrEqual(0);
    expect(THUMB_STEP).toBeGreaterThanOrEqual(0);
  });

  it("starts a hurt on each counted bolt: the red at full, half the shake", () => {
    const fx = standing(SHOOT_STEP);
    for (let bolt = 0; bolt < 3; bolt++) {
      expect(fx.hurt.value).toBe(0);
      fx.ingest([answer(SHOOT_MARK, shootPart)], L, () => {});
      expect(fx.hurt.value).toBe(1);
      expect(fx.hurt.shake).toBe(JAB_SHAKE);
      settle(fx);
    }
  });

  it("starts none on a refused bolt or a miss", () => {
    const fx = standing(SHOOT_STEP);
    fx.ingest([{ type: "instarRefuse", mark: SHOOT_MARK, player: 2, col: 3 }], L, () => {});
    expect(fx.hurt.value).toBe(0);
    // A miss is a bolt out of another column, which the simulation answers
    // with nothing: a frame with no event on it.
    fx.ingest([], L, () => {});
    fx.update(1 / 60);
    expect(fx.hurt.value).toBe(0);
    expect(fx.hurt.shake).toBe(0);
  });

  it("starts none on a counted thumb that is not a bolt", () => {
    const fx = standing(THUMB_STEP);
    const part = INSTAR_SCRIPT[THUMB_STEP]?.marks[0]?.part ?? "jaw";
    fx.ingest([answer(0, part)], L, () => {});
    expect(fx.hurt.value).toBe(0);
  });

  it("keeps the landing the bigger blow, even straight after a bolt", () => {
    const hurt = new BossHurt();
    hurt.jab();
    expect(hurt.shake).toBe(JAB_SHAKE);
    hurt.hit();
    expect(hurt.value).toBe(1);
    expect(hurt.shake).toBe(1);
    // And a bolt after a landing does not soften the shake already going.
    hurt.jab();
    expect(hurt.shake).toBe(1);
  });

  it("forgets the bolt's hurt on a clear", () => {
    const fx = standing(SHOOT_STEP);
    fx.ingest([answer(SHOOT_MARK, shootPart)], L, () => {});
    fx.clear();
    expect(fx.hurt.value).toBe(0);
    expect(fx.hurt.shake).toBe(0);
  });
});
