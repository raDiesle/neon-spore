import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type MirrorState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { drawMirrorGrip } from "../src/mirror-grip.js";
import { MirrorGripFx } from "../src/mirror-grip-fx.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";
import { hold, layout, mirror } from "./mirror-grip-states.js";
import { spyHolds } from "./soak-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MIRROR's lobes as a picture (`mirror-grip.ts`, `mirror-grip-fx.ts`):
 * the rings, the HOLD LAB's drops and the pin landing reach the canvas on the
 * screen they belong to and no other, and a whole last round on the field
 * draws. The press is `mirror-grip.test.ts`'s.
 */

beforeAll(installCanvasGlobals);

/** Strokes the grip makes on a role's screen, for one state. */
function strokes(role: ViewRole, m: MirrorState, beat = 6): number {
  const { ctx } = stubCanvas();
  const spy = ctx as unknown as CanvasRenderingContext2D;
  drawMirrorGrip(spy, layout(role), DEFAULT_CONFIG, m, 4, beat, 0.5, 1.2);
  return ctx.calls;
}

describe("the rings", () => {
  it("are nobody's under an ordinary round or while it demonstrates", () => {
    for (const role of ROLES) {
      expect(strokes(role, mirror({ round: 0 }))).toBe(0);
      expect(strokes(role, mirror({ phase: "show" }))).toBe(0);
    }
  });

  it("ring two lobes for player 1 and one for player 2 under reflect", () => {
    expect(strokes("p1", mirror())).toBeGreaterThan(strokes("p2", mirror()));
    expect(strokes("p2", mirror())).toBeGreaterThan(0);
    expect(strokes("test", mirror())).toBe(strokes("p1", mirror()));
  });

  it("sink this seat's own drop under its own thumb, and never show the other's alone", () => {
    expect(drops("p1", hold({ holdThumbs: 1 })).map((d) => d.o.held)).toEqual([true]);
    expect(drops("p1", hold({ holdThumbs: 2 })).map((d) => d.o.held)).toEqual([false]);
    expect(drops("p2", hold({ holdThumbs: 2 })).map((d) => d.o.held)).toEqual([true]);
    expect(drops("p2", hold({ holdThumbs: 1 })).map((d) => d.o.held)).toEqual([false]);
  });

  it("fill both drops with the count once both thumbs are down, the partner's dimmed", () => {
    for (const role of ROLES) {
      const got = drops(role, hold({ holdThumbs: 3, holdBeat: 5 }));
      expect(got.length).toBe(2);
      for (const d of got) expect(d.o.fill ?? 0).toBeGreaterThan(0);
      expect(got.filter((d) => d.o.theirs).length).toBe(role === "test" ? 0 : 1);
    }
  });
});

/** The HOLD LAB's drops the grip asks for on a role's screen. */
const drops = (role: ViewRole, m: MirrorState) => spyHolds(() => strokes(role, m)).holds;

describe("the pin landing", () => {
  it("throws a ring off both lobes, then fades", () => {
    const fx = new MirrorGripFx();
    const draw = () => {
      const { ctx } = stubCanvas();
      fx.draw(ctx as unknown as CanvasRenderingContext2D, layout("p1"), DEFAULT_CONFIG, hold(), 4);
      return ctx.calls;
    };
    expect(draw()).toBe(0);
    fx.ingest([{ type: "mirrorGrip", col: 4, on: true }]);
    expect(draw()).toBeGreaterThan(0);
    fx.update(1);
    expect(draw()).toBe(0);
    fx.ingest([{ type: "mirrorGrip", col: 4, on: false }]);
    fx.clear();
    expect(draw()).toBe(0);
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws the last round's rings, the pin and the count for ${role}`, () => {
      const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
      const index = waveWith("mirror");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      const tpb = ticksPerBeat(CFG);
      const set = (w: World, f: (m: MirrorState) => void) => {
        if (w.boss?.kind === "mirror") f(w.boss);
      };
      const { ctx } = runFrames(world, role, tpb * 12, {
        onTick: (tick, w) => {
          step(w, []);
          // Straight to the last round, listening; then the pin, both thumbs
          // — set rather than waited for, as the queen's test does it.
          if (tick === tpb * 2) {
            set(w, (m) => {
              m.round = m.rounds.length - 1;
              m.phase = "listen";
              m.phaseBeat = w.beat;
            });
          }
          if (tick === tpb * 6) {
            set(w, (m) => {
              m.phase = "hold";
              m.phaseBeat = w.beat;
              m.hullMilli = 0;
            });
          }
          if (tick === tpb * 8) {
            step(w, [
              {
                tick,
                player: 1,
                command: { kind: "drag", target: "mirrorLobe", on: true, fromMilli: 0, id: 0 },
              },
              {
                tick,
                player: 2,
                command: { kind: "drag", target: "mirrorLobe", on: true, fromMilli: 0, id: 1 },
              },
            ]);
          }
        },
      });
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
