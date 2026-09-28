import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { AntiphonState, SimEvent, World } from "@neon-spore/sim";
import { drawAntiphonGrip } from "../src/antiphon-grip.js";
import { AntiphonMarks } from "../src/antiphon-marks.js";
import { drawAntiphonRailGrip } from "../src/antiphon-rail-grip.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { grown, hung, TPB } from "./antiphon-frame-harness.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE ANTIPHON's two handles answer a touch the way THE GAUGE's do**
 * (`antiphon-marks.ts`, `.claude/skills/new-boss` §5): the organ's grip mark
 * stands on the pilot's screen alone and the rail on the navigator's, so
 * each asked mark wears the halo on its own screen and the other is shown
 * nothing — no partner's clock and no refusal; a pull washes the candidate
 * green; and the verdict reaches the field's frame.
 *
 * The states are **set**, `antiphon-frame-harness.ts`' arrangement.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);
const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

function standing(): { world: World; s: AntiphonState } {
  const world = hung();
  const s = grown(world);
  s.crossed = [];
  s.heldRail = -1;
  return { world, s };
}

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, l: Layout) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, layout(role));
  return log.join("|");
}

const organ = (s: AntiphonState, role: ViewRole) =>
  count(
    drawn(role, (ctx, l) => drawAntiphonGrip(ctx, l, CFG, s, 1.2, 1)),
    HALO,
  );

function rail(world: World, s: AntiphonState, role: ViewRole, v = new GripVerdicts()): string {
  return drawn(role, (ctx, l) => drawAntiphonRailGrip(ctx, l, CFG, s, world.beat, 1.2, 1, v));
}

describe("THE ANTIPHON's handles asking", () => {
  it("halo the organ's grip mark until a thumb rests on it", () => {
    const { s } = standing();
    const asked = organ(s, "p1");
    s.heldP2 = true;
    expect(asked - organ(s, "p1")).toBe(1);
  });

  it("halo every candidate a pull would take on", () => {
    const { world, s } = standing();
    expect(count(rail(world, s, "p2"), HALO)).toBe(3);
    expect(count(rail(world, s, "test"), HALO)).toBe(3);
    s.heldRail = 0;
    s.crossed = [2];
    expect(count(rail(world, s, "p2"), HALO)).toBe(1);
  });

  it("ask no pull while the organ is still growing, since the pull would be dropped", () => {
    const { world, s } = standing();
    const o = s.organs[0];
    if (o !== undefined) o.grownBeat = world.beat;
    expect(count(rail(world, s, "p2"), HALO)).toBe(0);
    expect(rail(world, s, "p2")).not.toBe("");
  });
});

describe("THE ANTIPHON's verdict on a touch", () => {
  it("washes a pulled candidate green by its column, and judges neither turn nor hardening", () => {
    const marks = new AntiphonMarks();
    marks.ingest([{ type: "antiphonHarden", col: 4, rail: 4 }]);
    expect(marks.verdicts.at(4)).toBeNull();
    marks.ingest([{ type: "antiphonPull", col: 2, left: 2 }]);
    expect(marks.verdicts.at(2)?.good).toBe(true);
    marks.clear();
    expect(marks.verdicts.at(2)).toBeNull();
  });

  it("rings the pulled candidate over its cross", () => {
    const { world, s } = standing();
    s.crossed = [0];
    const v = new GripVerdicts();
    v.mark(2, true);
    const bare = count(rail(world, s, "p2"), PALETTE.good);
    expect(count(rail(world, s, "p2", v), PALETTE.good)).toBeGreaterThan(bare);
  });

  /** A beat of the organ standing, `said` on tick 2 and the world held still. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const { world } = standing();
    const log: string[] = [];
    runFrames(world, role, TPB, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        w.events.length = 0;
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(["p2", "test"] as const)("reaches the field's frame, on %s", (role) => {
    const pulled: SimEvent[] = [{ type: "antiphonPull", col: 2, left: 2 }];
    expect(count(frames(role, pulled), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });

  it("is not on his screen, which draws no rail", () => {
    const pulled: SimEvent[] = [{ type: "antiphonPull", col: 2, left: 2 }];
    expect(count(frames("p1", pulled), PALETTE.good)).toBe(count(frames("p1", []), PALETTE.good));
  });
});
