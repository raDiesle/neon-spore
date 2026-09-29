import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type MazeState,
  mazeWheel,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMazeGrip, mazeHeartCircle, mazeHeartUnder } from "../src/maze-grip.js";
import { MazeGripFx } from "../src/maze-grip-fx.js";
import { mazeStringCircle } from "../src/maze-string.js";
import { PALETTE } from "../src/palette.js";
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
 * THE MAZE's heart as a control (`maze-grip.ts`): that either seat's thumb
 * takes hold of it and only under `grip`, that a move reports the thumb's
 * displacement on both axes so the sim can shake the heart by it, that the
 * string asks nothing meanwhile, and that the ring, the arrows, the word and
 * the green count reach the canvas. The rule is the simulation's
 * (`sim/test/maze-gestures.test.ts`); this file proves the picture hands it a
 * thumb.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** One small drum with two ways into the middle (`maze-draw.test.ts`). */
function wheel() {
  return mazeWheel(
    {
      rings: 3,
      coreMilli: 250,
      openMilli: 60,
      walls: [[], [0, 180_000], [0, 180_000], [0, 180_000]],
      openings: [
        [90_000, 270_000],
        [45_000, 225_000],
        [45_000, 225_000],
        [45_000, 225_000],
      ],
    },
    15_000,
  );
}

/** The right shot held in the heart: `grip`, no thumb on it yet. */
function grip(overrides: Partial<MazeState> = {}): MazeState {
  return {
    kind: "maze",
    rounds: [wheel()],
    round: 0,
    phase: "grip",
    phaseBeat: 4,
    angleMilli: 15_000,
    turn: 0,
    dragging: false,
    dragFromMilli: 0,
    armed: true,
    lockedCol: -1,
    lockedWay: -1,
    way: 0,
    shotColor: 0,
    step: 0,
    tried: [],
    hullMilli: 100_000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
    lost: null,
    gripSeats: 0,
    gripFromMilli: [0, 0, 0, 0],
    gripXMilli: 0,
    gripYMilli: 0,
    gripShookMilli: [0, 0],
    ...overrides,
  };
}

function fieldWith(seat: 1 | 2, boss: MazeState | null): Field {
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

const heart = (l: ReturnType<typeof layout>, m: MazeState) => mazeHeartCircle(l, DEFAULT_CONFIG, m);

describe("a thumb on the heart", () => {
  it("is either seat's, under grip, and takes a hold on both", () => {
    const l = layout("p2");
    const at = heart(l, grip());
    const touch = mazeHeartUnder(l, at.x, at.y, fieldWith(2, grip()));
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "mazeHeart",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "mazeHeart", player: 2 });
    expect(mazeHeartUnder(layout("p1"), at.x, at.y, fieldWith(1, grip()))).toMatchObject({
      player: 1,
      command: { target: "mazeHeart", on: true },
      hold: { kind: "drag", target: "mazeHeart", player: 1 },
    });
    expect(mazeHeartUnder(l, at.x, at.y, fieldWith(2, grip({ phase: "read" })))).toBeNull();
    expect(mazeHeartUnder(l, at.x, at.y, fieldWith(2, grip({ phase: "travel" })))).toBeNull();
    expect(mazeHeartUnder(l, at.x, at.y, fieldWith(2, null))).toBeNull();
    expect(mazeHeartUnder(l, at.x, at.y + at.r * 2, fieldWith(2, grip()))).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const l = layout("p2");
    const at = heart(l, grip());
    expect(touchDown(l, at.x, at.y, fieldWith(2, grip()))?.command).toMatchObject({
      target: "mazeHeart",
    });
  });

  it("reports where it has come on both axes, and lets go on the lift", () => {
    const l = layout("p1");
    const field = fieldWith(1, grip());
    const at = heart(l, grip());
    const hold = touchDown(l, at.x, at.y, field)?.hold as Hold;
    const pulled = touchMove(l, hold, at.x - l.tile * 0.4, at.y + l.tile * 0.6)?.command;
    expect(pulled).toMatchObject({
      target: "mazeHeart",
      on: true,
      fromMilli: -400,
      fromYMilli: 600,
    });
    const lifted = touchUp(l, hold, { x: at.x, y: at.y + l.tile })?.command;
    expect(lifted).toMatchObject({ target: "mazeHeart", on: false });
  });
});

describe("the string under grip", () => {
  it("asks nobody: both hands belong on the heart", () => {
    const l = layout("p1");
    const at = mazeStringCircle(l, DEFAULT_CONFIG);
    const command = touchDown(l, at.x, at.y, fieldWith(1, grip()))?.command;
    expect(command?.kind === "drag" && command.target === "mazeString").toBe(false);
  });
});

/** Strokes the grip makes on a role's screen, for one state. */
function strokes(role: ViewRole, m: MazeState): number {
  const { ctx } = stubCanvas();
  const spy = ctx as unknown as CanvasRenderingContext2D;
  drawMazeGrip(spy, layout(role), DEFAULT_CONFIG, m, role, 1.2);
  return ctx.calls;
}

describe("the ring", () => {
  it("is nobody's outside grip", () => {
    for (const role of ROLES) {
      expect(strokes(role, grip({ phase: "read" }))).toBe(0);
      expect(strokes(role, grip({ phase: "travel" }))).toBe(0);
      expect(strokes(role, grip({ phase: "verdict" }))).toBe(0);
    }
  });

  it("is on every screen, the same picture for the same state", () => {
    expect(strokes("p1", grip())).toBeGreaterThan(0);
    expect(strokes("p1", grip())).toBe(strokes("p2", grip()));
    expect(strokes("test", grip())).toBe(strokes("p2", grip()));
  });

  it("goes green under this seat's thumb, and the word names the partner's", () => {
    const green = (m: MazeState) => {
      const { ctx } = stubCanvas();
      const log: string[] = [];
      ctx.log = log;
      ctx.texts = [];
      drawMazeGrip(
        ctx as unknown as CanvasRenderingContext2D,
        layout("p1"),
        DEFAULT_CONFIG,
        m,
        "p1",
        1.2,
      );
      const good = log.filter((line) => line.includes(PALETTE.good)).length;
      return { good, words: ctx.texts.map((t) => t.text) };
    };
    expect(green(grip()).words).toEqual(["SHAKE"]);
    const held = green(grip({ gripSeats: 1 }));
    expect(held.words).toEqual(["P2 TOO"]);
    expect(held.good).toBeGreaterThan(green(grip()).good);
    expect(green(grip({ gripSeats: 3 })).words).toEqual([]);
  });

  it("fills the green count as the pair shakes", () => {
    const some = grip({ gripShookMilli: [3_000, 1_000] });
    expect(strokes("p1", some)).toBeGreaterThan(strokes("p1", grip()));
  });
});

describe("the thumb landing", () => {
  it("throws a ring off the heart, then fades", () => {
    const fx = new MazeGripFx();
    const draw = () => {
      const { ctx } = stubCanvas();
      fx.draw(ctx as unknown as CanvasRenderingContext2D, layout("p1"), DEFAULT_CONFIG, grip());
      return ctx.calls;
    };
    expect(draw()).toBe(0);
    fx.ingest([{ type: "mazeGrip", col: 4, on: true }]);
    expect(draw()).toBeGreaterThan(0);
    fx.update(1);
    expect(draw()).toBe(0);
    fx.ingest([{ type: "mazeGrip", col: 4, on: false }]);
    fx.clear();
    expect(draw()).toBe(0);
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws the held shot, the stretched heart and the ring for ${role}`, () => {
      const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
      const index = waveWith("maze");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      const tpb = ticksPerBeat(CFG);
      const set = (w: World, f: (m: MazeState) => void) => {
        if (w.boss?.kind === "maze") f(w.boss);
      };
      const { world: after, ctx } = runFrames(world, role, tpb * 8, {
        onTick: (tick, w) => {
          step(w, []);
          // Straight to the shot held in the heart — set rather than waited
          // for, as the mirror's test does it — then both hands, one tick.
          if (tick === tpb * 4) {
            set(w, (m) => {
              m.phase = "grip";
              m.phaseBeat = w.beat;
              m.way = 0;
              m.shotColor = 0;
            });
          }
          if (tick === tpb * 5) {
            const heart = (player: 1 | 2, fromMilli: number) => ({
              tick,
              player,
              command: {
                kind: "drag",
                target: "mazeHeart",
                on: true,
                fromMilli,
                fromYMilli: 0,
              } as const,
            });
            step(w, [heart(1, 0), heart(2, 0)]);
            step(w, [heart(1, 300), heart(2, 500)]);
          }
        },
      });
      expect(after.boss?.kind === "maze" && after.boss.gripSeats).toBe(3);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
