import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { LureBlastFx } from "../src/lure-blast.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  remembered,
  runFrames,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LURE, drawn: the body player 1 sees, the alarm player 2 sees over it,
 * and the fold both of them see when it goes.
 *
 * Nothing here can answer whether the disguise *reads* — that is the check
 * this lane owes and it needs two phones. What it can hold is the shape of the
 * arrangement: that the alarm is drawn on one seat and not the other, that
 * neither seat's frame throws, and that a lure at either edge of the field
 * still puts its label somewhere the canvas will accept.
 *
 * And the shot that must not be fired, which is the loudest picture in the
 * game: a blast over the whole stage (`lure-blast.ts`), drawn last of the
 * frame and therefore through none of the clipping the field pass has. A
 * gradient centred outside the stage, a radius that goes negative as the
 * picture fades, an alpha past one — every one of those is a value a real
 * canvas refuses, and this is where they would be found.
 */

beforeAll(installCanvasGlobals);

function lureFrames(role: ViewRole, col: number, ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col, kind: "lure", color: "cyan", wears: "bulb" }];
  const { ctx, events } = runFrames(createWorld(CFG, 1, queue), role, ticks);
  return { ctx, vanished: events.filter((e) => e.type === "lureVanished").length };
}

describe("the lure", () => {
  // Far enough to carry it past the row it goes on, so every frame this
  // creature ever produces — body, alarm and fold — has been through the
  // canvas that refuses what a real one refuses.
  const TICKS = ticksPerBeat(CFG) * 20;

  // The play in column three, once per seat: the case that compares the two
  // seats reads it rather than playing it again.
  const playFor = remembered((role) => lureFrames(role, 3, TICKS));

  for (const role of ROLES) {
    it(`draws the body, its alarm and its fold for ${role}`, () => {
      const { ctx, vanished } = playFor(role);
      expect(vanished).toBe(1);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("puts the alarm on player 2's screen and nothing extra on player 1's", () => {
    // Same world, same ticks, same body — the ring, the exclamation and the
    // label are the entire difference between the two frames.
    expect(playFor("p2").ctx.calls).toBeGreaterThan(playFor("p1").ctx.calls);
  });

  it("keeps its label on screen in the first column and the last", () => {
    for (const col of [0, CFG.cols - 1]) {
      expect(() => lureFrames("p2", col, TICKS)).not.toThrow();
    }
  });
});

describe("a lure shot by mistake", () => {
  // A beat in: the body is on the field by then and the shot, which takes a
  // beat to climb to it, lands on the second. It was three, and the two beats
  // before it were a lure falling — the picture the first describe already
  // has — drawn at every tick, five times over.
  const SHOT_TICK = ticksPerBeat(CFG);
  // Past the end of the blast: every frame of it, from the white wash to the
  // colour left hanging over the ship, has been through the canvas. The hit
  // is a beat after the shot and the blast lives `LIFE` seconds after that
  // (`lure-blast.ts`), a beat and a half — so four beats past the shot is the
  // whole of it and a beat of the hull standing broken under nothing.
  const TICKS = SHOT_TICK + ticksPerBeat(CFG) * 4;

  /**
   * The shot, and the frames it throws. Every tick, because the wash is over
   * in an eighth of a second — fifteen ticks — and a coarser sampling would
   * step past it; or, for one of three seats sharing the play, every third
   * tick at that seat's own phase, which still puts five frames of the wash
   * through the canvas for each and every tick through it for the three.
   */
  function shotFrames(role: ViewRole, col: number, sampling = { every: 1, phase: 0 }) {
    const queue: SpawnEntry[] = [{ beat: 0, col, kind: "lure", color: "cyan", wears: "bulb" }];
    return runFrames(createWorld(CFG, 1, queue), role, TICKS, {
      ...sampling,
      onTick: (tick, world) =>
        step(
          world,
          tick === SHOT_TICK
            ? [
                { tick, player: 1, command: { kind: "cannonCol", col } },
                { tick, player: 2, command: { kind: "fire", color: "cyan" } },
              ]
            : [],
        ),
    });
  }

  for (const [phase, role] of ROLES.entries()) {
    it(`draws the blast and the broken hull under it for ${role}`, () => {
      const { ctx, events, world } = shotFrames(role, 3, { every: 3, phase });
      // The run really did fire at it, or the frames prove nothing.
      expect(events.filter((e) => e.type === "lureHit")).toHaveLength(1);
      expect(world.scars).toHaveLength(CFG.lureBlastPlaces);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("draws it from either edge of the field, where most of it is off screen", () => {
    for (const col of [0, CFG.cols - 1]) {
      expect(() => shotFrames("test", col)).not.toThrow();
    }
  });
});

/**
 * The blast on its own, because `ctx.calls` over a whole frame cannot tell a
 * picture that drew nothing from a field's worth of calls around it.
 */
describe("the blast itself", () => {
  const L = computeLayout(VIEWPORT, CFG, "test");

  it("draws while it lasts, draws nothing once it is spent, and forgets on a restart", () => {
    const fx = new LureBlastFx();
    const { ctx } = stubCanvas();
    const canvas = ctx as unknown as CanvasRenderingContext2D;

    // Nothing to draw before anything has gone up.
    fx.draw(canvas, L);
    expect(ctx.calls).toBe(0);

    fx.spawn(L.width / 2, L.hullY - L.tile * 2, "cyan");
    // Every frame of it, from the white wash to the last of the afterglow.
    for (let i = 0; i < 90; i++) {
      fx.draw(canvas, L);
      fx.update(1 / 60);
    }
    expect(ctx.calls).toBeGreaterThan(100);

    // It ran out on its own, rather than being cleared.
    const spent = ctx.calls;
    fx.draw(canvas, L);
    expect(ctx.calls).toBe(spent);

    // And a wave starting over takes one that is still burning with it.
    fx.spawn(L.width / 2, L.hullY, "red");
    fx.clear();
    fx.draw(canvas, L);
    expect(ctx.calls).toBe(spent);
  });
});
