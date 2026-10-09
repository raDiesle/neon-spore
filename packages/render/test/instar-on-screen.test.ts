import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { instarBoss } from "@neon-spore/sim";
import { instarFarEnd } from "../src/instar-far-end.js";
import { frontLimbs } from "../src/instar-front.js";
import { frontBody } from "../src/instar-front-body.js";
import { INSTAR_TAIL_REST } from "../src/instar-glance.js";
import { instarHeadAt } from "../src/instar-place.js";
import type { Look } from "../src/instar-plate.js";
import { swimLook } from "../src/instar-serpent.js";
import { instarBody } from "../src/instar-sway.js";
import { tailShape } from "../src/instar-tail.js";
import { instarHandover, instarNeck, instarTurn } from "../src/instar-turn.js";
import { turnedLines } from "../src/instar-turning.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import { acting, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE INSTAR's tail is never cut by the screen's edge** — the owner, 9
 * October 2026: *make sure the graphics of boss specifically the tail is not
 * cut from borders of game screen*. Every step of the script, between beats
 * as well as on them, face-on and side-on, with the resting tail leaning
 * every way it leans: the whole tail, every ring with its girth and the
 * blades' tips, is inside the screen (`instar-far-end.ts`,
 * `instar-tail-fit.ts`).
 */

const L = computeLayout(VIEWPORT, CFG, "test");

/** The tail drawn for step `c`, `phase` of the way into its beat, `time` seconds in: its extent on the screen. */
function tailBox(c: number, phase: number, time: number) {
  const w = hung();
  const s = acting(w, c);
  const { f } = instarBody(s, CFG, w, w.beat + 2, phase, 0);
  const { head, r } = instarHeadAt(L, f);
  const look = { f, head, r, time, fade: 1, hurt: 0, threat: 0, fire: 0 } as unknown as Look;
  const side = instarHandover(f.side);
  let shape: ReturnType<typeof tailShape>;
  let rear: { x: number; y: number };
  if (side <= 0) {
    const neck = instarNeck(head, r);
    const body = frontBody(look, neck, instarFarEnd(L, f), instarTurn(f.side));
    const limbs = frontLimbs(look, neck, body.seen);
    rear = limbs.rear;
    shape = tailShape(L, limbs.tailLook, limbs.rear, limbs.heading);
  } else {
    const t = turnedLines(L, look, side);
    const sw = swimLook(L, look);
    rear = t.rear;
    shape = tailShape(L, { ...sw, r: sw.r * t.tailNear }, t.rear, t.heading);
  }
  const box = { x0: Infinity, x1: -Infinity, y0: Infinity };
  for (const g of shape.seen) {
    box.x0 = Math.min(box.x0, rear.x + g.c.x - g.r);
    box.x1 = Math.max(box.x1, rear.x + g.c.x + g.r);
    box.y0 = Math.min(box.y0, rear.y + g.c.y - g.r);
  }
  for (const b of shape.blades) {
    box.x0 = Math.min(box.x0, b.tip.x);
    box.x1 = Math.max(box.x1, b.tip.x);
    box.y0 = Math.min(box.y0, b.tip.y);
  }
  return box;
}

describe("THE INSTAR on the screen", () => {
  const steps = instarBoss(hung())?.steps.length ?? 0;

  it("keeps the whole tail inside the screen at every step, however the resting tail leans", () => {
    expect(steps).toBeGreaterThan(20);
    const was = INSTAR_TAIL_REST.lean;
    const cut: string[] = [];
    try {
      for (const lean of [1, 0, -1]) {
        INSTAR_TAIL_REST.lean = () => lean;
        for (let c = 0; c < steps; c++) {
          for (const phase of [0, 0.5]) {
            const b = tailBox(c, phase, 1 + c * 0.37);
            if (b.x0 < 0 || b.x1 > L.width || b.y0 < 0) {
              cut.push(
                `lean ${lean} step ${c}+${phase}: ${b.x0.toFixed(0)}..${b.x1.toFixed(0)}, top ${b.y0.toFixed(0)}`,
              );
            }
          }
        }
      }
    } finally {
      INSTAR_TAIL_REST.lean = was;
    }
    expect(cut).toEqual([]);
  });

  it("keeps it inside as the shipped lean moves it, through both ways of resting", () => {
    const cut: string[] = [];
    for (let c = 0; c < steps; c++) {
      for (let time = 0; time < 12; time += 1.5) {
        const b = tailBox(c, 0, time);
        if (b.x0 < 0 || b.x1 > L.width || b.y0 < 0) cut.push(`step ${c} at ${time}s`);
      }
    }
    expect(cut).toEqual([]);
  });
});
