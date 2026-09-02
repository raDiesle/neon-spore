import { beforeAll, describe, expect, it } from "bun:test";
import { type Creature, DEFAULT_CONFIG, ECHO_AXES } from "@neon-spore/sim";
import { drawEchoSeam, echoStretch } from "../src/echo.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE ECHO's warning, which is the only thing separating it from an ordinary
 * slick or bulb on the field: a furrow across the axis it will part along, and
 * a body straining wider along that axis as the beat comes.
 *
 * `echo.test.ts` in sim proves the *number* — that `echoSplitPhase` runs to one
 * on the beat the division happens. Nothing there says render reads it, and a
 * tell wired to nothing looks exactly like a tell that is subtle. This is the
 * half that says the picture actually moves.
 *
 * It calls the two functions directly rather than driving a frame, for
 * `dart-query.test.ts`'s reason: what is being asked is whether *these* two
 * put the right calls on a canvas, and a whole frame answers it through four
 * hundred other calls.
 */

const CFG = DEFAULT_CONFIG;

beforeAll(installCanvasGlobals);

/** An echo standing at beat 0, with every division still ahead of it. */
function echo(splits = CFG.echoSplits): Creature {
  return {
    id: 1,
    kind: "echo",
    col: 5,
    row: 4,
    fromRow: 3,
    color: "cyan",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
    shell: 0,
    echoSplits: splits,
    echoBeat: 0,
  };
}

/** How far the body is pulled out of shape this many beats through its wait. */
function stretch(c: Creature, beats: number): { angle: number; along: number; across: number } {
  return echoStretch(CFG, c, beats) ?? { angle: 0, along: 1, across: 1 };
}

describe("the strain", () => {
  it("leaves the body alone on the beat it arrives", () => {
    expect(stretch(echo(), 0).along).toBe(1);
    expect(stretch(echo(), 0).across).toBe(1);
  });

  it("pulls wider the closer the division gets", () => {
    const c = echo();
    const quarter = stretch(c, CFG.echoSplitBeats * 0.25).along;
    const half = stretch(c, CFG.echoSplitBeats * 0.5).along;
    const full = stretch(c, CFG.echoSplitBeats).along;
    expect(quarter).toBeGreaterThan(1);
    expect(half).toBeGreaterThan(quarter);
    expect(full).toBeGreaterThan(half);
  });

  /**
   * The whole reason the phase is squared. Linear strain reads as a body that
   * has been the wrong shape all along; this keeps it round while there is
   * time and does most of the pulling in the last beat, which is the moment
   * the warning is worth anything.
   */
  it("saves most of the pulling for the end", () => {
    const c = echo();
    const half = stretch(c, CFG.echoSplitBeats * 0.5).along - 1;
    const full = stretch(c, CFG.echoSplitBeats).along - 1;
    expect(half).toBeLessThan(full * 0.35);
  });

  it("necks across the axis while it stretches along it", () => {
    const pull = stretch(echo(), CFG.echoSplitBeats);
    expect(pull.along).toBeGreaterThan(1);
    expect(pull.across).toBeLessThan(1);
  });

  it("turns to the axis the halves will actually step along", () => {
    const sideways = stretch(echo(CFG.echoSplits), CFG.echoSplitBeats);
    const vertical = stretch(echo(CFG.echoSplits - 1), CFG.echoSplitBeats * 2);
    expect(sideways.angle).toBeCloseTo(Math.atan2(ECHO_AXES[0]!.row, ECHO_AXES[0]!.col), 5);
    expect(vertical.angle).toBeCloseTo(Math.atan2(ECHO_AXES[1]!.row, ECHO_AXES[1]!.col), 5);
    expect(sideways.angle).not.toBeCloseTo(vertical.angle, 5);
  });

  it("does nothing to a body that has finished dividing", () => {
    expect(echoStretch(CFG, echo(0), 99)).toBeNull();
  });
});

describe("the seam", () => {
  /** The alpha the furrow was stroked at. The stub records a property write
   * as `set <name>=<value>`. */
  const seamAlpha = (log: string[]): number =>
    Number(log.find((l) => l.startsWith("set globalAlpha="))!.slice("set globalAlpha=".length));

  function seamLog(c: Creature, beats: number): string[] {
    const { ctx } = stubCanvas();
    const log: string[] = [];
    ctx.log = log;
    drawEchoSeam(ctx as unknown as CanvasRenderingContext2D, CFG, c, beats, 52, 52, "#0a1a2a");
    ctx.log = undefined;
    return log;
  }

  /**
   * The floor is the part that never goes away. It is what makes the furrow a
   * *marking* on this creature — visible on the first frame, before anything
   * has begun to strain — rather than an animation that happens to it.
   */
  it("is already cut on the beat the body arrives", () => {
    const log = seamLog(echo(), 0);
    expect(log.filter((l) => l === "stroke").length).toBe(1);
    const alpha = seamAlpha(log);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(1);
  });

  it("darkens as the division comes", () => {
    expect(seamAlpha(seamLog(echo(), CFG.echoSplitBeats))).toBeGreaterThan(
      seamAlpha(seamLog(echo(), 0)),
    );
  });

  it("is drawn on nothing that has finished dividing", () => {
    expect(seamLog(echo(0), 99)).toEqual([]);
  });

  it("touches nothing that is not an echo", () => {
    const slick = { ...echo(), kind: "slick" as const };
    expect(seamLog(slick, 1)).toEqual([]);
    expect(echoStretch(CFG, slick, 1)).toBeNull();
  });
});
