import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { AntiphonState, SimEvent, World } from "@neon-spore/sim";
import { drawAntiphonGrip } from "../src/antiphon-grip.js";
import { AntiphonMarks } from "../src/antiphon-marks.js";
import { drawAntiphonRailGrip, drawAntiphonVerdict } from "../src/antiphon-rail-grip.js";
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
 * stands on the explainer's screen alone and the rail on the chooser's, so
 * each asked mark wears the halo on its own screen and the other is shown
 * nothing — no partner's clock and no refusal; and the verdict on arrival is
 * rung at the organ's place on both screens.
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
  s.carried = -1;
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

function rail(world: World, s: AntiphonState, role: ViewRole): string {
  return drawn(role, (ctx, l) => drawAntiphonRailGrip(ctx, l, CFG, s, world.beat, 1.2, 1));
}

function verdict(role: ViewRole, v: GripVerdicts): string {
  return drawn(role, (ctx, l) => drawAntiphonVerdict(ctx, l, CFG, v));
}

describe("THE ANTIPHON's handles asking", () => {
  it("halo the organ's grip mark until a thumb rests on it", () => {
    const { s } = standing();
    const asked = organ(s, "p1");
    s.heldP2 = true;
    expect(asked - organ(s, "p1")).toBe(1);
  });

  it("halo every candidate a carry would take on, and none while one is in hand", () => {
    const { world, s } = standing();
    expect(count(rail(world, s, "p2"), HALO)).toBe(3);
    expect(count(rail(world, s, "test"), HALO)).toBe(3);
    s.carried = 0;
    expect(count(rail(world, s, "p2"), HALO)).toBe(0);
  });

  it("ask no carry while the organ is still growing, since the carry would be dropped", () => {
    const { world, s } = standing();
    if (s.organ !== null) s.organ.grownBeat = world.beat;
    expect(count(rail(world, s, "p2"), HALO)).toBe(0);
    expect(rail(world, s, "p2")).not.toBe("");
  });
});

describe("THE ANTIPHON's verdict on arrival", () => {
  it("rings the organ green for the organ carried home or the ship burst, red for a decoy", () => {
    const marks = new AntiphonMarks();
    marks.ingest([{ type: "antiphonPit", col: 5, shape: 3, pits: 1 }]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.clear();
    marks.ingest([{ type: "antiphonHarden", col: 2, shape: 4 }]);
    expect(marks.verdicts.at(0)?.good).toBe(false);
    marks.clear();
    marks.ingest([{ type: "antiphonBurst", col: 5, pits: 6 }]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  it("draws the verdict at the organ's place", () => {
    const v = new GripVerdicts();
    const bare = count(verdict("p2", v), PALETTE.good);
    v.mark(0, true);
    expect(count(verdict("p2", v), PALETTE.good)).toBeGreaterThan(bare);
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

  it.each(["p1", "p2", "test"] as const)(
    "reaches the field's frame on every screen, on %s",
    (role) => {
      const pit: SimEvent[] = [{ type: "antiphonPit", col: 5, shape: 1, pits: 1 }];
      expect(count(frames(role, pit), PALETTE.good)).toBeGreaterThan(
        count(frames(role, []), PALETTE.good),
      );
    },
  );
});
