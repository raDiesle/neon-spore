import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { frontBody } from "../src/instar-front-body.js";
import { instarFarEnd, instarHeadAt, type Point } from "../src/instar-place.js";
import type { Look } from "../src/instar-plate.js";
import { POSES } from "../src/instar-poses.js";
import { profileLines } from "../src/instar-profile.js";
import { instarNeck, instarTurn } from "../src/instar-turn.js";
import { turnedLines } from "../src/instar-turning.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE INSTAR turning between its views is one body turning**
 * (`instar-turning.ts`). The owner, 7 October 2026: *when it's switching the
 * view from front to side it looks very strange and unnatural, like it's
 * replaced*. At one end of the turn the body is the face-on one, at the other
 * the side-on one, and between them no part of it jumps.
 */
const L = computeLayout(VIEWPORT, CFG, "test");

function lookOf(time: number): Look {
  const f = POSES.hover;
  const { head, r } = instarHeadAt(L, f);
  return {
    f,
    head,
    r,
    time,
    fade: 1,
    hurt: 0,
    threat: 0,
    fire: 0,
    harden: 0,
    shoveUp: 0,
    shoveDown: 0,
  };
}

describe("THE INSTAR turning", () => {
  const look = lookOf(1.3);
  const { f, head, r } = look;

  it("is the side-on body when it is all the way round", () => {
    const t = turnedLines(L, look, 1);
    expect(t.spine).toEqual(profileLines(L, look).spine);
    expect(t.near(0.5)).toBe(1);
  });

  it("is the face-on body when it has not started", () => {
    const neck = instarNeck(head, r);
    const front = frontBody(look, neck, instarFarEnd(L, f), instarTurn(f.side));
    const t = turnedLines(L, look, 0);
    const first = front.seen[0] as (typeof front.seen)[number];
    const last = front.seen.at(-1) as (typeof front.seen)[number];
    const close = (p: Point, q: Point) =>
      expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeLessThan(0.01);
    close(t.spine[0] as Point, { x: neck.x + first.c.x, y: neck.y + first.c.y });
    close(t.rear, { x: neck.x + last.c.x, y: neck.y + last.c.y });
    expect(t.body.w.yaw).toBeCloseTo(front.w.yaw, 6);
  });

  it("moves every part of the body a little at a time, all the way round", () => {
    const steps = 400;
    let prev = turnedLines(L, look, 0);
    let most = 0;
    for (let i = 1; i <= steps; i++) {
      const next = turnedLines(L, look, i / steps);
      for (const line of ["spine", "top", "bottom"] as const)
        next[line].forEach((p, j) => {
          const q = prev[line][j] as Point;
          most = Math.max(most, Math.hypot(p.x - q.x, p.y - q.y));
        });
      prev = next;
    }
    // A four-hundredth of the turn moves nothing by a fifth of a head: a body turning, not a cut.
    expect(most).toBeLessThan(0.2 * r);
  });
});
