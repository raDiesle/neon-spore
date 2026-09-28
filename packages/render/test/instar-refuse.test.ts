import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { instarPanel, step } from "@neon-spore/sim";
import { instarMarkUnder } from "../src/instar-mark-grip.js";
import { instarMarkPoint } from "../src/instar-place.js";
import { instarThreat } from "../src/instar-shape.js";
import { instarBody } from "../src/instar-sway.js";
import { computeLayout } from "../src/layout.js";
import { type Touch, touchMove } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import { acting, field, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A press on the partner's ring is refused once** (`instar-mark-grip.ts`):
 * it is handed through holding nothing, so a thumb resting there and moving
 * sends no second drag for `sim/instar-hand.ts` to refuse again. THE WARDEN's
 * eye had the same bug (`warden-grip.test.ts`).
 */

const L = computeLayout(VIEWPORT, CFG, "test");

describe("the partner's ring", () => {
  it("refuses a press and three moves once", () => {
    const world = hung();
    const s = world.boss?.kind === "instar" ? world.boss : null;
    if (s === null) throw new Error("the instar wave hung no body");
    const cursor = s.steps.findIndex((st) =>
      st.marks.some((m) => m.seat !== "both" && !instarPanel(m.gesture)),
    );
    expect(cursor).toBeGreaterThanOrEqual(0);
    acting(world, cursor);
    const marks = s.steps[cursor]?.marks ?? [];
    const id = marks.findIndex((m) => m.seat !== "both" && !instarPanel(m.gesture));
    const mark = marks[id];
    if (mark === undefined) throw new Error("the step has no one-seat mark");
    const wrong = mark.seat === "p1" ? 2 : 1;
    const beat = world.beat;
    const { sway } = instarBody(s, CFG, world, beat, 0);
    const at = instarMarkPoint(L, mark, sway, instarThreat(s, beat, 0));
    const down = instarMarkUnder(L, at.x, at.y, { ...field(world, beat, 0), seat: wrong });
    expect(down?.command).toMatchObject({ target: "instarMark", on: true, id });
    expect(down?.hold).toBeNull();
    const touches: (Touch | null | undefined)[] = [down];
    const hold = down?.hold;
    for (let i = 1; i <= 3 && hold; i++) touches.push(touchMove(L, hold, at.x + i * 4, at.y));
    let refused = 0;
    for (const t of touches) {
      const command = t?.command;
      step(world, command ? [{ tick: world.tick, player: wrong, command }] : []);
      refused += world.events.filter((e) => e.type === "instarRefuse").length;
    }
    expect(refused).toBe(1);
  });
});
