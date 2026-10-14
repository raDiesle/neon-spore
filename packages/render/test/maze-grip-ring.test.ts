import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type MazeState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMazeGrip } from "../src/maze-grip.js";
import { MazeGripFx } from "../src/maze-grip-fx.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";
import { gripState as grip } from "./maze-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MAZE's heart as a picture (`maze-grip.ts`, `maze-grip-fx.ts`): only
 * under `grip`, the word naming the partner while this seat waits on them,
 * the waiting clock, the ring a landing thumb throws, and all of it reaching
 * the field from a wave. The rub's drop is the cue's (`boss-cue-maze.test.ts`);
 * the thumb itself is `maze-grip.test.ts`.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** Strokes the grip makes on a role's screen, for one state. */
function strokes(role: ViewRole, m: MazeState): number {
  const { ctx } = stubCanvas();
  const spy = ctx as unknown as CanvasRenderingContext2D;
  drawMazeGrip(spy, layout(role), DEFAULT_CONFIG, m, role, 1.2);
  return ctx.calls;
}

describe("the partner", () => {
  it("is nobody's outside grip", () => {
    for (const role of ROLES) {
      expect(strokes(role, grip({ phase: "read" }))).toBe(0);
      expect(strokes(role, grip({ phase: "travel" }))).toBe(0);
      expect(strokes(role, grip({ phase: "verdict" }))).toBe(0);
    }
  });

  it("names the partner only while this seat waits on them", () => {
    const words = (m: MazeState) => {
      const { ctx } = stubCanvas();
      ctx.texts = [];
      drawMazeGrip(
        ctx as unknown as CanvasRenderingContext2D,
        layout("p1"),
        DEFAULT_CONFIG,
        m,
        "p1",
        1.2,
      );
      return ctx.texts.map((t) => t.text);
    };
    expect(words(grip())).toEqual([]);
    expect(words(grip({ gripSeats: 1 }))).toEqual(["P2 TOO"]);
    expect(words(grip({ gripSeats: 3 }))).toEqual([]);
    expect(strokes("test", grip({ gripSeats: 1 }))).toBe(0);
  });

  it("shows the waiting clock while the partner's half is not done", () => {
    // The clock's face sits on a dark disc no other part of the grip draws.
    const DISC = rgba(PALETTE.background, 0.9);
    const read = (role: ViewRole, m: MazeState) => {
      const { ctx } = stubCanvas();
      const log: string[] = [];
      ctx.log = log;
      ctx.texts = [];
      drawMazeGrip(ctx as unknown as CanvasRenderingContext2D, layout(role), CFG, m, role, 1.2);
      return {
        clock: log.some((line) => line.includes(DISC)),
        words: ctx.texts.map((t) => t.text),
      };
    };
    const DONE = CFG.mazeHeartTurns;
    // Nobody on it, or both rubbing with neither done: nothing to wait on.
    expect(read("p1", grip()).clock).toBe(false);
    expect(read("p1", grip({ gripSeats: 3 })).clock).toBe(false);
    // Holding alone: the partner is waited on, on this screen only.
    expect(read("p1", grip({ gripSeats: 1 })).clock).toBe(true);
    expect(read("p2", grip({ gripSeats: 1 })).clock).toBe(false);
    // Half rubbed and let go: told the partner is still to come.
    const mineDone = grip({ gripTurns: [DONE, 0] });
    expect(read("p1", mineDone)).toEqual({ clock: true, words: ["P2 TOO"] });
    expect(read("p2", mineDone).clock).toBe(false);
    // Their half done: this screen waits on nobody.
    expect(read("p1", grip({ gripSeats: 1, gripTurns: [0, DONE] })).clock).toBe(false);
    expect(read("test", grip({ gripSeats: 1 })).clock).toBe(false);
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
    it(`draws the held shot and the heart for ${role}`, () => {
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
