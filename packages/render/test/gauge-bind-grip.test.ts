import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";
import { bandAt, fieldWith, layout, playing } from "./gauge-grip-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GAUGE's band as the navigator's control, while it is wound
 * (`gauge-grip.ts`): the bind's cases, next door to the needle's in
 * `gauge-grip.test.ts` since the loose tooth took that file past the line.
 */

beforeAll(installCanvasGlobals);

describe("a thumb on the band", () => {
  it("is the navigator's, while it is wound, and nobody else's", () => {
    const l = layout("p2");
    const bound = playing({ boundBeat: 3 });
    const at = bandAt(l, bound);
    const touch = touchDown(l, at.x, at.y, fieldWith(2, bound));
    expect(touch?.command).toMatchObject({ target: "gaugeBand", on: true });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "gaugeBand", player: 2 });
    const his = touchDown(layout("p1"), at.x, at.y, fieldWith(1, bound));
    expect(his?.command?.kind === "drag" && his.command.target).not.toBe("gaugeBand");
    expect(touchDown(l, at.x, at.y, fieldWith(2, playing()))).toBeNull();
  });

  it("lets go on the lift, and carries no distance anybody reads", () => {
    const l = layout("p2");
    const bound = playing({ boundBeat: 3 });
    const field = fieldWith(2, bound);
    const at = bandAt(l, bound);
    const hold = touchDown(l, at.x, at.y, field)?.hold as Hold;
    expect(touchMove(l, hold, at.x + 4, at.y)?.command).toMatchObject({
      target: "gaugeBand",
      on: true,
    });
    expect(touchUp(l, hold, { x: at.x, y: at.y })?.command).toMatchObject({
      target: "gaugeBand",
      on: false,
    });
  });
});
