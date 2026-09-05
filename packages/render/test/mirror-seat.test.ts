import { beforeAll, describe, expect, it } from "bun:test";
import type { MirrorStep } from "@neon-spore/sim";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { P1_SKIN, P2_SKIN } from "../src/seat-skin.js";
import { drawShowRow } from "../src/simon-row.js";
import { VerdictFx } from "../src/simon-verdict.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE MIRROR's glyphs are the panel's own buttons, so they are the seat's own
 * flesh: violet on player one's screen, amber on player two's.
 *
 * They used to be neither — `drawStepGlyph` took no `SeatSkin` and every
 * control it drew fell through to `P1_SKIN`'s default, so the sequence was
 * drawn in player one's tissue on a gold panel. The pair is supposed to
 * recognise a glyph as the button it is about, and on player two's seat it did
 * not look like one.
 */

const CFG = DEFAULT_CONFIG;
const STEPS: readonly MirrorStep[] = ["fireRed", "fireCyan", "cannonLeft", "guard"];

beforeAll(installCanvasGlobals);

function logFor(
  role: ViewRole,
  draw: (ctx: CanvasRenderingContext2D, l: ReturnType<typeof computeLayout>) => void,
) {
  const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
  const { ctx } = stubCanvas();
  ctx.log = [];
  draw(ctx as unknown as CanvasRenderingContext2D, l);
  return (ctx.log ?? []).join("\n");
}

describe("a sequence glyph wears the seat it is drawn on", () => {
  const row = (ctx: CanvasRenderingContext2D, l: ReturnType<typeof computeLayout>) =>
    drawShowRow(ctx, l, l.tile * 2, STEPS, STEPS.length);

  it("draws the row in player one's flesh on player one's screen", () => {
    const p1 = logFor("p1", row);
    expect(p1).toContain(P1_SKIN.face);
    expect(p1).not.toContain(P2_SKIN.face);
  });

  it("draws the row in player two's flesh on player two's screen", () => {
    const p2 = logFor("p2", row);
    expect(p2).toContain(P2_SKIN.face);
    expect(p2).not.toContain(P1_SKIN.face);
  });

  it("throws the verdict's glyphs in the seat's flesh too", () => {
    const flights = STEPS.map((step, i) => ({ step, x: 100 + i * 40, r: 14 }));
    const fly = (ctx: CanvasRenderingContext2D, l: ReturnType<typeof computeLayout>) => {
      const fx = new VerdictFx();
      fx.start(flights, false, "step", l.tile * 2, l.hullY);
      fx.update(0.05);
      fx.drawFlights(ctx, l);
    };
    expect(logFor("p2", fly)).toContain(P2_SKIN.face);
    expect(logFor("p1", fly)).toContain(P1_SKIN.face);
  });
});
