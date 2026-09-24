import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  NO_BEARING,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { gaugeLobeArmed } from "../src/gauge-button.js";
import { drawGaugeGrip, gaugeBandGrip, gaugeNeedleGrip } from "../src/gauge-grip.js";
import { gaugeDial } from "../src/gauge-round.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GAUGE's dial as two controls (`gauge-grip.ts`): that the needle is the
 * pilot's and only while the valve is jammed, that the band is the
 * navigator's and only while it is wound, that a move on the needle reports a
 * **bearing** about the dial rather than a distance, and that each ring
 * reaches the canvas on the screen its own seat holds and no other. The rule
 * is the simulation's (`sim/test/gauge-hand.test.ts`); this file proves the
 * picture hands it a thumb — and that it never draws a control the round is
 * about to refuse.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The round installed and stepped once, so its state is the world's own. */
function round(): { world: World; g: GaugeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const g = world.boss;
  if (g === null || g.kind !== "gauge") throw new Error("the gauge's wave installed no gauge");
  g.phase = "play";
  return { world, g };
}

/** The same round with the fields this case is about moved. */
function playing(overrides: Partial<GaugeState> = {}): GaugeState {
  const { g } = round();
  return Object.assign(g, overrides);
}

function fieldWith(seat: 1 | 2, boss: GaugeState | null): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

const needleAt = (l: Layout, g: GaugeState) => gaugeNeedleGrip(l, DEFAULT_CONFIG, gaugeDial(l), g);
const bandAt = (l: Layout, g: GaugeState) => gaugeBandGrip(l, DEFAULT_CONFIG, gaugeDial(l), g);

describe("a thumb on the needle", () => {
  it("is the pilot's, under a jam, and nobody else's", () => {
    const l = layout("p1");
    const jammed = playing({ jamBeat: 3 });
    const at = needleAt(l, jammed);
    const touch = touchDown(l, at.x, at.y, fieldWith(1, jammed));
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "gaugeNeedle",
      on: true,
      fromMilli: NO_BEARING,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "gaugeNeedle", player: 1 });
    // Hers falls through: there is no needle drawn under her thumb to take.
    const hers = touchDown(layout("p2"), at.x, at.y, fieldWith(2, jammed));
    expect(hers?.command?.kind === "drag" && hers.command.target).not.toBe("gaugeNeedle");
    // And a valve that still answers is a needle with no ring on it at all.
    expect(touchDown(l, at.x, at.y, fieldWith(1, playing()))).toBeNull();
    expect(
      touchDown(l, at.x, at.y, fieldWith(1, playing({ jamBeat: 3, phase: "verdict" }))),
    ).toBeNull();
    expect(touchDown(l, at.x, at.y, fieldWith(1, null))).toBeNull();
  });

  it("reports where round the dial the finger is, and lets go on the lift", () => {
    const l = layout("p1");
    const jammed = playing({ jamBeat: 3 });
    const field = fieldWith(1, jammed);
    const at = needleAt(l, jammed);
    const dial = gaugeDial(l);
    const hold = touchDown(l, at.x, at.y, field)?.hold as Hold;
    // Straight left of the middle is three quarters of a turn clockwise from
    // the top, which is the nought end of the dial (`sim/gauge-hand.ts`).
    const turned = touchMove(l, hold, dial.cx - dial.r, dial.cy)?.command;
    expect(turned).toMatchObject({ target: "gaugeNeedle", on: true, fromMilli: 750 });
    const lifted = touchUp(l, hold, { x: dial.cx, y: dial.cy - dial.r })?.command;
    expect(lifted).toMatchObject({ target: "gaugeNeedle", on: false });
  });
});

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

/** Strokes the two rings make on a role's screen, for one state. */
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

  it("are gone outside the play, whatever the two states say", () => {
    const over = playing({ jamBeat: 3, boundBeat: 3, phase: "verdict" });
    for (const role of ROLES) expect(strokes(role, over)).toBe(0);
  });

  it("are one each: the needle his, the band hers, and both on the test screen", () => {
    const jammed = playing({ jamBeat: 3 });
    expect(strokes("p1", jammed)).toBeGreaterThan(0);
    expect(strokes("p2", jammed)).toBe(0);
    const bound = playing({ boundBeat: 3 });
    expect(strokes("p2", bound)).toBeGreaterThan(0);
    expect(strokes("p1", bound)).toBe(0);
    const both = playing({ jamBeat: 3, boundBeat: 3 });
    expect(strokes("test", both)).toBe(strokes("p1", jammed) + strokes("p2", bound));
  });

  it("fill under a thumb rather than breathing", () => {
    expect(strokes("p1", playing({ jamBeat: 3, handOn: true }))).toBeGreaterThan(
      strokes("p1", playing({ jamBeat: 3 })),
    );
    expect(strokes("p2", playing({ boundBeat: 3, openThumb: true }))).toBeGreaterThan(
      strokes("p2", playing({ boundBeat: 3 })),
    );
  });
});

describe("the lobes", () => {
  it("go faint exactly where the round would refuse the press", () => {
    const { world, g } = round();
    expect(gaugeLobeArmed(world, g, "left")).toBe(true);
    expect(gaugeLobeArmed(world, g, "call")).toBe(true);
    // A jam is his alone: his two buttons go and her call is untouched.
    g.jamBeat = world.beat;
    expect(gaugeLobeArmed(world, g, "left")).toBe(false);
    expect(gaugeLobeArmed(world, g, "right")).toBe(false);
    expect(gaugeLobeArmed(world, g, "call")).toBe(true);
    // Her own thumb on the band is, and so is a needle still settling.
    g.openThumb = true;
    expect(gaugeLobeArmed(world, g, "call")).toBe(false);
    g.openThumb = false;
    g.liftBeat = world.beat;
    expect(gaugeLobeArmed(world, g, "call")).toBe(false);
    g.liftBeat = world.beat - DEFAULT_CONFIG.gaugeSettleBeats;
    expect(gaugeLobeArmed(world, g, "call")).toBe(true);
  });
});

describe("on the round's own screen", () => {
  for (const role of ROLES) {
    it(`draws the claw, the lobes and both rings for ${role}`, () => {
      const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
      const index = waveWith("gauge");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      const tpb = ticksPerBeat(CFG);
      const { world: after, ctx } = runFrames(world, role, tpb * 8, {
        onTick: (tick, w) => {
          step(w, []);
          // Straight to both states at once — set rather than played for, as
          // THE MAZE's test does it — then a thumb on each.
          if (tick === tpb * 5 && w.boss?.kind === "gauge") {
            w.boss.phase = "play";
            w.boss.jamBeat = w.beat;
            w.boss.boundBeat = w.beat;
          }
          if (tick === tpb * 6) {
            step(w, [
              {
                tick,
                player: 1,
                command: { kind: "drag", target: "gaugeNeedle", on: true, fromMilli: 250 },
              },
              {
                tick,
                player: 2,
                command: { kind: "drag", target: "gaugeBand", on: true, fromMilli: 0 },
              },
            ]);
          }
        },
      });
      expect(after.boss?.kind === "gauge" && after.boss.handOn).toBe(true);
      expect(after.boss?.kind === "gauge" && after.boss.openThumb).toBe(true);
      expect(ctx.calls).toBeGreaterThan(100);
    });
  }
});
