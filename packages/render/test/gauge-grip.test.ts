import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { gaugeLobeArmed } from "../src/gauge-button.js";
import { drawGaugeGrip } from "../src/gauge-grip.js";
import { gaugeDial } from "../src/gauge-round.js";
import type { ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";
import { layout, playing, round } from "./gauge-grip-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GAUGE's dial as a control (`gauge-grip.ts`): that the band is the
 * navigator's and only while it is wound, and that its ring reaches the
 * canvas on the screen her seat holds and no other. The rule is the
 * simulation's (`sim/test/gauge-bind.test.ts`); this file proves the picture
 * hands it a thumb — and that it never draws a control the round is about to
 * refuse. The pilot's needle under a jam was the other half of this file
 * until the jam went, 2 October 2026. The band's own touch cases are next
 * door (`gauge-bind-grip.test.ts`), and the round they share is
 * `gauge-grip-harness.ts`.
 */

beforeAll(installCanvasGlobals);

/** Strokes the rings make on a role's screen, for one state. */
function strokes(role: ViewRole, g: GaugeState): number {
  const { ctx } = stubCanvas();
  const l = layout(role);
  drawGaugeGrip(
    ctx as unknown as CanvasRenderingContext2D,
    l,
    DEFAULT_CONFIG,
    gaugeDial(l),
    g,
    role,
    1.2,
  );
  return ctx.calls;
}

describe("the rings", () => {
  it("stand on nobody's screen while the round is in one state", () => {
    for (const role of ROLES) expect(strokes(role, playing())).toBe(0);
  });

  it("are gone outside the play, whatever the band says", () => {
    const over = playing({ boundBeat: 3, phase: "verdict" });
    for (const role of ROLES) expect(strokes(role, over)).toBe(0);
  });

  it("are the band's on her screen and the test screen, and never on his", () => {
    const bound = playing({ boundBeat: 3 });
    expect(strokes("p2", bound)).toBeGreaterThan(0);
    expect(strokes("p1", bound)).toBe(0);
    expect(strokes("test", bound)).toBe(strokes("p2", bound));
  });

  it("fill under a thumb rather than breathing", () => {
    expect(strokes("p2", playing({ boundBeat: 3, openThumb: true }))).toBeGreaterThan(
      strokes("p2", playing({ boundBeat: 3 })),
    );
  });
});

describe("the lobes", () => {
  it("go faint exactly where the round would refuse the press", () => {
    const { g } = round();
    expect(gaugeLobeArmed(g, "left")).toBe(true);
    expect(gaugeLobeArmed(g, "red")).toBe(true);
    // Her own thumb on the band refuses her call, and his turns never go.
    g.openThumb = true;
    expect(gaugeLobeArmed(g, "red")).toBe(false);
    expect(gaugeLobeArmed(g, "cyan")).toBe(false);
    expect(gaugeLobeArmed(g, "left")).toBe(true);
    expect(gaugeLobeArmed(g, "right")).toBe(true);
  });
});

describe("on the round's own screen", () => {
  for (const role of ROLES) {
    it(`draws the claw, the lobes and the band's ring for ${role}`, () => {
      const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
      const index = waveWith("gauge");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      const tpb = ticksPerBeat(CFG);
      const { world: after, ctx } = runFrames(world, role, tpb * 8, {
        onTick: (tick, w) => {
          step(w, []);
          // Straight to the bind — set rather than played for, as THE MAZE's
          // test does it — then her thumb on it.
          if (tick === tpb * 5 && w.boss?.kind === "gauge") {
            w.boss.phase = "play";
            w.boss.boundBeat = w.beat;
          }
          if (tick === tpb * 6) {
            step(w, [
              {
                tick,
                player: 2,
                command: { kind: "drag", target: "gaugeBand", on: true, fromMilli: 0 },
              },
            ]);
          }
        },
      });
      expect(after.boss?.kind === "gauge" && after.boss.openThumb).toBe(true);
      expect(ctx.calls).toBeGreaterThan(100);
    });
  }
});
