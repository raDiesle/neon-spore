import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SimEvent, step } from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { ShieldBody } from "../src/shield.js";
import { CFG, installCanvasGlobals, runFrames, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * The bug this guards, once: the director restarts a wave by building a whole
 * new `World` — beat, tick and `nextId` all back to 0 — while the renderer's
 * `Effects` lives on across the swap. Anything it had cached against a beat
 * number or a creature id was then read by the new run as its own, and a
 * scar's crack drew before the rock that made it had visibly landed.
 *
 * `Effects.reset()` is the answer, and this is the part that keeps being the
 * answer: state added later is caught by the same test rather than by someone
 * noticing a ghost weeks afterwards. It compares structurally against a fresh
 * instance, so a new field costs nothing here as long as `reset` clears it —
 * and fails loudly the moment one does not.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const _BEAT_SECONDS = 60 / CFG.bpm;

/** One of everything that leaves a mark: a miss, a deflect, a swallow, a
 * blocked shot, the queen. Enough that every collection has something in it. */
const BUSY: SimEvent[] = [
  { type: "breach", col: 3, damage: 5, span: 1, kind: "meteor", fromRow: 12, beat: 7 },
  { type: "breach", col: 5, damage: 9, span: 2, kind: "torch", fromRow: 13, beat: 8 },
  { type: "deflect", col: 2, span: 1, kind: "meteorFast", fromRow: 11 },
  { type: "podTaken", col: 4, kind: "mend" },
  { type: "reject", col: 1, row: 4 },
  { type: "fire", col: 3, color: "cyan", lance: false },
  { type: "petal", col: 5, row: 2, left: 3 },
  { type: "tether", col: 4, color: "red" },
  { type: "plate", col: 6, row: 2, left: 2, color: "cyan" },
  // A lure folding to a point. It outlives its own frame — half a second of
  // it — so it is state, and state is what this file is for.
  { type: "lureVanished", col: 2, row: 10, color: "cyan" },
  // A canopy cut off the body it was carrying. Same reason: it outlives its
  // own frame — a canopy climbing away and a body dropping out from under it,
  // most of a second of both — so it is state.
  { type: "chuteCut", col: 4, row: 7, color: "red", kind: "slick" },
];

beforeAll(installCanvasGlobals);

describe("a wave restart", () => {
  it("leaves Effects indistinguishable from a fresh one", () => {
    const { ctx } = stubCanvas();
    const used = new Effects();

    used.ingest(BUSY, L, 0, () => 42, CFG);
    // Draw as well as ingest: the impacts only reach their `onArrive` — and so
    // the arrival latch — from inside `draw`, so ingesting alone would leave
    // the one collection this whole guard exists for empty.
    let t = 0;
    for (let i = 0; i < 240; i++) {
      t += 1 / 60;
      used.update(1 / 60, L);
      used.drawRockImpact(ctx as unknown as CanvasRenderingContext2D, L, t, () => L.hullY);
    }
    // It really did accumulate something, or the comparison below proves nothing.
    expect(used).not.toEqual(new Effects());

    used.reset();
    expect(used).toEqual(new Effects());
  });

  it("leaves a ShieldBody indistinguishable from a fresh one", () => {
    const used = new ShieldBody();
    used.update(4, 1 / 60);
    for (let i = 0; i < 60; i++) used.update(4, 1 / 60);
    expect(used).not.toEqual(new ShieldBody());

    used.reset();
    expect(used).toEqual(new ShieldBody());
  });

  it("leaves Canvas2DRenderer's eased pose indistinguishable from a fresh one after a restart", () => {
    // Every tick is a frame, and the pose is eased on `dt`: the state a
    // restart has to undo is what a run of them leaves behind.
    const { renderer } = runFrames(createWorld(CFG, 3), "test", 60, {
      every: 1,
      onTick: (tick, world) =>
        step(
          world,
          tick === 5
            ? [
                { tick, player: 1, command: { kind: "cannonCol", col: 4 } },
                { tick, player: 2, command: { kind: "shieldCol", col: 4 } },
                { tick, player: 1, command: { kind: "guard" } },
                { tick, player: 2, command: { kind: "intake" } },
              ]
            : [],
        ),
    });
    const { canvas } = stubCanvas();

    // It really did move off a fresh renderer's pose, or the comparison below
    // proves nothing.
    expect(pose(renderer)).not.toEqual(pose(new Canvas2DRenderer(canvas)));

    // A fresh `World`, drawn once: the same restart signal `waveRestarted`
    // reads off two different `World` objects in the running game.
    const restarted = createWorld(CFG, 3);
    const restartFrame = {
      world: restarted,
      beatPhase: 0,
      role: "test" as const,
      time: 0,
      dt: 1 / CFG.tickHz,
      events: [],
      running: true,
    };
    renderer.draw(restartFrame);

    // A brand new renderer, drawing that same first frame, is what
    // `resetPose` promises to leave `renderer` indistinguishable from.
    const freshRenderer = new Canvas2DRenderer(canvas);
    freshRenderer.resize(VIEWPORT);
    freshRenderer.draw(restartFrame);
    expect(pose(renderer)).toEqual(pose(freshRenderer));
  });
});

/**
 * The renderer's own eased pose — `armed`, `intake`, `cannon`, `shield` —
 * minus everything a restart is not about (`ctx`, `canvas`, `viewport`,
 * `seen`, `effects`, which has its own guard above). Read as
 * `Record<string, unknown>` because these fields are private: this test
 * exists to catch exactly the field a later change adds and forgets to
 * clear in `resetPose`, so it has to see all of them, not just the ones an
 * accessor happens to expose.
 */
function pose(renderer: Canvas2DRenderer): Record<string, unknown> {
  const {
    ctx: _ctx,
    canvas: _canvas,
    viewport: _viewport,
    seen: _seen,
    effects: _effects,
    ...rest
  } = renderer as unknown as Record<string, unknown>;
  return rest;
}
