import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES } from "@neon-spore/content";
import {
  BASTION_LAYERS,
  BASTION_PLATES_A_SIDE,
  type BastionStep,
  bastionTrackPoints,
  handleBoundsMilli,
} from "@neon-spore/sim";
import { bastionKnobRest } from "../src/bastion-grip.js";
import { bastionCentre } from "../src/bastion-shape.js";
import { computeLayout } from "../src/layout.js";
import { posed, stood } from "./bastion-harness.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Every track a shipped BASTION pulls a plate along fits the field**
 * (`sim/bastion-track.ts`): from where its knob rests, the whole of it — a
 * curve round the moon included — stays inside the field a handle may go,
 * and on its own side of the moon, so the two seats' channels never cross.
 * A curve's length is its shape, so this is where a plate it does not fit
 * is caught.
 *
 * And **a script never steps back outward**: the picture draws a shell by
 * its kind (`bastion-shape.ts`), so the same shell twice must come twice
 * running — a second course — and the shells come outside in.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");

function scripts(): { name: string; steps: readonly BastionStep[] }[] {
  return WAVES.flatMap((w) =>
    w.boss?.kind === "bastion" ? [{ name: w.name, steps: w.boss.steps }] : [],
  );
}

describe("THE BASTION's tracks on the field", () => {
  it("has a shipped script to check", () => {
    expect(scripts().length).toBeGreaterThan(0);
  });

  it("keeps every shipped plate's track inside the field and on its own side of the moon", () => {
    const b = handleBoundsMilli(CFG);
    const px = (m: number) => (m * L.tile) / 1000;
    const c = bastionCentre(L, CFG);
    for (const { name, steps } of scripts()) {
      steps.forEach((step, cursor) => {
        if (step.layer !== "plates") return;
        const world = stood();
        const s = posed(world, "plates", "layer", (st) => {
          st.cursor = cursor;
        });
        for (const side of [0, 1] as const) {
          for (let k = 0; k < BASTION_PLATES_A_SIDE; k++) {
            const i = side * BASTION_PLATES_A_SIDE + k;
            const track = step.tracks?.[k] ?? "straight";
            s.goneMask = (1 << i) - 1 - (side === 1 ? (1 << BASTION_PLATES_A_SIDE) - 1 : 0);
            const rest = bastionKnobRest(L, CFG, s, side);
            const where = `${name} course ${cursor}, plate ${i}, ${track}`;
            for (const p of bastionTrackPoints(CFG, track, i)) {
              const x = rest.x + px(p.x);
              const y = rest.y + px(p.y);
              expect(x, where).toBeGreaterThanOrEqual(L.gridLeft + px(b.x0));
              expect(x, where).toBeLessThanOrEqual(L.gridLeft + px(b.x1));
              expect(y, where).toBeGreaterThanOrEqual(L.gridTop + px(b.y0));
              expect(y, where).toBeLessThanOrEqual(L.gridTop + px(b.y1));
              const own = side === 0 ? c.x - x : x - c.x;
              expect(own, where).toBeGreaterThan(rest.r);
            }
          }
        }
      });
    }
  });

  it("comes outside in, a shell twice only twice running", () => {
    for (const { steps } of scripts()) {
      const order = steps.map((st) => BASTION_LAYERS.indexOf(st.layer));
      for (let k = 1; k < order.length; k++) {
        expect(order[k] ?? 0).toBeGreaterThanOrEqual(order[k - 1] ?? 0);
      }
    }
  });
});
