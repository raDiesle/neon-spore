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
 * THE MAZE's heart as a control (`maze-grip.ts`): that only the navigator's
 * thumb takes it and only under `grip`, that a move reports how far down the
 * thumb has come so the sim can read the tear off it, that the string still
 * answers the pilot as the brace, and that the ring, the word and the count
 * reach the canvas on the screen they belong to and no other. The rule is the
 * simulation's (`sim/test/maze-gestures.test.ts`); this file proves the
 * picture hands it a thumb.
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

/** The right shot held in the heart: `grip`, with the pilot braced. */
function grip(overrides: Partial<MazeState> = {}): MazeState {
  return {
    kind: "maze",
    rounds: [wheel()],
    round: 0,
    phase: "grip",
    phaseBeat: 4,
    angleMilli: 15_000,
    turn: 0,
    dragging: true,
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
    gripThumb: false,
    gripPullMilli: 0,
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
  it("is the navigator's, under grip, and nobody else's", () => {
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
    expect(mazeHeartUnder(layout("p1"), at.x, at.y, fieldWith(1, grip()))).toBeNull();
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

  it("reports how far down it has come, and lets go on the lift", () => {
    const l = layout("p2");
    const field = fieldWith(2, grip());
    const at = heart(l, grip());
    const hold = touchDown(l, at.x, at.y, field)?.hold as Hold;
    const pulled = touchMove(l, hold, at.x, at.y + l.tile * 0.6)?.command;
    expect(pulled).toMatchObject({ target: "mazeHeart", on: true, fromYMilli: 600 });
    const lifted = touchUp(l, hold, { x: at.x, y: at.y + l.tile })?.command;
    expect(lifted).toMatchObject({ target: "mazeHeart", on: false });
  });
});

describe("the string under grip", () => {
  it("still answers the pilot, as the brace, and not the navigator", () => {
    const l = layout("p1");
    const at = mazeStringCircle(l, DEFAULT_CONFIG);
    expect(touchDown(l, at.x, at.y, fieldWith(1, grip()))?.command).toMatchObject({
      target: "mazeString",
    });
    const hers = touchDown(layout("p2"), at.x, at.y, fieldWith(2, grip()));
    expect(hers?.command?.kind === "drag" && hers.command.target).not.toBe("mazeString");
  });
});

/** Strokes the grip makes on a role's screen, for one state. */
function strokes(role: ViewRole, m: MazeState, beat = 6): number {
  const { ctx } = stubCanvas();
  const spy = ctx as unknown as CanvasRenderingContext2D;
  drawMazeGrip(spy, layout(role), DEFAULT_CONFIG, m, role, beat, 0.5, 1.2);
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

  it("is the navigator's, with the count on both screens", () => {
    expect(strokes("p2", grip())).toBeGreaterThan(strokes("p1", grip()));
    expect(strokes("p1", grip())).toBeGreaterThan(0);
    expect(strokes("test", grip())).toBe(strokes("p2", grip()));
  });

  it("fills under her thumb, and the word goes with it", () => {
    const held = grip({ gripThumb: true, gripPullMilli: 300 });
    // The pilot's screen has no ring, so what it loses is the word alone…
    const word = strokes("p1", grip()) - strokes("p1", held);
    expect(word).toBeGreaterThan(0);
    // …and the navigator's loses the same word and gains the fill.
    expect(strokes("p2", grip()) - strokes("p2", held)).toBeLessThan(word);
  });

  it("runs the count down over mazeGripBeats", () => {
    const out = 4 + DEFAULT_CONFIG.mazeGripBeats + 1;
    expect(strokes("p1", grip(), out)).toBeLessThan(strokes("p1", grip(), 4));
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
            step(w, [
              {
                tick,
                player: 1,
                command: { kind: "drag", target: "mazeString", on: true, fromMilli: 0 },
              },
              {
                tick,
                player: 2,
                command: {
                  kind: "drag",
                  target: "mazeHeart",
                  on: true,
                  fromMilli: 0,
                  fromYMilli: 300,
                },
              },
            ]);
          }
        },
      });
      expect(after.boss?.kind === "maze" && after.boss.gripThumb).toBe(true);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
