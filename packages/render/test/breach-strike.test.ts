import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type SimEvent } from "@neon-spore/sim";
import { BREACH_STRIKE_LOOK, type StrikePaint } from "../src/breach-look.js";
import { BreachStrike } from "../src/breach-strike.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The seam the hit that loses the wave is offered through.
 *
 * Two things have to hold and neither of them is a picture, because the
 * shipped record draws nothing at all (`breach-look.ts`). The first is the
 * **gate**: a rock is still visibly in the air for a fraction of a second
 * after the beat resolves it, and a strike that fired on the event would be
 * the ship breaking before anything reached it — the defect `arrivals.ts`
 * exists for. The second is that the look really is the switch: at the shipped
 * `seconds: 0` this class touches the canvas not once, and with an answer
 * patched in it paints every hit exactly once a frame.
 *
 * What the answers themselves draw is held by `tools/versus/test/variants.test.ts`,
 * which runs every candidate's paint through a canvas that refuses an
 * unparseable colour, a NaN coordinate and a negative radius.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const SURFACE = (_x: number): number => L.hullY;

beforeAll(installCanvasGlobals);

function breach(kind: "meteor" | "slick"): SimEvent {
  return {
    type: "breach",
    col: 4,
    kind,
    span: 1,
    beat: 3,
    fromRow: CFG.rows - 3,
    weight: "heavy",
    seed: 1,
    holes: 0,
    color: null,
  };
}

/** The monkeypatch `tools/versus` performs, done by hand for one assertion:
 * the record is the object the drawing code reads every call. */
function withLook<T>(seconds: number, paint: (s: StrikePaint) => void, run: () => T): T {
  const was = { seconds: BREACH_STRIKE_LOOK.seconds, paint: BREACH_STRIKE_LOOK.paint };
  Object.assign(BREACH_STRIKE_LOOK, {
    seconds,
    paint: (_ctx: unknown, s: StrikePaint) => paint(s),
  });
  try {
    return run();
  } finally {
    Object.assign(BREACH_STRIKE_LOOK, was);
  }
}

describe("the strike waits for what caused it", () => {
  it("holds a rock's until the rock has been drawn reaching the hull", () => {
    const fx = new BreachStrike();
    fx.ingest([breach("meteor")]);
    const seen: StrikePaint[] = [];
    // Nothing has landed yet, so a whole second of frames draws nothing.
    fx.update(0.5, () => false);
    withLook(
      1,
      (s) => seen.push(s),
      () => fx.draw(stubCanvas().ctx as never, L, SURFACE),
    );
    expect(seen).toHaveLength(0);
    // The rock is drawn into the skin, and now the strike is live.
    fx.update(0.016, (col, beat) => col === 4 && beat === 3);
    withLook(
      1,
      (s) => seen.push(s),
      () => fx.draw(stubCanvas().ctx as never, L, SURFACE),
    );
    expect(seen).toHaveLength(1);
    expect(seen[0]?.t).toBeCloseTo(0, 5);
  });

  it("fires a living body's at once: there is no fall replay to wait for", () => {
    const fx = new BreachStrike();
    fx.ingest([breach("slick")]);
    fx.update(0.016, () => false);
    const seen: StrikePaint[] = [];
    withLook(
      1,
      (s) => seen.push(s),
      () => fx.draw(stubCanvas().ctx as never, L, SURFACE),
    );
    expect(seen).toHaveLength(1);
  });
});

describe("the look is the switch", () => {
  it("draws nothing at all while the look asks for no seconds", () => {
    // `seconds: 0` is the whole switch, and it was the shipped record until
    // the owner took two answers on 16 September 2026 (`breach-either.ts`).
    // It is still the switch every future candidate is offered through.
    const fx = new BreachStrike();
    fx.ingest([breach("slick")]);
    fx.update(0.016, () => true);
    const { ctx } = stubCanvas();
    withLook(
      0,
      () => {},
      () => fx.draw(ctx as never, L, SURFACE),
    );
    expect(ctx.calls).toBe(0);
  });

  it("draws the shipped record's own picture, on a real canvas", () => {
    // Not a patch: what the game actually draws on the frame it loses a wave.
    const fx = new BreachStrike();
    fx.ingest([breach("slick")]);
    fx.update(0.016, () => true);
    const { ctx } = stubCanvas();
    fx.draw(ctx as never, L, SURFACE);
    expect(ctx.calls).toBeGreaterThan(0);
  });

  it("runs its own clock out and then stops drawing", () => {
    const fx = new BreachStrike();
    fx.ingest([breach("slick")]);
    fx.update(0.016, () => true);
    const seen: number[] = [];
    const draw = () =>
      withLook(
        0.5,
        (s) => seen.push(s.t),
        () => fx.draw(stubCanvas().ctx as never, L, SURFACE),
      );
    draw();
    fx.update(0.3, () => true);
    draw();
    fx.update(0.3, () => true);
    draw();
    // Two frames inside the half second, and nothing after it.
    expect(seen).toHaveLength(2);
    expect(seen[1]).toBeGreaterThan(seen[0] as number);
  });

  it("forgets everything on a restart, waiting and live alike", () => {
    const fx = new BreachStrike();
    fx.ingest([breach("meteor"), breach("slick")]);
    fx.update(0.016, () => true);
    fx.clear();
    const seen: StrikePaint[] = [];
    withLook(
      1,
      (s) => seen.push(s),
      () => fx.draw(stubCanvas().ctx as never, L, SURFACE),
    );
    expect(seen).toHaveLength(0);
  });
});
