import { beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { buildBoss, buildQueue, NETTLE_SCRIPT } from "@neon-spore/content";
import {
  createWorld,
  NETTLE_PARTS,
  type NettleState,
  type SimEvent,
  sceneBoss,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { JAB_SHAKE } from "../src/boss-hurt.js";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { NettleFx } from "../src/nettle-fx.js";
import { NettleStrike } from "../src/nettle-strike.js";
import { stubCanvas } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE NETTLE's own fx** (`nettle-fx.ts`): the events of THE INSTAR's
 * engine reach it, not THE INSTAR's, when the world's boss is THE NETTLE; a
 * counted bolt on a shoot mark shows the lighter hurt and a thumb does not;
 * every part it has strikes with a picture of its own, drawn out of that
 * part's marks and over within two seconds; and the death leaves the bell
 * as the last step lands. The full blow of a landing is `boss-hurt.test.ts`'s
 * row, and the frames are `nettle-frame.test.ts`'s.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");

function hung() {
  const world = createWorld(CFG, 3);
  const index = waveWith("nettle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

/** A NettleFx standing on `cursor`, its marks placed the way the drawer places them. */
function standing(cursor: number): NettleFx {
  const s = sceneBoss(hung()) as NettleState;
  s.cursor = cursor;
  const fx = new NettleFx();
  fx.place(L, s, { xMilli: 0, yMilli: 0 }, 0, { x: L.width / 2, y: L.gridTop + 200 }, 120);
  return fx;
}

const answer = (mark: number, part: string): SimEvent =>
  ({ type: "instarAnswer", mark, part, col: 3 }) as SimEvent;

function drawCalls(fx: NettleFx): number {
  const { ctx } = stubCanvas();
  const before = ctx.calls;
  fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
  return ctx.calls - before;
}

const SHOOT_STEP = NETTLE_SCRIPT.findIndex((s) => s.marks.some((m) => m.gesture === "shoot"));
const THUMB_STEP = NETTLE_SCRIPT.findIndex((s) => s.marks.every((m) => m.gesture !== "shoot"));

describe("THE NETTLE's fx", () => {
  it("takes the engine's events when the world's boss is THE NETTLE, and only then", () => {
    const land: SimEvent[] = [{ type: "instarLand", step: 0, col: 3 }];
    const nettle = new Effects();
    nettle.ingest(land, L, 0, () => 0, CFG, false, undefined, "nettle");
    expect(nettle.boss.nettle.hurt.value).toBe(1);
    expect(nettle.boss.instar.hurt.value).toBe(0);
    const instar = new Effects();
    instar.ingest(land, L, 0, () => 0, CFG, false, undefined, "instar");
    expect(instar.boss.instar.hurt.value).toBe(1);
    expect(instar.boss.nettle.hurt.value).toBe(0);
  });

  it("shows the lighter hurt on a counted bolt, and none on a counted thumb", () => {
    expect(SHOOT_STEP).toBeGreaterThanOrEqual(0);
    expect(THUMB_STEP).toBeGreaterThanOrEqual(0);
    const shot = standing(SHOOT_STEP);
    const i = NETTLE_SCRIPT[SHOOT_STEP]?.marks.findIndex((m) => m.gesture === "shoot") ?? 0;
    shot.ingest([answer(i, "spot")], L, () => {});
    expect(shot.hurt.value).toBe(1);
    expect(shot.hurt.shake).toBe(JAB_SHAKE);
    const thumb = standing(THUMB_STEP);
    thumb.ingest([answer(0, NETTLE_SCRIPT[THUMB_STEP]?.marks[0]?.part ?? "arm")], L, () => {});
    expect(thumb.hurt.value).toBe(0);
  });

  it.each([...NETTLE_PARTS])(
    "strikes with the %s, drawn, and is over within two seconds",
    (part) => {
      const cursor = Math.max(
        0,
        NETTLE_SCRIPT.findIndex((s) => s.marks.some((m) => m.part === part)),
      );
      const fx = standing(cursor);
      fx.ingest([{ type: "instarStrike", part, col: 2 }], L, () => {});
      expect(fx.strike.active).toBe(true);
      expect(fx.jolt).toBeGreaterThan(0);
      fx.update(0.2);
      expect(drawCalls(fx)).toBeGreaterThan(0);
      for (let t = 0; t < 120; t++) fx.update(1 / 60);
      expect(fx.strike.active).toBe(false);
      expect(drawCalls(fx)).toBe(0);
    },
  );

  it("strikes with nothing of its own for a part only THE INSTAR has", () => {
    const fx = standing(0);
    const bursts: string[] = [];
    fx.ingest([{ type: "instarStrike", part: "jaw", col: 2 }], L, (_x, _y, _n, hex) =>
      bursts.push(hex),
    );
    expect(fx.strike.active).toBe(false);
    expect(bursts.length).toBe(1);
  });

  it("draws a strike in the game's own frame, on the frames after it", () => {
    // The same play twice, once with the strike's picture stubbed out, so what
    // differs is the picture and not the sparks the same event throws.
    const calls = (drawn: boolean): number => {
      const off = drawn ? null : spyOn(NettleStrike.prototype, "draw").mockImplementation(() => {});
      const world = hung();
      for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
      const { ctx } = runFrames(world, "p1", 12, {
        every: 3,
        onTick: (tick, w) => {
          step(w, []);
          if (tick === 0) w.events.push({ type: "instarStrike", part: "frill", col: 3 });
        },
      });
      off?.mockRestore();
      return ctx.calls;
    };
    expect(calls(true)).toBeGreaterThan(calls(false));
  });

  it("lets the death go off the bell as the last step lands, and forgets all of it on a restart", () => {
    const fx = standing(0);
    fx.ingest([{ type: "instarDown", col: 3 }], L, () => {});
    expect(fx.death.active).toBe(true);
    expect(fx.hurt.value).toBe(1);
    fx.update(0.3);
    expect(drawCalls(fx)).toBeGreaterThan(0);
    fx.clear();
    expect(fx).toEqual(new NettleFx());
  });
});
